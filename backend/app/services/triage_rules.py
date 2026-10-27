import re
from typing import Dict, List, Tuple

# Emergency red flag keywords and patterns
EMERGENCY_RED_FLAGS = [
    r"chest pain",
    r"radiating to (arm|jaw|back)",
    r"shortness of breath",
    r"difficulty breathing",
    r"cannot breathe",
    r"stroke",
    r"facial drooping",
    r"arm weakness",
    r"slurred speech",
    r"sudden loss of vision",
    r"unconscious",
    r"fainting with chest pain",
    r"coughing blood",
    r"vomiting blood",
    r"severe allergic reaction",
    r"anaphylaxis",
    r"swelling of (?:tongue|throat)",
    r"worst headache of life",
    r"seizure",
    r"छाती में दर्द",
    r"सांस लेने में तकलीफ",
    r"बेहोश",
    r"छातीत दुखणे",
    r"श्वास घेण्यास त्रास"
]

URGENT_CARE_FLAGS = [
    r"high fever",
    r"fever above 102",
    r"fever above 103",
    r"severe abdominal pain",
    r"uncontrolled vomiting",
    r"dehydration",
    r"deep cut",
    r"inability to keep fluids down",
    r"तेज बुखार",
    r"पोटात तीव्र वेदना"
]

DISCLAIMERS = {
    "en": "Disclaimer: HealthSathi AI is an educational health awareness companion, not a certified medical diagnostic system or doctor. If you are experiencing severe, worsening, or life-threatening symptoms, please call emergency services (112 / 108 in India) or visit the nearest emergency room immediately.",
    "hi": "अस्वीकरण: हेल्थसाथी एआई केवल एक शैक्षिक स्वास्थ्य जागरूकता साधन है, कोई प्रमाणित चिकित्सीय निदान प्रणाली या डॉक्टर नहीं है। यदि आपको गंभीर या जानलेवा लक्षण महसूस हो रहे हैं, तो तुरंत आपातकालीन सेवा (112 / 108) पर कॉल करें या नजदीकी अस्पताल जाएं।",
    "mr": "अस्वीकरण: हेल्थसाथी एआय हे केवळ एक शैक्षणिक आरोग्य मार्गदर्शन साधन आहे, कोणताही अधिकृत वैद्यकीय निदान करणारा डॉक्टर नाही. तुम्हाला तीव्र किंवा जीवघेणी लक्षणे आढळल्यास ताबडतोब आपत्कालीन सेवेशी (112 / 108) संपर्क साधा किंवा जवळच्या रुग्णालयात जा."
}

def detect_triage_level(text: str, severity: str = "moderate") -> Tuple[str, List[str]]:
    """
    Returns (triage_level, red_flags)
    triage_level: 'emergency' | 'urgent_care' | 'routine_doctor' | 'self_care'
    """
    text_lower = text.lower()
    matched_red_flags = []

    for pattern in EMERGENCY_RED_FLAGS:
        if re.search(pattern, text_lower):
            matched_red_flags.append(pattern)

    if matched_red_flags or severity.lower() == "severe":
        clean_flags = [
            "Severe symptom pattern detected",
            "Potential need for immediate acute evaluation"
        ]
        if any(re.search(p, text_lower) for p in [r"chest pain", r"सांस", r"श्वास", r"breath", r"छाती"]):
            clean_flags.append("Cardiopulmonary warning signs present")
        if any(re.search(p, text_lower) for p in [r"stroke", r"facial", r"speech", r"weakness"]):
            clean_flags.append("Neurological warning signs present (FAST criteria)")
        return "emergency", clean_flags

    for pattern in URGENT_CARE_FLAGS:
        if re.search(pattern, text_lower):
            return "urgent_care", ["Prompt evaluation recommended within 12-24 hours"]

    if severity.lower() == "moderate":
        return "routine_doctor", []

    return "self_care", []
