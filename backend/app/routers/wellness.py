from datetime import date, datetime, timedelta
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Query, status
from app.database import get_connection
from app.schemas import (
    WellnessLogCreate,
    DailyCheckinCreate,
    WellnessGoalsSchema,
    WellnessSummaryResponse,
    DailyDaySummary
)

router = APIRouter(prefix="/api/wellness", tags=["Wellness & Preventive"])

WELLNESS_DISCLAIMER = (
    "Wellness metrics (hydration, sleep, and physical activity logs) are supportive habit trackers "
    "for general lifestyle awareness. They do not constitute diagnostic medical telemetry or replace "
    "clinical monitoring prescribed by a healthcare provider."
)

REMINDER_LIMITATION_NOTICE = (
    "Notice: In-app reminders trigger locally while HealthSathi AI is active in an open browser tab. "
    "Background operating system push notifications or SMS are not sent when the application is closed."
)

@router.get("/goals", response_model=WellnessGoalsSchema)
def get_wellness_goals():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT water_target_ml, sleep_target_hours, activity_target_mins FROM wellness_goals ORDER BY id DESC LIMIT 1")
    row = cursor.fetchone()
    conn.close()
    if row:
        return WellnessGoalsSchema(
            water_target_ml=row["water_target_ml"],
            sleep_target_hours=row["sleep_target_hours"],
            activity_target_mins=row["activity_target_mins"]
        )
    return WellnessGoalsSchema()

@router.put("/goals", response_model=WellnessGoalsSchema)
def update_wellness_goals(goals: WellnessGoalsSchema):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE wellness_goals 
        SET water_target_ml = ?, sleep_target_hours = ?, activity_target_mins = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = (SELECT id FROM wellness_goals ORDER BY id DESC LIMIT 1)
    """, (goals.water_target_ml, goals.sleep_target_hours, goals.activity_target_mins))
    if cursor.rowcount == 0:
        cursor.execute("""
            INSERT INTO wellness_goals (water_target_ml, sleep_target_hours, activity_target_mins)
            VALUES (?, ?, ?)
        """, (goals.water_target_ml, goals.sleep_target_hours, goals.activity_target_mins))
    conn.commit()
    conn.close()
    return goals

@router.get("/summary", response_model=WellnessSummaryResponse)
def get_wellness_summary(days: int = 7):
    """
    Returns aggregated metrics for the past 7 days:
    - Hydration (total ml per day)
    - Sleep (hours and quality)
    - Physical activity (minutes and activity type)
    - Mood / Energy check-in (1-5 rating and stress level)
    """
    conn = get_connection()
    cursor = conn.cursor()

    # Get goals
    cursor.execute("SELECT water_target_ml, sleep_target_hours, activity_target_mins FROM wellness_goals ORDER BY id DESC LIMIT 1")
    goal_row = cursor.fetchone()
    goals = WellnessGoalsSchema(
        water_target_ml=goal_row["water_target_ml"] if goal_row else 2000,
        sleep_target_hours=goal_row["sleep_target_hours"] if goal_row else 8.0,
        activity_target_mins=goal_row["activity_target_mins"] if goal_row else 30
    )

    # Generate dates for past N days ending today
    today_dt = date.today()
    dates_list = [(today_dt - timedelta(days=i)).isoformat() for i in range(days - 1, -1, -1)]

    cursor.execute(
        """
        SELECT log_date, log_type, metric_primary, metric_secondary, notes, is_demo
        FROM wellness_logs
        WHERE log_date >= ?
        ORDER BY log_date ASC, id ASC
        """,
        (dates_list[0],)
    )
    rows = cursor.fetchall()
    conn.close()

    # Aggregate by date
    daily_map: Dict[str, Dict[str, Any]] = {
        d: {
            "date": d,
            "hydration_ml": 0,
            "sleep_hours": 0.0,
            "sleep_quality": None,
            "activity_mins": 0,
            "activity_type": None,
            "mood_energy": None,
            "stress_level": None,
            "notes": None,
            "is_demo": False
        }
        for d in dates_list
    }

    for r in rows:
        d = r["log_date"]
        if d not in daily_map:
            continue
        entry = daily_map[d]
        ltype = r["log_type"]
        val = r["metric_primary"]
        sec = r["metric_secondary"]
        is_demo = bool(r["is_demo"])

        if is_demo:
            entry["is_demo"] = True

        if ltype == "hydration":
            entry["hydration_ml"] += int(val)
        elif ltype == "sleep":
            entry["sleep_hours"] = round(float(val), 1)
            entry["sleep_quality"] = sec
        elif ltype == "activity":
            entry["activity_mins"] += int(val)
            entry["activity_type"] = sec
        elif ltype == "checkin":
            entry["mood_energy"] = int(val)
            entry["stress_level"] = sec
            if r["notes"]:
                entry["notes"] = r["notes"]

    weekly_trend = [DailyDaySummary(**data) for data in daily_map.values()]
    today_data = daily_map.get(today_dt.isoformat(), {})

    return WellnessSummaryResponse(
        weekly_trend=weekly_trend,
        today_hydration=today_data.get("hydration_ml", 0),
        today_sleep=today_data.get("sleep_hours", 0.0),
        today_activity=today_data.get("activity_mins", 0),
        today_mood=today_data.get("mood_energy"),
        today_stress=today_data.get("stress_level"),
        goals=goals,
        in_app_reminder_notice=REMINDER_LIMITATION_NOTICE,
        disclaimer=WELLNESS_DISCLAIMER
    )

@router.post("/log")
def log_wellness_metric(log: WellnessLogCreate):
    """Logs individual habit metric (hydration, sleep, activity, or checkin)."""
    log_date = log.log_date or date.today().isoformat()
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        INSERT INTO wellness_logs (log_date, log_type, metric_primary, metric_secondary, notes, is_demo)
        VALUES (?, ?, ?, ?, ?, 0)
        """,
        (log_date, log.log_type, log.metric_primary, log.metric_secondary, log.notes)
    )
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()
    return {"status": "success", "id": new_id, "log_type": log.log_type, "date": log_date}

