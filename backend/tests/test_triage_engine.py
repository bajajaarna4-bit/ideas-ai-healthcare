import sys
import os
import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from app.main import app
from app.services.clinical_triage_engine import evaluate_smart_triage
from app.database import get_connection

client = TestClient(app)

def test_stroke_fast_red_flag_escalation():
    # Synthetic test data: FAST stroke criteria
    res = evaluate_smart_triage(
        main_symptom="Sudden arm weakness",
        onset="sudden_under_1hr",
        severity="severe",
        progression="worsening_rapidly",
        associated_symptoms=["stroke_fast"],
        age_range="adult_18_64",
        language="en"
    )
    assert res.care_tier == "emergency_now"
    assert res.is_emergency is True
    assert res.requires_immediate_escalation is True
    assert res.emergency_number == "112 / 108"
    assert any("stroke" in w.lower() or "droop" in w.lower() or "weakness" in w.lower() for w in res.urgent_warning_signs["en"])

def test_radiating_chest_pain_escalation():
    # Synthetic test data: Cardiopulmonary red flag
    res = evaluate_smart_triage(
        main_symptom="Chest tightness and heaviness",
        onset="today",
        severity="severe",
        progression="worsening_rapidly",
        associated_symptoms=["radiating_chest_pain", "difficulty_breathing"],
        age_range="adult_18_64",
        language="en"
    )
    assert res.care_tier == "emergency_now"
    assert res.is_emergency is True
    assert res.requires_immediate_escalation is True

def test_unbearable_sudden_thunderclap_headache():
    # Synthetic test data: Sudden worst headache
    res = evaluate_smart_triage(
        main_symptom="Worst headache of my life",
        onset="sudden_under_1hr",
        severity="unbearable",
        progression="worsening_rapidly",
        associated_symptoms=["thunderclap_headache"],
        age_range="adult_18_64",
        language="en"
    )
    assert res.care_tier == "emergency_now"
    assert res.is_emergency is True

def test_prompt_evaluation_tier_high_fever_and_vomiting():
    # Synthetic test data: Persistent high fever and dehydration risk
    res = evaluate_smart_triage(
        main_symptom="High fever and stomach pain",
        onset="1_to_3_days",
        severity="moderate",
        progression="worsening_gradually",
        associated_symptoms=["persistent_high_fever", "severe_abdominal_pain_vomiting"],
        age_range="adult_18_64",
        language="en"
    )
    assert res.care_tier == "prompt_evaluation"
    assert res.is_emergency is False
    assert "12-24" in res.tier_title["en"]

def test_routine_consultation_tier_persisting_symptoms():
    # Synthetic test data: Chronic / persisting moderate cough
    res = evaluate_smart_triage(
        main_symptom="Dry cough and mild fatigue",
        onset="more_than_week",
        severity="moderate",
        progression="stable",
        associated_symptoms=[],
        age_range="adult_18_64",
        language="en"
    )
    assert res.care_tier == "routine_consultation"
    assert res.is_emergency is False

def test_self_care_education_with_not_all_clear():
    # Synthetic test data: Mild, brief, improving symptoms
    res = evaluate_smart_triage(
        main_symptom="Mild runny nose and scratchy throat",
        onset="1_to_3_days",
        severity="mild",
        progression="improving",
        associated_symptoms=[],
        age_range="adult_18_64",
        language="en"
    )
    assert res.care_tier == "self_care_education"
    assert res.is_emergency is False
    # Must NOT claim definitive all-clear
    assert any("not an all-clear" in w.lower() or "not a diagnosis" in w.lower() for w in res.urgent_warning_signs["en"])

def test_insufficient_information():
    # Synthetic test data: Empty symptom input
    res = evaluate_smart_triage(
        main_symptom="",
        onset="today",
        severity="mild",
        progression="stable",
        associated_symptoms=[],
        age_range="adult_18_64",
        language="en"
    )
    assert res.care_tier == "insufficient_info"
    assert res.is_emergency is False

def test_multilingual_triage_output():
    # Hindi
    res_hi = evaluate_smart_triage(
        main_symptom="छाती में तेज दर्द",
        onset="today",
        severity="severe",
        progression="worsening_rapidly",
        associated_symptoms=["radiating_chest_pain"],
        language="hi"
    )
    assert res_hi.care_tier == "emergency_now"
    assert "आपातकालीन" in res_hi.tier_title["hi"]

    # Marathi
    res_mr = evaluate_smart_triage(
        main_symptom="सौम्य सर्दी आणि खोकला",
        onset="1_to_3_days",
        severity="mild",
        progression="stable",
        associated_symptoms=[],
        language="mr"
    )
    assert res_mr.care_tier == "self_care_education"
    assert "घरगुती" in res_mr.tier_title["mr"]

def test_api_questionnaire_endpoint_and_privacy_default():
    # Ensure symptom answers are NOT stored by default
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT COUNT(*) FROM symptom_checks")
    count_before = c.fetchone()[0]
    conn.close()

    # Call endpoint without save_history (default False)
    payload = {
        "main_symptom": "Mild headache",
        "onset": "today",
        "severity": "mild",
        "progression": "stable",
        "associated_symptoms": [],
        "age_range": "adult_18_64",
        "language": "en"
    }
    response = client.post("/api/symptoms/questionnaire", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["care_tier"] == "self_care_education"
    assert "ruleset_reference" in data

    # Verify count did NOT increase
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT COUNT(*) FROM symptom_checks")
    count_after = c.fetchone()[0]
    conn.close()
    assert count_after == count_before, "Symptom answers must NOT be stored by default!"

def test_api_questionnaire_opt_in_save():
    # When user explicitly opts in with save_history=True, it should save
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT COUNT(*) FROM symptom_checks")
    count_before = c.fetchone()[0]
    conn.close()

    payload = {
        "main_symptom": "Fever and chills",
        "onset": "1_to_3_days",
        "severity": "moderate",
        "progression": "stable",
        "associated_symptoms": ["persistent_high_fever"],
        "age_range": "adult_18_64",
        "language": "en",
        "save_history": True
    }
    response = client.post("/api/symptoms/questionnaire", json=payload)
    assert response.status_code == 200

    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT COUNT(*) FROM symptom_checks")
    count_after = c.fetchone()[0]
    conn.close()
    assert count_after == count_before + 1
