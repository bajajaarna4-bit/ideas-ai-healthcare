from fastapi import APIRouter, HTTPException
from app.schemas import UserProfileSchema
from app.database import get_connection, init_db
from app.config import settings

router = APIRouter(prefix="/api", tags=["User & System"])

@router.get("/health")
def health_check():
    gemini_ready = bool(settings.GEMINI_API_KEY and len(settings.GEMINI_API_KEY.strip()) > 5)
    return {
        "status": "online",
        "app_name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "gemini_configured": gemini_ready,
        "database": "sqlite",
        "supported_languages": ["en", "hi", "mr"]
    }

@router.get("/user/profile", response_model=UserProfileSchema)
def get_user_profile():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT name, age, gender, language, blood_group, allergies, chronic_conditions FROM user_profile LIMIT 1")
    row = cursor.fetchone()
    conn.close()
    if not row:
        return UserProfileSchema(
            name="Demo User (Aarav)",
            age=34,
            gender="Male",
            language="en",
            blood_group="B+",
            allergies="Penicillin",
            chronic_conditions="Mild Hypertension"
        )
    return dict(row)

@router.put("/user/profile", response_model=UserProfileSchema)
def update_user_profile(profile: UserProfileSchema):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE user_profile 
        SET name = ?, age = ?, gender = ?, language = ?, blood_group = ?, allergies = ?, chronic_conditions = ?
        WHERE id = (SELECT id FROM user_profile LIMIT 1)
    """, (profile.name, profile.age, profile.gender, profile.language, profile.blood_group, profile.allergies, profile.chronic_conditions))
    conn.commit()
    conn.close()
    return profile

@router.post("/user/reset-demo")
def reset_demo_data():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM chat_messages")
    cursor.execute("DELETE FROM symptom_checks")
    cursor.execute("DELETE FROM medical_reports")
    cursor.execute("DELETE FROM vitals_log")
    cursor.execute("DELETE FROM reminders")
    cursor.execute("DELETE FROM wellness_logs")
    cursor.execute("DELETE FROM wellness_goals")
    cursor.execute("DELETE FROM user_profile")
    conn.commit()
    conn.close()

    init_db()
    return {"status": "success", "message": "Synthetic demo data has been reset successfully."}

@router.get("/dashboard/summary")
def get_dashboard_summary():
    """
    Returns accurate metrics and recent activity from actually implemented modules:
    - Assistant chat messages (only if recorded)
    - Symptom checks (only if saved with user consent)
    - Medical reports (only if saved with user consent)
    - Upcoming reminders (medications, appointments, vitals)
    - Today's wellness metrics and user vs demo status
    No fabricated user counts or false clinical outcome statistics.
    """
    from datetime import date
    conn = get_connection()
    cursor = conn.cursor()

    # User Profile
    cursor.execute("SELECT name, age, gender, language, blood_group, allergies, chronic_conditions FROM user_profile LIMIT 1")
    profile_row = cursor.fetchone()
    profile = dict(profile_row) if profile_row else {}

    # Chat assistant activity
    cursor.execute("SELECT COUNT(*) FROM chat_messages")
    chat_count = cursor.fetchone()[0]
    cursor.execute("SELECT role, content, created_at FROM chat_messages ORDER BY id DESC LIMIT 2")
    recent_chats = [dict(r) for r in cursor.fetchall()]

    # Symptom checks (privacy-conscious: only if user opted to save)
    cursor.execute("SELECT COUNT(*) FROM symptom_checks")
    symptom_count = cursor.fetchone()[0]
    cursor.execute("SELECT symptoms, triage_level, summary, created_at FROM symptom_checks ORDER BY id DESC LIMIT 3")
    recent_symptoms = [dict(r) for r in cursor.fetchall()]

    # Medical reports
    cursor.execute("SELECT COUNT(*) FROM medical_reports")
    report_count = cursor.fetchone()[0]
    cursor.execute("SELECT title, report_type, summary, created_at FROM medical_reports ORDER BY id DESC LIMIT 3")
    recent_reports = [dict(r) for r in cursor.fetchall()]

    # Reminders: active uncompleted
    cursor.execute("SELECT id, title, reminder_type, scheduled_time, frequency, doctor_specialty, location, is_demo FROM reminders WHERE is_completed = 0 ORDER BY id ASC LIMIT 5")
    upcoming_reminders = [dict(r) for r in cursor.fetchall()]

    # Today's wellness
    today_str = date.today().isoformat()
    cursor.execute(
        """
        SELECT log_type, metric_primary, metric_secondary, is_demo
        FROM wellness_logs
        WHERE log_date = ?
        """,
        (today_str,)
    )
    today_rows = cursor.fetchall()
    hydration = sum(r["metric_primary"] for r in today_rows if r["log_type"] == "hydration")
    sleep = next((r["metric_primary"] for r in today_rows if r["log_type"] == "sleep"), 0.0)
    activity = sum(r["metric_primary"] for r in today_rows if r["log_type"] == "activity")
    mood = next((int(r["metric_primary"]) for r in today_rows if r["log_type"] == "checkin"), None)

    # User entry count (non-demo)
    cursor.execute("SELECT COUNT(*) FROM wellness_logs WHERE is_demo = 0")
    user_wellness_count = cursor.fetchone()[0]

    conn.close()

    return {
        "profile": profile,
        "assistant_activity": {
            "total_messages": chat_count,
            "has_activity": chat_count > 0,
            "recent_messages": recent_chats
        },
        "symptom_activity": {
            "saved_sessions_count": symptom_count,
            "has_saved_sessions": symptom_count > 0,
            "recent_sessions": recent_symptoms
        },
        "report_activity": {
            "saved_reports_count": report_count,
            "has_saved_reports": report_count > 0,
            "recent_reports": recent_reports
        },
        "upcoming_reminders": upcoming_reminders,
        "wellness_today": {
            "hydration_ml": int(hydration),
            "sleep_hours": round(float(sleep), 1),
            "activity_mins": int(activity),
            "mood_rating": mood,
            "user_entries_count": user_wellness_count,
            "is_demo_mode": user_wellness_count == 0
        }
    }
