import sys
import os
import io
import pytest
from datetime import date
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from app.main import app

client = TestClient(app)

def test_journey_step_1_dashboard_summary():
    """Step 1: Open the dashboard and verify accurate module summaries."""
    res = client.get("/api/dashboard/summary")
    assert res.status_code == 200
    data = res.json()
    assert "profile" in data
    assert "assistant_activity" in data
    assert "symptom_activity" in data
    assert "report_activity" in data
    assert "upcoming_reminders" in data
    assert "wellness_today" in data
    # Verify no fabricated counts
    assert isinstance(data["assistant_activity"]["total_messages"], int)
    assert isinstance(data["wellness_today"]["hydration_ml"], int)

def test_journey_step_2_and_3_ask_health_question_multilingual():
    """Step 2 & 3: Ask health questions and switch languages (EN, HI, MR)."""
    # English question
    res_en = client.post("/api/chat", json={"message": "What does high blood pressure mean?", "language": "en"})
    assert res_en.status_code == 200
    data_en = res_en.json()
    assert data_en["language"] == "en"
    assert "blood pressure" in data_en["reply"].lower()
    assert "disclaimer" in data_en
    assert data_en["red_flag_alert"] is False

    # Hindi question
    res_hi = client.post("/api/chat", json={"message": "हाई ब्लड प्रेशर का क्या मतलब है?", "language": "hi"})
    assert res_hi.status_code == 200
    data_hi = res_hi.json()
    assert data_hi["language"] == "hi"
    assert "रक्तचाप" in data_hi["reply"]

    # Marathi question
    res_mr = client.post("/api/chat", json={"message": "हाय ब्लड प्रेशर म्हणजे काय?", "language": "mr"})
    assert res_mr.status_code == 200
    data_mr = res_mr.json()
    assert data_mr["language"] == "mr"
    assert "रक्तदाब" in data_mr["reply"]

    # Red-flag emergency check (Stroke FAST signs)
    res_emerg = client.post("/api/chat", json={"message": "My father has sudden facial drooping and slurred speech", "language": "en"})
    assert res_emerg.status_code == 200
    data_emerg = res_emerg.json()
    assert data_emerg["red_flag_alert"] is True
    assert data_emerg["emergency_number"] == "112 / 108"

def test_journey_step_4_symptom_questionnaire():
    """Step 4: Complete the symptom questionnaire with safety triage."""
    # Red-flag early escalation test
    payload_emergency = {
        "main_symptom": "Severe crushing chest pain radiating to left arm",
        "onset": "sudden_under_1hr",
        "severity": "unbearable",
        "progression": "worsening_rapidly",
        "associated_symptoms": ["chest_radiating_arm_jaw", "shortness_of_breath"],
        "age_range": "adult_18_64",
        "language": "en",
        "save_history": False
    }
    res_emerg = client.post("/api/symptoms/questionnaire", json=payload_emergency)
    assert res_emerg.status_code == 200
    data_emerg = res_emerg.json()
    assert data_emerg["care_tier"] == "emergency_now"
    assert data_emerg["is_emergency"] is True
    assert data_emerg["emergency_number"] == "112 / 108"

    # Routine tier test
    payload_routine = {
        "main_symptom": "Mild runny nose and intermittent sneezing for a week",
        "onset": "more_than_week",
        "severity": "mild",
        "progression": "stable",
        "associated_symptoms": [],
        "age_range": "adult_18_64",
        "language": "en",
        "save_history": False
    }
    res_routine = client.post("/api/symptoms/questionnaire", json=payload_routine)
    assert res_routine.status_code == 200
    data_routine = res_routine.json()
    assert data_routine["is_emergency"] is False
    assert data_routine["care_tier"] in ["routine_consultation", "self_care_education"]
    assert "clinical_disclaimer" in data_routine

