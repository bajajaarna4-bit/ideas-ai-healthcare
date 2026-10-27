import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Globe,
  User,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Server,
  CheckCircle,
  Database
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useHealthData } from '../contexts/HealthDataContext';
import { LANGUAGE_OPTIONS } from '../i18n';
import { SupportedLanguage } from '../types';

export const Settings: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { userProfile, updateProfile, resetDemoData, systemHealth } = useHealthData();

  const [formData, setFormData] = useState(userProfile);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleResetDemo = async () => {
    if (window.confirm("Are you sure you want to reset all demo data and vitals back to the default synthetic state?")) {
      await resetDemoData();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 3000);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="p-2 rounded-xl bg-health-teal-100 text-health-teal-800">
            <SettingsIcon className="w-5 h-5" />
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-health-navy-900">
            {t.settings.title}
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-health-slate-500">
          {t.settings.subtitle}
        </p>
      </div>

      {/* Language Section */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-health-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-health-navy-900 font-bold text-sm sm:text-base">
          <Globe className="w-5 h-5 text-health-teal-600" />
          <span>{t.settings.languageSection}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {LANGUAGE_OPTIONS.map((opt) => (
            <button
              key={opt.code}
              onClick={() => setLanguage(opt.code)}
              className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 ${
                language === opt.code
                  ? 'bg-health-teal-50/70 border-health-teal-500 ring-2 ring-health-teal-500/20'
                  : 'bg-white border-health-slate-200 hover:border-health-teal-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-base text-health-navy-900">{opt.nativeLabel}</span>
                {language === opt.code && (
                  <CheckCircle className="w-4 h-4 text-health-teal-600" />
                )}
              </div>
              <span className="text-xs text-health-slate-500">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Profile Form Section */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-health-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-health-navy-900 font-bold text-sm sm:text-base">
            <User className="w-5 h-5 text-health-teal-600" />
            <span>{t.settings.profileSection}</span>
          </div>
          {saveSuccess && (
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{t.settings.savedSuccess}</span>
            </span>
          )}
        </div>

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-health-slate-700 mb-1 block">
                {t.settings.name}
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-xl border border-health-slate-300 p-2.5 text-xs text-health-slate-900 focus:outline-none focus:ring-2 focus:ring-health-teal-500/20"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-health-slate-700 mb-1 block">
                {t.settings.age}
              </label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                className="w-full rounded-xl border border-health-slate-300 p-2.5 text-xs text-health-slate-900 focus:outline-none focus:ring-2 focus:ring-health-teal-500/20"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-health-slate-700 mb-1 block">
                {t.settings.gender}
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full rounded-xl border border-health-slate-300 p-2.5 text-xs text-health-slate-900 focus:outline-none focus:ring-2 focus:ring-health-teal-500/20"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-health-slate-700 mb-1 block">
                {t.settings.bloodGroup}
              </label>
              <input
                type="text"
                value={formData.blood_group}
                onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                className="w-full rounded-xl border border-health-slate-300 p-2.5 text-xs text-health-slate-900 focus:outline-none focus:ring-2 focus:ring-health-teal-500/20"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-health-slate-700 mb-1 block">
                {t.settings.allergies}
              </label>
              <input
                type="text"
                value={formData.allergies}
                onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                className="w-full rounded-xl border border-health-slate-300 p-2.5 text-xs text-health-slate-900 focus:outline-none focus:ring-2 focus:ring-health-teal-500/20"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-health-slate-700 mb-1 block">
                {t.settings.chronicConditions}
              </label>
              <input
                type="text"
                value={formData.chronic_conditions}
                onChange={(e) => setFormData({ ...formData, chronic_conditions: e.target.value })}
                className="w-full rounded-xl border border-health-slate-300 p-2.5 text-xs text-health-slate-900 focus:outline-none focus:ring-2 focus:ring-health-teal-500/20"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2 bg-health-teal-600 hover:bg-health-teal-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
            >
              {t.settings.saveProfile}
            </button>
          </div>
        </form>
      </div>

      {/* Backend & AI Status */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-health-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-health-navy-900 font-bold text-sm sm:text-base">
          <Server className="w-5 h-5 text-health-teal-600" />
          <span>{t.settings.apiStatusTitle}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-health-slate-50 border border-health-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-health-slate-800">FastAPI Backend</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                {systemHealth?.status === 'online' ? 'Online' : 'Offline'}
              </span>
            </div>
            <p className="text-health-slate-500">
              Running on Python FastAPI with SQLite local persistence.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-health-slate-50 border border-health-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-health-slate-800">Gemini AI Engine</span>
              <span
                className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                  systemHealth?.gemini_configured
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {systemHealth?.gemini_configured ? 'Active' : 'Safe Demo Fallback'}
              </span>
            </div>
            <p className="text-health-slate-500">
              {systemHealth?.gemini_configured
                ? 'Gemini 1.5 Flash configured via backend environment variable.'
                : 'Using verified local healthcare knowledge rules. Key can be set in backend/.env.'}
            </p>
          </div>
        </div>
      </div>

      {/* Privacy and Reset Demo */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-health-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-health-navy-900 font-bold text-sm sm:text-base">
          <ShieldCheck className="w-5 h-5 text-health-teal-600" />
          <span>{t.settings.privacySection}</span>
        </div>
        <p className="text-xs text-health-slate-600 leading-relaxed">
          {t.settings.privacyNotice}
        </p>

        <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={handleResetDemo}
            className="flex items-center gap-1.5 px-4 py-2 bg-health-slate-100 hover:bg-health-slate-200 text-health-slate-800 rounded-xl text-xs font-semibold transition-colors border border-health-slate-200"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.settings.resetDataBtn}</span>
          </button>
          {resetSuccess && (
            <span className="text-xs text-emerald-700 font-semibold">
              Demo database reset successfully!
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
