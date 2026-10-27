import json
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, status
from typing import List, Optional
from app.schemas import (
    ReportSimplifierRequest,
    ReportSimplifierResponse,
    ManualReportSimplifierRequest
)
from app.services.report_analyzer import (
    analyze_lab_text,
    analyze_manual_tests,
    extract_text_from_pdf
)
from app.database import get_connection

router = APIRouter(prefix="/api/reports", tags=["Reports"])

MAX_PDF_SIZE_BYTES = 10 * 1024 * 1024 # 10 MB limit

SAMPLE_SYNTHETIC_REPORT = {
    "title": "Routine Health Checkup Panel (Synthetic Demonstration Data)",
    "report_type": "Comprehensive Metabolic & CBC Panel",
    "text": """DEMONSTRATION MEDICAL REPORT (SYNTHETIC PATIENT DATA):
Patient Name: Demo User (Aarav Sharma)
Age: 34 Y / Male
Date of Collection: 2026-10-25

COMPLETE BLOOD COUNT (CBC):
- Hemoglobin: 11.2 g/dL (Reference: 13.5 - 17.5 g/dL)
- Total Leukocyte Count (WBC): 6,900 cells/uL (Reference: 4,000 - 11,000 cells/uL)
- Platelet Count: 220 10^3/uL (Reference: 150 - 450 10^3/uL)

METABOLIC & LIPID PANEL:
- Fasting Blood Sugar: 126 mg/dL (Reference: 70 - 99 mg/dL)
- HbA1c: 6.2 % (Reference: 4.0 - 5.6 %)
- Total Cholesterol: 228 mg/dL (Reference: 125 - 200 mg/dL)
- Serum Creatinine: 0.9 mg/dL (Reference: 0.7 - 1.3 mg/dL)
- SGPT (ALT): 32 U/L (Reference: 7 - 56 U/L)
- TSH: 2.1 uIU/mL (Reference: 0.4 - 4.2 uIU/mL)
""",
    "manual_tests": [
        {"test_name": "Hemoglobin", "value": "11.2", "unit": "g/dL", "reference_interval": "13.5 - 17.5"},
        {"test_name": "Fasting Blood Sugar", "value": "126", "unit": "mg/dL", "reference_interval": "70 - 99"},
        {"test_name": "HbA1c", "value": "6.2", "unit": "%", "reference_interval": "4.0 - 5.6"},
        {"test_name": "Total Cholesterol", "value": "228", "unit": "mg/dL", "reference_interval": "< 200"},
        {"test_name": "Serum Creatinine", "value": "0.9", "unit": "mg/dL", "reference_interval": "0.7 - 1.3"},
        {"test_name": "Platelet Count", "value": "220", "unit": "10^3/uL", "reference_interval": "150 - 450"}
    ]
}

@router.get("/sample")
def get_sample_report():
    """Returns clearly labeled synthetic sample report data."""
    return SAMPLE_SYNTHETIC_REPORT

@router.post("/simplify", response_model=ReportSimplifierResponse)
async def simplify_report_endpoint(request: ReportSimplifierRequest):
    """Parses raw text report and explains diagnostic markers."""
    try:
        response = analyze_lab_text(
            raw_text=request.raw_text,
            language=request.language,
            user_consented_ai=request.user_consented_ai
        )

        # Do not persist report by default (only if save_report=True)
        if request.save_report:
            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO medical_reports (title, report_type, original_text, summary, abnormal_findings, normal_findings, questions_for_doctor, language)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    response.title,
                    request.report_type,
                    request.raw_text,
                    response.summary,
                    json.dumps([f.model_dump() for f in response.findings if f.status != "within_interval"]),
                    json.dumps([f.model_dump() for f in response.findings if f.status == "within_interval"]),
                    json.dumps(response.questions_for_doctor),
                    request.language
                )
            )
            conn.commit()
            conn.close()

        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/simplify-manual", response_model=ReportSimplifierResponse)
def simplify_manual_tests_endpoint(request: ManualReportSimplifierRequest):
    """Processes structured, user-entered test names, values, units, and reference intervals."""
    if not request.tests:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="At least one test entry is required."
        )

    response = analyze_manual_tests(
        tests=request.tests,
        language=request.language,
        user_consented_ai=request.user_consented_ai
    )

    # Optional saving only if opted-in
    if request.save_report:
        try:
            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO medical_reports (title, report_type, original_text, summary, abnormal_findings, normal_findings, questions_for_doctor, language)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    response.title,
                    "Manual Entry",
                    json.dumps([t.model_dump() for t in request.tests]),
                    response.summary,
                    json.dumps([f.model_dump() for f in response.findings if f.status != "within_interval"]),
                    json.dumps([f.model_dump() for f in response.findings if f.status == "within_interval"]),
                    json.dumps(response.questions_for_doctor),
                    request.language
                )
            )
            conn.commit()
            conn.close()
        except Exception:
            pass

    return response

@router.post("/upload-pdf", response_model=ReportSimplifierResponse)
async def upload_pdf_endpoint(
    file: UploadFile = File(...),
    language: str = Form("en"),
    user_consented_ai: bool = Form(False),
    save_report: bool = Form(False)
):
    """
    Accepts synthetic PDF reports, extracts text in-memory, validates format/content,
    and returns structured simplification without persisting files to disk.
    """
    filename = (file.filename or "").lower()
    if not filename.endswith(".pdf") and file.content_type != "application/pdf":
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid file format. Please upload a standard PDF (.pdf) document."
        )

    try:
        pdf_bytes = await file.read()
        if len(pdf_bytes) > MAX_PDF_SIZE_BYTES:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"File exceeds the maximum permitted size of 10 MB."
            )

        extracted_text = extract_text_from_pdf(pdf_bytes)

        # Analyze extracted text safely
        response = analyze_lab_text(
            raw_text=extracted_text,
            language=language,
            user_consented_ai=user_consented_ai
        )

        if save_report:
            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO medical_reports (title, report_type, original_text, summary, abnormal_findings, normal_findings, questions_for_doctor, language)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    f"PDF: {file.filename}",
                    "Uploaded PDF Document",
                    extracted_text[:2000],
                    response.summary,
                    json.dumps([f.model_dump() for f in response.findings if f.status != "within_interval"]),
                    json.dumps([f.model_dump() for f in response.findings if f.status == "within_interval"]),
                    json.dumps(response.questions_for_doctor),
                    language
                )
            )
            conn.commit()
            conn.close()

        return response
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(ve)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while analyzing the PDF document: {str(e)}"
        )
    finally:
        await file.close()

@router.get("/history")
def get_report_history():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, title, report_type, summary, language, created_at FROM medical_reports ORDER BY id DESC LIMIT 20")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]
