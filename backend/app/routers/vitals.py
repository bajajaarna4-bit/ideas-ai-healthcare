from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.schemas import VitalCreate, VitalItem, ReminderCreate, ReminderUpdate, ReminderItem
from app.database import get_connection

router = APIRouter(prefix="/api", tags=["Vitals & Reminders"])

@router.get("/vitals", response_model=List[VitalItem])
def get_vitals(vital_type: Optional[str] = None):
    conn = get_connection()
    cursor = conn.cursor()
    if vital_type:
        cursor.execute("SELECT * FROM vitals_log WHERE vital_type = ? ORDER BY recorded_at ASC", (vital_type,))
    else:
        cursor.execute("SELECT * FROM vitals_log ORDER BY recorded_at ASC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

@router.post("/vitals", response_model=VitalItem)
def add_vital(vital: VitalCreate):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        INSERT INTO vitals_log (vital_type, value_primary, value_secondary, unit, notes)
        VALUES (?, ?, ?, ?, ?)
        """,
        (vital.vital_type, vital.value_primary, vital.value_secondary, vital.unit, vital.notes)
    )
    conn.commit()
    vital_id = cursor.lastrowid
    cursor.execute("SELECT * FROM vitals_log WHERE id = ?", (vital_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row)

@router.delete("/vitals/{vital_id}")
def delete_vital(vital_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM vitals_log WHERE id = ?", (vital_id,))
    conn.commit()
    conn.close()
    return {"status": "success", "id": vital_id}

# Reminders Endpoints
@router.get("/reminders", response_model=List[ReminderItem])
def get_reminders(reminder_type: Optional[str] = None):
    conn = get_connection()
    cursor = conn.cursor()
    if reminder_type:
        cursor.execute("SELECT * FROM reminders WHERE reminder_type = ? ORDER BY is_completed ASC, id ASC", (reminder_type,))
    else:
        cursor.execute("SELECT * FROM reminders ORDER BY is_completed ASC, id ASC")
    rows = cursor.fetchall()
    conn.close()
    return [
        {
            "id": row["id"],
            "title": row["title"],
            "reminder_type": row["reminder_type"],
            "scheduled_time": row["scheduled_time"],
            "frequency": row["frequency"],
            "is_completed": bool(row["is_completed"]),
            "notes": row["notes"],
            "doctor_specialty": row["doctor_specialty"] if "doctor_specialty" in row.keys() else None,
            "location": row["location"] if "location" in row.keys() else None,
            "is_demo": bool(row["is_demo"]) if "is_demo" in row.keys() else False,
            "created_at": row["created_at"]
        }
        for row in rows
    ]

@router.post("/reminders", response_model=ReminderItem)
def create_reminder(reminder: ReminderCreate):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        INSERT INTO reminders (title, reminder_type, scheduled_time, frequency, is_completed, notes, doctor_specialty, location, is_demo)
        VALUES (?, ?, ?, ?, 0, ?, ?, ?, 0)
        """,
        (
            reminder.title,
            reminder.reminder_type,
            reminder.scheduled_time,
            reminder.frequency,
            reminder.notes,
            reminder.doctor_specialty,
            reminder.location
        )
    )
    conn.commit()
    new_id = cursor.lastrowid
    cursor.execute("SELECT * FROM reminders WHERE id = ?", (new_id,))
    row = cursor.fetchone()
    conn.close()
    return {
        "id": row["id"],
        "title": row["title"],
        "reminder_type": row["reminder_type"],
        "scheduled_time": row["scheduled_time"],
        "frequency": row["frequency"],
        "is_completed": bool(row["is_completed"]),
        "notes": row["notes"],
        "doctor_specialty": row["doctor_specialty"],
        "location": row["location"],
        "is_demo": bool(row["is_demo"]),
        "created_at": row["created_at"]
    }

