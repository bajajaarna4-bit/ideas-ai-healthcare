# HealthSathi AI — Your Multilingual AI Health Companion 🩺✨

**HealthSathi AI** is a modern, accessible, and empathetic healthcare web application built for hackathons and patient wellness empowerment. It helps users explore health information responsibly, triage symptoms with evidence-based urgency criteria, simplify complex medical and lab reports, and manage preventive lifestyle routines across **English**, **Hindi (हिंदी)**, and **Marathi (मराठी)**.

---

## ⚠️ Healthcare Safety & Ethics Notice
> **Important**: HealthSathi AI is an **educational health awareness companion**, **NOT** a certified medical diagnostic system or physician.
> - It does **not** diagnose diseases, prescribe pharmaceuticals, or recommend altering prescribed treatments.
> - In case of acute emergencies (severe chest pain, sudden numbness/paralysis, difficulty breathing, anaphylaxis), users are escalated immediately to emergency services (**112 / 108 in India**).
> - All demonstration health vitals and patient metrics are **synthetic** and clearly labeled.
> - User input is treated strictly as untrusted data with robust prompt guards preventing injection or unsafe medical advice generation.

---

## 🌟 Key Features

1. **AI Health Assistant (`ChatAssistant.tsx`)**:
   - Conversational health guidance powered by **Google Gemini API** (Gemini 1.5 Flash) with an intelligent, evidence-based local fallback engine for offline or hackathon evaluation.
   - Plain language explanations of medical concepts (e.g. hypertension, dehydration, viral vs bacterial infections).
   - Direct language switching between English, Hindi, and Marathi.
   - Example quick-prompt chips.
   - Clear chat history action with interactive confirmation dialog.
   - Message timestamps, typing indicator, and responsive mobile layout.

2. **Smart Symptom Guidance (`SymptomGuidance.tsx`)**:
   - Step-by-step, privacy-first questionnaire (Main symptom, Onset, Severity, Trajectory/Progression, Associated warning signs, and Optional age range).
   - "Why we ask this" clinical explanations on every step to prevent unnecessary data collection.
   - **Deterministic, clinician-reviewed ruleset** based on NHS 111, NICE CKS, and WHO IMAI guidelines.
   - **Instant Early Escalation**: If critical red flags are selected (stroke FAST signs, radiating chest pain, severe breathlessness, thunderclap headache, anaphylaxis, stiff neck with fever), the system triggers an immediate emergency protocol without delaying the user through further questions.
   - 4-Tier Care Level recommendations:
     1. **Tier 1: Emergency Care Required Immediately** (`emergency_now`) - Direct link to 112 / 108.
     2. **Tier 2: Prompt Medical Evaluation** (`prompt_evaluation`) - Outpatient evaluation within 12 - 24 hours.
     3. **Tier 3: Routine Clinician Consultation** (`routine_consultation`) - Non-urgent clinic appointment over next few days.
     4. **Tier 4: General Self-Care & Supportive Home Education** (`self_care_education`) - Home comfort measures with explicit notice that this is NOT an all-clear or diagnosis.
     5. **Insufficient Information State** (`insufficient_info`) - Guidance when symptoms are too vague to triage safely.
   - **Privacy-by-Design**: Symptom questionnaire answers are **not stored by default** in the database.
   - Support for English, Hindi (हिंदी), and Marathi (मराठी).

---

## 📋 Smart Symptom Guidance Ruleset: Clinical Basis & Limitations

### Sources & Clinical Frameworks
The deterministic clinical logic in `backend/app/services/clinical_triage_engine.py` is synthesized from established international healthcare triage standards:
- **NHS 111 Clinical Assessment System (CAS)**: Urgency disposition categories (Emergency, Within 12-24h, Routine, Home Care) and red-flag escalation pathways.
- **NICE Clinical Knowledge Summaries (CKS)**: Acute chest pain protocols, suspected neurological stroke criteria (FAST), and feverish illness in vulnerable groups.
- **WHO IMAI (Integrated Management of Adolescent and Adult Illness)**: Emergency warning signs for acute respiratory distress, severe dehydration, and meningism.
- **CDC Emergency Warning Signs**: Life-threatening escalation guidelines for respiratory and cardiovascular decompensation.