def test_journey_step_5_synthetic_sample_report_and_pdf_upload():
    """Step 5: Upload and analyze synthetic report (Sample, Manual & PDF)."""
    # 1. Fetch sample report
    res_sample = client.get("/api/reports/sample")
    assert res_sample.status_code == 200
    sample = res_sample.json()
    assert "manual_tests" in sample
    assert len(sample["manual_tests"]) > 0

    # 2. Analyze manual tests
    res_manual = client.post("/api/reports/simplify-manual", json={
        "tests": sample["manual_tests"],
        "language": "en",
        "user_consented_ai": False,
        "save_report": False
    })
    assert res_manual.status_code == 200
    data_manual = res_manual.json()
    assert data_manual["abnormal_count"] > 0
    assert len(data_manual["findings"]) == len(sample["manual_tests"])
    assert "reference_interval_explanation" in data_manual

    # 3. Upload text-based PDF
    pdf_bytes = b"""%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj
4 0 obj << /Length 135 >> stream
BT
/F1 12 Tf
72 712 Td
(Hemoglobin: 11.2 g/dL Reference: 13.5 - 17.5 g/dL) Tj
0 -20 Td
(Fasting Blood Sugar: 126 mg/dL Reference: 70 - 99 mg/dL) Tj
ET
endstream
endobj
5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000430 00000 n 
trailer << /Size 6 /Root 1 0 R >>
startxref
509
%%EOF"""
    files = {"file": ("synthetic_cbc.pdf", pdf_bytes, "application/pdf")}
    res_pdf = client.post("/api/reports/upload-pdf", files=files, data={"language": "en", "user_consented_ai": "false", "save_report": "false"})
    assert res_pdf.status_code == 200
    data_pdf = res_pdf.json()
    assert len(data_pdf["findings"]) >= 2

def test_journey_step_6_appointment_reminder_lifecycle():
    """Step 6: Create, edit, complete (toggle), and delete appointment reminder."""
    # Create
    create_res = client.post("/api/reminders", json={
        "title": "Hackathon Demo Appointment",
        "reminder_type": "appointment",
        "scheduled_time": "2026-11-10 10:00 AM",
        "frequency": "Once",
        "doctor_specialty": "Dr. Anita Mehta (Cardiologist)",
        "location": "City Heart Center, Suite 101",
        "notes": "Annual check-up"
    })
    assert create_res.status_code == 200
    item = create_res.json()
    item_id = item["id"]
    assert item["is_completed"] is False

    # Edit
    edit_res = client.put(f"/api/reminders/{item_id}", json={
        "notes": "Updated: fasting required 8 hours prior"
    })
    assert edit_res.status_code == 200
    assert "fasting required" in edit_res.json()["notes"]

    # Toggle complete
    toggle_res = client.patch(f"/api/reminders/{item_id}/toggle")
    assert toggle_res.status_code == 200
    assert toggle_res.json()["is_completed"] is True

    # Delete
    del_res = client.delete(f"/api/reminders/{item_id}")
    assert del_res.status_code == 200

def test_journey_step_7_wellness_entry_and_summary():
    """Step 7: Add wellness logs (hydration, sleep, activity, checkin) and fetch 7-day summary."""
    today = date.today().isoformat()

    # Hydration entry
    res_h = client.post("/api/wellness/log", json={
        "log_date": today,
        "log_type": "hydration",
        "metric_primary": 500,
        "notes": "Afternoon glass of water"
    })
    assert res_h.status_code == 200

    # Daily checkin
    res_c = client.post("/api/wellness/checkin", json={
        "mood_energy": 5,
        "stress_level": "low",
        "notes": "Energetic and well rested"
    })
    assert res_c.status_code == 200

    # 7-day summary
    res_s = client.get("/api/wellness/summary?days=7")
    assert res_s.status_code == 200
    summary = res_s.json()
    assert len(summary["weekly_trend"]) == 7
    assert summary["today_hydration"] >= 500

def test_journey_step_8_navigate_all_pages_and_system_health():
    """Step 8: Verify all core endpoints for seamless page navigation."""
    # Health endpoint
    res_health = client.get("/api/health")
    assert res_health.status_code == 200
    assert res_health.json()["status"] == "online"

    # User profile
    res_prof = client.get("/api/user/profile")
    assert res_prof.status_code == 200
    assert "name" in res_prof.json()

    # Preventive catalog
    res_prev = client.get("/api/preventive/recommendations?language=en&age=34&gender=Male")
    assert res_prev.status_code == 200
    assert len(res_prev.json()["screenings"]) > 0

    # Reminders list
    res_rem = client.get("/api/reminders")
    assert res_rem.status_code == 200
    assert isinstance(res_rem.json(), list)

    # Vitals list
    res_vit = client.get("/api/vitals")
    assert res_vit.status_code == 200
    assert isinstance(res_vit.json(), list)
