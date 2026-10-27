# HealthSathi AI — 60–75 Second Demonstration Video Plan & Timed Script

> **Project**: HealthSathi AI — Your Multilingual AI Health Companion  
> **Target Video Duration**: 70–75 Seconds  
> **Resolution & Aspect Ratio**: 1920x1080 (1080p, 60fps, 16:9 Landscape)  
> **Tone**: Professional, compassionate, clear, authoritative yet humble  

---

## Pre-Recording Checklist & Environment Setup

Before starting screen capture, ensure the local environment is prepared:

1. **Backend Service**:
   - Ensure the FastAPI server is running:
     ```powershell
     python -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload
     ```
   - Verify health check at `http://127.0.0.1:8000/api/health` returns `status: "healthy"`.

2. **Frontend Service**:
   - Ensure the Vite React app is running:
     ```powershell
     $env:PATH = "C:\Users\Param maan\node-portable;" + $env:PATH
     npm --prefix frontend run dev
     ```
   - Open browser to `http://localhost:5173`. Set browser zoom to 100% (or 110% on high-DPI displays).

3. **Demo Data State**:
   - Navigate to **Settings** (`/settings`) and click **"Reset Demo Data"** to ensure clean initial logs.
   - Have the sample synthetic report file ready or use the built-in **"Load Synthetic Sample Report"** button in the Medical Report Simplifier.

---

## Timed Demonstration Script (75 Seconds Total)

```
00:00 ─── [01. The Problem] ────────────────────────── 00:10
00:10 ─── [02. Introduce HealthSathi AI] ───────────── 00:20
00:20 ─── [03. Multilingual Assistant in Action] ───── 00:35
00:35 ─── [04. Smart Symptom Guidance & Escalation] ── 00:45
00:45 ─── [05. Synthetic Lab Report Simplifier] ────── 00:55
00:55 ─── [06. Preventive Care Reminders & Habits] ─── 01:05
01:05 ─── [07. Impact Vision & Ethical Close] ──────── 01:15
```

---

### Segment 1: The Problem (00:00 – 00:10 | 10 seconds)
- **Screen Recording Action**:
  - Open on a rapid montage or split visual: an overwhelming search engine result page full of scary medical diagnoses, followed by an intimidating laboratory report PDF filled with dense, cryptic numbers.
- **Voiceover Narration (Spoken Word)**:
  > *"When health worries strike, millions face confusing medical jargon, language barriers, and terrifying search results that amplify anxiety instead of offering clarity."*
- **On-Screen Text (Lower Third)**:
  - `Over 75% of online health information is English-only and jargon-heavy`
- **Visual Cue**: Quick cut to the clean HealthSathi AI dashboard.

---

### Segment 2: Introduce HealthSathi AI (00:10 – 00:20 | 10 seconds)
- **Screen Recording Action**:
  - Show the HealthSathi AI Dashboard landing page.
  - Smoothly pan over the 4 primary cards: *AI Health Assistant*, *Smart Symptom Guidance*, *Medical Report Simplifier*, and *Preventive Healthcare*.
  - Show the prominent top banner with language selector (`English`, `हिंदी`, `मराठी`) and the safety emergency badge (`Emergency: 112 / 108`).
- **Voiceover Narration (Spoken Word)**:
  > *"Meet HealthSathi AI — an empathetic, privacy-first health companion that bridges linguistic divides in English, Hindi, and Marathi."*
- **On-Screen Text (Lower Third)**:
  - `HealthSathi AI: Your Multilingual AI Health Companion (EN | HI | MR)`

---

### Segment 3: Multilingual Assistant in Action (00:20 – 00:35 | 15 seconds)
- **Screen Recording Action**:
  - Click into **AI Health Assistant** (`/chat`).
  - Click the example prompt: *"What does high blood pressure mean?"*.
  - Response streams in smoothly in English with everyday analogies (garden hose metaphor), practical lifestyle tips, and a clear safety reminder.
  - Click the **Hindi (हिंदी)** language pill at the top right.
  - Ask: *"उच्च रक्तचाप क्या होता है?"* (or click the sample). The assistant immediately explains in natural conversational Hindi.
- **Voiceover Narration (Spoken Word)**:
  > *"Our AI assistant transforms intimidating clinical terms into clear, everyday concepts — seamlessly switching between English, Hindi, and Marathi, backed by verified clinical guardrails."*
- **On-Screen Text (Lower Third)**:
  - `Plain-Language Explanations • Real-Time Language Switching • Safety Guardrails`

---

