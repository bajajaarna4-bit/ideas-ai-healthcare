export const en = {
  appName: "HealthSathi AI",
  appTagline: "Your Multilingual AI Health Companion",
  disclaimerShort: "Educational Tool Only — Not a Substitute for Medical Advice or Diagnosis.",
  disclaimerFull: "Disclaimer: HealthSathi AI is an educational health awareness platform, not a certified medical diagnostic system or physician. It does not diagnose medical conditions, prescribe medication, or alter clinical treatment plans. If you suspect an acute medical emergency, call 112 / 108 or your local emergency number immediately.",
  syntheticNotice: "Demo Environment: Displaying synthetic demonstration data for illustration purposes.",

  // Navigation
  nav: {
    dashboard: "Dashboard",
    assistant: "AI Health Assistant",
    symptoms: "Symptom Guidance",
    reports: "Report Simplifier",
    preventive: "Preventive Care",
    settings: "Settings & Language",
    emergency: "Emergency 112/108",
  },

  // Dashboard
  dashboard: {
    welcome: "Welcome back, {name}",
    welcomeSub: "Your personalized preventative health overview and AI wellness companion.",
    emergencyBannerTitle: "Experiencing severe chest pain, breathlessness, or stroke symptoms?",
    emergencyBannerBtn: "Access Emergency Protocol",
    quickActionsTitle: "Core Health Tools",
    aiAssistantTitle: "AI Health Assistant",
    aiAssistantDesc: "Ask wellness questions, explore health guidance, and learn with multilingual support.",
    symptomGuidanceTitle: "Symptom Guidance",
    symptomGuidanceDesc: "Structured symptom exploration with urgency triage and doctor question prep.",
    reportSimplifierTitle: "Report Simplifier",
    reportSimplifierDesc: "Transform complex blood tests and pathology jargon into simple explanations.",
    preventiveCareTitle: "Preventive Health",
    preventiveCareDesc: "Track recommended screenings, adult vaccines, and daily vital benchmarks.",
    wellnessSummaryTitle: "Your Health Vitals Summary",
    bloodPressure: "Blood Pressure",
    bloodGlucose: "Fasting Glucose",
    heartRate: "Resting Heart Rate",
    hydration: "Daily Hydration",
    optimal: "Optimal",
    attentionNeeded: "Review with Doctor",
    normal: "Normal Range",
    upcomingReminders: "Upcoming Health Reminders",
    noReminders: "No pending reminders for today.",
    markDone: "Done",
    recentActivity: "Recent Companion Activity",
    syntheticBadge: "Synthetic Demonstration Data",
    recentAssistantTitle: "Recent Health Assistant Dialogues",
    recentSymptomsTitle: "Saved Symptom Sessions",
    recentReportsTitle: "Saved Laboratory Reports",
    noSavedSymptoms: "No symptom sessions saved (sessions are kept private unless explicitly opted-in).",
    noSavedReports: "No lab reports saved locally.",
    noChatsYet: "No chat dialogues recorded yet. Start asking a question below.",
    realDataOnly: "Actual User Activity",
  },

  // Chat Assistant
  chat: {
    title: "AI Health Assistant",
    subtitle: "Conversational health awareness and wellness education powered by Gemini AI.",
    placeholder: "Ask about symptoms, healthy habits, nutrition, or medical terms...",
    send: "Send",
    thinking: "HealthSathi AI is analyzing...",
    clearHistory: "Clear Chat",
    safetyNotice: "HealthSathi AI provides general health insights. Never disregard professional clinical advice.",
    suggestedPromptsTitle: "Common Questions to Explore:",
    prompt1: "What are early signs of high blood sugar?",
    prompt2: "How can I lower my cholesterol through diet?",
    prompt3: "What questions should I ask during an annual checkup?",
    prompt4: "When is a persistent cough considered urgent?",
  },

  // Symptom Guidance
  symptoms: {
    title: "Smart Symptom Guidance & Triage",
    subtitle: "A step-by-step, clinically reviewed assessment to guide appropriate care levels. Not a diagnostic tool.",
    stepIndicator: "Step {current} of {total}: {name}",
    nextBtn: "Continue",
    backBtn: "Previous Step",
    startOverBtn: "Start Over",
    submitBtn: "Complete Assessment",
    privacyNotice: "Privacy Protected: Symptom answers are processed during this session only and are not stored by default.",
    earlyEscalationBanner: "CRITICAL RED FLAG DETECTED: A potentially life-threatening warning sign was selected. Do not delay assessment to complete remaining questions.",
    earlyEscalationBtn: "Access Emergency Protocol Now (112 / 108)",

    // Steps
    step1Title: "Primary Symptom",
    step1Why: "Why we ask: Anchors clinical review pathways to specific physiological organ systems.",
    step1Label: "What is your main symptom or concern today?",
    step1Placeholder: "e.g., Throbbing headache, chest discomfort, fever, cough...",
    step1Common: "Select or type your primary symptom:",

    step2Title: "Onset Timeline",
    step2Why: "Why we ask: Distinguishes hyper-acute sudden emergencies from subacute or chronic illness.",
    step2Label: "When did this symptom start?",

    step3Title: "Severity & Trajectory",
    step3Why: "Why we ask: Trajectory identifies whether an illness is stabilizing or accelerating towards severe decompensation.",
    step3SeverityLabel: "How intense is the symptom right now?",
    step3ProgressionLabel: "How has the symptom changed since it began?",

    step4Title: "Associated Warning Signs",
    step4Why: "Why we ask: Checks for systemic clinical red flags (such as stroke FAST criteria, chest radiating pain, or meningeal signs).",
    step4Label: "Are you experiencing any of these associated warning signs? (Select all that apply):",
    noneOfAbove: "None of these warning signs apply to me",

    step5Title: "Age Bracket (Optional)",
    step5Why: "Why we ask: Age groups like children (<12) and older adults (65+) carry elevated physiological vulnerability to dehydration and atypical infections.",
    step5Label: "Select your approximate age group (optional):",
    skipAge: "Skip / Prefer not to say",

    // Options
    onsets: {
      sudden_under_1hr: "Sudden onset (within the past hour)",
      today: "Earlier today (under 24 hours)",
      "1_to_3_days": "1 to 3 days ago",
      "4_to_7_days": "4 to 7 days ago",
      more_than_week: "More than 1 week ago",
      chronic: "Ongoing / Chronic (several weeks or months)"
    },
    severities: {
      mild: "Mild (Noticeable but easily manageable)",
      moderate: "Moderate (Uncomfortable; disrupting daily tasks)",
      severe: "Severe (Intense; unable to do normal activities)",
      unbearable: "Unbearable / Worst ever experienced"
    },
    progressions: {
      improving: "Improving (Getting noticeably better)",
      stable: "Stable (Staying about the same)",
      worsening_gradually: "Worsening gradually over days",
      worsening_rapidly: "Worsening rapidly within hours"
    },
    ageRanges: {
      child_under_12: "Child (Under 12 years)",
      teen_12_17: "Adolescent (12 - 17 years)",
      adult_18_64: "Adult (18 - 64 years)",
      elderly_65_plus: "Older Adult (65+ years)",
      prefer_not_to_say: "Prefer not to disclose"
    },

    // Results View
    resultsTitle: "Clinical Guidance & Next Steps",
    careTierTitle: "Recommended Level of Care",
    reasonTitle: "Clinical Rationale for this Recommendation",
    actionsTitle: "Recommended Actionable Steps",
    warningsTitle: "Warning Signs Requiring Immediate Emergency Attention",
    summaryTitle: "Summary of Information Provided",
    rulesetReference: "Clinical Ruleset Reference",
    rulesetDesc: "Based on NHS 111 Clinical Assessment System (CAS), NICE Clinical Knowledge Summaries, and WHO IMAI Emergency Protocol.",
    notDiagnosisNotice: "Important Limitation: This assessment is NOT a definitive diagnosis or medical clearance. Clinical conditions can change rapidly. When in doubt, always consult a licensed doctor."
  },

  // Report Simplifier
  reports: {
    title: "Medical Report Simplifier",
    subtitle: "Understand your diagnostic tests, laboratory reference intervals, and clinical terms in plain language.",
    syntheticBanner: "Demonstration Mode: Uploaded files and entered tests are processed locally. Use synthetic or anonymized reports.",
    
    // Tabs
    tabPdf: "Upload PDF Report",
    tabManual: "Manual Test Entry",
    tabPaste: "Paste Text / Sample",

    // PDF Upload Tab
    pdfUploadTitle: "Upload Text-Based Diagnostic PDF",
    pdfUploadDesc: "Upload an official synthetic or anonymized laboratory report in PDF format (up to 10 MB).",
    pdfDropzone: "Click to select or drag and drop a PDF file here",
    pdfFileSelected: "Selected file:",
    pdfScannedNotice: "Note: Scanned or photograph PDFs without selectable text are not supported. If you have an image/scan, please use the Manual Test Entry tab.",
    pdfUploadBtn: "Analyze & Simplify PDF",

    // Manual Entry Tab
    manualTitle: "Enter Lab Test Parameters Manually",
    manualDesc: "Enter individual diagnostic test markers, reported values, units, and laboratory-printed reference ranges.",
    colTestName: "Test / Marker Name",
    colValue: "Reported Value",
    colUnit: "Unit",
    colReference: "Reference Interval",
    addTestBtn: "Add Another Test",
    removeTestBtn: "Remove",
    loadSampleManualBtn: "Load Sample Markers",
    manualAnalyzeBtn: "Analyze Manual Entries",
    testNamePlaceholder: "e.g. Hemoglobin, Fasting Blood Sugar",
    valuePlaceholder: "e.g. 11.2, 126, Negative",
    unitPlaceholder: "e.g. g/dL, mg/dL, %",
    referencePlaceholder: "e.g. 13.5 - 17.5, < 200",

    // Paste Text Tab
    inputLabel: "Paste Lab Report or Diagnostic Text",
    inputPlaceholder: "e.g., Hemoglobin: 11.2 g/dL (Reference: 13.5 - 17.5 g/dL), Fasting Blood Sugar: 126 mg/dL...",
    loadSampleBtn: "Load Sample Blood Panel",
    simplifyBtn: "Simplify & Explain Report",
    
    // AI & Privacy
    aiConsentTitle: "Enable AI Terminology Simplification",
    aiConsentDesc: "Transmits anonymized test names and values to Gemini AI for conversational explanations. When unchecked, reports are processed 100% locally on device.",
    privacyNote: "Zero-persistence guarantee: Uploaded files and extracted data are discarded immediately after processing and never stored on disk without explicit consent.",

    // Processing & Status
    processing: "Extracting and analyzing diagnostic markers...",
    resultsTitle: "Simplified Report Analysis",
    findingsTitle: "Key Diagnostic Markers",
    testName: "Test Name",
    yourValue: "Your Value",
    referenceRange: "Reference Interval",
    status: "Status",
    explanation: "Plain Language Meaning",
    clinicalNote: "Clinical Context",
    
    // Status Badges
    statusWithin: "Within Interval",
    statusAbove: "Above Interval",
    statusBelow: "Below Interval",
    statusAmbiguous: "Ambiguous / Review with Doctor",
    
    abnormalCountBadge: "{count} Out-of-Interval Markers",
    ambiguousCountBadge: "{count} Ambiguous Markers",
    allNormalBadge: "All Markers Within Reference Interval",
    
    // Clinical Nuance
    referenceNuanceTitle: "Important Clinical Context Regarding Reference Intervals",
    referenceNuanceText: "Laboratory reference intervals represent where approximately 95% of a healthy reference population falls. Reference intervals vary between individual laboratories, patient age, gender, pregnancy status, and specific test assays. A value outside the interval does not automatically confirm disease, and a value within the interval does not rule out underlying conditions. Never modify prescribed medications or treatment without consulting your physician.",

    // Questions & Tips
    questionsForDoctor: "Important Questions to Ask Your Clinician",
    lifestyleTips: "Evidence-Based Lifestyle Considerations",
    disclaimer: "This report analysis is for educational and communication support only. It does not constitute medical diagnosis or clinical evaluation. Please review all test results with a qualified healthcare professional.",
  },

  // Preventive Care
  preventive: {
    title: "Preventive Healthcare & Daily Wellness",
    subtitle: "Manage prescribed medication schedules, clinical appointments, hydration, sleep recovery, and habit check-ins.",
    
    // Sub-Tabs
    tabMedications: "Medication Reminders",
    tabAppointments: "Appointments",
    tabHydration: "Hydration Tracker",
    tabSleepActivity: "Sleep & Activity",
    tabCheckinSummary: "Daily Check-in & Trends",
    tabEducationGoals: "Screenings & Targets",

    // In-App Reminder Limitation Notice
    reminderLimitationNotice: "Notice: In-app reminders trigger locally while HealthSathi AI is active in an open browser tab. Background operating system push notifications or SMS are not sent when the application is closed.",
    generalNotice: "General wellness guidance only: Wellness targets and habit tracking are not medical prescriptions. Always prioritize clinical instructions from your doctor.",

    // Medications
    medTitle: "Prescription Medication Reminders",
    medSubtitle: "Keep track of doctor-prescribed medicine times and dosing intervals.",
    medDisclaimer: "Safety Notice: This is a reminder system only. HealthSathi AI does not prescribe medicines, calculate dosages, or modify prescribed treatments. Always follow your doctor's exact prescription and consult a qualified healthcare provider if unsure.",
    addMedBtn: "Add Medication Reminder",
    medNameLabel: "Medication Name",
    medNamePlaceholder: "e.g. Amlodipine 5mg, Metformin 500mg",
    medScheduleLabel: "Prescribed Frequency",
    medSchedulePlaceholder: "e.g. Once Daily, Twice Daily, With Meals",
    medTimeLabel: "Reminder Time",
    medTimePlaceholder: "e.g. 08:30 AM",
    medNotesLabel: "Prescription Instructions / Notes",
    medNotesPlaceholder: "e.g. Take with water after breakfast",
    markTakenBtn: "Mark Taken",
    takenBadge: "Taken Today",
    pendingBadge: "Pending",
    emptyMeds: "No medication reminders added yet.",

    // Appointments
    apptTitle: "Clinical Appointments",
    apptSubtitle: "Schedule, track, and prepare for doctor visits and diagnostic consultations.",
    addApptBtn: "Schedule Appointment",
    apptDoctorLabel: "Doctor Name & Specialty",
    apptDoctorPlaceholder: "e.g. Dr. Anita Mehta (Cardiologist)",
    apptDateTimeLabel: "Appointment Date & Time",
    apptDateTimePlaceholder: "e.g. 2026-11-05 10:30 AM",
    apptLocationLabel: "Clinic Location / Telehealth Link",
    apptLocationPlaceholder: "e.g. Apex Heart Center, Suite 204",
    apptNotesLabel: "Preparation Notes",
    apptNotesPlaceholder: "e.g. Bring fasting lab report and ECG copy",
    emptyAppts: "No upcoming clinical appointments scheduled.",
    completedBadge: "Attended / Completed",
    upcomingBadge: "Upcoming",

    // Hydration
    hydrationTitle: "Daily Hydration Tracking",
    hydrationSubtitle: "Maintain adequate daily water balance for optimal cellular and cardiovascular function.",
    todayWater: "Today's Intake",
    waterTarget: "Daily Target",
    quickAddWater: "Quick Add Water",
    addGlass: "+250 ml (1 Glass)",
    addBottle: "+500 ml (1 Bottle)",
    addLiter: "+1000 ml",
    customWater: "Custom Water Amount (ml)",
    logWaterBtn: "Log Hydration",
    waterGoalReached: "Target Achieved! Excellent hydration today.",
    waterGoalRemaining: "{remaining} ml remaining to reach your target",

    // Sleep & Activity
    sleepActivityTitle: "Sleep & Physical Activity Logs",
    sleepActivitySubtitle: "Log circadian sleep recovery and aerobic physical exercise.",
    logSleepBtn: "Log Sleep",
    logActivityBtn: "Log Activity",
    sleepHoursLabel: "Hours Slept",
    sleepQualityLabel: "Sleep Quality",
    sleepRestful: "Deep / Restful 🌙",
    sleepAverage: "Average / Normal 😴",
    sleepRestless: "Disturbed / Restless 🥱",
    activityTypeLabel: "Activity Type",
    activityWalking: "Brisk Walking 🚶",
    activityYoga: "Yoga / Stretching 🧘",
    activityCycling: "Cycling 🚴",
    activityRunning: "Running / Jogging 🏃",
    activityGym: "Strength / Gym 🏋️",
    activityDurationLabel: "Duration (Minutes)",
    activityIntensityLabel: "Intensity",
    intensityLight: "Light",
    intensityModerate: "Moderate",
    intensityVigorous: "Vigorous",

    // Daily Check-in & Trends
    checkinTitle: "Daily Wellness Check-in",
    checkinSubtitle: "A 30-second daily reflection to record mood, energy, and stress levels.",
    moodLabel: "Energy & Mood Level",
    moodExhausted: "Exhausted 🌧️",
    moodLow: "Low 🥱",
    moodNeutral: "Neutral 😐",
    moodGood: "Good 😊",
    moodGreat: "Great 🌟",
    stressLabel: "Stress Level",
    stressLow: "Low Stress",
    stressModerate: "Moderate Stress",
    stressHigh: "High Stress",
    reflectionLabel: "Daily Reflection / Symptoms Note",
    submitCheckinBtn: "Record Daily Check-in",
    weeklyTrendTitle: "7-Day Wellness Trends",
    weeklyTrendSubtitle: "Aggregated visual metrics distinguishing user entries from synthetic demo logs.",
    syntheticBadge: "Synthetic Demo Data",
    userBadge: "Actual User Entry",

    // Targets & Screenings
    targetsTitle: "Configurable Wellness Goals",
    waterTargetLabel: "Daily Water Target (ml)",
    sleepTargetLabel: "Daily Sleep Target (hours)",
    activityTargetLabel: "Daily Active Target (minutes)",
    saveTargetsBtn: "Update Goals",
    targetsUpdated: "Wellness targets updated successfully!",

    screeningsTab: "Screening Schedule",
    vaccinationsTab: "Adult Immunizations",
    habitsTab: "Daily Wellness Targets",
    vitalsTab: "Log & View Vitals",
    frequency: "Recommended Frequency",
    targetGoal: "Clinical Target",
    whyItMatters: "Why This Test Matters",
    logNewVital: "Log New Vital Reading",
    vitalType: "Vital Sign",
    value: "Value",
    secondaryValue: "Diastolic (for BP)",
    notes: "Notes / Context",
    saveVital: "Record Reading",
    vitalsChartTitle: "7-Day Vitals Trend",

    // Privacy Deletion Controls
    clearLogsBtn: "Clear My User Logs",
    resetDemoBtn: "Reset Demonstration Data",
    clearSuccess: "User wellness logs deleted successfully."
  },

  // Settings
  settings: {
    title: "Settings & Personalization",
    subtitle: "Manage your language preference, synthetic demonstration profile, and data privacy.",
    languageSection: "Display & Assistant Language",
    profileSection: "User Profile (Demonstration)",
    name: "Full Name",
    age: "Age",
    gender: "Gender",
    bloodGroup: "Blood Group",
    allergies: "Known Allergies",
    chronicConditions: "Pre-existing Conditions",
    saveProfile: "Update Profile",
    savedSuccess: "Profile updated successfully!",
    privacySection: "Data Privacy & Local Storage",
    privacyNotice: "HealthSathi AI processes information locally and through private API calls. No personal health records are permanently sold or tracked.",
    resetDataBtn: "Reset Demo Data & Vitals",
    apiStatusTitle: "Backend & Gemini AI Status",
    geminiActive: "Gemini AI Engine Active",
    geminiFallback: "Offline Fallback Engine Active (Safe Rule Engine)",
  }
};
