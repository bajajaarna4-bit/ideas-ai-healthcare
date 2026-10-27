import sys
import os
import io
import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from app.main import app
from app.services.report_analyzer import (
    evaluate_value_vs_interval,
    parse_interval,
    analyze_manual_tests,
    extract_text_from_pdf
)
from app.schemas import ManualLabTestEntry
import pypdf

client = TestClient(app)

def create_synthetic_pdf_bytes(text: str) -> bytes:
    """Helper to generate in-memory text PDF for testing."""
    writer = pypdf.PdfWriter()
    # Add a blank page with text annotation or create a simple page
    page = writer.add_blank_page(width=612, height=792)
    # We can write text using a canvas or use pypdf's writer
    # A standard minimal valid PDF with a content stream:
    pdf_content = (
        f"%PDF-1.4\n"
        f"1 0 obj <</Type /Catalog /Pages 2 0 R>> endobj\n"
        f"2 0 obj <</Type /Pages /Kids [3 0 R] /Count 1>> endobj\n"
        f"3 0 obj <</Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj\n"
        f"4 0 obj <</Length {len(text) + 50}>> stream\n"
        f"BT /F1 12 Tf 100 700 Td ({text}) Tj ET\n"
        f"endstream\nendobj\n"
        f"5 0 obj <</Type /Font /Subtype /Type1 /BaseFont /Helvetica>> endobj\n"
        f"xref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000244 00000 n \n0000000344 00000 n \n"
        f"trailer <</Size 6 /Root 1 0 R>>\nstartxref\n423\n%%EOF"
    )
    return pdf_content.encode("latin-1")

def test_interval_parsing_and_evaluation():
    # 1. Standard range
    status, is_amb, note = evaluate_value_vs_interval("11.2", "13.5 - 17.5")
    assert status == "below_interval"
    assert is_amb is False

    status, is_amb, note = evaluate_value_vs_interval("14.5", "13.5 - 17.5")
    assert status == "within_interval"

    status, is_amb, note = evaluate_value_vs_interval("18.2", "13.5 - 17.5")
    assert status == "above_interval"

    # 2. Upper bound range (< 200)
    status, is_amb, note = evaluate_value_vs_interval("228", "< 200")
    assert status == "above_interval"

    status, is_amb, note = evaluate_value_vs_interval("180", "< 200")
    assert status == "within_interval"

    # 3. Lower bound range (> 30)
    status, is_amb, note = evaluate_value_vs_interval("22", "> 30")
    assert status == "below_interval"

    status, is_amb, note = evaluate_value_vs_interval("38", "> 30")
    assert status == "within_interval"

    # 4. Qualitative
    status, is_amb, note = evaluate_value_vs_interval("Negative", "Negative")
    assert status == "within_interval"

    status, is_amb, note = evaluate_value_vs_interval("Positive", "Negative")
    assert status == "above_interval"

def test_missing_values_and_ambiguous_intervals():
    # Missing value
    status, is_amb, note = evaluate_value_vs_interval("", "13.5 - 17.5")
    assert status == "ambiguous_comparison"
    assert is_amb is True

    # Ambiguous interval (e.g. "Varies", "See note")
    status, is_amb, note = evaluate_value_vs_interval("45", "Varies with age and trimester")
    assert status == "ambiguous_comparison"
    assert is_amb is True
    assert note is not None

def test_unusual_units_preservation():
    tests = [
        ManualLabTestEntry(test_name="Serum Folate", value="18.5", unit="nmol/L", reference_interval="7.0 - 45.0"),
        ManualLabTestEntry(test_name="Serum B12", value="140", unit="pmol/L", reference_interval="150 - 650")
    ]
    resp = analyze_manual_tests(tests, language="en")
    assert len(resp.findings) == 2
    assert resp.findings[0].unit == "nmol/L"
    assert resp.findings[0].status == "within_interval"
    assert resp.findings[1].unit == "pmol/L"
    assert resp.findings[1].status == "below_interval"

def test_multilingual_manual_simplifier():
    tests = [
        ManualLabTestEntry(test_name="Hemoglobin", value="10.8", unit="g/dL", reference_interval="13.5 - 17.5"),
        ManualLabTestEntry(test_name="Fasting Blood Sugar", value="134", unit="mg/dL", reference_interval="70 - 99")
    ]
    
    # Hindi
    resp_hi = analyze_manual_tests(tests, language="hi")
    assert resp_hi.abnormal_count == 2
    assert "एनीमिया" in resp_hi.findings[0].clinical_significance or "कमी" in resp_hi.findings[0].clinical_significance
    assert len(resp_hi.questions_for_doctor) > 0

    # Marathi
    resp_mr = analyze_manual_tests(tests, language="mr")
    assert resp_mr.abnormal_count == 2
    assert "ॲनिमिया" in resp_mr.findings[0].clinical_significance or "कमी" in resp_mr.findings[0].clinical_significance

def test_api_simplify_manual_endpoint():
    payload = {
        "tests": [
            {"test_name": "Hemoglobin", "value": "11.2", "unit": "g/dL", "reference_interval": "13.5 - 17.5"},
            {"test_name": "HbA1c", "value": "6.2", "unit": "%", "reference_interval": "4.0 - 5.6"}
        ],
        "language": "en"
    }
    r = client.post("/api/reports/simplify-manual", json=payload)
    assert r.status_code == 200
    data = r.json()
    assert data["abnormal_count"] == 2
    assert "reference_interval_explanation" in data

def test_api_sample_report_endpoint():
    r = client.get("/api/reports/sample")
    assert r.status_code == 200
    data = r.json()
    assert "text" in data
    assert "manual_tests" in data
    assert len(data["manual_tests"]) >= 4

def test_pdf_upload_validation_invalid_extension():
    # Non-PDF upload
    files = {"file": ("report.txt", b"Random text content", "text/plain")}
    r = client.post("/api/reports/upload-pdf", files=files)
    assert r.status_code == 422
    assert "PDF" in r.json()["detail"]

def test_pdf_upload_scanned_image_rejection():
    # PDF with zero text (simulating scanned image without OCR)
    writer = pypdf.PdfWriter()
    writer.add_blank_page(width=612, height=792)
    out_buf = io.BytesIO()
    writer.write(out_buf)
    blank_pdf_bytes = out_buf.getvalue()

    files = {"file": ("scanned_blood_report.pdf", blank_pdf_bytes, "application/pdf")}
    r = client.post("/api/reports/upload-pdf", files=files)
    assert r.status_code == 422
    assert "scanned" in r.json()["detail"].lower()