@router.put("/reminders/{reminder_id}", response_model=ReminderItem)
def update_reminder(reminder_id: int, update_data: ReminderUpdate):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM reminders WHERE id = ?", (reminder_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Reminder not found")

    new_title = update_data.title if update_data.title is not None else row["title"]
    new_type = update_data.reminder_type if update_data.reminder_type is not None else row["reminder_type"]
    new_time = update_data.scheduled_time if update_data.scheduled_time is not None else row["scheduled_time"]
    new_freq = update_data.frequency if update_data.frequency is not None else row["frequency"]
    new_notes = update_data.notes if update_data.notes is not None else row["notes"]
    new_doc = update_data.doctor_specialty if update_data.doctor_specialty is not None else (row["doctor_specialty"] if "doctor_specialty" in row.keys() else None)
    new_loc = update_data.location if update_data.location is not None else (row["location"] if "location" in row.keys() else None)
    new_comp = int(update_data.is_completed) if update_data.is_completed is not None else row["is_completed"]

    cursor.execute(
        """
        UPDATE reminders
        SET title = ?, reminder_type = ?, scheduled_time = ?, frequency = ?, notes = ?, doctor_specialty = ?, location = ?, is_completed = ?
        WHERE id = ?
        """,
        (new_title, new_type, new_time, new_freq, new_notes, new_doc, new_loc, new_comp, reminder_id)
    )
    conn.commit()
    cursor.execute("SELECT * FROM reminders WHERE id = ?", (reminder_id,))
    updated_row = cursor.fetchone()
    conn.close()
    return {
        "id": updated_row["id"],
        "title": updated_row["title"],
        "reminder_type": updated_row["reminder_type"],
        "scheduled_time": updated_row["scheduled_time"],
        "frequency": updated_row["frequency"],
        "is_completed": bool(updated_row["is_completed"]),
        "notes": updated_row["notes"],
        "doctor_specialty": updated_row["doctor_specialty"],
        "location": updated_row["location"],
        "is_demo": bool(updated_row["is_demo"]),
        "created_at": updated_row["created_at"]
    }

@router.patch("/reminders/{reminder_id}/toggle")
def toggle_reminder(reminder_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT is_completed FROM reminders WHERE id = ?", (reminder_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Reminder not found")
    new_status = 0 if row["is_completed"] else 1
    cursor.execute("UPDATE reminders SET is_completed = ? WHERE id = ?", (new_status, reminder_id))
    conn.commit()
    conn.close()
    return {"status": "success", "id": reminder_id, "is_completed": bool(new_status)}

@router.delete("/reminders/{reminder_id}")
def delete_reminder(reminder_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM reminders WHERE id = ?", (reminder_id,))
    conn.commit()
    conn.close()
    return {"status": "success", "id": reminder_id}

@router.delete("/reminders/clear-user")
def clear_user_reminders():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM reminders WHERE is_demo = 0")
    count = cursor.rowcount
    conn.commit()
    conn.close()
    return {"status": "success", "deleted_user_reminders": count}

@router.post("/reminders/reset-demo")
def reset_demo_reminders():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM reminders")
    cursor.executemany("""
    INSERT INTO reminders (title, reminder_type, scheduled_time, frequency, is_completed, notes, doctor_specialty, location, is_demo)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
    """, [
        ("Amlodipine 5mg (Prescription BP)", "medication", "08:30 AM", "Daily", 1, "Take with water after breakfast as prescribed by Dr. Mehta", None, None),
        ("Metformin 500mg (Prescription Glucose)", "medication", "08:00 PM", "Daily", 0, "Take with dinner. Follow your physician's prescription.", None, None),
        ("Cardiology Routine Follow-up", "appointment", "2026-11-05 10:30 AM", "Once", 0, "Follow-up for BP stabilization and ECG review", "Dr. Anita Mehta (Cardiologist)", "Apex Heart Clinic, Room 204"),
        ("Comprehensive Eye Exam & Fundus Check", "appointment", "2026-11-18 03:00 PM", "Once", 0, "Annual diabetic retinopathy & vision screening", "Dr. K. Verma (Ophthalmology)", "Vision Care Center"),
        ("Morning Hydration Target (500ml)", "hydration", "10:00 AM", "Daily", 1, "Stay hydrated during morning workday", None, None),
        ("Brisk Evening Walk (30 mins)", "screening", "06:30 PM", "Daily", 0, "Cardiovascular aerobic activity", None, None)
    ])
    conn.commit()
    conn.close()
    return {"status": "success", "message": "Demo reminders reset successfully."}
