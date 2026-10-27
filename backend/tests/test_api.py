import sys
import os
import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from app.main import app

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "en" in data["supported_languages"]
    assert "hi" in data["supported_languages"]
    assert "mr" in data["supported_languages"]

def test_chat_multilingual_and_questions():
    # 1. English High Blood Pressure
    r_en = client.post("/api/chat", json={
        "message": "What does high blood pressure mean?",
        "language": "en"
    })
    assert r_en.status_code == 200
    d_en = r_en.json()
    assert "artery" in d_en["reply"].lower() or "pressure" in d_en["reply"].lower()
    assert d_en["is_demo_mode"] is True
    assert "educational" in d_en["disclaimer"].lower()

    # 2. Hindi Dehydration
    r_hi = client.post("/api/chat", json={
        "message": "Explain dehydration in simple words.",
        "language": "hi"
    })
    assert r_hi.status_code == 200
    d_hi = r_hi.json()
    assert "पानी" in d_hi["reply"] or "डिहाइड्रेशन" in d_hi["reply"]
    assert d_hi["language"] == "hi"

    # 3. Marathi Viral vs Bacterial
    r_mr = client.post("/api/chat", json={
        "message": "What is the difference between a viral infection and a bacterial infection?",
        "language": "mr"
    })
    assert r_mr.status_code == 200
    d_mr = r_mr.json()
    assert "विषाणू" in d_mr["reply"] or "बॅक्टेरिया" in d_mr["reply"] or "व्हायरल" in d_mr["reply"]
    assert d_mr["language"] == "mr"

    # 4. Checkup preparation
    r_checkup = client.post("/api/chat", json={
        "message": "How can I prepare for a routine health check-up?",
        "language": "en"
    })
    assert r_checkup.status_code == 200
    d_checkup = r_checkup.json()
    assert "fasting" in d_checkup["reply"].lower() or "medication" in d_checkup["reply"].lower()

def test_chat_validation_empty_and_whitespace():
    # Empty message
    r_empty = client.post("/api/chat", json={"message": "", "language": "en"})
    assert r_empty.status_code == 422

    # Whitespace only message
    r_space = client.post("/api/chat", json={"message": "   \n\t  ", "language": "en"})
    assert r_space.status_code == 422

    # Invalid language code
    r_lang = client.post("/api/chat", json={"message": "Hello", "language": "fr"})
    assert r_lang.status_code == 422

def test_chat_emergency_escalation():
    response = client.post("/api/chat", json={
        "message": "I have severe crushing chest pain radiating to my jaw and I cannot breathe",
        "language": "en"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["red_flag_alert"] is True
    assert data["emergency_number"] == "112 / 108"
    assert "emergency" in data["reply"].lower()

def test_chat_clear_history():
    # Send a message
    client.post("/api/chat", json={"message": "Test note", "language": "en"})
    
    # Check history
    h_before = client.get("/api/chat/history")
    assert len(h_before.json()) > 0
    
    # Clear history
    del_r = client.delete("/api/chat/history")
    assert del_r.status_code == 200
    
    # Check history is empty
    h_after = client.get("/api/chat/history")
    assert len(h_after.json()) == 0

def test_symptom_analysis():
    response = client.post("/api/symptoms/analyze", json={
        "symptoms": "Mild dry cough and throat tickle",
        "duration": "1 day",
        "severity": "mild",
        "language": "en"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["triage_level"] in ["self_care", "routine_doctor"]
    assert len(data["home_comfort_steps"]) > 0

def test_report_simplifier():
    sample_text = """
    CBC Test Report:
    Hemoglobin: 11.2 g/dL (13.5 - 17.5)
    Fasting Blood Sugar: 126 mg/dL (70 - 99)
    Total Cholesterol: 215 mg/dL (125 - 200)
    """
    response = client.post("/api/reports/simplify", json={
        "raw_text": sample_text,
        "language": "en"
    })
    assert response.status_code == 200
    data = response.json()
    assert len(data["findings"]) >= 3
    assert data["abnormal_count"] >= 1
