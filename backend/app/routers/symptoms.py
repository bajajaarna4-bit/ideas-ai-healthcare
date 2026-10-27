import json
from fastapi import APIRouter, HTTPException, status
from typing import List, Dict, Any
from app.schemas import (
    SymptomAnalysisRequest,
    SymptomAnalysisResponse,
    SmartQuestionnaireRequest,
    SmartQuestionnaireResponse
)
from app.services.gemini_service import analyze_symptoms, call_gemini_api
from app.services.clinical_triage_engine import (
    evaluate_smart_triage,
    CRITICAL_EMERGENCY_RED_FLAGS,
    PROMPT_EVALUATION_FLAGS
)
from app.database import get_connection

router = APIRouter(prefix="/api/symptoms", tags=["Symptoms"])

@router.get("/red-flags")
def get_red_flags(language: str = "en"):
    """Returns the deterministic catalog of critical emergency signs for UI early escalation."""
    lang = language if language in ["en", "hi", "mr"] else "en"
    critical_list = []
    for key, data in CRITICAL_EMERGENCY_RED_FLAGS.items():
        critical_list.append({
            "id": key,
            "label": data["label"].get(lang, data["label"]["en"]),
            "is_emergency": True
        })
    prompt_list = []
    for key, data in PROMPT_EVALUATION_FLAGS.items():
        prompt_list.append({
            "id": key,
            "label": data["label"].get(lang, data["label"]["en"]),
            "is_emergency": False
        })
    return {
        "critical_emergency_flags": critical_list,
        "prompt_evaluation_flags": prompt_list
    }

@router.post("/questionnaire", response_model=SmartQuestionnaireResponse)
async def smart_questionnaire_endpoint(request: SmartQuestionnaireRequest):
    """
    Step-by-step Smart Symptom Guidance questionnaire evaluation.
    Uses deterministic, clinician-reviewed ruleset without relying on LLM for emergency safety.
    """
    lang = request.language if request.language in ["en", "hi", "mr"] else "en"
    
    # 1. Deterministic clinical evaluation
    triage_result = evaluate_smart_triage(
        main_symptom=request.main_symptom,
        onset=request.onset,
        severity=request.severity,
        progression=request.progression,
        associated_symptoms=request.associated_symptoms,
        age_range=request.age_range,
        language=lang
    )

    # 2. Privacy Check: Do not store symptom answers by default.
    # Only store if explicitly opted-in by user (save_history=True)
    if request.save_history:
        try:
            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO symptom_checks (symptoms, duration, severity, triage_level, summary, red_flags, recommendations, language)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    request.main_symptom,
                    request.onset,
                    request.severity,
                    triage_result.care_tier,
                    triage_result.summary_of_input.get(lang, triage_result.summary_of_input["en"]),
                    json.dumps(triage_result.urgent_warning_signs.get(lang, [])),
                    json.dumps(triage_result.action_steps.get(lang, [])),
                    lang
                )
            )
            conn.commit()
            conn.close()
        except Exception as e:
            # Storage failure should not break user triage delivery
            pass

    # 3. Optional plain-language AI explanation if non-emergency and Gemini available
    ai_explanation = None
    if not triage_result.is_emergency and triage_result.care_tier != "insufficient_info":
        prompt = f"""
You are HealthSathi AI, an educational health assistant.
The user completed a symptom questionnaire:
- Main Symptom: {request.main_symptom}
- Onset: {request.onset}
- Severity: {request.severity}
- Trajectory: {request.progression}
- Care Tier Assigned by Clinical Engine: {triage_result.care_tier}

Write 2 concise, empathetic sentences in {lang} explaining in simple everyday language what factors were considered, reiterating that this is general guidance, not a diagnosis.
Do NOT override the care tier or invent medical risk percentages.
"""
        gemini_text = await call_gemini_api(prompt)
        if gemini_text:
            ai_explanation = gemini_text.strip()

    return SmartQuestionnaireResponse(
        care_tier=triage_result.care_tier,
        tier_title=triage_result.tier_title.get(lang, triage_result.tier_title["en"]),
        reason_for_step=triage_result.reason_for_step.get(lang, triage_result.reason_for_step["en"]),
        action_steps=triage_result.action_steps.get(lang, triage_result.action_steps["en"]),
        urgent_warning_signs=triage_result.urgent_warning_signs.get(lang, triage_result.urgent_warning_signs["en"]),
        summary_of_input=triage_result.summary_of_input.get(lang, triage_result.summary_of_input["en"]),
        is_emergency=triage_result.is_emergency,
        requires_immediate_escalation=triage_result.requires_immediate_escalation,
        emergency_number=triage_result.emergency_number,
        ai_plain_language_explanation=ai_explanation,
        clinical_disclaimer=triage_result.clinical_disclaimer.get(lang, triage_result.clinical_disclaimer["en"]),
        ruleset_reference="Clinician-reviewed deterministic ruleset based on NHS 111 CAS & NICE CKS Guidelines"
    )

@router.post("/analyze", response_model=SymptomAnalysisResponse)
async def analyze_symptom_endpoint(request: SymptomAnalysisRequest):
    """Legacy quick symptom analyze endpoint, preserving backward compatibility."""
    try:
        result = await analyze_symptoms(request)

        # Do not store symptom answers by default unless save_history is True
        if request.save_history:
            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO symptom_checks (symptoms, duration, severity, triage_level, summary, red_flags, recommendations, language)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    request.symptoms,
                    request.duration,
                    request.severity,
                    result.triage_level,
                    result.summary,
                    json.dumps(result.red_flags),
                    json.dumps(result.home_comfort_steps),
                    request.language
                )
            )
            conn.commit()
            conn.close()

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history")
def get_symptom_history():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM symptom_checks ORDER BY id DESC LIMIT 20")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]
