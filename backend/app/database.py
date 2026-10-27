import sqlite3
import json
import os
from datetime import datetime
from typing import Any, Dict, List, Optional

DB_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "healthsathi.db")

def get_connection():
    conn = sqlite3.connect(DB_FILE, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    # User Profile table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS user_profile (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT DEFAULT 'Demo User (Aarav)',
        age INTEGER DEFAULT 34,
        gender TEXT DEFAULT 'Male',
        language TEXT DEFAULT 'en',
        blood_group TEXT DEFAULT 'B+',
        allergies TEXT DEFAULT 'Penicillin',
        chronic_conditions TEXT DEFAULT 'Mild Hypertension (Under review)',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Chat history table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS chat_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        language TEXT DEFAULT 'en',
        category TEXT DEFAULT 'general',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Symptom assessments table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS symptom_checks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        symptoms TEXT NOT NULL,
        duration TEXT,
        severity TEXT,
        triage_level TEXT,
        summary TEXT,
        red_flags TEXT,
        recommendations TEXT,
        language TEXT DEFAULT 'en',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Medical reports table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS medical_reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        report_type TEXT,
        original_text TEXT,
        summary TEXT,
        abnormal_findings TEXT,
        normal_findings TEXT,
        questions_for_doctor TEXT,
        language TEXT DEFAULT 'en',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Vitals table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS vitals_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        vital_type TEXT NOT NULL, -- 'blood_pressure', 'glucose', 'heart_rate', 'weight', 'hydration'
        value_primary REAL NOT NULL,
        value_secondary REAL, -- e.g. diastolic for BP
        unit TEXT NOT NULL,
        notes TEXT,
        recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Reminders table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS reminders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        reminder_type TEXT NOT NULL, -- 'medication', 'appointment', 'hydration', 'screening', 'checkup'
        scheduled_time TEXT NOT NULL,
        frequency TEXT DEFAULT 'Daily',
        is_completed INTEGER DEFAULT 0,
        notes TEXT,
        doctor_specialty TEXT,
        location TEXT,
        is_demo INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Wellness Logs table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS wellness_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        log_date DATE NOT NULL,
        log_type TEXT NOT NULL, -- 'hydration', 'sleep', 'activity', 'checkin'
        metric_primary REAL NOT NULL,
        metric_secondary TEXT,
        notes TEXT,
        is_demo INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Configurable Wellness Goals table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS wellness_goals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        water_target_ml INTEGER DEFAULT 2000,
        sleep_target_hours REAL DEFAULT 8.0,
        activity_target_mins INTEGER DEFAULT 30,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    conn.commit()

    # Safely migrate existing reminders table columns if missing
    cursor.execute("PRAGMA table_info(reminders)")
    reminder_cols = [col[1] for col in cursor.fetchall()]
    if "doctor_specialty" not in reminder_cols:
        cursor.execute("ALTER TABLE reminders ADD COLUMN doctor_specialty TEXT")
    if "location" not in reminder_cols:
        cursor.execute("ALTER TABLE reminders ADD COLUMN location TEXT")
    if "is_demo" not in reminder_cols:
        cursor.execute("ALTER TABLE reminders ADD COLUMN is_demo INTEGER DEFAULT 0")
    conn.commit()

    # Seed default wellness goals if empty
    cursor.execute("SELECT COUNT(*) FROM wellness_goals")
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
        INSERT INTO wellness_goals (water_target_ml, sleep_target_hours, activity_target_mins)
        VALUES (2000, 8.0, 30)
        """)
        conn.commit()

    # Check if user profile exists, seed demo profile if empty
    cursor.execute("SELECT COUNT(*) FROM user_profile")
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
        INSERT INTO user_profile (name, age, gender, language, blood_group, allergies, chronic_conditions)
        VALUES ('Aarav Sharma (Demo Profile)', 34, 'Male', 'en', 'B+', 'Penicillin', 'Mild Hypertension')
        """)
        conn.commit()

    # Check if reminders exist, seed synthetic demo reminders if empty
    cursor.execute("SELECT COUNT(*) FROM reminders")
    if cursor.fetchone()[0] == 0:
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

    # Seed synthetic wellness logs (past 7 days) if empty
    cursor.execute("SELECT COUNT(*) FROM wellness_logs")
    if cursor.fetchone()[0] == 0:
        cursor.executemany("""
        INSERT INTO wellness_logs (log_date, log_type, metric_primary, metric_secondary, notes, is_demo, created_at)
        VALUES (?, ?, ?, ?, ?, 1, ?)
        """, [
            # Day 1: 2026-10-21
            ("2026-10-21", "hydration", 2100, None, "Met daily hydration goal", "2026-10-21 20:00:00"),
            ("2026-10-21", "sleep", 7.5, "restful", "Good restful sleep", "2026-10-21 07:00:00"),
            ("2026-10-21", "activity", 35, "walking", "Brisk walking around neighborhood park", "2026-10-21 18:30:00"),
            ("2026-10-21", "checkin", 4, "low", "Felt energized and productive", "2026-10-21 21:00:00"),

            # Day 2: 2026-10-22
            ("2026-10-22", "hydration", 1850, None, "Slightly below target", "2026-10-22 20:30:00"),
            ("2026-10-22", "sleep", 6.8, "average", "Woke up once during night", "2026-10-22 07:15:00"),
            ("2026-10-22", "activity", 25, "yoga", "Morning stretching & yoga session", "2026-10-22 08:00:00"),
            ("2026-10-22", "checkin", 3, "moderate", "Work stress in afternoon", "2026-10-22 21:15:00"),

            # Day 3: 2026-10-23
            ("2026-10-23", "hydration", 2250, None, "Kept water bottle at desk", "2026-10-23 20:00:00"),
            ("2026-10-23", "sleep", 8.0, "restful", "Optimal sleep duration", "2026-10-23 07:00:00"),
            ("2026-10-23", "activity", 40, "cycling", "Evening stationary cycle", "2026-10-23 18:45:00"),
            ("2026-10-23", "checkin", 5, "low", "Great mood and minimal fatigue", "2026-10-23 21:00:00"),

            # Day 4: 2026-10-24
            ("2026-10-24", "hydration", 2400, None, "Well hydrated weekend", "2026-10-24 19:30:00"),
            ("2026-10-24", "sleep", 8.2, "restful", "Weekend recovery sleep", "2026-10-24 08:30:00"),
            ("2026-10-24", "activity", 45, "walking", "Outdoor trail walk with family", "2026-10-24 17:30:00"),
            ("2026-10-24", "checkin", 5, "low", "Relaxed weekend", "2026-10-24 21:00:00"),

            # Day 5: 2026-10-25
            ("2026-10-25", "hydration", 2000, None, "Hit exact goal", "2026-10-25 20:00:00"),
            ("2026-10-25", "sleep", 7.2, "average", "Normal sleep", "2026-10-25 07:10:00"),
            ("2026-10-25", "activity", 30, "walking", "Evening brisk walk", "2026-10-25 18:30:00"),
            ("2026-10-25", "checkin", 4, "low", "Feeling healthy and ready for week", "2026-10-25 21:00:00"),

            # Day 6: 2026-10-26
            ("2026-10-26", "hydration", 2300, None, "Drinking water regularly", "2026-10-26 20:00:00"),
            ("2026-10-26", "sleep", 7.8, "restful", "Slept early", "2026-10-26 06:45:00"),
            ("2026-10-26", "activity", 35, "walking", "Neighborhood walk", "2026-10-26 18:30:00"),
            ("2026-10-26", "checkin", 4, "low", "Good energy throughout day", "2026-10-26 21:00:00"),

            # Day 7: 2026-10-27 (Today)
            ("2026-10-27", "hydration", 1250, None, "In progress today", "2026-10-27 11:00:00"),
            ("2026-10-27", "sleep", 7.4, "restful", "Woke up refreshed", "2026-10-27 06:30:00"),
            ("2026-10-27", "activity", 20, "yoga", "Morning gentle stretches", "2026-10-27 07:30:00"),
            ("2026-10-27", "checkin", 4, "low", "Morning wellness check-in", "2026-10-27 08:00:00")
        ])
        conn.commit()

    # Check if vitals exist, seed synthetic trend data if empty
    cursor.execute("SELECT COUNT(*) FROM vitals_log")
    if cursor.fetchone()[0] == 0:
        cursor.executemany("""
        INSERT INTO vitals_log (vital_type, value_primary, value_secondary, unit, notes, recorded_at)
        VALUES (?, ?, ?, ?, ?, ?)
        """, [
            ("blood_pressure", 124, 82, "mmHg", "Morning reading, resting", "2026-10-21 08:30:00"),
            ("blood_pressure", 122, 80, "mmHg", "Morning reading", "2026-10-22 08:35:00"),
            ("blood_pressure", 128, 85, "mmHg", "After brisk commute", "2026-10-23 09:00:00"),
            ("blood_pressure", 120, 78, "mmHg", "Resting weekend", "2026-10-24 09:15:00"),
            ("blood_pressure", 119, 79, "mmHg", "Optimal resting", "2026-10-25 08:45:00"),
            ("blood_pressure", 121, 81, "mmHg", "Current reading", "2026-10-26 08:30:00"),

            ("glucose", 98, None, "mg/dL", "Fasting", "2026-10-21 07:30:00"),
            ("glucose", 102, None, "mg/dL", "Fasting", "2026-10-23 07:35:00"),
            ("glucose", 95, None, "mg/dL", "Fasting", "2026-10-25 07:30:00"),
            ("glucose", 99, None, "mg/dL", "Fasting", "2026-10-26 07:40:00"),

            ("heart_rate", 72, None, "bpm", "Resting", "2026-10-24 08:00:00"),
            ("heart_rate", 70, None, "bpm", "Resting", "2026-10-25 08:00:00"),
            ("heart_rate", 74, None, "bpm", "Resting", "2026-10-26 08:00:00"),

            ("hydration", 2200, None, "ml", "Daily total", "2026-10-25 21:00:00"),
            ("hydration", 2400, None, "ml", "Daily total", "2026-10-26 21:00:00")
        ])
        conn.commit()

    conn.close()
