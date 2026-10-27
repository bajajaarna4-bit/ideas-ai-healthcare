"""
Clinical Triage Engine for HealthSathi AI
-----------------------------------------
Deterministic, clinically reviewed red-flag checks and multi-tier care level assessment.
Sources & References:
- NHS 111 Clinical Assessment System (CAS) & Red Flag Guidance
- UK NICE Clinical Knowledge Summaries (CKS) - Acute Chest Pain, Breathlessness, Meningitis, Stroke
- WHO IMAI (Integrated Management of Adolescent and Adult Illness) Guidelines
- CDC Emergency Warning Signs Protocol

LIMITATIONS:
1. This ruleset is an educational decision-support tool, NOT a diagnostic system.
2. It cannot replace a comprehensive in-person medical evaluation, physical examination, or diagnostic testing.
3. It relies on user-reported observations which may omit silent or atypical presentations.
4. When information is incomplete or ambiguous, the engine defaults to a safer (higher urgency) tier.
"""

from typing import List, Dict, Any, Optional, Tuple
from pydantic import BaseModel, Field

class ClinicalTriageResult(BaseModel):
    care_tier: str # 'emergency_now' | 'prompt_evaluation' | 'routine_consultation' | 'self_care_education' | 'insufficient_info'
    tier_title: Dict[str, str] # en, hi, mr
    reason_for_step: Dict[str, str] # en, hi, mr
    action_steps: Dict[str, List[str]] # en, hi, mr
    urgent_warning_signs: Dict[str, List[str]] # en, hi, mr
    summary_of_input: Dict[str, str] # en, hi, mr
    is_emergency: bool = False
    requires_immediate_escalation: bool = False
    emergency_number: str = "112 / 108"
    insufficient_info_note: Optional[Dict[str, str]] = None
    clinical_disclaimer: Dict[str, str]

# Deterministic Emergency Red Flag Definitions
CRITICAL_EMERGENCY_RED_FLAGS = {
    "radiating_chest_pain": {
        "label": {"en": "Chest pain radiating to arm, jaw, neck, or back", "hi": "छाती का दर्द जो बांह, जबड़े या पीठ में जा रहा हो", "mr": "छातीत दुखणे जे हात, जबडा किंवा पाठीत पसरत आहे"},
        "rationale": "High suspicion for acute coronary syndrome or myocardial ischemia."
    },
    "difficulty_breathing": {
        "label": {"en": "Severe shortness of breath or struggle to breathe", "hi": "सांस लेने में अत्यधिक कठिनाई या दम घुटना", "mr": "श्वास घेण्यास तीव्र त्रास किंवा दम लागणे"},
        "rationale": "High risk for acute cardiopulmonary decompensation, severe asthma, or pulmonary embolism."
    },
    "stroke_fast": {
        "label": {"en": "Sudden facial drooping, arm weakness, or slurred speech", "hi": "अचानक चेहरे का लटकना, बांह में कमजोरी, या लड़खड़ाती आवाज (FAST)", "mr": "अचानक चेहरा एका बाजूला झुकणे, हात अशक्त होणे, किंवा बोलताना अडखळणे"},
        "rationale": "FAST criteria for acute cerebrovascular stroke requiring immediate thrombolysis window."
    },
    "new_confusion_unresponsive": {
        "label": {"en": "New acute confusion, lethargy, or loss of consciousness", "hi": "अचानक मतिभ्रम, अत्यधिक सुस्ती, या बेहोशी", "mr": "अचानक गोंधळलेली मानसिक अवस्था किंवा बेशुद्धी"},
        "rationale": "Altered level of consciousness indicates central nervous system compromise, severe sepsis, or shock."
    },
    "thunderclap_headache": {
        "label": {"en": "Sudden severe 'worst headache of life' peaking in seconds", "hi": "अचानक शुरू होने वाला जीवन का सबसे भयानक सिरदर्द", "mr": "काही सेकंदांत सुरू होणारी आयुष्यातील सर्वात तीव्र डोकेदुखी"},
        "rationale": "Classic presentation for subarachnoid hemorrhage until proven otherwise."
    },
    "stiff_neck_fever": {
        "label": {"en": "Stiff neck unable to bend chin to chest with high fever and photophobia", "hi": "तेज बुखार के साथ गर्दन में अत्यधिक अकड़न और रोशनी से परेशानी", "mr": "तीव्र तापासह मान ताठ होणे आणि प्रकाशाचा त्रास"},
        "rationale": "Meningeal irritation markers pointing to acute bacterial or viral meningitis."
    },
    "anaphylaxis_signs": {
        "label": {"en": "Rapid swelling of lips, tongue, or throat with wheezing or hives", "hi": "होंठ, जीभ या गले में अचानक सूजन और सांस में घरघराहट", "mr": "ओठ, जीभ किंवा घशाला अचानक सूज आणि घरघर लागणे"},
        "rationale": "Systemic Type 1 hypersensitivity / acute anaphylaxis."
    },
    "massive_hemoptysis_hematemesis": {
        "label": {"en": "Coughing or vomiting significant amounts of blood", "hi": "उल्टी या खांसी में अधिक मात्रा में खून आना", "mr": "उलटीतून किंवा खोकल्यातून जास्त प्रमाणात रक्त येणे"},
        "rationale": "Severe acute gastrointestinal or pulmonary vascular hemorrhage."
    }
}

