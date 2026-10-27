import React, { useState } from 'react';
import {
  Stethoscope,
  AlertTriangle,
  HelpCircle,
  CheckCircle2,
  PhoneCall,
  Clock,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  RefreshCw,
  Info,
  ShieldAlert,
  Calendar,
  Activity,
  HeartPulse,
  User,
  AlertCircle
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useHealthData } from '../contexts/HealthDataContext';
import { api } from '../services/api';
import { SmartQuestionnaireResponse } from '../types';

export const SymptomGuidance: React.FC = () => {
  const { language, t, format } = useLanguage();
  const { setEmergencyModalOpen } = useHealthData();

  // Step state: 1 to 5, and 6 is Results
  const [currentStep, setCurrentStep] = useState(1);

  // Form state
  const [mainSymptom, setMainSymptom] = useState('');
  const [onset, setOnset] = useState('1_to_3_days');
  const [severity, setSeverity] = useState('moderate');
  const [progression, setProgression] = useState('stable');
  const [associatedSymptoms, setAssociatedSymptoms] = useState<string[]>([]);
  const [ageRange, setAgeRange] = useState('adult_18_64');

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SmartQuestionnaireResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Common main symptom suggestions
  const commonSymptoms = [
    { en: "Headache", hi: "सिरदर्द", mr: "डोकेदुखी" },
    { en: "Fever & Chills", hi: "बुखार एवं कंपकंपी", mr: "ताप व भरून येणे" },
    { en: "Chest discomfort", hi: "छाती में भारीपन", mr: "छातीत दडपण" },
    { en: "Shortness of breath", hi: "सांस लेने में तकलीफ", mr: "श्वास घेण्यास त्रास" },
    { en: "Abdominal pain", hi: "पेट में दर्द", mr: "पोटात दुखणे" },
    { en: "Sore throat & Cough", hi: "गले में खराश एवं खांसी", mr: "घसा खवखवणे व खोकला" },
    { en: "Dizziness & Fatigue", hi: "चक्कर एवं अत्यधिक थकान", mr: "चक्कर व थकवा" },
    { en: "Skin rash / Itching", hi: "त्वचा पर दाने / खुजली", mr: "अंगावर पुरळ / खाज" }
  ];

  // Associated clinical warning signs checklist
  const warningSignOptions = [
    {
      id: "radiating_chest_pain",
      isCritical: true,
      label: {
        en: "Chest pain radiating to arm, jaw, neck, or back",
        hi: "छाती का दर्द जो बांह, जबड़े या पीठ में फैल रहा हो",
        mr: "छातीत दुखणे जे हात, जबडा किंवा पाठीत पसरत आहे"
      }
    },
    {
      id: "difficulty_breathing",
      isCritical: true,
      label: {
        en: "Severe shortness of breath, gasping, or struggle to breathe",
        hi: "सांस लेने में अत्यधिक कठिनाई या दम घुटना",
        mr: "श्वास घेण्यास तीव्र त्रास किंवा दम लागणे"
      }
    },
    {
      id: "stroke_fast",
      isCritical: true,
      label: {
        en: "Sudden facial drooping, arm weakness, or slurred speech (FAST)",
        hi: "अचानक चेहरे का लटकना, बांह में कमजोरी, या लड़खड़ाती आवाज (FAST)",
        mr: "अचानक चेहरा एका बाजूला झुकणे, हात अशक्त होणे, किंवा बोलताना अडखळणे"
      }
    },
    {
      id: "new_confusion_unresponsive",
      isCritical: true,
      label: {
        en: "New acute confusion, extreme lethargy, or loss of consciousness",
        hi: "अचानक मतिभ्रम, अत्यधिक सुस्ती, या बेहोशी",
        mr: "अचानक गोंधळलेली मानसिक अवस्था किंवा बेशुद्धी"
      }
    },
    {
      id: "thunderclap_headache",
      isCritical: true,
      label: {
        en: "Sudden severe 'worst headache of life' peaking within seconds",
        hi: "अचानक शुरू हुआ जीवन का सबसे भयानक सिरदर्द (Thunderclap)",
        mr: "काही सेकंदांत सुरू होणारी आयुष्यातील सर्वात तीव्र डोकेदुखी"
      }
    },
    {
      id: "stiff_neck_fever",
      isCritical: true,
      label: {
        en: "Stiff neck (unable to touch chin to chest) with high fever and light sensitivity",
        hi: "तेज बुखार के साथ गर्दन में अकड़न और रोशनी से परेशानी",
        mr: "तीव्र तापासह मान ताठ होणे आणि प्रकाशाचा त्रास"
      }
    },
    {
      id: "anaphylaxis_signs",
      isCritical: true,
      label: {
        en: "Rapid swelling of lips, tongue, or throat with wheezing or hives",
        hi: "होंठ, जीभ या गले में सूजन और सांस में घरघराहट",
        mr: "ओठ, जीभ किंवा घशाला अचानक सूज आणि घरघर लागणे"
      }
    },
    {
      id: "persistent_high_fever",
      isCritical: false,
      label: {
        en: "Fever above 102°F (38.9°C) lasting over 48 hours",
        hi: "102°F से अधिक बुखार जो 48 घंटे से लगातार बना हुआ है",
        mr: "१०२°F पेक्षा जास्त ताप जो ४८ तासांपेक्षा जास्त वेळ राहतो"
      }
    },
    {
      id: "severe_abdominal_pain_vomiting",
      isCritical: false,
      label: {
        en: "Severe continuous stomach pain or persistent vomiting (>12 hrs)",
        hi: "पेट में लगातार तेज दर्द या 12 घंटे से अधिक लगातार उल्टी",
        mr: "पोटात सतत तीव्र वेदना किंवा १२ तासांपेक्षा जास्त वेळ सतत उलट्या"
      }
    }
  ];

  // Check if any critical emergency red flag is selected right now
  const hasCriticalRedFlagSelected = associatedSymptoms.some(id => {
    const item = warningSignOptions.find(opt => opt.id === id);
    return item?.isCritical;
  });

  const toggleAssociatedSymptom = (id: string) => {
    setAssociatedSymptoms(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const clearAssociatedSymptoms = () => {
    setAssociatedSymptoms([]);
  };

  const handleNext = () => {
    if (currentStep === 1 && !mainSymptom.trim()) {
      setErrorMessage(
        language === 'hi'
          ? 'कृपया आगे बढ़ने से पहले अपना मुख्य लक्षण दर्ज करें।'
          : (language === 'mr' ? 'कृपया पुढे जाण्यापूर्वी तुमचे मुख्य लक्षण नोंदवा.' : 'Please describe your main symptom before continuing.')
      );
      return;
    }
    setErrorMessage(null);
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setErrorMessage(null);
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const handleStartOver = () => {
    setCurrentStep(1);
    setMainSymptom('');
    setOnset('1_to_3_days');
    setSeverity('moderate');
    setProgression('stable');
    setAssociatedSymptoms([]);
    setAgeRange('adult_18_64');
    setResult(null);
    setErrorMessage(null);
  };

  const handleSubmitQuestionnaire = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await api.submitSmartQuestionnaire({
        main_symptom: mainSymptom.trim(),
        onset,
        severity,
        progression,
        associated_symptoms: associatedSymptoms,
        age_range: ageRange,
        language,
        save_history: false // Privacy by default
      });
      setResult(response);
      setCurrentStep(6); // Results screen
    } catch (err: any) {
      console.error("Smart triage error:", err);
      setErrorMessage(err.message || 'Failed to complete questionnaire.');
    } finally {
      setIsLoading(false);
    }
  };

  // Get visual badge styling based on care tier
  const getTierBadgeInfo = (tier: string) => {
    switch (tier) {
      case 'emergency_now':
        return {
          bg: 'bg-red-50 border-red-300 text-red-950',
          badgeBg: 'bg-red-600 text-white',
          icon: ShieldAlert,
          title: language === 'hi' ? 'आपातकालीन सहायता (Tier 1)' : (language === 'mr' ? 'तातडीचे आपत्कालीन उपचार (Tier 1)' : 'Emergency Care Required Immediately (Tier 1)'),
          urgencyText: language === 'hi' ? 'जीवन रक्षा हेतु तत्काल आपातकालीन विभाग जाएं' : (language === 'mr' ? 'जीव वाचवण्यासाठी तात्काळ आपत्कालीन कक्षात जा' : 'Immediate emergency department assessment required')
        };
      case 'prompt_evaluation':
        return {
          bg: 'bg-amber-50 border-amber-300 text-amber-950',
          badgeBg: 'bg-amber-600 text-white',
          icon: AlertTriangle,
          title: language === 'hi' ? 'शीघ्र चिकित्सीय जांच (Tier 2)' : (language === 'mr' ? 'लवकर वैद्यकीय तपासणी (Tier 2)' : 'Prompt Medical Evaluation (Tier 2)'),
          urgencyText: language === 'hi' ? '12 से 24 घंटे के भीतर डॉक्टर से मिलें' : (language === 'mr' ? '१२ ते २४ तासांत डॉक्टरांना दाखवा' : 'Evaluate within 12 - 24 hours at an outpatient clinic')
        };
      case 'routine_consultation':
        return {
          bg: 'bg-blue-50 border-blue-300 text-blue-950',
          badgeBg: 'bg-blue-600 text-white',
          icon: Calendar,
          title: language === 'hi' ? 'नियमित डॉक्टर अपॉइंटमेंट (Tier 3)' : (language === 'mr' ? 'नियमित डॉक्टरांची तपासणी (Tier 3)' : 'Routine Clinician Consultation (Tier 3)'),
          urgencyText: language === 'hi' ? 'अगले 2-4 दिनों में क्लिनिक अपॉइंटमेंट लें' : (language === 'mr' ? 'पुढील २-४ दिवसांत डॉक्टरांकडे जा' : 'Schedule appointment over the next few days')
        };
      case 'self_care_education':
        return {
          bg: 'bg-emerald-50 border-emerald-300 text-emerald-950',
          badgeBg: 'bg-emerald-600 text-white',
          icon: CheckCircle2,
          title: language === 'hi' ? 'घरेलू देखभाल एवं विश्राम (Tier 4)' : (language === 'mr' ? 'घरगुती काळजी व विश्रांती (Tier 4)' : 'General Self-Care & Supportive Home Education (Tier 4)'),
          urgencyText: language === 'hi' ? 'घर पर आराम करें और 48 घंटे तक नजर रखें' : (language === 'mr' ? 'घरी विश्रांती घ्या आणि ४८ तास निरीक्षण करा' : 'Supportive home measures; not an all-clear or diagnosis')
        };
      default:
        return {
          bg: 'bg-slate-50 border-slate-300 text-slate-900',
          badgeBg: 'bg-slate-600 text-white',
          icon: Info,
          title: language === 'hi' ? 'अपर्याप्त जानकारी' : (language === 'mr' ? 'अपुरी माहिती' : 'Insufficient Information Provided'),
          urgencyText: language === 'hi' ? 'स्पष्ट लक्षणों के साथ पुनः प्रयास करें' : (language === 'mr' ? 'स्पष्ट लक्षणांसह पुन्हा प्रयत्न करा' : 'Please provide specific symptoms for a safe assessment')
        };
    }
  };

  const stepTitles = [
    t.symptoms.step1Title,
    t.symptoms.step2Title,
    t.symptoms.step3Title,
    t.symptoms.step4Title,
    t.symptoms.step5Title
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="p-2 rounded-xl bg-health-teal-100 text-health-teal-800">
            <Stethoscope className="w-5 h-5" />
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-health-navy-900">
            {t.symptoms.title}
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-health-slate-500">
          {t.symptoms.subtitle}
        </p>
      </div>

      {/* Instant Early Escalation Alert Banner if Critical Red Flag is active */}
      {hasCriticalRedFlagSelected && currentStep < 6 && (
        <div className="bg-red-50 border-2 border-red-500 rounded-2xl p-4 sm:p-5 shadow-md flex flex-wrap items-center justify-between gap-4 animate-in fade-in duration-150">
          <div className="flex items-start gap-3 max-w-xl">
            <ShieldAlert className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5 animate-bounce" />
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-red-950">
                {t.symptoms.earlyEscalationBanner}
              </h3>
              <p className="text-xs text-red-800 mt-1">
                {language === 'hi'
                  ? 'आपने एक गंभीर आपातकालीन चेतावनी संकेत चुना है। शेष फॉर्म भरने में समय बर्बाद न करें।'
                  : language === 'mr'
                  ? 'तुम्ही धोक्याचे गंभीर लक्षण निवडले आहे. बाकीचे प्रश्न भरण्यात वेळ वाया घालवू नका.'
                  : 'A high-urgency red flag was selected. Do not delay assessment to complete remaining questions.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setEmergencyModalOpen(true)}
            className="px-4 py-2.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center gap-2 ml-auto sm:ml-0"
          >
            <PhoneCall className="w-4 h-4 animate-pulse" />
            <span>{t.symptoms.earlyEscalationBtn}</span>
          </button>
        </div>
      )}

      {/* Progress Stepper (Only on Steps 1 to 5) */}
      {currentStep <= 5 && (
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-health-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-health-slate-700">
            <span>
              {format(t.symptoms.stepIndicator, {
                current: currentStep,
                total: 5,
                name: stepTitles[currentStep - 1]
              })}
            </span>
            <span className="text-health-teal-600 font-mono">
              {Math.round((currentStep / 5) * 100)}%
            </span>
          </div>

          {/* Stepper bar */}
          <div className="w-full bg-health-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-health-teal-500 to-health-navy-700 h-full rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 5) * 100}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-health-slate-400">
            <span className="flex items-center gap-1 text-emerald-700 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              {t.symptoms.privacyNotice}
            </span>
          </div>
        </div>
      )}

      {/* Questionnaire Form Container */}
      {currentStep <= 5 && (
        <div className="bg-white rounded-2xl p-5 sm:p-7 border border-health-slate-200 shadow-sm space-y-6">
          {/* STEP 1: Main Symptom */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Why we ask this banner */}
              <div className="p-3 bg-health-navy-50/70 border border-health-navy-100 rounded-xl flex items-start gap-2 text-xs text-health-navy-900">
                <Info className="w-4 h-4 text-health-teal-600 flex-shrink-0 mt-0.5" />
                <span>{t.symptoms.step1Why}</span>
              </div>

              <div>
                <label className="text-xs sm:text-sm font-bold text-health-slate-900 block mb-1">
                  {t.symptoms.step1Label}
                </label>
                <textarea
                  rows={2}
                  value={mainSymptom}
                  onChange={(e) => setMainSymptom(e.target.value)}
                  placeholder={t.symptoms.step1Placeholder}
                  className="w-full rounded-xl border border-health-slate-300 p-3 text-sm text-health-slate-900 focus:outline-none focus:ring-2 focus:ring-health-teal-500/20 focus:border-health-teal-600"
                  autoFocus
                />
              </div>

              <div>
                <span className="text-xs font-semibold text-health-slate-600 block mb-2">
                  {t.symptoms.step1Common}
                </span>
                <div className="flex flex-wrap gap-2">
                  {commonSymptoms.map((s, idx) => {
                    const label = s[language] || s.en;
                    const isSelected = mainSymptom.toLowerCase().includes(s.en.toLowerCase()) || mainSymptom.includes(label);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setMainSymptom(label)}
                        className={`text-xs px-3 py-1.5 rounded-xl border transition-all text-left ${
                          isSelected
                            ? 'bg-health-teal-50 border-health-teal-500 text-health-teal-900 font-bold ring-1 ring-health-teal-500'
                            : 'bg-health-slate-50 border-health-slate-200 hover:border-health-teal-300 text-health-slate-700'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Onset Timeline */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-3 bg-health-navy-50/70 border border-health-navy-100 rounded-xl flex items-start gap-2 text-xs text-health-navy-900">
                <Info className="w-4 h-4 text-health-teal-600 flex-shrink-0 mt-0.5" />
                <span>{t.symptoms.step2Why}</span>
              </div>

              <div>
                <label className="text-xs sm:text-sm font-bold text-health-slate-900 block mb-3">
                  {t.symptoms.step2Label}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {Object.entries(t.symptoms.onsets).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setOnset(key)}
                      className={`p-3.5 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between ${
                        onset === key
                          ? 'bg-health-teal-50 border-health-teal-500 text-health-teal-900 font-bold ring-2 ring-health-teal-500/20'
                          : 'bg-white border-health-slate-200 hover:border-health-teal-300 text-health-slate-700'
                      }`}
                    >
                      <span>{label}</span>
                      {onset === key && <CheckCircle2 className="w-4 h-4 text-health-teal-600 flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Severity & Trajectory */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="p-3 bg-health-navy-50/70 border border-health-navy-100 rounded-xl flex items-start gap-2 text-xs text-health-navy-900">
                <Info className="w-4 h-4 text-health-teal-600 flex-shrink-0 mt-0.5" />
                <span>{t.symptoms.step3Why}</span>
              </div>

              {/* Severity Selection */}
              <div>
                <label className="text-xs sm:text-sm font-bold text-health-slate-900 block mb-2">
                  {t.symptoms.step3SeverityLabel}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {Object.entries(t.symptoms.severities).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSeverity(key)}
                      className={`p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                        severity === key
                          ? key === 'unbearable'
                            ? 'bg-rose-50 border-rose-500 text-rose-950 font-bold ring-2 ring-rose-500/20'
                            : 'bg-health-teal-50 border-health-teal-500 text-health-teal-950 font-bold ring-2 ring-health-teal-500/20'
                          : 'bg-white border-health-slate-200 hover:border-health-teal-300 text-health-slate-700'
                      }`}
                    >
                      <span>{label}</span>
                      {severity === key && <CheckCircle2 className="w-4 h-4 text-health-teal-600 flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Trajectory / Progression Selection */}
              <div className="pt-2 border-t border-health-slate-100">
                <label className="text-xs sm:text-sm font-bold text-health-slate-900 block mb-2">
                  {t.symptoms.step3ProgressionLabel}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {Object.entries(t.symptoms.progressions).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setProgression(key)}
                      className={`p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                        progression === key
                          ? key === 'worsening_rapidly'
                            ? 'bg-rose-50 border-rose-500 text-rose-950 font-bold ring-2 ring-rose-500/20'
                            : 'bg-health-teal-50 border-health-teal-500 text-health-teal-950 font-bold ring-2 ring-health-teal-500/20'
                          : 'bg-white border-health-slate-200 hover:border-health-teal-300 text-health-slate-700'
                      }`}
                    >
                      <span>{label}</span>
                      {progression === key && <CheckCircle2 className="w-4 h-4 text-health-teal-600 flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Associated Warning Signs */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-3 bg-health-navy-50/70 border border-health-navy-100 rounded-xl flex items-start gap-2 text-xs text-health-navy-900">
                <Info className="w-4 h-4 text-health-teal-600 flex-shrink-0 mt-0.5" />
                <span>{t.symptoms.step4Why}</span>
              </div>

              <div>
                <label className="text-xs sm:text-sm font-bold text-health-slate-900 block mb-3">
                  {t.symptoms.step4Label}
                </label>
                <div className="space-y-2">
                  {warningSignOptions.map((opt) => {
                    const isChecked = associatedSymptoms.includes(opt.id);
                    const optLabel = opt.label[language] || opt.label.en;
                    return (
                      <div
                        key={opt.id}
                        onClick={() => toggleAssociatedSymptom(opt.id)}
                        className={`p-3 rounded-xl border text-xs transition-all cursor-pointer flex items-start gap-3 ${
                          isChecked
                            ? opt.isCritical
                              ? 'bg-rose-50/80 border-rose-400 text-rose-950 font-semibold ring-1 ring-rose-400'
                              : 'bg-health-teal-50 border-health-teal-500 text-health-teal-950 font-semibold ring-1 ring-health-teal-500'
                            : 'bg-white border-health-slate-200 hover:border-health-teal-300 text-health-slate-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="mt-0.5 rounded text-health-teal-600 focus:ring-health-teal-500"
                        />
                        <div className="flex-1">
                          <span className="leading-snug">{optLabel}</span>
                          {opt.isCritical && (
                            <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                              Red Flag
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={clearAssociatedSymptoms}
                    className="text-xs text-health-teal-700 font-semibold hover:underline"
                  >
                    {t.symptoms.noneOfAbove}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Age Bracket (Optional) */}
          {currentStep === 5 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-3 bg-health-navy-50/70 border border-health-navy-100 rounded-xl flex items-start gap-2 text-xs text-health-navy-900">
                <Info className="w-4 h-4 text-health-teal-600 flex-shrink-0 mt-0.5" />
                <span>{t.symptoms.step5Why}</span>
              </div>

              <div>
                <label className="text-xs sm:text-sm font-bold text-health-slate-900 block mb-3">
                  {t.symptoms.step5Label}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {Object.entries(t.symptoms.ageRanges).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setAgeRange(key)}
                      className={`p-3.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                        ageRange === key
                          ? 'bg-health-teal-50 border-health-teal-500 text-health-teal-900 font-bold ring-2 ring-health-teal-500/20'
                          : 'bg-white border-health-slate-200 hover:border-health-teal-300 text-health-slate-700'
                      }`}
                    >
                      <span>{label}</span>
                      {ageRange === key && <CheckCircle2 className="w-4 h-4 text-health-teal-600 flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Error notice if validation failed */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-health-slate-100">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                disabled={isLoading}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-health-slate-700 bg-health-slate-100 hover:bg-health-slate-200 transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t.symptoms.backBtn}</span>
              </button>
            ) : (
              <div></div>
            )}

            {currentStep < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-health-teal-600 to-health-navy-700 hover:opacity-95 shadow-sm transition-all flex items-center gap-1.5"
              >
                <span>{t.symptoms.nextBtn}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmitQuestionnaire}
                disabled={isLoading}
                className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-700 hover:opacity-95 shadow-md transition-all flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Evaluating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>{t.symptoms.submitBtn}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* STEP 6: Results Screen */}
      {currentStep === 6 && result && (
        <div className="bg-white rounded-2xl p-5 sm:p-7 border border-health-slate-200 shadow-md space-y-6 animate-in fade-in duration-200">
          {/* Header Action Bar with Start Over Button */}
          <div className="flex items-center justify-between pb-3 border-b border-health-slate-100">
            <h2 className="text-base sm:text-lg font-extrabold text-health-navy-950">
              {t.symptoms.resultsTitle}
            </h2>
            <button
              onClick={handleStartOver}
              className="text-xs font-bold px-3 py-1.5 bg-health-slate-100 hover:bg-health-slate-200 text-health-slate-700 rounded-xl transition-colors"
            >
              {t.symptoms.startOverBtn}
            </button>
          </div>

          {/* Care Tier Card */}
          {(() => {
            const tierInfo = getTierBadgeInfo(result.care_tier);
            const TierIcon = tierInfo.icon;
            return (
              <div className={`p-5 rounded-2xl border-2 ${tierInfo.bg} space-y-3`}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className={`p-2 rounded-xl ${tierInfo.badgeBg} shadow-sm`}>
                      <TierIcon className="w-5 h-5 text-white" />
                    </span>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider block opacity-75">
                        {t.symptoms.careTierTitle}
                      </span>
                      <h3 className="text-base sm:text-lg font-black tracking-tight">
                        {result.tier_title}
                      </h3>
                    </div>
                  </div>

                  {result.is_emergency && (
                    <button
                      onClick={() => setEmergencyModalOpen(true)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black shadow-md transition-all flex items-center gap-1.5 animate-pulse"
                    >
                      <PhoneCall className="w-4 h-4" />
                      <span>CALL 112 / 108 NOW</span>
                    </button>
                  )}
                </div>

                <div className="pt-2 border-t border-current/15 text-xs sm:text-sm font-medium">
                  {tierInfo.urgencyText}
                </div>
              </div>
            );
          })()}

          {/* Summary of Information Supplied */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold text-health-slate-500 uppercase tracking-wider">
              {t.symptoms.summaryTitle}
            </h3>
            <div className="p-3.5 bg-health-slate-50 border border-health-slate-200/80 rounded-xl text-xs text-health-slate-800 leading-relaxed font-mono">
              {result.summary_of_input}
            </div>
          </div>

          {/* Reason for the Suggested Next Step */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold text-health-slate-500 uppercase tracking-wider">
              {t.symptoms.reasonTitle}
            </h3>
            <div className="p-4 bg-sky-50/70 border border-sky-200 rounded-xl text-xs sm:text-sm text-sky-950 leading-relaxed">
              {result.reason_for_step}
            </div>
          </div>

          {/* Optional AI Plain-Language Explanation */}
          {result.ai_plain_language_explanation && (
            <div className="p-4 bg-health-teal-50/50 border border-health-teal-200 rounded-xl space-y-1">
              <span className="text-[11px] font-bold text-health-teal-800 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Plain-Language Overview
              </span>
              <p className="text-xs text-health-teal-950 leading-relaxed">
                {result.ai_plain_language_explanation}
              </p>
            </div>
          )}

          {/* Actionable Steps & Urgent Warning Signs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Actionable Steps */}
            <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2.5">
              <h3 className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{t.symptoms.actionsTitle}</span>
              </h3>
              <ul className="space-y-2 text-xs text-emerald-900">
                {result.action_steps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="font-bold text-emerald-600">•</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Warning Signs Requiring Urgent Attention */}
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2.5">
              <h3 className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>{t.symptoms.warningsTitle}</span>
              </h3>
              <ul className="space-y-2 text-xs text-amber-900">
                {result.urgent_warning_signs.map((warning, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="font-bold text-amber-600">•</span>
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Clinician Ruleset Reference & Limitations */}
          <div className="p-4 bg-health-slate-50 border border-health-slate-200 rounded-xl space-y-1.5 text-xs text-health-slate-600">
            <div className="flex items-center gap-2 font-bold text-health-navy-950">
              <ShieldCheck className="w-4 h-4 text-health-teal-600" />
              <span>{t.symptoms.rulesetReference}</span>
            </div>
            <p className="text-[11px] text-health-slate-500">
              {t.symptoms.rulesetDesc}
            </p>
            <p className="text-[11px] text-amber-900 font-medium pt-1">
              {t.symptoms.notDiagnosisNotice}
            </p>
          </div>

          {/* Mandatory Safety Footnote */}
          <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">{t.disclaimerShort}</p>
              <p className="text-[11px] text-amber-800 mt-0.5">{result.clinical_disclaimer}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
