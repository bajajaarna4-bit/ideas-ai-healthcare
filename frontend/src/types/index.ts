export type SupportedLanguage = 'en' | 'hi' | 'mr';

export interface UserProfile {
  name: string;
  age: number;
  gender: string;
  language: SupportedLanguage;
  blood_group: string;
  allergies: string;
  chronic_conditions: string;
}

export interface VitalItem {
  id: number;
  vital_type: 'blood_pressure' | 'glucose' | 'heart_rate' | 'weight' | 'hydration';
  value_primary: number;
  value_secondary?: number | null;
  unit: string;
  notes?: string | null;
  recorded_at: string;
}

export interface ReminderItem {
  id: number;
  title: string;
  reminder_type: 'medication' | 'appointment' | 'hydration' | 'screening' | 'checkup';
  scheduled_time: string;
  frequency: string;
  is_completed: boolean;
  notes?: string | null;
  doctor_specialty?: string | null;
  location?: string | null;
  is_demo?: boolean;
  created_at: string;
}

export interface WellnessGoals {
  water_target_ml: number;
  sleep_target_hours: number;
  activity_target_mins: number;
}

export interface DailyDaySummary {
  date: string;
  hydration_ml: number;
  sleep_hours: number;
  sleep_quality?: string | null;
  activity_mins: number;
  activity_type?: string | null;
  mood_energy?: number | null;
  stress_level?: string | null;
  notes?: string | null;
  is_demo: boolean;
}

export interface WellnessSummaryResponse {
  weekly_trend: DailyDaySummary[];
  today_hydration: number;
  today_sleep: number;
  today_activity: number;
  today_mood?: number | null;
  today_stress?: string | null;
  goals: WellnessGoals;
  in_app_reminder_notice: string;
  disclaimer: string;
}

export interface DashboardSummary {
  profile: Partial<UserProfile>;
  assistant_activity: {
    total_messages: number;
    has_activity: boolean;
    recent_messages: Array<{ role: string; content: string; created_at: string }>;
  };
  symptom_activity: {
    saved_sessions_count: number;
    has_saved_sessions: boolean;
    recent_sessions: Array<{ symptoms: string; triage_level: string; summary: string; created_at: string }>;
  };
  report_activity: {
    saved_reports_count: number;
    has_saved_reports: boolean;
    recent_reports: Array<{ title: string; report_type: string; summary: string; created_at: string }>;
  };
  upcoming_reminders: ReminderItem[];
  wellness_today: {
    hydration_ml: number;
    sleep_hours: number;
    activity_mins: number;
    mood_rating?: number | null;
    user_entries_count: number;
    is_demo_mode: boolean;
  };
}

export interface ChatMessage {
  id?: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  language?: SupportedLanguage;
  red_flag_alert?: boolean;
  emergency_number?: string | null;
  suggested_followups?: string[];
  disclaimer?: string;
  created_at?: string;
}

export interface ChatResponse {
  reply: string;
  language: SupportedLanguage;
  is_demo_mode: boolean;
  demo_notice?: string | null;
  confidence_note?: string | null;
  red_flag_alert: boolean;
  emergency_number?: string | null;
  suggested_followups: string[];
  disclaimer: string;
}

export interface ManualLabTestEntry {
  test_name: string;
  value: string;
  unit?: string;
  reference_interval?: string;
}

export interface SampleReportData {
  title: string;
  report_type: string;
  text: string;
  manual_tests: ManualLabTestEntry[];
}

export interface LabFinding {
  test_name: string;
  value: string;
  unit?: string;
  normal_range: string;
  status: 'within_interval' | 'below_interval' | 'above_interval' | 'ambiguous_comparison' | 'normal' | 'high' | 'low';
  plain_explanation: string;
  clinical_significance: string;
  is_ambiguous?: boolean;
  ambiguity_note?: string | null;
}

export interface ReportSimplifierResponse {
  title: string;
  summary: string;
  findings: LabFinding[];
  abnormal_count: number;
  ambiguous_count?: number;
  questions_for_doctor: string[];
  lifestyle_tips: string[];
  reference_interval_explanation?: string;
  privacy_disclosure?: string;
  used_ai_simplification?: boolean;
  disclaimer: string;
}

export interface PotentialCondition {
  name: string;
  description: string;
  urgency: 'low' | 'moderate' | 'high';
}

export interface SymptomAnalysisResponse {
  triage_level: 'emergency' | 'urgent_care' | 'routine_doctor' | 'self_care';
  summary: string;
  educational_topics: PotentialCondition[];
  red_flags: string[];
  home_comfort_steps: string[];
  questions_for_doctor: string[];
  escalation_advice: string;
  disclaimer: string;
}

export type CareTier = 'emergency_now' | 'prompt_evaluation' | 'routine_consultation' | 'self_care_education' | 'insufficient_info';

export interface SmartQuestionnaireRequest {
  main_symptom: string;
  onset: string;
  severity: string;
  progression: string;
  associated_symptoms: string[];
  age_range?: string;
  language: SupportedLanguage;
  save_history?: boolean;
}

export interface SmartQuestionnaireResponse {
  care_tier: CareTier;
  tier_title: string;
  reason_for_step: string;
  action_steps: string[];
  urgent_warning_signs: string[];
  summary_of_input: string;
  is_emergency: boolean;
  requires_immediate_escalation: boolean;
  emergency_number: string;
  ai_plain_language_explanation?: string | null;
  clinical_disclaimer: string;
  ruleset_reference: string;
}

export interface PreventiveScreening {
  category: string;
  test: string;
  frequency: string;
  target: string;
  importance: string;
}

export interface VaccinationSchedule {
  vaccine: string;
  schedule: string;
  target_group: string;
}

export interface DailyHabit {
  habit: string;
  goal: string;
  tip: string;
}

export interface PreventiveData {
  language: SupportedLanguage;
  age: number;
  gender: string;
  screenings: PreventiveScreening[];
  vaccinations: VaccinationSchedule[];
  daily_habits: DailyHabit[];
  disclaimer: string;
}