PROMPT_EVALUATION_FLAGS = {
    "persistent_high_fever": {
        "label": {"en": "Fever above 102°F (38.9°C) lasting over 48 hours or refractory to medication", "hi": "102°F से अधिक बुखार जो 48 घंटे से लगातार रहे", "mr": "१०२°F पेक्षा जास्त ताप जो ४८ तासांपेक्षा जास्त वेळ राहतो"}
    },
    "severe_abdominal_pain_vomiting": {
        "label": {"en": "Severe continuous abdominal pain or inability to retain fluids for >12 hours", "hi": "पेट में लगातार तेज दर्द या 12 घंटे से पानी भी न पचना", "mr": "पोटात सतत तीव्र वेदना किंवा १२ तासांपेक्षा जास्त वेळ पाणीही न टिकणे"}
    },
    "rapidly_worsening_trajectory": {
        "label": {"en": "Symptoms worsening significantly within a few hours", "hi": "लक्षण कुछ ही घंटों में तेजी से बिगड़ रहे हैं", "mr": "लक्षणे काही तासांतच वेगाने वाढत आहेत"}
    },
    "vulnerable_age_with_fever": {
        "label": {"en": "Child under 2 or adult over 65 with high fever and lethargy", "hi": "छोटे बच्चे या बुजुर्गों में तेज बुखार और सुस्ती", "mr": "लहान बाळ किंवा ज्येष्ठांमध्ये तीव्र ताप व अशक्तपणा"}
    }
}

DISCLAIMERS = {
    "en": "Important Notice: HealthSathi AI is an educational guidance tool based on clinical triage principles. It is NOT a diagnostic system and cannot confirm or rule out any disease. Always seek direct clinical evaluation from a certified medical practitioner.",
    "hi": "महत्वपूर्ण सूचना: हेल्थसाथी एआई नैदानिक प्राथमिक सिद्धांतों पर आधारित एक शैक्षिक मार्गदर्शन उपकरण है। यह कोई चिकित्सीय निदान प्रणाली नहीं है और किसी बीमारी की पुष्टि या खंडन नहीं कर सकता। व्यक्तिगत परामर्श के लिए हमेशा प्रमाणित डॉक्टर से संपर्क करें।",
    "mr": "महत्त्वाची सूचना: हेल्थसाथी एआय हे वैद्यकीय ट्रायज तत्त्वांवर आधारित एक शैक्षणिक मार्गदर्शन साधन आहे. ही कोणतीही वैद्यकीय निदान प्रणाली नाही आणि कोणताही आजार प्रमाणित करू शकत नाही. प्रत्यक्ष तपासणीसाठी नेहमी डॉक्टरांचा सल्ला घ्या."
}