### Segment 4: Smart Symptom Guidance & Safety Escalation (00:35 – 00:45 | 10 seconds)
- **Screen Recording Action**:
  - Navigate to **Symptom Guidance** (`/symptoms`).
  - Demonstrate deterministic safety-first triage: enter *"Chest pain radiating to left arm with breathlessness"*.
  - Immediately, the system displays the high-priority **EMERGENCY WARNING** modal with NHS 111 / WHO IMAI protocol callout, directing the user to dial **112 / 108** without delay.
- **Voiceover Narration (Spoken Word)**:
  > *"For symptoms, deterministic safety comes first. Clinician-reviewed red flags instantly escalate acute emergencies to hotlines 112 and 108 — never delayed by generative AI."*
- **On-Screen Text (Lower Third)**:
  - `Deterministic Red-Flag Escalation • NHS 111 & WHO Protocols • Immediate Hotline 112/108`

---

### Segment 5: Synthetic Lab Report Simplifier (00:45 – 00:55 | 10 seconds)
- **Screen Recording Action**:
  - Navigate to **Report Simplifier** (`/reports`).
  - Click **"Load Synthetic Sample Report"** (or upload synthetic PDF).
  - Show the parsed lab panel: Fasting Blood Sugar, HbA1c, and Total Cholesterol.
  - Highlight the visual range indicator (Normal vs. Elevated), the plain-language explanation, and the generated *"Questions to ask your clinician"*.
  - Note the prominent badge: *"Reference intervals vary by laboratory, age, and health status."*
- **Voiceover Narration (Spoken Word)**:
  > *"Our report simplifier breaks down diagnostic lab values into plain English, Hindi, or Marathi — equipping patients with thoughtful questions for their next clinic visit."*
- **On-Screen Text (Lower Third)**:
  - `Synthetic Diagnostic Analysis • Range Context • Clinician Discussion Prompts`

---

### Segment 6: Preventive Care Reminders & Habits (00:55 – 01:05 | 10 seconds)
- **Screen Recording Action**:
  - Navigate to **Preventive Care** (`/preventive`).
  - Show the **Medications** tab: click "Mark as Taken" on Metformin with an instant feedback toast.
  - Switch to **Hydration / Activity**: click "+250 ml Water" button.
  - Scroll slightly to show the interactive 7-day weekly wellness chart rendering genuine local SQLite data.
- **Voiceover Narration (Spoken Word)**:
  > *"Preventive care keeps patients on track with non-prescriptive medication reminders, appointment alerts, and privacy-respecting daily hydration and activity tracking."*
- **On-Screen Text (Lower Third)**:
  - `Non-Prescriptive Reminders • 7-Day Trend Analytics • Zero Unconsented Cloud Tracking`

---

### Segment 7: Impact Vision & Ethical Close (01:05 – 01:15 | 10 seconds)
- **Screen Recording Action**:
  - Cut back to the full HealthSathi AI overview screen or open the 16:9 impact slide (`deliverables/impact_slide.html`).
  - Highlight the closing safety disclaimer banner at the bottom.
  - End on the HealthSathi AI brand mark with contact/hackathon details.
- **Voiceover Narration (Spoken Word)**:
  > *"HealthSathi AI: Empowering patients with understanding, dignity, and safety across languages. Responsible healthcare guidance for everyone."*
- **On-Screen Text (Lower Third)**:
  - `Educational Guidance Companion • Does Not Replace Clinicians • Hackathon 2026`

---

## Production & Recording Guide

### 1. Recording Software Options
- **OBS Studio (Recommended)**:
  - Base (Canvas) Resolution: `1920x1080`
  - Output (Scaled) Resolution: `1920x1080`
  - FPS: `60 fps`
  - Audio: 48kHz, 24-bit stereo with Noise Suppression filter (RNNoise).
- **Loom**:
  - Record: "Screen only" or "Screen + Cam" (bottom left small circle).
  - Quality: 1080p HD.
- **Clipchamp / Windows Snipping Tool / Premiere Pro**:
  - Assemble video clips and apply smooth 0.3s crossfade transitions.

### 2. Audio & Narration Tips
- **Pacing**: Aim for approximately 130–140 words per minute (~2.2 words per second). The 150-word script above fits naturally within 70 seconds.
- **Tone**: Warm, clear, empathetic. Avoid rushed delivery.
- **Mic Technique**: Keep microphone 10–15 cm away with a pop filter to prevent plosives.

### 3. Video Editing & Polish Checklist
- [ ] No dead mouse movements; smooth cursor navigation between buttons.
- [ ] All sensitive or real personal health data is absent (only synthetic demo data shown).
- [ ] Emergency escalation warning is clearly readable and displayed prominently.
- [ ] Background music: Soft, low-volume ambient healthcare/tech instrumental (-22 dB relative to voiceover at -6 dB).
- [ ] Final video length is strictly between 60 and 75 seconds.
