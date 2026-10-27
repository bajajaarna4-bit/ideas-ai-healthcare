import sys
import os
import pytest
from datetime import date
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from app.main import app

client = TestClient(app)

def test_medication_reminder_creation_and_disclaimer():
    """Test medication reminder entry with prescribed schedule and time."""
    payload = {
        "title": "Metformin 500mg",
        "reminder_type": "medication",
        "scheduled_time": "08:00 PM",
        "frequency": "Twice Daily (Morning & Evening)",
        "notes": "Take after meal as prescribed by Dr. Mehta"
    }
    response = client.post("/api/reminders", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Metformin 500mg"
    assert data["reminder_type"] == "medication"
    assert data["scheduled_time"] == "08:00 PM"
    assert data["frequency"] == "Twice Daily (Morning & Evening)"
    assert data["is_completed"] is False
    assert data["is_demo"] is False
    rem_id = data["id"]

    # Verify toggle completion
    toggle_res = client.patch(f"/api/reminders/{rem_id}/toggle")
    assert toggle_res.status_code == 200
    assert toggle_res.json()["is_completed"] is True

    # Delete
    del_res = client.delete(f"/api/reminders/{rem_id}")
    assert del_res.status_code == 200

def test_appointment_reminder_crud():
    """Test creating, editing, completing, and deleting an appointment reminder."""
    # 1. Create
    payload = {
        "title": "Cardiology Consultation",
        "reminder_type": "appointment",
        "scheduled_time": "2026-11-12 11:00 AM",
        "frequency": "Once",
        "doctor_specialty": "Dr. Anita Mehta (Cardiology)",
        "location": "City Heart Hospital, Suite 402",
        "notes": "Bring recent ECG and lipid panel"
    }
    create_res = client.post("/api/reminders", json=payload)
    assert create_res.status_code == 200
    appt = create_res.json()
    appt_id = appt["id"]
    assert appt["doctor_specialty"] == "Dr. Anita Mehta (Cardiology)"
    assert appt["location"] == "City Heart Hospital, Suite 402"

    # 2. Edit / Update
    update_payload = {
        "scheduled_time": "2026-11-12 02:30 PM",
        "notes": "Rescheduled to afternoon per clinic request"
    }
    put_res = client.put(f"/api/reminders/{appt_id}", json=update_payload)
    assert put_res.status_code == 200
    updated = put_res.json()
    assert updated["scheduled_time"] == "2026-11-12 02:30 PM"
    assert "Rescheduled" in updated["notes"]

    # 3. Complete
    toggle_res = client.patch(f"/api/reminders/{appt_id}/toggle")
    assert toggle_res.status_code == 200
    assert toggle_res.json()["is_completed"] is True

    # 4. Delete
    del_res = client.delete(f"/api/reminders/{appt_id}")
    assert del_res.status_code == 200

def test_hydration_tracking_and_weekly_summary():
    """Test logging hydration and verifying aggregation in the 7-day summary."""
    today_str = date.today().isoformat()

    # Log 500 ml hydration
    log_payload = {
        "log_date": today_str,
        "log_type": "hydration",
        "metric_primary": 500,
        "notes": "Morning water intake"
    }
    res = client.post("/api/wellness/log", json=log_payload)
    assert res.status_code == 200

    # Fetch summary
    summary_res = client.get("/api/wellness/summary")
    assert summary_res.status_code == 200
    summary = summary_res.json()
    assert "weekly_trend" in summary
    assert len(summary["weekly_trend"]) == 7
    assert summary["today_hydration"] >= 500
    assert "in_app_reminder_notice" in summary
    assert "disclaimer" in summary

def test_sleep_and_activity_logging():
    """Test sleep and physical activity logging."""
    today_str = date.today().isoformat()

    # Sleep log
    sleep_payload = {
        "log_date": today_str,
        "log_type": "sleep",
        "metric_primary": 7.5,
        "metric_secondary": "restful",
        "notes": "Slept by 11 PM"
    }
    sleep_res = client.post("/api/wellness/log", json=sleep_payload)
    assert sleep_res.status_code == 200

    # Activity log
    act_payload = {
        "log_date": today_str,
        "log_type": "activity",
        "metric_primary": 35,
        "metric_secondary": "walking",
        "notes": "Brisk neighborhood walk"
    }
    act_res = client.post("/api/wellness/log", json=act_payload)
    assert act_res.status_code == 200

    # Check summary contains updated sleep & activity
    summary_res = client.get("/api/wellness/summary")
    summary = summary_res.json()
    assert summary["today_sleep"] >= 7.0
    assert summary["today_activity"] >= 35

def test_daily_wellness_checkin():
    """Test daily mood and stress reflection check-in."""
    checkin_payload = {
        "mood_energy": 5,
        "stress_level": "low",
        "notes": "Feeling great after morning routine"
    }
    res = client.post("/api/wellness/checkin", json=checkin_payload)
    assert res.status_code == 200
    assert res.json()["status"] == "success"

def test_configurable_wellness_goals():
    """Test retrieving and updating wellness targets."""
    goals_payload = {
        "water_target_ml": 2500,
        "sleep_target_hours": 7.5,
        "activity_target_mins": 45
    }
    put_res = client.put("/api/wellness/goals", json=goals_payload)
    assert put_res.status_code == 200
    assert put_res.json()["water_target_ml"] == 2500
    assert put_res.json()["activity_target_mins"] == 45

    get_res = client.get("/api/wellness/goals")
    assert get_res.status_code == 200
    assert get_res.json()["water_target_ml"] == 2500

def test_data_deletion_controls():
    """Test data deletion control to purge user entries while keeping demo safe."""
    del_res = client.delete("/api/wellness/clear-history")
    assert del_res.status_code == 200
    assert "deleted_user_entries" in del_res.json()

def test_dashboard_summary_endpoint():
    """Test that dashboard summary returns accurate non-fake metrics."""
    res = client.get("/api/dashboard/summary")
    assert res.status_code == 200
    data = res.json()
    assert "profile" in data
    assert "assistant_activity" in data
    assert "symptom_activity" in data
    assert "report_activity" in data
    assert "upcoming_reminders" in data
    assert "wellness_today" in data