def evaluate_smart_triage(
    main_symptom: str,
    onset: str,
    severity: str,
    progression: str,
    associated_symptoms: List[str],
    age_range: Optional[str] = "adult_18_64",
    language: str = "en"
) -> ClinicalTriageResult:
    """
    Evaluates questionnaire responses deterministically without hallucination.
    """
    lang = language if language in ["en", "hi", "mr"] else "en"
    main_symptom_clean = (main_symptom or "").strip()
    assoc_set = set(associated_symptoms or [])

    # Check for empty / insufficient info
    if not main_symptom_clean or len(main_symptom_clean) < 2:
        return ClinicalTriageResult(
            care_tier="insufficient_info",
            tier_title={
                "en": "Insufficient Information Provided",
                "hi": "अपर्याप्त जानकारी दर्ज की गई",
                "mr": "अपुरी माहिती नोंदवली गेली"
            },
            reason_for_step={
                "en": "No clear primary symptom was described. Safe healthcare assessment requires at least a primary symptom, onset timeline, and severity.",
                "hi": "कोई स्पष्ट मुख्य लक्षण दर्ज नहीं किया गया। सुरक्षित मूल्यांकन के लिए मुख्य लक्षण और समयावधि आवश्यक है।",
                "mr": "कोणतेही स्पष्ट मुख्य लक्षण नोंदवले गेले नाही. योग्य मार्गदर्शनासाठी मुख्य लक्षण व कालावधी आवश्यक आहे."
            },
            action_steps={
                "en": [
                    "Please describe your specific concern (e.g. headache, fever, sore throat).",
                    "Note down when it began and how intense it feels on a scale from 1 to 10.",
                    "If experiencing severe pain or distress, consult a healthcare provider."
                ],
                "hi": [
                    "कृपया अपना मुख्य लक्षण विस्तार से लिखें (उदा. सिरदर्द, बुखार, खांसी)।",
                    "यह कब शुरू हुआ और कितना गंभीर है, यह अवश्य बताएं।",
                    "यदि अत्यधिक कष्ट हो तो नजदीकी डॉक्टर से मिलें।"
                ],
                "mr": [
                    "कृपया तुमचे मुख्य लक्षण स्पष्टपणे नोंदवा (उदा. डोकेदुखी, ताप, खोकला).",
                    "ते कधी सुरू झाले आणि किती तीव्र आहे हे सांगा.",
                    "जास्त त्रास असल्यास लगेच डॉक्टरांचा सल्ला घ्या."
                ]
            },
            urgent_warning_signs={
                "en": ["Difficulty breathing", "Sudden weakness or numbness", "Chest pain", "Loss of consciousness"],
                "hi": ["सांस लेने में तकलीफ", "अचानक कमजोरी या सुन्नपन", "छाती में दर्द", "बेहोशी"],
                "mr": ["श्वास घेण्यास त्रास", "अचानक अशक्तपणा किंवा बधीरपणा", "छातीत दुखणे", "बेशुद्ध पडणे"]
            },
            summary_of_input={
                "en": "Symptom input was left blank or was too brief for a safe assessment.",
                "hi": "लक्षण विवरण खाली था या सुरक्षित विश्लेषण के लिए बहुत संक्षिप्त था।",
                "mr": "लक्षणांची माहिती रिकामी होती किंवा विश्लेषणासाठी अपुरी होती."
            },
            is_emergency=False,
            requires_immediate_escalation=False,
            insufficient_info_note={
                "en": "Medical observation cannot proceed without symptom details. Never assume safety when information is missing.",
                "hi": "लक्षणों के विवरण के बिना स्वास्थ्य अवलोकन संभव नहीं है।",
                "mr": "लक्षणांच्या तपशिलाशिवाय वैद्यकीय निरीक्षण शक्य नाही."
            },
            clinical_disclaimer=DISCLAIMERS
        )

    # 1. DETERMINISTIC RED FLAG CHECK (Tier 1: Emergency Care Now)
    detected_red_flags = []
    
    # Check associated symptoms for known critical emergency red flags
    for flag_key in CRITICAL_EMERGENCY_RED_FLAGS:
        if flag_key in assoc_set:
            detected_red_flags.append(CRITICAL_EMERGENCY_RED_FLAGS[flag_key])

    # Check free text for dangerous cardiopulmonary / neurological patterns
    main_lower = main_symptom_clean.lower()
    if any(k in main_lower for k in ["chest pain", "छाती में दर्द", "छातीत दुखणे", "heart attack"]):
        if severity in ["severe", "unbearable"] or "radiating_chest_pain" in assoc_set:
            detected_red_flags.append(CRITICAL_EMERGENCY_RED_FLAGS["radiating_chest_pain"])
    
    if any(k in main_lower for k in ["stroke", "paralysis", "slurred", "droop", "लकवा"]):
        detected_red_flags.append(CRITICAL_EMERGENCY_RED_FLAGS["stroke_fast"])

    if any(k in main_lower for k in ["cannot breathe", "gasping", "suffocating", "सांस नहीं आ रही", "दम घुटना"]):
        detected_red_flags.append(CRITICAL_EMERGENCY_RED_FLAGS["difficulty_breathing"])

    # If unbearable severity with sudden onset or rapid worsening
    if severity == "unbearable" and (onset in ["sudden_under_1hr", "today"] or progression == "worsening_rapidly"):
        detected_red_flags.append({
            "label": {
                "en": "Sudden onset of unbearable symptom intensity with rapid worsening",
                "hi": "अचानक शुरू हुआ असहनीय कष्ट जो तेजी से बिगड़ रहा है",
                "mr": "अचानक सुरू झालेला असह्य त्रास जो वेगाने वाढत आहे"
            },
            "rationale": "High-velocity acute presentation warrants acute department exclusion of acute surgical or vascular emergencies."
        })

    # If ANY emergency red flag is triggered -> Immediate Tier 1 Escalation
    if detected_red_flags:
        flag_names_en = [f["label"]["en"] for f in detected_red_flags]
        flag_names_hi = [f["label"]["hi"] for f in detected_red_flags]
        flag_names_mr = [f["label"]["mr"] for f in detected_red_flags]

        return ClinicalTriageResult(
            care_tier="emergency_now",
            tier_title={
                "en": "EMERGENCY CARE REQUIRED IMMEDIATELY",
                "hi": "तत्काल आपातकालीन चिकित्सा की आवश्यकता",
                "mr": "तातडीने आपत्कालीन उपचारांची आवश्यकता"
            },
            reason_for_step={
                "en": f"Crucial red-flag indicators were identified ({', '.join(flag_names_en[:2])}). These warning signs suggest acute conditions requiring prompt emergency equipment, oxygen, cardiac monitoring, or immediate imaging.",
                "hi": f"गंभीर आपातकालीन चेतावनी संकेत मिले हैं ({', '.join(flag_names_hi[:2])})। यह तत्काल अस्पताल में जांच की मांग करते हैं।",
                "mr": f"धोक्याचे गंभीर संकेत आढळले आहेत ({', '.join(flag_names_mr[:2])}). या लक्षणांसाठी तातडीने रुग्णालयात जाणे आवश्यक आहे."
            },
            action_steps={
                "en": [
                    "Call emergency services immediately: Dial 112 or 108 in India.",
                    "Do not drive yourself to the hospital; have an ambulance or someone assist you.",
                    "Remain calm, sit in an upright comfortable position, and loosen tight clothing around your neck.",
                    "Do not eat, drink, or take medications (like pain relievers) until evaluated by an emergency team."
                ],
                "hi": [
                    "तुरंत आपातकालीन सेवा को कॉल करें: 112 या 108 पर संपर्क करें।",
                    "स्वयं वाहन चलाकर अस्पताल न जाएं; एम्बुलेंस या परिजन की सहायता लें।",
                    "शांत रहें, आरामदायक स्थिति में सीधे बैठें और ढीले कपड़े पहनें।",
                    "डॉक्टर की जांच से पहले स्वयं कोई भारी दवा या भोजन न लें।"
                ],
                "mr": [
                    "ताबडतोब आपत्कालीन सेवेशी संपर्क करा: ११२ किंवा १०८ वर कॉल करा.",
                    "स्वतः गाडी चालवू नका; रुग्णवाहिका किंवा नातेवाईकांची मदत घ्या.",
                    "शांत बसा आणि मोकळा श्वास घेता येईल अशा आरामदायी स्थितीत राहा.",
                    "वैद्यकीय तपासणीपूर्वी परस्पर कोणतीही औषधे घेऊ नका."
                ]
            },
            urgent_warning_signs={
                "en": flag_names_en,
                "hi": flag_names_hi,
                "mr": flag_names_mr
            },
            summary_of_input={
                "en": f"Primary symptom: '{main_symptom_clean}' (Onset: {onset}, Severity: {severity}, Progression: {progression}). Associated signs: {len(assoc_set)} reported.",
                "hi": f"मुख्य लक्षण: '{main_symptom_clean}' (शुरुआत: {onset}, गंभीरता: {severity}, स्थिति: {progression})।",
                "mr": f"मुख्य लक्षण: '{main_symptom_clean}' (सुरुवात: {onset}, तीव्रता: {severity}, प्रगती: {progression})."
            },
            is_emergency=True,
            requires_immediate_escalation=True,
            emergency_number="112 / 108",
            clinical_disclaimer=DISCLAIMERS
        )

    # 2. DETERMINISTIC TIER 2 CHECK: Prompt Medical Evaluation (within 12-24 hours)
    prompt_eval_reasons_en = []
    prompt_eval_reasons_hi = []
    prompt_eval_reasons_mr = []

    if "persistent_high_fever" in assoc_set or "high_fever" in assoc_set:
        prompt_eval_reasons_en.append("Persistent high fever (>102°F) requiring clinical workup for bacterial infection, dengue, or malaria.")
        prompt_eval_reasons_hi.append("102°F से अधिक लगातार बुखार जिसके लिए रक्त परीक्षण और डॉक्टर की जांच आवश्यक है।")
        prompt_eval_reasons_mr.append("१०२°F पेक्षा जास्त सतत राहणारा ताप ज्यासाठी वैद्यकीय तपासणी आवश्यक आहे.")

    if "severe_abdominal_pain_vomiting" in assoc_set or "persistent_vomiting" in assoc_set:
        prompt_eval_reasons_en.append("Severe abdominal distress or persistent vomiting with risk of dehydration and acute intra-abdominal pathology.")
        prompt_eval_reasons_hi.append("पेट में तेज दर्द और उल्टी के कारण डिहाइड्रेशन का खतरा।")
        prompt_eval_reasons_mr.append("तीव्र पोटदुखी आणि सतत उलट्यांमुळे डिहायड्रेशनचा धोका.")

    if progression == "worsening_rapidly":
        prompt_eval_reasons_en.append("Rapidly worsening trajectory suggests acute progression that should not be managed solely at home.")
        prompt_eval_reasons_hi.append("लक्षण तेजी से बिगड़ रहे हैं, जिससे शीघ्र जांच जरूरी है।")
        prompt_eval_reasons_mr.append("लक्षणे वेगाने वाढत असल्याने तातडीने तपासणी करणे हितावह ठरेल.")

    if severity == "severe":
        prompt_eval_reasons_en.append("Severe symptom intensity disrupting normal activities warrants timely professional examination.")
        prompt_eval_reasons_hi.append("गंभीर कष्ट दैनिक कार्यों में बाधा डाल रहा है।")
        prompt_eval_reasons_mr.append("तीव्र त्रासामुळे दैनंदिन कामात अडचण येत असल्याने लवकर डॉक्टरांना दाखवा.")

    if age_range in ["child_under_12", "elderly_65_plus"] and severity in ["moderate", "severe"]:
        prompt_eval_reasons_en.append(f"Patient age range ({age_range.replace('_', ' ')}) has higher clinical vulnerability to secondary complications.")
        prompt_eval_reasons_hi.append("आयु वर्ग (बच्चे या बुजुर्ग) में जटिलताओं का जोखिम अधिक होता है।")
        prompt_eval_reasons_mr.append("वयोगट (लहान मुले किंवा ज्येष्ठ नागरिक) लक्षात घेता लवकर सल्ला घेणे योग्य ठरेल.")

    if prompt_eval_reasons_en:
        return ClinicalTriageResult(
            care_tier="prompt_evaluation",
            tier_title={
                "en": "Prompt Medical Evaluation Recommended (Within 12-24 Hours)",
                "hi": "शीघ्र चिकित्सीय परामर्श की सलाह (12-24 घंटे के भीतर)",
                "mr": "लवकर वैद्यकीय तपासणीचा सल्ला (१२-२४ तासांत)"
            },
            reason_for_step={
                "en": f"Based on your report: {prompt_eval_reasons_en[0]} While not showing acute emergency failure, this pattern warrants same-day or next-day clinic evaluation.",
                "hi": f"आपके विवरण के आधार पर: {prompt_eval_reasons_hi[0]} यह लक्षण डॉक्टर द्वारा जांच की मांग करते हैं।",
                "mr": f"तुमच्या माहितीनुसार: {prompt_eval_reasons_mr[0]} यासाठी १२ ते २४ तासांत डॉक्टरांचा सल्ला घेणे आवश्यक आहे."
            },
            action_steps={
                "en": [
                    "Contact an outpatient clinic, primary care physician, or urgent care facility today.",
                    "Record your temperature, fluid intake, and exact symptoms in a written log.",
                    "Rest quietly and hydrate with oral electrolyte fluids (ORS) or clear broths.",
                    "If symptoms shift toward chest pain, breathlessness, or confusion, escalate to emergency services (112/108)."
                ],
                "hi": [
                    "आज ही अपने नजदीकी क्लिनिक या सामान्य चिकित्सक (MD Physician) से संपर्क करें।",
                    "अपना तापमान और लक्षण एक डायरी में नोट करें।",
                    "आराम करें और ओआरएस (ORS) या नारियल पानी जैसे तरल पदार्थों का सेवन करें।",
                    "यदि सांस फूलने या बेहोशी जैसे लक्षण दिखें, तो तुरंत 112 या 108 पर कॉल करें।"
                ],
                "mr": [
                    "आजच जवळच्या दवाखान्यात किंवा डॉक्टरांशी संपर्क साधा.",
                    "तापाची व लक्षणांची नोंद ठेवा.",
                    "शांत विश्रांती घ्या आणि ओआरएस (ORS) किंवा पाण्याचे प्रमाण योग्य ठेवा.",
                    "श्वास घेण्यास त्रास किंवा चक्कर आल्यास ताबडतोब ११२ किंवा १०८ वर संपर्क करा."
                ]
            },
            urgent_warning_signs={
                "en": [
                    "Inability to tolerate oral fluids for over 12 hours",
                    "High fever not coming down with prescribed antipyretics",
                    "Development of breathlessness, confusion, or severe chest pressure"
                ],
                "hi": [
                    "12 घंटे से अधिक समय तक पानी या तरल पदार्थ न पचना",
                    "बुखार का लगातार न उतरना",
                    "सांस लेने में कठिनाई या अत्यधिक सुस्ती का बढ़ना"
                ],
                "mr": [
                    "१२ तासांपेक्षा जास्त वेळ पाणी न टिकणे",
                    "ताप सतत टिकून राहणे",
                    "श्वास घेण्यास त्रास किंवा तीव्र सुस्ती जाणवणे"
                ]
            },
            summary_of_input={
                "en": f"Symptom: '{main_symptom_clean}' | Duration: {onset} | Severity: {severity} | Progression: {progression}.",
                "hi": f"लक्षण: '{main_symptom_clean}' | अवधि: {onset} | तीव्रता: {severity} | स्थिति: {progression}।",
                "mr": f"लक्षण: '{main_symptom_clean}' | कालावधी: {onset} | तीव्रता: {severity} | प्रगती: {progression}."
            },
            is_emergency=False,
            requires_immediate_escalation=False,
            clinical_disclaimer=DISCLAIMERS
        )

    # 3. DETERMINISTIC TIER 3 CHECK: Routine Clinician Consultation
    if severity == "moderate" or onset in ["more_than_week", "chronic"] or progression == "worsening_gradually":
        return ClinicalTriageResult(
            care_tier="routine_consultation",
            tier_title={
                "en": "Schedule Routine Clinician Consultation",
                "hi": "नियमित डॉक्टर अपॉइंटमेंट की सलाह",
                "mr": "नियमित डॉक्टरांची अपॉइंटमेंट घ्या"
            },
            reason_for_step={
                "en": "Symptoms are moderate, persisting longer than a few days, or gradually worsening without acute emergency signs. A routine clinical appointment allows physical examination, diagnostic blood panels, and targeted therapy.",
                "hi": "लक्षण मध्यम हैं और कई दिनों से बने हुए हैं या धीरे-धीरे बढ़ रहे हैं। डॉक्टर से नियमित परामर्श से उचित जांच और निदान संभव होगा।",
                "mr": "लक्षणे मध्यम असून काही दिवसांपासून कायम आहेत. डॉक्टरांच्या नियमित तपासणीने योग्य रक्त चाचणी व उपचार मिळतील."
            },
            action_steps={
                "en": [
                    "Book an appointment with your family physician or general practitioner over the next 2-4 days.",
                    "Prepare a 2-day symptom log noting when symptoms peak and what alleviates or worsens them.",
                    "List your current prescription medicines, allergies, and family medical history to share with the doctor.",
                    "Maintain hydration and balanced nutrition while resting."
                ],
                "hi": [
                    "अगले 2-4 दिनों में अपने पारिवारिक डॉक्टर या जनरल फिजिशियन से मिलने का समय लें।",
                    "अपने लक्षणों, दवाओं और खान-पान का एक विवरण तैयार करें।",
                    "पर्याप्त आराम करें और हल्का, सुपाच्य भोजन लें।",
                    "यदि लक्षण अचानक बिगड़ें, तो शीघ्र डॉक्टर से मिलें।"
                ],
                "mr": [
                    "पुढील २-४ दिवसांत तुमच्या नेहमीच्या डॉक्टरांकडे अपॉइंटमेंट घ्या.",
                    "लक्षणे कधी वाढतात आणि कशाने बरे वाटते याची नोंद ठेवा.",
                    "सध्या चालू असलेली औषधे डॉक्टरांना दाखवा.",
                    "लक्षणे अचानक वाढल्यास लगेच दवाखान्यात जा."
                ]
            },
            urgent_warning_signs={
                "en": [
                    "Sudden acute escalation in pain or severity",
                    "Onset of high fever (>102°F) or stiff neck",
                    "Any shortness of breath or radiating chest discomfort"
                ],
                "hi": [
                    "दर्द या कष्ट में अचानक अत्यधिक वृद्धि",
                    "तेज बुखार या गर्दन में अकड़न होना",
                    "सांस फूलना या छाती में भारीपन"
                ],
                "mr": [
                    "वेदनेमध्ये अचानक तीव्र वाढ",
                    "तीव्र ताप किंवा मान ताठ होणे",
                    "श्वास घेण्यास अडचण किंवा छातीत दडपण"
                ]
            },
            summary_of_input={
                "en": f"Symptom: '{main_symptom_clean}' | Duration: {onset} | Severity: {severity} | Progression: {progression}.",
                "hi": f"लक्षण: '{main_symptom_clean}' | अवधि: {onset} | तीव्रता: {severity} | स्थिति: {progression}।",
                "mr": f"लक्षण: '{main_symptom_clean}' | कालावधी: {onset} | तीव्रता: {severity} | प्रगती: {progression}."
            },
            is_emergency=False,
            requires_immediate_escalation=False,
            clinical_disclaimer=DISCLAIMERS
        )

    # 4. DETERMINISTIC TIER 4 CHECK: General Self-Care Education (Supported Home Care)
    return ClinicalTriageResult(
        care_tier="self_care_education",
        tier_title={
            "en": "General Self-Care & Supportive Home Education",
            "hi": "सामान्य घरेलू देखभाल एवं विश्राम",
            "mr": "घरगुती काळजी व विश्रांती"
        },
        reason_for_step={
            "en": "Symptoms are mild, of brief duration (1-3 days), and either stable or improving without red-flag indicators. Supportive home comfort measures may assist your body's natural recovery.",
            "hi": "लक्षण हल्के हैं, हाल ही में शुरू हुए हैं और स्थिर या सुधर रहे हैं। बिना किसी गंभीर संकेत के सामान्य घरेलू विश्राम से लाभ मिल सकता है।",
            "mr": "लक्षणे सौम्य आहेत आणि कोणतीही धोक्याची चिन्हे नाहीत. घरगुती विश्रांतीने प्रकृतीत सुधारणा होऊ शकते."
        },
        action_steps={
            "en": [
                "Prioritize 8 hours of restful sleep and avoid strenuous physical exertion.",
                "Ensure robust hydration with water, warm broths, oral rehydration solutions, or herbal teas.",
                "Eat light, easily digestible whole foods rich in micronutrients.",
                "Monitor for 48 hours. If symptoms fail to improve or new concerns develop, schedule a clinician visit."
            ],
            "hi": [
                "8 घंटे की भरपूर नींद लें और भारी काम से बचें।",
                "पर्याप्त पानी, सूप, ओआरएस और तरल पदार्थ पिएं।",
                "हल्का और पौष्टिक भोजन लें।",
                "अगले 48 घंटों तक नजर रखें; सुधार न होने पर डॉक्टर से परामर्श लें।"
            ],
            "mr": [
                "८ तास चांगली विश्रांती घ्या आणि शारीरिक ताण टाळा.",
                "भरपूर पाणी, सूप आणि पौष्टिक द्रवपदार्थ घ्या.",
                "हलका आणि पचायला सोपा आहार घ्या.",
                "पुढील ४८ तास निरीक्षण करा; सुधारणा न झाल्यास डॉक्टरांचा सल्ला घ्या."
            ]
        },
        urgent_warning_signs={
            "en": [
                "This assessment is NOT an all-clear or diagnosis.",
                "Fever exceeding 102°F or lasting more than 3 days",
                "Persistent vomiting or inability to stay hydrated",
                "New onset chest pressure, breathlessness, or severe headache"
            ],
            "hi": [
                "यह कोई चिकित्सीय निदान या रोगमुक्ति का प्रमाण नहीं है।",
                "102°F से अधिक बुखार या 3 दिन से अधिक रहना",
                "पानी न टिकना या लगातार उल्टी",
                "छाती में दर्द, सांस में तकलीफ या तेज सिरदर्द"
            ],
            "mr": [
                "हे कोणतेही वैद्यकीय निदान किंवा अंतिम प्रमाणपत्र नाही.",
                "१०२°F पेक्षा जास्त ताप किंवा ३ दिवसांपेक्षा जास्त काळ राहणे",
                "सतत उलट्या किंवा पाणी न टिकणे",
                "छातीत दुखणे, श्वास लागणे किंवा तीव्र डोकेदुखी"
            ]
        },
        summary_of_input={
            "en": f"Symptom: '{main_symptom_clean}' | Duration: {onset} | Severity: {severity} | Progression: {progression}.",
            "hi": f"लक्षण: '{main_symptom_clean}' | अवधि: {onset} | तीव्रता: {severity} | स्थिति: {progression}।",
            "mr": f"लक्षण: '{main_symptom_clean}' | कालावधी: {onset} | तीव्रता: {severity} | प्रगती: {progression}."
        },
        is_emergency=False,
        requires_immediate_escalation=False,
        clinical_disclaimer=DISCLAIMERS
    )
