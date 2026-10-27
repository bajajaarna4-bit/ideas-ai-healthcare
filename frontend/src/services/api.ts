import {
  UserProfile,
  VitalItem,
  ReminderItem,
  ChatMessage,
  ChatResponse,
  SymptomAnalysisResponse,
  SmartQuestionnaireRequest,
  SmartQuestionnaireResponse,
  ReportSimplifierResponse,
  ManualLabTestEntry,
  SampleReportData,
  PreventiveData,
  WellnessGoals,
  WellnessSummaryResponse,
  DashboardSummary,
  SupportedLanguage
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorDetail = res.statusText;
    try {
      const errJson = await res.json();
      if (errJson && errJson.detail) {
        errorDetail = typeof errJson.detail === 'string' ? errJson.detail : JSON.stringify(errJson.detail);
      }
    } catch {
      try {
        const errorText = await res.text();
        if (errorText) errorDetail = errorText;
      } catch {
        // keep statusText
      }
    }
    throw new Error(errorDetail || `API Error ${res.status}`);
  }
  return res.json();
}

export const api = {
  // System Health
  async getHealth() {
    return handleResponse<{
      status: string;
      app_name: string;
      version: string;
      gemini_configured: boolean;
      database: string;
      supported_languages: string[];
    }>(await fetch(`${API_BASE}/api/health`));
  },

  // User Profile
  async getUserProfile(): Promise<UserProfile> {
    return handleResponse<UserProfile>(await fetch(`${API_BASE}/api/user/profile`));
  },

  async updateUserProfile(profile: UserProfile): Promise<UserProfile> {
    return handleResponse<UserProfile>(
      await fetch(`${API_BASE}/api/user/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      })
    );
  },

  async resetDemoData(): Promise<{ status: string; message: string }> {
    return handleResponse<{ status: string; message: string }>(
      await fetch(`${API_BASE}/api/user/reset-demo`, { method: 'POST' })
    );
  },

  // AI Chat Assistant
  async sendChatMessage(message: string, language: SupportedLanguage, category: string = 'general'): Promise<ChatResponse> {
    return handleResponse<ChatResponse>(
      await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, language, category }),
      })
    );
  },

  async getChatHistory(): Promise<ChatMessage[]> {
    return handleResponse<ChatMessage[]>(await fetch(`${API_BASE}/api/chat/history`));
  },

  async clearChatHistory(): Promise<{ status: string }> {
    return handleResponse<{ status: string }>(
      await fetch(`${API_BASE}/api/chat/history`, { method: 'DELETE' })
    );
  },

  // Symptom Guidance
  async analyzeSymptoms(payload: {
    symptoms: string;
    duration: string;
    severity: string;
    age?: number;
    gender?: string;
    language: SupportedLanguage;
  }): Promise<SymptomAnalysisResponse> {
    return handleResponse<SymptomAnalysisResponse>(
      await fetch(`${API_BASE}/api/symptoms/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    );
  },

  async submitSmartQuestionnaire(payload: SmartQuestionnaireRequest): Promise<SmartQuestionnaireResponse> {
    return handleResponse<SmartQuestionnaireResponse>(
      await fetch(`${API_BASE}/api/symptoms/questionnaire`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    );
  },

  // Report Simplifier
  async getSampleReport(): Promise<SampleReportData> {
    return handleResponse<SampleReportData>(
      await fetch(`${API_BASE}/api/reports/sample`)
    );
  },

  async simplifyReport(payload: {
    raw_text: string;
    report_type?: string;
    language: SupportedLanguage;
    user_consented_ai?: boolean;
    save_report?: boolean;
  }): Promise<ReportSimplifierResponse> {
    return handleResponse<ReportSimplifierResponse>(
      await fetch(`${API_BASE}/api/reports/simplify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    );
  },

  async simplifyManualTests(payload: {
    tests: ManualLabTestEntry[];
    language: SupportedLanguage;
    user_consented_ai?: boolean;
    save_report?: boolean;
  }): Promise<ReportSimplifierResponse> {
    return handleResponse<ReportSimplifierResponse>(
      await fetch(`${API_BASE}/api/reports/simplify-manual`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    );
  },

  async uploadReportPdf(
    file: File,
    language: SupportedLanguage,
    userConsentedAi: boolean = false,
    saveReport: boolean = false
  ): Promise<ReportSimplifierResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('language', language);
    formData.append('user_consented_ai', String(userConsentedAi));
    formData.append('save_report', String(saveReport));

    return handleResponse<ReportSimplifierResponse>(
      await fetch(`${API_BASE}/api/reports/upload-pdf`, {
        method: 'POST',
        body: formData,
      })
    );
  },

  // Preventive Care
  async getPreventiveCare(language: SupportedLanguage, age: number = 34, gender: string = 'Male'): Promise<PreventiveData> {
    return handleResponse<PreventiveData>(
      await fetch(`${API_BASE}/api/preventive/recommendations?language=${language}&age=${age}&gender=${encodeURIComponent(gender)}`)
    );
  },

  // Vitals
  async getVitals(vitalType?: string): Promise<VitalItem[]> {
    const url = vitalType ? `${API_BASE}/api/vitals?vital_type=${vitalType}` : `${API_BASE}/api/vitals`;
    return handleResponse<VitalItem[]>(await fetch(url));
  },

  async addVital(vital: {
    vital_type: string;
    value_primary: number;
    value_secondary?: number | null;
    unit: string;
    notes?: string;
  }): Promise<VitalItem> {
    return handleResponse<VitalItem>(
      await fetch(`${API_BASE}/api/vitals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vital),
      })
    );
  },

  // Reminders
  async getReminders(reminderType?: string): Promise<ReminderItem[]> {
    const url = reminderType ? `${API_BASE}/api/reminders?reminder_type=${reminderType}` : `${API_BASE}/api/reminders`;
    return handleResponse<ReminderItem[]>(await fetch(url));
  },

  async toggleReminder(id: number): Promise<{ status: string; id: number; is_completed: boolean }> {
    return handleResponse<{ status: string; id: number; is_completed: boolean }>(
      await fetch(`${API_BASE}/api/reminders/${id}/toggle`, { method: 'PATCH' })
    );
  },

  async addReminder(reminder: {
    title: string;
    reminder_type: string;
    scheduled_time: string;
    frequency?: string;
    notes?: string;
    doctor_specialty?: string;
    location?: string;
  }): Promise<ReminderItem> {
    return handleResponse<ReminderItem>(
      await fetch(`${API_BASE}/api/reminders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reminder),
      })
    );
  },

  async updateReminder(id: number, reminder: Partial<ReminderItem>): Promise<ReminderItem> {
    return handleResponse<ReminderItem>(
      await fetch(`${API_BASE}/api/reminders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reminder),
      })
    );
  },

  async deleteReminder(id: number): Promise<{ status: string; id: number }> {
    return handleResponse<{ status: string; id: number }>(
      await fetch(`${API_BASE}/api/reminders/${id}`, { method: 'DELETE' })
    );
  },

  async resetDemoReminders(): Promise<{ status: string; message: string }> {
    return handleResponse<{ status: string; message: string }>(
      await fetch(`${API_BASE}/api/reminders/reset-demo`, { method: 'POST' })
    );
  },

  async clearUserReminders(): Promise<{ status: string; deleted_user_reminders: number }> {
    return handleResponse<{ status: string; deleted_user_reminders: number }>(
      await fetch(`${API_BASE}/api/reminders/clear-user`, { method: 'DELETE' })
    );
  },

  // Wellness Tracking & Check-ins
  async getWellnessSummary(days: number = 7): Promise<WellnessSummaryResponse> {
    return handleResponse<WellnessSummaryResponse>(
      await fetch(`${API_BASE}/api/wellness/summary?days=${days}`)
    );
  },

  async logWellnessMetric(payload: {
    log_date?: string;
    log_type: string;
    metric_primary: number;
    metric_secondary?: string;
    notes?: string;
  }): Promise<{ status: string; id: number; log_type: string; date: string }> {
    return handleResponse<{ status: string; id: number; log_type: string; date: string }>(
      await fetch(`${API_BASE}/api/wellness/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    );
  },

  async submitDailyCheckin(payload: {
    mood_energy: number;
    stress_level: string;
    notes?: string;
  }): Promise<{ status: string; id: number; date: string }> {
    return handleResponse<{ status: string; id: number; date: string }>(
      await fetch(`${API_BASE}/api/wellness/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    );
  },

  async getWellnessGoals(): Promise<WellnessGoals> {
    return handleResponse<WellnessGoals>(await fetch(`${API_BASE}/api/wellness/goals`));
  },

  async updateWellnessGoals(goals: WellnessGoals): Promise<WellnessGoals> {
    return handleResponse<WellnessGoals>(
      await fetch(`${API_BASE}/api/wellness/goals`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goals),
      })
    );
  },

  async clearUserWellnessHistory(): Promise<{ status: string; deleted_user_entries: number }> {
    return handleResponse<{ status: string; deleted_user_entries: number }>(
      await fetch(`${API_BASE}/api/wellness/clear-history`, { method: 'DELETE' })
    );
  },

  async resetDemoWellness(): Promise<{ status: string; message: string }> {
    return handleResponse<{ status: string; message: string }>(
      await fetch(`${API_BASE}/api/wellness/reset-demo`, { method: 'POST' })
    );
  },

  // Dashboard Summary (Real Data Only)
  async getDashboardSummary(): Promise<DashboardSummary> {
    return handleResponse<DashboardSummary>(await fetch(`${API_BASE}/api/dashboard/summary`));
  }
};