### Clinical Limitations
1. **Educational & Decision-Support Only**: HealthSathi AI is **NOT** a diagnostic tool and does not replace in-person physical examination, auscultation, or laboratory diagnostics.
2. **Deterministic Primacy**: Artificial intelligence (LLMs) can explain results in plain language, but **never** overrides the deterministic clinical ruleset or invents arbitrary numerical risk scores.
3. **Never an "All-Clear"**: Safe self-care recommendations explicitly state they are not definitive clearance, as conditions can evolve rapidly.
4. **User-Reported Subjectivity**: Triage output relies on self-reported symptoms, which may omit silent physiological abnormalities (e.g., silent hypoxia or asymptomatic arrhythmias).
5. **Conservative Fallback**: When inputs are ambiguous, contradictory, or incomplete, the engine conservatively routes the user to a safer, higher-urgency disposition.

3. **Medical Report Simplifier (`ReportSimplifier.tsx`)**:
   - **Supported Input Modes**:
     - **Synthetic PDF Upload**: In-memory parsing using `pypdf` with a 10 MB limit, strict PDF mime validation, and zero file execution.
     - **Manual Lab Test Entry**: Enter individual test name, reported value, unit, and reference interval with dynamic row add/delete and sample prefill.
     - **Paste Text & Built-in Sample**: Instant one-click loading of a synthetic CBC + Metabolic panel.
   - **Deterministic Processing & Ambiguity Handling**:
     - Mathematical interval parsing: ranges (`13.5 - 17.5`), upper bounds (`< 200`), lower bounds (`> 30`), and qualitative values (`Negative`).
     - Ambiguity detection: Flags non-numeric or missing ranges with a note advising laboratory review rather than guessing clinical interpretations.
     - Unsupported format handling: Automatically detects scanned or photograph PDFs (<30 selectable characters) and returns a friendly 422 error with one-click redirection to manual entry.
   - **Healthcare Safety & Clinical Nuance**:
     - Prominent callout explaining that reference intervals vary by laboratory, patient age, gender, pregnancy, and assay methodology.
     - Clearly states that out-of-range values do not establish disease, and within-interval values do not rule out conditions.
     - Never prescribes medications or suggests changing prescribed therapies.
   - **Privacy-by-Design & AI Consent**:
     - 100% deterministic local parsing by default.
     - Optional "Enable AI Terminology Simplification" checkbox requiring explicit user consent before transmitting anonymized test names and values to Gemini AI.
     - Zero persistence by default; PDF streams are released from memory immediately after extraction.
   - **Multilingual Support**: Diagnostic explanations, clinician questions, and lifestyle tips generated in English, Hindi (हिंदी), and Marathi (मराठी).

4. **Preventive Healthcare & Daily Wellness (`PreventiveCare.tsx`)**:
   - **Medication Schedule Reminders**:
     - Allows entering medicine name, prescribed frequency (e.g., daily, twice daily, with meals), reminder time, and doctor's notes.
     - Pure reminder system: Never recommends pharmaceuticals, calculates dosages, or modifies doctor prescriptions.
     - Prominent safety disclaimer reminding users to follow their prescribing clinician's instructions.
   - **Clinical Appointment Reminders**:
     - Create, edit, complete (toggle attended), and delete appointment reminders with doctor specialty, scheduled date/time, and clinic location.
   - **Hydration Tracking**:
     - Daily water intake logging with quick-add buttons (`+250 ml (1 glass)`, `+500 ml (1 bottle)`, `+1000 ml`) and custom ml amounts.
     - Daily target progress bar with target-achieved milestones.
   - **Sleep & Physical Activity Logs**:
     - Sleep tracking: hours slept, sleep quality rating (restful, average, restless), and notes.
     - Physical activity tracking: activity type (walking, yoga, cycling, running, gym), duration in minutes, and intensity.
   - **Daily Wellness Check-in & Weekly Trend Chart**:
     - 30-second daily reflection: energy/mood level (1 to 5 with intuitive emojis), stress level, and personal notes.
     - Visual 7-day summary chart using **Recharts** with clear distinction badges between **Synthetic Demo Records** and **Actual User Entries**.
   - **Storage & In-App Reminder Limitations**:
     - In-app reminders run within your active browser tab. Truthful notice explains that background OS push notifications or SMS are not sent when the browser is closed.
     - Local SQLite persistence with zero unnecessary medical data retention.
     - Built-in data deletion control ("Clear My User Logs") to purge user entries on demand.

