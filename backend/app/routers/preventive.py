from fastapi import APIRouter
from typing import Dict, List, Any
from app.services.triage_rules import DISCLAIMERS

router = APIRouter(prefix="/api/preventive", tags=["Preventive Care"])

PREVENTIVE_CATALOG = {
    "en": {
        "screenings": [
            {
                "category": "Cardiovascular Health",
                "test": "Blood Pressure Measurement",
                "frequency": "At least once every 6-12 months (or weekly if hypertensive)",
                "target": "Below 120/80 mmHg",
                "importance": "Early detection of silent high blood pressure prevents stroke, kidney disease, and heart attacks."
            },
            {
                "category": "Metabolic Screening",
                "test": "Fasting Blood Glucose & HbA1c",
                "frequency": "Annually for adults 30+, or biannually if risk factors exist",
                "target": "Fasting < 100 mg/dL, HbA1c < 5.7%",
                "importance": "Catches prediabetes early, enabling lifestyle interventions to prevent full-blown type 2 diabetes."
            },
            {
                "category": "Lipid Management",
                "test": "Lipid Profile (Cholesterol & Triglycerides)",
                "frequency": "Every 1-2 years for adults",
                "target": "Total Cholesterol < 200 mg/dL, LDL < 100 mg/dL",
                "importance": "Helps assess arterial plaque accumulation risk and guides dietary lipid balance."
            },
            {
                "category": "Bone & Nutrition",
                "test": "Serum 25-Hydroxy Vitamin D & B12",
                "frequency": "Annually, especially for urban and vegetarian diets",
                "target": "Vitamin D > 30 ng/mL, Vitamin B12 > 200 pg/mL",
                "importance": "Crucial for bone density, neurological health, cognitive focus, and energy vitality."
            }
        ],
        "vaccinations": [
            {"vaccine": "Annual Influenza (Flu)", "schedule": "Once every year before winter / monsoon", "target_group": "All adults & elderly"},
            {"vaccine": "Tetanus, Diphtheria (Td/Tdap)", "schedule": "Booster every 10 years", "target_group": "All adults"},
            {"vaccine": "Hepatitis B (3 doses)", "schedule": "0, 1, and 6 months if not taken in childhood", "target_group": "High-risk adults / healthcare workers"},
            {"vaccine": "Pneumococcal Conjugate", "schedule": "Single or paired doses at age 65+ (or earlier if chronic respiratory illness)", "target_group": "Adults 65+ & vulnerable groups"}
        ],
        "daily_habits": [
            {"habit": "Hydration Balance", "goal": "2.5 - 3.0 Liters daily", "tip": "Drink a glass upon waking and keep a water bottle visible."},
            {"habit": "Aerobic Exercise", "goal": "150 minutes per week", "tip": "30 minutes of brisk walking 5 days a week lowers risk of chronic illness by 30%."},
            {"habit": "Sleep Recovery", "goal": "7 - 8 hours restful sleep", "tip": "Maintain consistent sleep and wake times; avoid screens 45 minutes prior."}
        ]
    },
    "hi": {
        "screenings": [
            {
                "category": "हृदय स्वास्थ्य",
                "test": "ब्लड प्रेशर (रक्तचाप) जांच",
                "frequency": "हर 6 से 12 महीने में कम से कम एक बार",
                "target": "120/80 mmHg से नीचे",
                "importance": "हाई बीपी के शुरुआती लक्षणों को पहचानकर दिल के दौरे और स्ट्रोक से बचाव।"
            },
            {
                "category": "डायबिटीज जांच",
                "test": "फास्टिंग ब्लड शुगर एवं HbA1c",
                "frequency": "30 वर्ष से अधिक उम्र के वयस्कों के लिए प्रतिवर्ष",
                "target": "फास्टिंग < 100 mg/dL, HbA1c < 5.7%",
                "importance": "प्री-डायबिटीज को समय पर पकड़कर खान-पान से पूर्ण नियंत्रण संभव।"
            },
            {
                "category": "लिपिड प्रोफाइल",
                "test": "कोलेस्ट्रॉल एवं ट्राइग्लिसराइड्स",
                "frequency": "हर 1-2 वर्ष में",
                "target": "टोटल कोलेस्ट्रॉल < 200 mg/dL",
                "importance": "धमनियों में रुकावट और दिल की बीमारियों के जोखिम को कम करता है।"
            }
        ],
        "vaccinations": [
            {"vaccine": "वार्षिक इन्फ्लूएंजा (फ्लू)", "schedule": "हर वर्ष सर्दी/मानसून से पहले", "target_group": "सभी वयस्क एवं बुजुर्ग"},
            {"vaccine": "टिटनेस बूस्टर (Td)", "schedule": "प्रत्येक 10 वर्ष में एक बार", "target_group": "सभी वयस्क"}
        ],
        "daily_habits": [
            {"habit": "पर्याप्त जल सेवन", "goal": "2.5 से 3 लीटर प्रतिदिन", "tip": "सुबह उठते ही एक गिलास पानी पिएं।"},
            {"habit": "शारीरिक व्यायाम", "goal": "सप्ताह में 150 मिनट", "tip": "रोजाना 30 मिनट तेज चाल से टहलें।"}
        ]
    },
    "mr": {
        "screenings": [
            {
                "category": "हृदय आरोग्य",
                "test": "रक्तदाब (Blood Pressure) तपासणी",
                "frequency": "दर ६ ते १२ महिन्यांतून एकदा",
                "target": "120/80 mmHg पेक्षा कमी",
                "importance": "उच्च रक्तदाब वेळेवर ओळखून हृदयविकार व स्ट्रोक टाळणे."
            },
            {
                "category": "मधुमेह तपासणी",
                "test": "फास्टिंग ब्लड शुगर व HbA1c",
                "frequency": "दरवर्षी एकदा (वय ३०+)",
                "target": "Fasting < 100 mg/dL, HbA1c < 5.7%",
                "importance": "मधुमेह सुरू होण्यापूर्वीच योग्य जीवनशैलीने नियंत्रित करणे शक्य."
            }
        ],
        "vaccinations": [
            {"vaccine": "फ्लू लस (Influenza)", "schedule": "दरवर्षी एकदा", "target_group": "सर्व प्रौढ व ज्येष्ठ नागरिक"},
            {"vaccine": "धनुर्वात (Tetanus)", "schedule": "दर १० वर्षांनी बूस्टर", "target_group": "सर्व प्रौढ व्यक्ती"}
        ],
        "daily_habits": [
            {"habit": "पाणी पिणे", "goal": "२.५ ते ३ लिटर रोज", "tip": "सकाळी उठल्यावर पाणी पिण्याची सवय ठेवा."},
            {"habit": "नियमित व्यायाम", "goal": "आठवड्यात १५० मिनिटे", "tip": "दररोज किमान ३० मिनिटे जलद गतीने चाला."}
        ]
    }
}

@router.get("/recommendations")
def get_preventive_recommendations(language: str = "en", age: int = 34, gender: str = "Male"):
    lang = language if language in ["en", "hi", "mr"] else "en"
    catalog = PREVENTIVE_CATALOG.get(lang, PREVENTIVE_CATALOG["en"])
    return {
        "language": lang,
        "age": age,
        "gender": gender,
        "screenings": catalog["screenings"],
        "vaccinations": catalog["vaccinations"],
        "daily_habits": catalog["daily_habits"],
        "disclaimer": DISCLAIMERS[lang]
    }
