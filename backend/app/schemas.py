from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000, description="User health question")
    language: str = Field("en", pattern="^(en|hi|mr)$")
    context: Optional[str] = None
    category: Optional[str] = "general"

class ChatResponse(BaseModel):
    reply: str
    language: str
    is_demo_mode: bool = False
    demo_notice: Optional[str] = None
    confidence_note: Optional[str] = None
    red_flag_alert: bool = False
    emergency_number: Optional[str] = None
    suggested_followups: List[str] = []
    disclaimer: str

class SymptomAnalysisRequest(BaseModel):
    symptoms: str
    duration: str = "1-2 days"
    severity: str = "moderate" # mild, moderate, severe
    age: Optional[int] = 34
    gender: Optional[str] = "Male"
    existing_conditions: Optional[str] = None
    language: str = "en"
    save_history: bool = False

class SmartQuestionnaireRequest(BaseModel):
    main_symptom: str = Field(..., min_length=1, max_length=500, description="Primary symptom reported")
    onset: str = Field("1_to_3_days", description="When symptoms began")
    severity: str = Field("moderate", description="Mild, moderate, severe, or unbearable")
    progression: str = Field("stable", description="Trajectory: improving, stable, worsening_gradually, worsening_rapidly")
    associated_symptoms: List[str] = Field(default_factory=list, description="Associated clinical warning signs")
    age_range: Optional[str] = Field("adult_18_64", description="Age category for clinical vulnerability")
    language: str = Field("en", pattern="^(en|hi|mr)$")
    save_history: bool = Field(False, description="Privacy toggle: Do not store symptom answers by default")

class SmartQuestionnaireResponse(BaseModel):
    care_tier: str # emergency_now, prompt_evaluation, routine_consultation, self_care_education, insufficient_info
    tier_title: str
    reason_for_step: str
    action_steps: List[str]
    urgent_warning_signs: List[str]
    summary_of_input: str
    is_emergency: bool = False
    requires_immediate_escalation: bool = False
    emergency_number: str = "112 / 108"
    ai_plain_language_explanation: Optional[str] = None
    clinical_disclaimer: str
    ruleset_reference: str = "Clinician-reviewed deterministic ruleset based on NHS 111 CAS & NICE Clinical Summaries"

class PotentialCondition(BaseModel):
    name: str
    description: str
    urgency: str # low, moderate, high

class SymptomAnalysisResponse(BaseModel):
    triage_level: str # emergency, urgent_care, routine_doctor, self_care
    summary: str
    educational_topics: List[PotentialCondition] = []
    red_flags: List[str] = []
    home_comfort_steps: List[str] = []
    questions_for_doctor: List[str] = []
    escalation_advice: str
    disclaimer: str

class ManualLabTestEntry(BaseModel):
    test_name: str = Field(..., min_length=1, description="Laboratory test name")
    value: str = Field(..., min_length=1, description="Reported numeric or qualitative test value")
    unit: Optional[str] = Field("", description="Measurement unit (e.g. mg/dL, g/dL, %)")
    reference_interval: Optional[str] = Field("", description="Laboratory provided normal reference interval")

class ManualReportSimplifierRequest(BaseModel):
    tests: List[ManualLabTestEntry]
    language: str = "en"
    user_consented_ai: bool = False
    save_report: bool = False

class LabFinding(BaseModel):
    test_name: str
    value: str
    unit: Optional[str] = ""
    normal_range: str
    status: str # 'within_interval', 'below_interval', 'above_interval', 'ambiguous_comparison', 'normal', 'high', 'low'
    plain_explanation: str
    clinical_significance: str
    is_ambiguous: bool = False
    ambiguity_note: Optional[str] = None

class ReportSimplifierRequest(BaseModel):
    raw_text: str
    report_type: Optional[str] = "General Lab Report"
    language: str = "en"
    user_consented_ai: bool = False
    save_report: bool = False

class ReportSimplifierResponse(BaseModel):
    title: str
    summary: str
    findings: List[LabFinding] = []
    abnormal_count: int = 0
    ambiguous_count: int = 0
    questions_for_doctor: List[str] = []
    lifestyle_tips: List[str] = []
    reference_interval_explanation: str = ""
    privacy_disclosure: str = ""
    used_ai_simplification: bool = False
    disclaimer: str

class VitalCreate(BaseModel):
    vital_type: str # 'blood_pressure', 'glucose', 'heart_rate', 'weight', 'hydration'
    value_primary: float
    value_secondary: Optional[float] = None
    unit: str
    notes: Optional[str] = None

class VitalItem(BaseModel):
    id: int
    vital_type: str
    value_primary: float
    value_secondary: Optional[float] = None
    unit: str
    notes: Optional[str] = None
    recorded_at: str

class ReminderCreate(BaseModel):
    title: str = Field(..., min_length=1, description="Medication, appointment, or habit title")
    reminder_type: str = Field(..., description="'medication', 'appointment', 'hydration', 'screening', 'checkup'")
    scheduled_time: str = Field(..., description="Time or datetime string, e.g. '08:30 AM' or '2026-11-05 10:30 AM'")
    frequency: str = "Daily"
    notes: Optional[str] = None
    doctor_specialty: Optional[str] = None
    location: Optional[str] = None

class ReminderUpdate(BaseModel):
    title: Optional[str] = None
    reminder_type: Optional[str] = None
    scheduled_time: Optional[str] = None
    frequency: Optional[str] = None
    notes: Optional[str] = None
    doctor_specialty: Optional[str] = None
    location: Optional[str] = None
    is_completed: Optional[bool] = None

class ReminderItem(BaseModel):
    id: int
    title: str
    reminder_type: str
    scheduled_time: str
    frequency: str
    is_completed: bool
    notes: Optional[str] = None
    doctor_specialty: Optional[str] = None
    location: Optional[str] = None
    is_demo: bool = False
    created_at: str

class WellnessLogCreate(BaseModel):
    log_date: Optional[str] = None
    log_type: str # 'hydration', 'sleep', 'activity', 'checkin'
    metric_primary: float
    metric_secondary: Optional[str] = None
    notes: Optional[str] = None

class DailyCheckinCreate(BaseModel):
    mood_energy: int = Field(..., ge=1, le=5, description="1 to 5 mood/energy rating")
    stress_level: str = Field(..., description="'low', 'moderate', or 'high'")
    notes: Optional[str] = ""

class WellnessLogItem(BaseModel):
    id: int
    log_date: str
    log_type: str
    metric_primary: float
    metric_secondary: Optional[str] = None
    notes: Optional[str] = None
    is_demo: bool = False
    created_at: str

class WellnessGoalsSchema(BaseModel):
    water_target_ml: int = 2000
    sleep_target_hours: float = 8.0
    activity_target_mins: int = 30

class DailyDaySummary(BaseModel):
    date: str
    hydration_ml: int = 0
    sleep_hours: float = 0.0
    sleep_quality: Optional[str] = None
    activity_mins: int = 0
    activity_type: Optional[str] = None
    mood_energy: Optional[int] = None
    stress_level: Optional[str] = None
    notes: Optional[str] = None
    is_demo: bool = False

class WellnessSummaryResponse(BaseModel):
    weekly_trend: List[DailyDaySummary]
    today_hydration: int
    today_sleep: float
    today_activity: int
    today_mood: Optional[int] = None
    today_stress: Optional[str] = None
    goals: WellnessGoalsSchema
    in_app_reminder_notice: str
    disclaimer: str

class UserProfileSchema(BaseModel):
    name: str
    age: int
    gender: str
    language: str
    blood_group: str
    allergies: str
    chronic_conditions: str