5. **Dashboard & Settings**:
   - Personalized greeting and accurate vitals overview.
   - Core tools quick navigation.
   - High-contrast, unambiguous Emergency Protocol banner linking directly to national emergency lines (**112 / 108**).
   - Real activity integration: displays actual dialogue counts, saved symptom sessions (if opted-in), saved lab reports (if opted-in), and today's wellness totals with zero fabricated statistics.
   - Synthetic profile editor, demo reset utility, and Gemini status check.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Recharts.
- **Backend**: Python 3.12+, FastAPI, Uvicorn, Pydantic v2, HTTPX.
- **Database**: SQLite (local persistence, thread-safe).
- **AI Engine**: Google Gemini API via REST with structured JSON responses and offline rule engine fallback.
- **Internationalization (i18n)**: Dedicated translation dictionaries (`src/i18n/en.ts`, `hi.ts`, `mr.ts`).

---

## 🚀 Installation & Run Guide (Windows & VS Code)

### Prerequisites
- **Python 3.10+** (verified on Python 3.12)
- **Node.js 18+** (verified on Node.js v20.18.0)

### 1. Clone & Setup Backend
Open a terminal in the root folder (`Ideas Healthcare`):

```powershell
# 1. Install backend Python dependencies
python -m pip install -r backend/requirements.txt
python -m pip install pytest

# 2. Configure environment variables
# Copy .env.example to backend/.env
Copy-Item backend/.env.example backend/.env

# Optional: Add your real Gemini API key in backend/.env:
# GEMINI_API_KEY=AIzaSy...
```

### 2. Setup Frontend
```powershell
# In PowerShell:
cd frontend
npm install --legacy-peer-deps
cd ..
```

---

## 💻 Running the Application

### Option A: Running with Two Terminals in VS Code

**Terminal 1 (Backend Server)**:
```powershell
python -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload
```
*Backend API will run at `http://localhost:8000`. Interactive OpenAPI documentation is available at `http://localhost:8000/docs`.*

**Terminal 2 (Frontend Dev Server)**:
```powershell
cd frontend
npm run dev
```
*Frontend will run at `http://localhost:5173`.*

---

## 🧪 Testing & Verification

Run the comprehensive pytest suite covering all 41 unit, integration, and end-to-end user journey tests across the complete application:

```powershell
python -m pytest backend/tests/ -v
```

Run specific test modules:
```powershell
# Complete 8-step user journey test
python -m pytest backend/tests/test_user_journey.py -v

# Smart symptom triage and red-flag escalation tests
python -m pytest backend/tests/test_triage_engine.py -v

# Medical report parser, interval comparisons, and PDF validation tests
python -m pytest backend/tests/test_report_analyzer.py -v

# Preventive care, medication reminders, appointments, and wellness tests
python -m pytest backend/tests/test_preventive.py -v
```

Build the production frontend bundle:
```powershell
cd frontend
npm run build
```

---

## 🔑 Environment Variables

Create `backend/.env` based on `backend/.env.example`:

| Variable | Description | Default | Security Context |
| :--- | :--- | :--- | :--- |
| `GEMINI_API_KEY` | Google Gemini API Key for live AI responses | *Optional* | **Backend only**. Never exposed to browser or frontend bundles. |
| `DATABASE_URL` | SQLite database file path | `sqlite:///./healthsathi.db` | Local thread-safe SQLite connection. |
| `FRONTEND_URL` | Allowed origin for CORS | `http://localhost:5173` | Guards API endpoints against unauthorized origins. |
| `ENVIRONMENT` | Runtime environment (`development` / `production`) | `development` | In production, restricts CORS strictly to specified frontend URLs. |
| `VITE_API_URL` | Backend URL for Vite frontend | `http://localhost:8000` | Frontend configuration for API communication. |

---

## 🔧 Troubleshooting Guide

### 1. Port 8000 Conflict (`WinError 10048` or `Address already in use`)
If another Uvicorn or Python process is occupying port 8000:
```powershell
# Find process listening on port 8000
netstat -ano | findstr :8000

# Terminate using the process ID (PID)
taskkill /F /PID <PID_NUMBER>
```

### 2. Node.js Not Recognized in PowerShell
If using a portable or standalone Node.js installation:
```powershell
$env:PATH = "C:\Users\<username>\node-portable;" + $env:PATH
node -v
npm -v
```

### 3. Resetting Demonstration Database
If you wish to reset all patient records, vitals, reminders, and chat logs back to the clean demonstration state:
- Click **"Reset Demo Data & Vitals"** in the Settings page (`/settings`), or
- Make a POST request to `http://localhost:8000/api/user/reset-demo`.

---

## 🔒 Privacy & Data Limitations

1. **Local-First Architecture**: HealthSathi AI processes all information locally by default. No personal health records or patient profiles are tracked or sold.
2. **Opt-In Storage**: Symptom assessments and uploaded laboratory reports are **never saved to disk by default**. Storage occurs only if the user explicitly opts in.
3. **In-Memory File Processing**: Uploaded PDF reports are extracted strictly in memory via `pypdf`, verified for MIME type, and closed immediately after analysis without writing temporary files to disk.
4. **Untrusted Input Sanitization**: User-entered reports and symptoms are treated strictly as unverified data payloads, preventing prompt injection or instruction overrides.
5. **In-App Reminder Limitation**:
   > **Truthful Disclosure**: Reminders run locally in the active browser tab while the web application is open. **Background operating system push notifications, SMS, or automated phone calls are not sent when the browser is closed.**

---

## ⚠️ Healthcare Safety Disclaimers

> **IMPORTANT**: HealthSathi AI is an **educational health companion**, NOT a licensed medical diagnostic system or physician.
> - **No Medical Diagnosis or Prescription**: HealthSathi AI does not diagnose diseases, prescribe pharmaceuticals, or calculate medication dosages.
> - **Prescription Integrity**: Never alter, skip, or discontinue prescribed treatments without consulting your prescribing physician.
> - **Emergency Escalation**: For acute emergency symptoms (crushing chest pain radiating to arm/jaw, sudden face drooping or speech difficulty, severe respiratory distress, acute severe trauma), contact emergency services immediately (**112 / 108 in India**).
> - **Reference Range Variability**: Laboratory reference intervals represent ~95% of a healthy reference population and vary between individual laboratories, patient demographics, and testing assays. A value outside a reference interval does not establish disease, and a value within range does not rule out underlying conditions.

---

## 📌 Known Limitations

1. **Scanned / Photograph PDFs**: PDFs consisting solely of rasterized images or photos without an underlying text layer cannot be parsed without optical character recognition (OCR). The application gracefully detects these files (HTTP 422) and offers a direct one-click switch to the **Manual Lab Test Entry** tab.
2. **In-App Reminders in Background**: Because HealthSathi AI operates as a lightweight client-side application without external SMS/telephony gateways, reminders are visible only when the browser tab is open.
3. **Offline Demo Fallback**: When `GEMINI_API_KEY` is not provided, the assistant uses a deterministic, clinician-reviewed offline rule engine covering common health topics in English, Hindi, and Marathi.

---

## 📄 License & Attribution
Created for hackathon demonstration. All health guidance is for educational and informational purposes only.
