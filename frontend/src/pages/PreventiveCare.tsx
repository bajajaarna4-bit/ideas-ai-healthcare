import React, { useState, useEffect } from 'react';
import {
  Activity,
  Pill,
  Calendar,
  Droplets,
  Moon,
  Smile,
  Shield,
  Plus,
  CheckCircle,
  Clock,
  AlertCircle,
  Trash2,
  Edit2,
  Sparkles,
  Info,
  RefreshCw,
  Zap,
  Check,
  X
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { useLanguage } from '../contexts/LanguageContext';
import { useHealthData } from '../contexts/HealthDataContext';
import { api } from '../services/api';
import {
  PreventiveData,
  ReminderItem,
  WellnessSummaryResponse,
  WellnessGoals
} from '../types';

type PreventiveTab =
  | 'medications'
  | 'appointments'
  | 'hydration'
  | 'sleep_activity'
  | 'checkin_summary'
  | 'education_goals';

export const PreventiveCare: React.FC = () => {
  const { language, t, format } = useLanguage();
  const {
    userProfile,
    reminders,
    addReminder,
    updateReminder,
    deleteReminder,
    toggleReminder,
    vitals,
    addVital
  } = useHealthData();

  const [activeTab, setActiveTab] = useState<PreventiveTab>('medications');
  const [preventiveData, setPreventiveData] = useState<PreventiveData | null>(null);
  const [wellnessSummary, setWellnessSummary] = useState<WellnessSummaryResponse | null>(null);
  const [isLoadingWellness, setIsLoadingWellness] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Modals state
  const [showMedModal, setShowMedModal] = useState<boolean>(false);
  const [showApptModal, setShowApptModal] = useState<boolean>(false);
  const [showSleepModal, setShowSleepModal] = useState<boolean>(false);
  const [showActivityModal, setShowActivityModal] = useState<boolean>(false);

  // Edit reminder state
  const [editingReminder, setEditingReminder] = useState<ReminderItem | null>(null);

  // Form states - Medications
  const [medName, setMedName] = useState('');
  const [medSchedule, setMedSchedule] = useState('');
  const [medTime, setMedTime] = useState('');
  const [medNotes, setMedNotes] = useState('');

  // Form states - Appointments
  const [apptDoctor, setApptDoctor] = useState('');
  const [apptDateTime, setApptDateTime] = useState('');
  const [apptLocation, setApptLocation] = useState('');
  const [apptNotes, setApptNotes] = useState('');

  // Form states - Hydration custom
  const [customWater, setCustomWater] = useState('');

  // Form states - Sleep
  const [sleepHours, setSleepHours] = useState('7.5');
  const [sleepQuality, setSleepQuality] = useState('restful');
  const [sleepNotes, setSleepNotes] = useState('');

  // Form states - Activity
  const [activityType, setActivityType] = useState('walking');
  const [activityDuration, setActivityDuration] = useState('30');
  const [activityIntensity, setActivityIntensity] = useState('moderate');
  const [activityNotes, setActivityNotes] = useState('');

  // Form states - Daily Check-in
  const [checkinMood, setCheckinMood] = useState<number>(4);
  const [checkinStress, setCheckinStress] = useState<string>('low');
  const [checkinNotes, setCheckinNotes] = useState<string>('');

  // Form states - Goals
  const [waterGoal, setWaterGoal] = useState<number>(2000);
  const [sleepGoal, setSleepGoal] = useState<number>(8);
  const [activityGoal, setActivityGoal] = useState<number>(30);

  // Load guidelines and wellness summary
  const loadWellnessData = async () => {
    setIsLoadingWellness(true);
    try {
      const summary = await api.getWellnessSummary(7);
      setWellnessSummary(summary);
      if (summary.goals) {
        setWaterGoal(summary.goals.water_target_ml);
        setSleepGoal(summary.goals.sleep_target_hours);
        setActivityGoal(summary.goals.activity_target_mins);
      }
    } catch (err) {
      console.error('Failed to load wellness summary', err);
    } finally {
      setIsLoadingWellness(false);
    }
  };

  useEffect(() => {
    const loadGuidelines = async () => {
      try {
        const data = await api.getPreventiveCare(language, userProfile.age, userProfile.gender);
        setPreventiveData(data);
      } catch (err) {
        console.error('Failed to load preventive guidelines', err);
      }
    };
    loadGuidelines();
    loadWellnessData();
  }, [language, userProfile.age, userProfile.gender]);

  const showNotification = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  // Medication Submit
  const handleSaveMedication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName.trim() || !medTime.trim()) return;

    if (editingReminder) {
      await updateReminder(editingReminder.id, {
        title: medName.trim(),
        scheduled_time: medTime.trim(),
        frequency: medSchedule.trim() || 'Daily',
        notes: medNotes.trim() || undefined
      });
      showNotification('Medication reminder updated.');
    } else {
      await addReminder({
        title: medName.trim(),
        reminder_type: 'medication',
        scheduled_time: medTime.trim(),
        frequency: medSchedule.trim() || 'Daily',
        notes: medNotes.trim() || undefined
      });
      showNotification('New medication reminder scheduled.');
    }

    setMedName('');
    setMedSchedule('');
    setMedTime('');
    setMedNotes('');
    setEditingReminder(null);
    setShowMedModal(false);
  };

  // Appointment Submit
  const handleSaveAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apptDoctor.trim() || !apptDateTime.trim()) return;

    if (editingReminder) {
      await updateReminder(editingReminder.id, {
        title: `Appointment: ${apptDoctor.trim()}`,
        doctor_specialty: apptDoctor.trim(),
        scheduled_time: apptDateTime.trim(),
        location: apptLocation.trim() || undefined,
        notes: apptNotes.trim() || undefined
      });
      showNotification('Appointment reminder updated.');
    } else {
      await addReminder({
        title: `Appointment: ${apptDoctor.trim()}`,
        reminder_type: 'appointment',
        scheduled_time: apptDateTime.trim(),
        frequency: 'Once',
        doctor_specialty: apptDoctor.trim(),
        location: apptLocation.trim() || undefined,
        notes: apptNotes.trim() || undefined
      });
      showNotification('Clinical appointment reminder scheduled.');
    }

    setApptDoctor('');
    setApptDateTime('');
    setApptLocation('');
    setApptNotes('');
    setEditingReminder(null);
    setShowApptModal(false);
  };

  // Hydration quick log
  const handleLogWater = async (amount: number) => {
    try {
      await api.logWellnessMetric({
        log_type: 'hydration',
        metric_primary: amount,
        notes: 'Logged from Hydration Tracker'
      });
      showNotification(`Added +${amount} ml to daily hydration.`);
      loadWellnessData();
    } catch (err) {
      console.error('Failed to log water', err);
    }
  };

  // Sleep Submit
  const handleSaveSleep = async (e: React.FormEvent) => {
    e.preventDefault();
    const hours = parseFloat(sleepHours);
    if (isNaN(hours) || hours <= 0) return;

    try {
      await api.logWellnessMetric({
        log_type: 'sleep',
        metric_primary: hours,
        metric_secondary: sleepQuality,
        notes: sleepNotes.trim() || undefined
      });
      showNotification('Sleep session recorded.');
      setShowSleepModal(false);
      setSleepNotes('');
      loadWellnessData();
    } catch (err) {
      console.error('Failed to log sleep', err);
    }
  };

  // Activity Submit
  const handleSaveActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    const mins = parseInt(activityDuration, 10);
    if (isNaN(mins) || mins <= 0) return;

    try {
      await api.logWellnessMetric({
        log_type: 'activity',
        metric_primary: mins,
        metric_secondary: activityType,
        notes: activityNotes.trim() || undefined
      });
      showNotification('Physical exercise session recorded.');
      setShowActivityModal(false);
      setActivityNotes('');
      loadWellnessData();
    } catch (err) {
      console.error('Failed to log activity', err);
    }
  };

  // Daily Check-in Submit
  const handleSaveCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.submitDailyCheckin({
        mood_energy: checkinMood,
        stress_level: checkinStress,
        notes: checkinNotes.trim() || undefined
      });
      showNotification('Daily wellness reflection saved.');
      setCheckinNotes('');
      loadWellnessData();
    } catch (err) {
      console.error('Failed to save checkin', err);
    }
  };

  // Goals Update
  const handleSaveGoals = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateWellnessGoals({
        water_target_ml: waterGoal,
        sleep_target_hours: sleepGoal,
        activity_target_mins: activityGoal
      });
      showNotification(t.preventive.targetsUpdated);
      loadWellnessData();
    } catch (err) {
      console.error('Failed to update goals', err);
    }
  };

  // Clear user data
  const handleClearUserData = async () => {
    if (!window.confirm('Are you sure you want to delete your personal logs? Synthetic demo records will be retained.')) {
      return;
    }
    try {
      await api.clearUserWellnessHistory();
      await api.clearUserReminders();
      showNotification(t.preventive.clearSuccess);
      loadWellnessData();
    } catch (err) {
      console.error('Failed to clear logs', err);
    }
  };

  // Filter reminders
  const medicationReminders = reminders.filter((r) => r.reminder_type === 'medication');
  const appointmentReminders = reminders.filter(
    (r) => r.reminder_type === 'appointment' || r.reminder_type === 'checkup'
  );

  // Prepare Chart Data
  const weeklyTrendData = (wellnessSummary?.weekly_trend || []).map((day) => ({
    date: day.date.slice(5),
    water: day.hydration_ml,
    sleep: day.sleep_hours,
    activity: day.activity_mins,
    mood: day.mood_energy || 3,
    isDemo: day.is_demo
  }));

  const todayHydration = wellnessSummary?.today_hydration || 0;
  const currentWaterTarget = wellnessSummary?.goals?.water_target_ml || 2000;
  const waterProgressPct = Math.min(100, Math.round((todayHydration / currentWaterTarget) * 100));

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Toast Notification */}
      {feedbackMsg && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-health-navy-900 text-white shadow-xl flex items-center gap-2.5 text-xs sm:text-sm animate-in fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="p-2 rounded-xl bg-health-teal-100 text-health-teal-800">
            <Activity className="w-5 h-5" />
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-health-navy-900">
            {t.preventive.title}
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-health-slate-600">
          {t.preventive.subtitle}
        </p>
      </div>

      {/* Truthful Limitation Notice (No false push/SMS claims) */}
      <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 flex items-start gap-2.5 text-xs text-sky-950">
        <Info className="w-4 h-4 text-sky-600 mt-0.5 flex-shrink-0" />
        <p className="leading-relaxed">{t.preventive.reminderLimitationNotice}</p>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex border-b border-health-slate-200 gap-1 sm:gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveTab('medications')}
          className={`px-3 py-2 text-xs sm:text-sm font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'medications'
              ? 'border-health-teal-600 text-health-teal-800 bg-white'
              : 'border-transparent text-health-slate-600 hover:text-health-slate-900'
          }`}
        >
          <Pill className="w-4 h-4" />
          <span>{t.preventive.tabMedications}</span>
        </button>

        <button
          onClick={() => setActiveTab('appointments')}
          className={`px-3 py-2 text-xs sm:text-sm font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'appointments'
              ? 'border-health-teal-600 text-health-teal-800 bg-white'
              : 'border-transparent text-health-slate-600 hover:text-health-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>{t.preventive.tabAppointments}</span>
        </button>

        <button
          onClick={() => setActiveTab('hydration')}
          className={`px-3 py-2 text-xs sm:text-sm font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'hydration'
              ? 'border-health-teal-600 text-health-teal-800 bg-white'
              : 'border-transparent text-health-slate-600 hover:text-health-slate-900'
          }`}
        >
          <Droplets className="w-4 h-4" />
          <span>{t.preventive.tabHydration}</span>
        </button>

        <button
          onClick={() => setActiveTab('sleep_activity')}
          className={`px-3 py-2 text-xs sm:text-sm font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'sleep_activity'
              ? 'border-health-teal-600 text-health-teal-800 bg-white'
              : 'border-transparent text-health-slate-600 hover:text-health-slate-900'
          }`}
        >
          <Moon className="w-4 h-4" />
          <span>{t.preventive.tabSleepActivity}</span>
        </button>

        <button
          onClick={() => setActiveTab('checkin_summary')}
          className={`px-3 py-2 text-xs sm:text-sm font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'checkin_summary'
              ? 'border-health-teal-600 text-health-teal-800 bg-white'
              : 'border-transparent text-health-slate-600 hover:text-health-slate-900'
          }`}
        >
          <Smile className="w-4 h-4" />
          <span>{t.preventive.tabCheckinSummary}</span>
        </button>

        <button
          onClick={() => setActiveTab('education_goals')}
          className={`px-3 py-2 text-xs sm:text-sm font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'education_goals'
              ? 'border-health-teal-600 text-health-teal-800 bg-white'
              : 'border-transparent text-health-slate-600 hover:text-health-slate-900'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>{t.preventive.tabEducationGoals}</span>
        </button>
      </div>

      {/* TAB 1: MEDICATIONS */}
      {activeTab === 'medications' && (
        <div className="space-y-4">
          {/* Clinician Prescription Warning Disclaimer */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 flex items-start gap-3 text-xs text-amber-950">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <span className="font-bold">Important Prescription Warning:</span>
              <p className="leading-relaxed text-amber-900/90">{t.preventive.medDisclaimer}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-health-navy-900">
                {t.preventive.medTitle}
              </h3>
              <p className="text-xs text-health-slate-500">{t.preventive.medSubtitle}</p>
            </div>
            <button
              onClick={() => {
                setEditingReminder(null);
                setMedName('');
                setMedSchedule('');
                setMedTime('');
                setMedNotes('');
                setShowMedModal(true);
              }}
              className="px-4 py-2 bg-health-teal-600 hover:bg-health-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>{t.preventive.addMedBtn}</span>
            </button>
          </div>

          {medicationReminders.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-health-slate-200 text-health-slate-500 text-xs">
              <Pill className="w-8 h-8 mx-auto text-health-slate-300 mb-2" />
              <p>{t.preventive.emptyMeds}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {medicationReminders.map((med) => (
                <div
                  key={med.id}
                  className={`p-4 rounded-xl border transition-all ${
                    med.is_completed
                      ? 'bg-emerald-50/40 border-emerald-200'
                      : 'bg-white border-health-slate-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-sm text-health-navy-900">{med.title}</h4>
                        {med.is_demo && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-health-slate-100 text-health-slate-600">
                            Demo
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-health-slate-600 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-health-teal-600" />
                        <span>{med.scheduled_time}</span>
                        <span className="text-health-slate-400">• {med.frequency}</span>
                      </p>
                      {med.notes && (
                        <p className="text-xs text-health-slate-500 italic mt-1">{med.notes}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => toggleReminder(med.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors ${
                          med.is_completed
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-health-teal-50 text-health-teal-700 hover:bg-health-teal-100 border border-health-teal-200'
                        }`}
                      >
                        {med.is_completed ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{t.preventive.takenBadge}</span>
                          </>
                        ) : (
                          <span>{t.preventive.markTakenBtn}</span>
                        )}
                      </button>

                      <button
                        onClick={() => {
                          setEditingReminder(med);
                          setMedName(med.title);
                          setMedTime(med.scheduled_time);
                          setMedSchedule(med.frequency);
                          setMedNotes(med.notes || '');
                          setShowMedModal(true);
                        }}
                        className="p-1.5 text-health-slate-400 hover:text-health-slate-700 rounded-lg hover:bg-health-slate-100"
                        title="Edit reminder"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => deleteReminder(med.id)}
                        className="p-1.5 text-health-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                        title="Delete reminder"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: APPOINTMENTS */}
      {activeTab === 'appointments' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-health-navy-900">
                {t.preventive.apptTitle}
              </h3>
              <p className="text-xs text-health-slate-500">{t.preventive.apptSubtitle}</p>
            </div>
            <button
              onClick={() => {
                setEditingReminder(null);
                setApptDoctor('');
                setApptDateTime('');
                setApptLocation('');
                setApptNotes('');
                setShowApptModal(true);
              }}
              className="px-4 py-2 bg-health-teal-600 hover:bg-health-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>{t.preventive.addApptBtn}</span>
            </button>
          </div>

          {appointmentReminders.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-health-slate-200 text-health-slate-500 text-xs">
              <Calendar className="w-8 h-8 mx-auto text-health-slate-300 mb-2" />
              <p>{t.preventive.emptyAppts}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {appointmentReminders.map((appt) => (
                <div
                  key={appt.id}
                  className={`p-4 rounded-xl border transition-all ${
                    appt.is_completed
                      ? 'bg-health-slate-50 border-health-slate-200 opacity-75'
                      : 'bg-white border-health-slate-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-sm text-health-navy-900">
                          {appt.doctor_specialty || appt.title}
                        </h4>
                        {appt.is_demo && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-health-slate-100 text-health-slate-600">
                            Demo
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-health-slate-600 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-health-teal-600" />
                        <span className="font-medium">{appt.scheduled_time}</span>
                      </p>

                      {appt.location && (
                        <p className="text-xs text-health-slate-500">
                          <strong>Location:</strong> {appt.location}
                        </p>
                      )}

                      {appt.notes && (
                        <p className="text-xs text-health-slate-500 italic">{appt.notes}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => toggleReminder(appt.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                          appt.is_completed
                            ? 'bg-health-slate-200 text-health-slate-700'
                            : 'bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200'
                        }`}
                      >
                        {appt.is_completed ? t.preventive.completedBadge : 'Mark Attended'}
                      </button>

                      <button
                        onClick={() => {
                          setEditingReminder(appt);
                          setApptDoctor(appt.doctor_specialty || appt.title);
                          setApptDateTime(appt.scheduled_time);
                          setApptLocation(appt.location || '');
                          setApptNotes(appt.notes || '');
                          setShowApptModal(true);
                        }}
                        className="p-1.5 text-health-slate-400 hover:text-health-slate-700 rounded-lg hover:bg-health-slate-100"
                        title="Edit appointment"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => deleteReminder(appt.id)}
                        className="p-1.5 text-health-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                        title="Delete appointment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: HYDRATION TRACKER */}
      {activeTab === 'hydration' && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-health-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-health-navy-900">
              {t.preventive.hydrationTitle}
            </h3>
            <p className="text-xs text-health-slate-500">{t.preventive.hydrationSubtitle}</p>
          </div>

          {/* Progress Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-sky-50 to-teal-50 border border-sky-200/70 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-sky-100 text-sky-700">
                  <Droplets className="w-6 h-6" />
                </span>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-health-navy-950">
                    {todayHydration} <span className="text-xs font-semibold text-health-slate-500">/ {currentWaterTarget} ml</span>
                  </div>
                  <p className="text-xs text-health-slate-600">
                    {todayHydration >= currentWaterTarget
                      ? t.preventive.waterGoalReached
                      : format(t.preventive.waterGoalRemaining, {
                          remaining: currentWaterTarget - todayHydration
                        })}
                  </p>
                </div>
              </div>
              <span className="text-sm font-extrabold text-health-teal-700 bg-white px-3 py-1 rounded-full border border-teal-200 shadow-2xs">
                {waterProgressPct}% Achieved
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-white rounded-full h-3 overflow-hidden border border-sky-200">
              <div
                className="bg-gradient-to-r from-sky-500 to-teal-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${waterProgressPct}%` }}
              />
            </div>
          </div>

          {/* Quick Buttons */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-health-slate-700 uppercase tracking-wider">
              {t.preventive.quickAddWater}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => handleLogWater(250)}
                className="py-2.5 px-3 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-900 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>{t.preventive.addGlass}</span>
              </button>
              <button
                type="button"
                onClick={() => handleLogWater(500)}
                className="py-2.5 px-3 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-900 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>{t.preventive.addBottle}</span>
              </button>
              <button
                type="button"
                onClick={() => handleLogWater(1000)}
                className="py-2.5 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-900 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>{t.preventive.addLiter}</span>
              </button>
            </div>
          </div>

          {/* Custom Water Input */}
          <div className="pt-3 border-t border-health-slate-100 flex flex-wrap items-center gap-2">
            <input
              type="number"
              min="50"
              step="50"
              value={customWater}
              onChange={(e) => setCustomWater(e.target.value)}
              placeholder={t.preventive.customWater}
              className="px-3 py-2 text-xs rounded-xl border border-health-slate-300 w-44 focus:outline-none focus:ring-1 focus:ring-health-teal-500"
            />
            <button
              onClick={() => {
                const val = parseInt(customWater, 10);
                if (!isNaN(val) && val > 0) {
                  handleLogWater(val);
                  setCustomWater('');
                }
              }}
              className="px-4 py-2 bg-health-navy-800 hover:bg-health-navy-900 text-white rounded-xl text-xs font-bold transition-colors"
            >
              {t.preventive.logWaterBtn}
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: SLEEP & PHYSICAL ACTIVITY */}
      {activeTab === 'sleep_activity' && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-health-navy-900">
                {t.preventive.sleepActivityTitle}
              </h3>
              <p className="text-xs text-health-slate-500">{t.preventive.sleepActivitySubtitle}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSleepModal(true)}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Moon className="w-4 h-4" />
                <span>{t.preventive.logSleepBtn}</span>
              </button>
              <button
                onClick={() => setShowActivityModal(true)}
                className="px-3.5 py-2 bg-health-teal-600 hover:bg-health-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Activity className="w-4 h-4" />
                <span>{t.preventive.logActivityBtn}</span>
              </button>
            </div>
          </div>

          {/* Today's Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-health-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
                  <Moon className="w-5 h-5" />
                </span>
                <span className="text-xs font-semibold text-health-slate-400">Target: {sleepGoal} hrs</span>
              </div>
              <div className="text-2xl font-black text-health-navy-900">
                {wellnessSummary?.today_sleep || 0} <span className="text-xs font-semibold text-health-slate-500">hours</span>
              </div>
              <p className="text-xs text-health-slate-600">
                Restful circadian recovery supports brain plasticity, hormone regulation, and metabolic health.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-health-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                  <Activity className="w-5 h-5" />
                </span>
                <span className="text-xs font-semibold text-health-slate-400">Target: {activityGoal} mins</span>
              </div>
              <div className="text-2xl font-black text-health-navy-900">
                {wellnessSummary?.today_activity || 0} <span className="text-xs font-semibold text-health-slate-500">active minutes</span>
              </div>
              <p className="text-xs text-health-slate-600">
                150 minutes of weekly moderate aerobic activity lowers risks of cardiovascular events by 30%.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: DAILY CHECK-IN & 7-DAY SUMMARY */}
      {activeTab === 'checkin_summary' && (
        <div className="space-y-6">
          {/* Daily Reflection Check-in Card */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-health-slate-200 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-health-navy-900">
                {t.preventive.checkinTitle}
              </h3>
              <p className="text-xs text-health-slate-500">{t.preventive.checkinSubtitle}</p>
            </div>

            <form onSubmit={handleSaveCheckin} className="space-y-4">
              {/* Mood / Energy Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-health-slate-700">
                  {t.preventive.moodLabel}
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { val: 1, label: t.preventive.moodExhausted },
                    { val: 2, label: t.preventive.moodLow },
                    { val: 3, label: t.preventive.moodNeutral },
                    { val: 4, label: t.preventive.moodGood },
                    { val: 5, label: t.preventive.moodGreat }
                  ].map((m) => (
                    <button
                      key={m.val}
                      type="button"
                      onClick={() => setCheckinMood(m.val)}
                      className={`p-2.5 rounded-xl border text-center transition-all text-xs font-bold ${
                        checkinMood === m.val
                          ? 'border-health-teal-600 bg-health-teal-50 text-health-teal-900 ring-2 ring-health-teal-500/20'
                          : 'border-health-slate-200 bg-white hover:border-health-slate-300 text-health-slate-700'
                      }`}
                    >
                      <span>{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Stress Level */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-health-slate-700">
                  {t.preventive.stressLabel}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: 'low', label: t.preventive.stressLow },
                    { val: 'moderate', label: t.preventive.stressModerate },
                    { val: 'high', label: t.preventive.stressHigh }
                  ].map((s) => (
                    <button
                      key={s.val}
                      type="button"
                      onClick={() => setCheckinStress(s.val)}
                      className={`py-2 px-3 rounded-xl border text-center text-xs font-bold transition-all ${
                        checkinStress === s.val
                          ? 'border-health-navy-700 bg-health-navy-50 text-health-navy-950 ring-2 ring-health-navy-500/20'
                          : 'border-health-slate-200 bg-white text-health-slate-700 hover:border-health-slate-300'
                      }`}
                    >
                      <span>{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <input
                  type="text"
                  value={checkinNotes}
                  onChange={(e) => setCheckinNotes(e.target.value)}
                  placeholder={t.preventive.reflectionLabel}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-health-slate-300 focus:outline-none focus:ring-1 focus:ring-health-teal-500"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-health-teal-600 to-health-navy-700 text-white font-bold text-xs shadow-sm hover:opacity-95 transition-opacity"
                >
                  {t.preventive.submitCheckinBtn}
                </button>
              </div>
            </form>
          </div>

          {/* 7-DAY VISUAL SUMMARY CHART WITH REAL VS SYNTHETIC LABELS */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-health-slate-200 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-health-navy-900">
                  {t.preventive.weeklyTrendTitle}
                </h3>
                <p className="text-xs text-health-slate-500">
                  {t.preventive.weeklyTrendSubtitle}
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-health-slate-100 text-health-slate-600 border border-health-slate-200">
                  {t.preventive.syntheticBadge}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                  {t.preventive.userBadge}
                </span>
              </div>
            </div>

            {/* Recharts 7-Day Chart */}
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', color: '#fff', fontSize: '11px', border: 'none' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar dataKey="water" name="Hydration (ml)" fill="#0284C7" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="activity" name="Activity (min)" fill="#0D9488" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: SCREENINGS, VACCINES & GOALS */}
      {activeTab === 'education_goals' && (
        <div className="space-y-6">
          {/* General Guidance Disclaimer */}
          <div className="p-3.5 rounded-xl bg-teal-50/80 border border-teal-200 flex items-start gap-2.5 text-xs text-teal-950">
            <Info className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
            <p className="leading-relaxed">{t.preventive.generalNotice}</p>
          </div>

          {/* Configurable Goals Form */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-health-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm sm:text-base font-bold text-health-navy-900">
              {t.preventive.targetsTitle}
            </h3>

            <form onSubmit={handleSaveGoals} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-health-slate-700 block mb-1">
                  {t.preventive.waterTargetLabel}
                </label>
                <input
                  type="number"
                  min="1000"
                  max="5000"
                  step="100"
                  value={waterGoal}
                  onChange={(e) => setWaterGoal(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-health-slate-300 focus:outline-none focus:ring-1 focus:ring-health-teal-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-health-slate-700 block mb-1">
                  {t.preventive.sleepTargetLabel}
                </label>
                <input
                  type="number"
                  min="5"
                  max="12"
                  step="0.5"
                  value={sleepGoal}
                  onChange={(e) => setSleepGoal(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-health-slate-300 focus:outline-none focus:ring-1 focus:ring-health-teal-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-health-slate-700 block mb-1">
                  {t.preventive.activityTargetLabel}
                </label>
                <input
                  type="number"
                  min="10"
                  max="180"
                  step="5"
                  value={activityGoal}
                  onChange={(e) => setActivityGoal(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-health-slate-300 focus:outline-none focus:ring-1 focus:ring-health-teal-500"
                />
              </div>

              <div className="sm:col-span-3 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-health-teal-600 hover:bg-health-teal-700 text-white font-bold text-xs shadow-sm transition-colors"
                >
                  {t.preventive.saveTargetsBtn}
                </button>
              </div>
            </form>
          </div>

          {/* Screenings Table */}
          {preventiveData && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-health-navy-900">
                Recommended Screenings for Age {userProfile.age} ({userProfile.gender})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {preventiveData.screenings.map((sc, i) => (
                  <div key={i} className="p-4 rounded-xl bg-white border border-health-slate-200 shadow-2xs space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-health-teal-700 bg-health-teal-50 px-2 py-0.5 rounded">
                      {sc.category}
                    </span>
                    <h4 className="font-bold text-sm text-health-navy-900">{sc.test}</h4>
                    <p className="text-xs text-health-slate-600">
                      <strong>Frequency:</strong> {sc.frequency}
                    </p>
                    <p className="text-xs text-health-slate-600">
                      <strong>Target:</strong> {sc.target}
                    </p>
                    <p className="text-[11px] text-health-slate-500 italic">{sc.importance}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Adult Vaccinations */}
          {preventiveData && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-health-navy-900">
                Recommended Adult Immunization Schedule
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {preventiveData.vaccinations.map((vac, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-white border border-health-slate-200 space-y-1">
                    <h4 className="font-bold text-xs text-health-navy-900">{vac.vaccine}</h4>
                    <p className="text-xs text-health-slate-600">
                      <strong>Schedule:</strong> {vac.schedule}
                    </p>
                    <p className="text-[11px] text-health-slate-500">
                      <strong>Group:</strong> {vac.target_group}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* PRIVACY & DATA DELETION FOOTER */}
      <div className="pt-4 border-t border-health-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="text-health-slate-400">
          HealthSathi AI processes preventive logs locally in SQLite without cloud transmission.
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleClearUserData}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 underline"
          >
            {t.preventive.clearLogsBtn}
          </button>
        </div>
      </div>

      {/* MODAL: ADD / EDIT MEDICATION */}
      {showMedModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-health-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-health-navy-900">
                {editingReminder ? 'Edit Medication Reminder' : t.preventive.addMedBtn}
              </h3>
              <button
                onClick={() => {
                  setShowMedModal(false);
                  setEditingReminder(null);
                }}
                className="text-health-slate-400 hover:text-health-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMedication} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-health-slate-700 block mb-1">
                  {t.preventive.medNameLabel} *
                </label>
                <input
                  type="text"
                  required
                  value={medName}
                  onChange={(e) => setMedName(e.target.value)}
                  placeholder={t.preventive.medNamePlaceholder}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-health-slate-300 focus:outline-none focus:ring-1 focus:ring-health-teal-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-health-slate-700 block mb-1">
                  {t.preventive.medScheduleLabel}
                </label>
                <input
                  type="text"
                  value={medSchedule}
                  onChange={(e) => setMedSchedule(e.target.value)}
                  placeholder={t.preventive.medSchedulePlaceholder}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-health-slate-300 focus:outline-none focus:ring-1 focus:ring-health-teal-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-health-slate-700 block mb-1">
                  {t.preventive.medTimeLabel} *
                </label>
                <input
                  type="text"
                  required
                  value={medTime}
                  onChange={(e) => setMedTime(e.target.value)}
                  placeholder={t.preventive.medTimePlaceholder}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-health-slate-300 focus:outline-none focus:ring-1 focus:ring-health-teal-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-health-slate-700 block mb-1">
                  {t.preventive.medNotesLabel}
                </label>
                <textarea
                  rows={2}
                  value={medNotes}
                  onChange={(e) => setMedNotes(e.target.value)}
                  placeholder={t.preventive.medNotesPlaceholder}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-health-slate-300 focus:outline-none focus:ring-1 focus:ring-health-teal-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowMedModal(false);
                    setEditingReminder(null);
                  }}
                  className="px-4 py-2 text-xs font-bold text-health-slate-600 hover:bg-health-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-health-teal-600 hover:bg-health-teal-700 rounded-xl"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT APPOINTMENT */}
      {showApptModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-health-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-health-navy-900">
                {editingReminder ? 'Edit Appointment' : t.preventive.addApptBtn}
              </h3>
              <button
                onClick={() => {
                  setShowApptModal(false);
                  setEditingReminder(null);
                }}
                className="text-health-slate-400 hover:text-health-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAppointment} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-health-slate-700 block mb-1">
                  {t.preventive.apptDoctorLabel} *
                </label>
                <input
                  type="text"
                  required
                  value={apptDoctor}
                  onChange={(e) => setApptDoctor(e.target.value)}
                  placeholder={t.preventive.apptDoctorPlaceholder}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-health-slate-300 focus:outline-none focus:ring-1 focus:ring-health-teal-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-health-slate-700 block mb-1">
                  {t.preventive.apptDateTimeLabel} *
                </label>
                <input
                  type="text"
                  required
                  value={apptDateTime}
                  onChange={(e) => setApptDateTime(e.target.value)}
                  placeholder={t.preventive.apptDateTimePlaceholder}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-health-slate-300 focus:outline-none focus:ring-1 focus:ring-health-teal-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-health-slate-700 block mb-1">
                  {t.preventive.apptLocationLabel}
                </label>
                <input
                  type="text"
                  value={apptLocation}
                  onChange={(e) => setApptLocation(e.target.value)}
                  placeholder={t.preventive.apptLocationPlaceholder}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-health-slate-300 focus:outline-none focus:ring-1 focus:ring-health-teal-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-health-slate-700 block mb-1">
                  {t.preventive.apptNotesLabel}
                </label>
                <textarea
                  rows={2}
                  value={apptNotes}
                  onChange={(e) => setApptNotes(e.target.value)}
                  placeholder={t.preventive.apptNotesPlaceholder}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-health-slate-300 focus:outline-none focus:ring-1 focus:ring-health-teal-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowApptModal(false);
                    setEditingReminder(null);
                  }}
                  className="px-4 py-2 text-xs font-bold text-health-slate-600 hover:bg-health-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-health-teal-600 hover:bg-health-teal-700 rounded-xl"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: LOG SLEEP */}
      {showSleepModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-health-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-health-navy-900">{t.preventive.logSleepBtn}</h3>
              <button onClick={() => setShowSleepModal(false)} className="text-health-slate-400 hover:text-health-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSleep} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-health-slate-700 block mb-1">
                  {t.preventive.sleepHoursLabel}
                </label>
                <input
                  type="number"
                  min="1"
                  max="24"
                  step="0.5"
                  required
                  value={sleepHours}
                  onChange={(e) => setSleepHours(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-health-slate-300 focus:outline-none focus:ring-1 focus:ring-health-teal-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-health-slate-700 block mb-1">
                  {t.preventive.sleepQualityLabel}
                </label>
                <select
                  value={sleepQuality}
                  onChange={(e) => setSleepQuality(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-health-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-health-teal-500"
                >
                  <option value="restful">{t.preventive.sleepRestful}</option>
                  <option value="average">{t.preventive.sleepAverage}</option>
                  <option value="restless">{t.preventive.sleepRestless}</option>
                </select>
              </div>

              <div>
                <input
                  type="text"
                  value={sleepNotes}
                  onChange={(e) => setSleepNotes(e.target.value)}
                  placeholder="Notes (optional, e.g. Slept well)"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-health-slate-300 focus:outline-none focus:ring-1 focus:ring-health-teal-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSleepModal(false)}
                  className="px-4 py-2 text-xs font-bold text-health-slate-600 hover:bg-health-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl"
                >
                  Save Sleep
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: LOG ACTIVITY */}
      {showActivityModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-health-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-health-navy-900">{t.preventive.logActivityBtn}</h3>
              <button onClick={() => setShowActivityModal(false)} className="text-health-slate-400 hover:text-health-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveActivity} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-health-slate-700 block mb-1">
                  {t.preventive.activityTypeLabel}
                </label>
                <select
                  value={activityType}
                  onChange={(e) => setActivityType(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-health-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-health-teal-500"
                >
                  <option value="walking">{t.preventive.activityWalking}</option>
                  <option value="yoga">{t.preventive.activityYoga}</option>
                  <option value="cycling">{t.preventive.activityCycling}</option>
                  <option value="running">{t.preventive.activityRunning}</option>
                  <option value="gym">{t.preventive.activityGym}</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-health-slate-700 block mb-1">
                  {t.preventive.activityDurationLabel}
                </label>
                <input
                  type="number"
                  min="5"
                  max="300"
                  step="5"
                  required
                  value={activityDuration}
                  onChange={(e) => setActivityDuration(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-health-slate-300 focus:outline-none focus:ring-1 focus:ring-health-teal-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-health-slate-700 block mb-1">
                  {t.preventive.activityIntensityLabel}
                </label>
                <select
                  value={activityIntensity}
                  onChange={(e) => setActivityIntensity(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-health-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-health-teal-500"
                >
                  <option value="light">{t.preventive.intensityLight}</option>
                  <option value="moderate">{t.preventive.intensityModerate}</option>
                  <option value="vigorous">{t.preventive.intensityVigorous}</option>
                </select>
              </div>

              <div>
                <input
                  type="text"
                  value={activityNotes}
                  onChange={(e) => setActivityNotes(e.target.value)}
                  placeholder="Notes (optional, e.g. morning park)"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-health-slate-300 focus:outline-none focus:ring-1 focus:ring-health-teal-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowActivityModal(false)}
                  className="px-4 py-2 text-xs font-bold text-health-slate-600 hover:bg-health-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-health-teal-600 hover:bg-health-teal-700 rounded-xl"
                >
                  Save Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