@router.post("/checkin")
def submit_daily_checkin(checkin: DailyCheckinCreate):
    """Submits a simple daily mood/energy and stress reflection."""
    today_str = date.today().isoformat()
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        INSERT INTO wellness_logs (log_date, log_type, metric_primary, metric_secondary, notes, is_demo)
        VALUES (?, 'checkin', ?, ?, ?, 0)
        """,
        (today_str, checkin.mood_energy, checkin.stress_level, checkin.notes)
    )
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()
    return {"status": "success", "id": new_id, "date": today_str}

@router.delete("/clear-history")
def clear_user_wellness_history():
    """Privacy data deletion control: deletes user-entered wellness logs while preserving or resetting synthetic demo data."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM wellness_logs WHERE is_demo = 0")
    deleted_count = cursor.rowcount
    conn.commit()
    conn.close()
    return {"status": "success", "deleted_user_entries": deleted_count}

@router.post("/reset-demo")
def reset_demo_wellness():
    """Re-seeds clean 7-day demonstration data."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM wellness_logs")
    cursor.execute("DELETE FROM wellness_goals")
    cursor.execute("INSERT INTO wellness_goals (water_target_ml, sleep_target_hours, activity_target_mins) VALUES (2000, 8.0, 30)")
    
    # 7-day demo
    today = date.today()
    demo_entries = []
    for i in range(6, -1, -1):
        d_str = (today - timedelta(days=i)).isoformat()
        demo_entries.append((d_str, "hydration", 1900 + (i % 3) * 200, None, "Synthetic Demo Hydration", 1))
        demo_entries.append((d_str, "sleep", 7.0 + (i % 2) * 0.8, "restful" if i % 2 == 0 else "average", "Synthetic Demo Sleep", 1))
        demo_entries.append((d_str, "activity", 25 + (i % 3) * 10, "walking", "Synthetic Demo Activity", 1))
        demo_entries.append((d_str, "checkin", 4 if i % 2 == 0 else 3, "low", "Synthetic Demo Check-in", 1))

    cursor.executemany(
        """
        INSERT INTO wellness_logs (log_date, log_type, metric_primary, metric_secondary, notes, is_demo)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        demo_entries
    )
    conn.commit()
    conn.close()
    return {"status": "success", "message": "Wellness demonstration logs re-seeded successfully."}
