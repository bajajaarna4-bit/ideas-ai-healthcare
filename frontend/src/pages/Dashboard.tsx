import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Stethoscope,
  FileText,
  Activity,
  Heart,
  Droplets,
  Zap,
  CheckCircle2,
  Clock,
  ArrowRight,
  AlertTriangle,
  ShieldCheck,
  Sparkles,
  Calendar,
  Pill,
  Smile,
  Info
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useHealthData } from '../contexts/HealthDataContext';
import { api } from '../services/api';
import { DashboardSummary } from '../types';

export const Dashboard: React.FC = () => {
  const { t, format } = useLanguage();
  const {
    userProfile,
    vitals,
    reminders,
    toggleReminder,
    setActiveTab,
    setEmergencyModalOpen
  } = useHealthData();

  const [dashboardData, setDashboardData] = useState<DashboardSummary | null>(null);

  useEffect(() => {
    const fetchDashboardSummary = async () => {
      try {
        const summary = await api.getDashboardSummary();
        setDashboardData(summary);
      } catch (err) {
        console.error('Failed to fetch dashboard summary', err);
      }
    };
    fetchDashboardSummary();
  }, [reminders]);

  // Find latest vitals
  const latestBP = [...vitals].reverse().find(v => v.vital_type === 'blood_pressure');
  const latestGlucose = [...vitals].reverse().find(v => v.vital_type === 'glucose');
  const latestHR = [...vitals].reverse().find(v => v.vital_type === 'heart_rate');

  const todayHydration = dashboardData?.wellness_today.hydration_ml || 0;
  const todaySleep = dashboardData?.wellness_today.sleep_hours || 0;
  const todayActivity = dashboardData?.wellness_today.activity_mins || 0;
  const isDemoWellness = dashboardData?.wellness_today.is_demo_mode ?? true;

  const coreTools = [
    {
      id: 'assistant',
      title: t.dashboard.aiAssistantTitle,
      desc: t.dashboard.aiAssistantDesc,
      icon: MessageSquare,
      color: 'from-teal-500 to-teal-700',
      badge: 'Multilingual AI'
    },
    {
      id: 'symptoms',
      title: t.dashboard.symptomGuidanceTitle,
      desc: t.dashboard.symptomGuidanceDesc,
      icon: Stethoscope,
      color: 'from-sky-500 to-blue-700',
      badge: 'Clinical Triage'
    },
    {
      id: 'reports',
      title: t.dashboard.reportSimplifierTitle,
      desc: t.dashboard.reportSimplifierDesc,
      icon: FileText,
      color: 'from-indigo-500 to-indigo-700',
      badge: 'Lab Translator'
    },
    {
      id: 'preventive',
      title: t.dashboard.preventiveCareTitle,
      desc: t.dashboard.preventiveCareDesc,
      icon: Activity,
      color: 'from-emerald-500 to-teal-700',
      badge: 'Habits & Reminders'
    }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Synthetic Demo Banner Notice */}
      <div className="bg-health-navy-50/80 border border-health-navy-200/80 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs text-health-navy-900">
        <div className="flex items-center gap-2.5">
          <span className="px-2 py-0.5 rounded-full bg-health-teal-100 text-health-teal-800 font-bold text-[10px] uppercase tracking-wider">
            {t.dashboard.syntheticBadge}
          </span>
          <span>{t.syntheticNotice}</span>
        </div>
        <div className="flex items-center gap-2 text-health-slate-500 text-[11px]">
          <ShieldCheck className="w-3.5 h-3.5 text-health-teal-600" />
          <span>Non-Diagnostic Educational Tool</span>
        </div>
      </div>

      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-health-navy-900 via-health-navy-800 to-health-teal-800 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-health-teal-200 border border-white/10">
            <Sparkles className="w-3.5 h-3.5" />
            <span>HealthSathi Companion</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {format(t.dashboard.welcome, { name: userProfile.name.split(' ')[0] })}
          </h1>
          <p className="text-sm text-health-slate-200 leading-relaxed">
            {t.dashboard.welcomeSub}
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab('assistant')}
              className="px-4 py-2 bg-health-teal-500 hover:bg-health-teal-400 text-health-navy-950 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{t.dashboard.aiAssistantTitle}</span>
            </button>
            <button
              onClick={() => setActiveTab('symptoms')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold text-xs sm:text-sm border border-white/20 transition-all flex items-center gap-2"
            >
              <Stethoscope className="w-4 h-4" />
              <span>{t.dashboard.symptomGuidanceTitle}</span>
            </button>
          </div>
        </div>

        {/* Background abstract decoration */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-health-teal-400/20 to-transparent pointer-events-none" />
      </div>

      {/* Prominent Emergency Protocol Warning Banner */}
      <div className="bg-gradient-to-r from-rose-50 via-red-50 to-amber-50 border-2 border-rose-300 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="p-2.5 rounded-xl bg-rose-600 text-white flex-shrink-0 animate-pulse">
            <AlertTriangle className="w-5 h-5" />
          </span>
          <div className="space-y-0.5">
            <h3 className="font-extrabold text-sm sm:text-base text-rose-950">
              {t.dashboard.emergencyBannerTitle}
            </h3>
            <p className="text-xs text-rose-800 leading-relaxed">
              Immediate medical assessment required. HealthSathi AI cannot triage life-threatening conditions. Call national emergency services immediately.
            </p>
          </div>
        </div>
        <button
          onClick={() => setEmergencyModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 flex-shrink-0"
        >
          <span>{t.dashboard.emergencyBannerBtn} (112 / 108)</span>
        </button>
      </div>

      {/* Core Tools Grid */}
      <div className="space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-health-slate-900">
          {t.dashboard.quickActionsTitle}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {coreTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.id}
                onClick={() => setActiveTab(tool.id)}
                className="group relative bg-white rounded-2xl p-5 border border-health-slate-200/90 shadow-2xs hover:shadow-md hover:border-health-teal-400 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`p-3 rounded-xl bg-gradient-to-br ${tool.color} text-white shadow-sm`}>
                      <Icon className="w-5 h-5" />
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-health-slate-400 bg-health-slate-50 px-2.5 py-1 rounded-full border border-health-slate-200">
                      {tool.badge}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm sm:text-base text-health-slate-900 group-hover:text-health-teal-700 transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-xs text-health-slate-500 mt-1 leading-relaxed">
                    {tool.desc}
                  </p>
                </div>

                <div className="pt-4 mt-2 border-t border-health-slate-100 flex items-center text-xs font-bold text-health-teal-600 group-hover:translate-x-0.5 transition-transform">
                  <span>Open Tool</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Vitals & Real Module Activities */}
        <div className="lg:col-span-2 space-y-6">
          {/* Vitals & Today Wellness Summary */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-bold text-health-slate-900">
                {t.dashboard.wellnessSummaryTitle}
              </h2>
              <button
                onClick={() => setActiveTab('preventive')}
                className="text-xs font-semibold text-health-teal-600 hover:text-health-teal-700 flex items-center gap-1"
              >
                <span>View Trend Charts</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Blood Pressure */}
              <div className="bg-white p-4 rounded-2xl border border-health-slate-200 shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-health-slate-500">{t.dashboard.bloodPressure}</span>
                  <Heart className="w-4 h-4 text-rose-500" />
                </div>
                <div className="text-lg sm:text-xl font-extrabold text-health-slate-900">
                  {latestBP ? `${latestBP.value_primary}/${latestBP.value_secondary}` : '121/81'}
                  <span className="text-[10px] text-health-slate-400 ml-1 font-normal">mmHg</span>
                </div>
                <span className="inline-block mt-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {t.dashboard.optimal}
                </span>
              </div>

              {/* Fasting Glucose */}
              <div className="bg-white p-4 rounded-2xl border border-health-slate-200 shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-health-slate-500">{t.dashboard.bloodGlucose}</span>
                  <Zap className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-lg sm:text-xl font-extrabold text-health-slate-900">
                  {latestGlucose ? `${latestGlucose.value_primary}` : '98'}
                  <span className="text-[10px] text-health-slate-400 ml-1 font-normal">mg/dL</span>
                </div>
                <span className="inline-block mt-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {t.dashboard.normal}
                </span>
              </div>

              {/* Today Hydration */}
              <div className="bg-white p-4 rounded-2xl border border-health-slate-200 shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-health-slate-500">{t.dashboard.hydration}</span>
                  <Droplets className="w-4 h-4 text-sky-500" />
                </div>
                <div className="text-lg sm:text-xl font-extrabold text-health-slate-900">
                  {todayHydration}
                  <span className="text-[10px] text-health-slate-400 ml-1 font-normal">ml</span>
                </div>
                <span className={`inline-block mt-2 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                  todayHydration >= 2000
                    ? 'bg-sky-50 text-sky-700 border-sky-200'
                    : 'bg-health-slate-50 text-health-slate-600 border-health-slate-200'
                }`}>
                  {todayHydration >= 2000 ? 'Target Met' : `${todayHydration}/2000 ml`}
                </span>
              </div>

              {/* Sleep Hours */}
              <div className="bg-white p-4 rounded-2xl border border-health-slate-200 shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-health-slate-500">Sleep</span>
                  <Activity className="w-4 h-4 text-indigo-500" />
                </div>
                <div className="text-lg sm:text-xl font-extrabold text-health-slate-900">
                  {todaySleep}
                  <span className="text-[10px] text-health-slate-400 ml-1 font-normal">hrs</span>
                </div>
                <span className="inline-block mt-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {todaySleep >= 7 ? 'Restful' : 'Under Target'}
                </span>
              </div>
            </div>
          </div>

          {/* REAL COMPANION ACTIVITY SECTION (NO FAKE STATS) */}
          <div className="bg-white rounded-2xl p-5 border border-health-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-health-navy-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-health-teal-600" />
                <span>{t.dashboard.realDataOnly}</span>
              </h3>
              <span className="text-[11px] font-bold text-health-slate-400">
                {isDemoWellness ? 'Demo Profile Mode' : 'User Synced Records'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Chat Activity */}
              <div className="p-3.5 rounded-xl bg-health-slate-50 border border-health-slate-200/70 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800">
                  AI Assistant
                </span>
                <p className="text-xs font-bold text-health-navy-900">
                  {dashboardData?.assistant_activity.total_messages || 0} Messages
                </p>
                <p className="text-[11px] text-health-slate-500">
                  {dashboardData?.assistant_activity.has_activity
                    ? 'Conversational health dialogues recorded.'
                    : t.dashboard.noChatsYet}
                </p>
              </div>

              {/* Symptom Checks */}
              <div className="p-3.5 rounded-xl bg-health-slate-50 border border-health-slate-200/70 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800">
                  Symptom Checks
                </span>
                <p className="text-xs font-bold text-health-navy-900">
                  {dashboardData?.symptom_activity.saved_sessions_count || 0} Saved Sessions
                </p>
                <p className="text-[11px] text-health-slate-500">
                  {dashboardData?.symptom_activity.has_saved_sessions
                    ? 'Clinical guidance sessions saved with user consent.'
                    : t.dashboard.noSavedSymptoms}
                </p>
              </div>

              {/* Lab Reports */}
              <div className="p-3.5 rounded-xl bg-health-slate-50 border border-health-slate-200/70 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-800">
                  Lab Reports
                </span>
                <p className="text-xs font-bold text-health-navy-900">
                  {dashboardData?.report_activity.saved_reports_count || 0} Saved Reports
                </p>
                <p className="text-[11px] text-health-slate-500">
                  {dashboardData?.report_activity.has_saved_reports
                    ? 'Evaluated blood panels stored with user consent.'
                    : t.dashboard.noSavedReports}
                </p>
              </div>
            </div>
          </div>

          {/* Safety Disclaimer Card */}
          <div className="bg-amber-50/70 border border-amber-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-health-slate-900">
                  {t.disclaimerShort}
                </h4>
                <p className="text-xs text-health-slate-600 mt-1 leading-relaxed">
                  {t.disclaimerFull}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Upcoming Reminders (Medications & Appointments) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-health-slate-900">
              {t.dashboard.upcomingReminders}
            </h2>
            <button
              onClick={() => setActiveTab('preventive')}
              className="text-xs font-bold text-health-teal-600 hover:text-health-teal-700"
            >
              Manage
            </button>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-health-slate-200 shadow-2xs space-y-3">
            {reminders.length === 0 ? (
              <p className="text-xs text-health-slate-400 py-4 text-center">
                {t.dashboard.noReminders}
              </p>
            ) : (
              reminders.map((reminder) => (
                <div
                  key={reminder.id}
                  onClick={() => toggleReminder(reminder.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                    reminder.is_completed
                      ? 'bg-health-slate-50 border-health-slate-200/60 opacity-60'
                      : 'bg-white border-health-slate-200 hover:border-health-teal-300 shadow-2xs'
                  }`}
                >
                  <button
                    className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center transition-colors flex-shrink-0 ${
                      reminder.is_completed
                        ? 'bg-health-teal-600 text-white'
                        : 'border border-health-slate-300 hover:border-health-teal-500'
                    }`}
                  >
                    {reminder.is_completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`p-1 rounded text-[10px] ${
                        reminder.reminder_type === 'medication'
                          ? 'bg-rose-50 text-rose-700'
                          : reminder.reminder_type === 'appointment'
                          ? 'bg-sky-50 text-sky-700'
                          : 'bg-teal-50 text-teal-700'
                      }`}>
                        {reminder.reminder_type === 'medication' ? (
                          <Pill className="w-3 h-3" />
                        ) : (
                          <Calendar className="w-3 h-3" />
                        )}
                      </span>
                      <p className={`text-xs font-bold truncate ${reminder.is_completed ? 'line-through text-health-slate-400' : 'text-health-slate-900'}`}>
                        {reminder.title}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-health-slate-500 mt-1">
                      <Clock className="w-3 h-3" />
                      <span>{reminder.scheduled_time}</span>
                      <span>•</span>
                      <span>{reminder.frequency}</span>
                    </div>

                    {reminder.location && (
                      <p className="text-[10px] text-health-slate-400 mt-0.5 truncate">
                        {reminder.location}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
