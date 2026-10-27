import React from 'react';
import {
  LayoutDashboard,
  MessageSquare,
  Stethoscope,
  FileText,
  Activity,
  Settings,
  Sparkles,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useHealthData } from '../../contexts/HealthDataContext';

export const Sidebar: React.FC = () => {
  const { t } = useLanguage();
  const { activeTab, setActiveTab, systemHealth, userProfile } = useHealthData();

  const navItems = [
    { id: 'dashboard', label: t.nav.dashboard, icon: LayoutDashboard, badge: null },
    { id: 'assistant', label: t.nav.assistant, icon: MessageSquare, badge: 'AI' },
    { id: 'symptoms', label: t.nav.symptoms, icon: Stethoscope, badge: 'Triage' },
    { id: 'reports', label: t.nav.reports, icon: FileText, badge: 'Lab' },
    { id: 'preventive', label: t.nav.preventive, icon: Activity, badge: null },
    { id: 'settings', label: t.nav.settings, icon: Settings, badge: null },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-health-slate-200 min-h-[calc(100vh-4rem)] p-4 justify-between">
      <div className="space-y-6">
        {/* User Mini Profile Card */}
        <div className="p-3 bg-health-slate-50 border border-health-slate-200/80 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-health-teal-100 border border-health-teal-300 flex items-center justify-center text-health-teal-800 font-bold text-sm">
              {userProfile.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-health-slate-900 truncate">
                {userProfile.name}
              </p>
              <p className="text-[11px] text-health-slate-500 truncate">
                {userProfile.age} yrs • {userProfile.blood_group} • {userProfile.gender}
              </p>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-health-slate-200/60 flex items-center justify-between text-[10px] text-health-slate-500">
            <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Demo Mode
            </span>
            <span className="text-health-slate-400">Local SQLite</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-health-teal-600 to-health-teal-700 text-white shadow-sm shadow-health-teal-600/30 font-semibold'
                    : 'text-health-slate-600 hover:bg-health-slate-100 hover:text-health-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-health-slate-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-health-teal-50 text-health-teal-700 border border-health-teal-200'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info & Gemini AI Status Badge */}
      <div className="pt-4 border-t border-health-slate-200 space-y-2">
        <div className="p-2.5 bg-health-navy-50 border border-health-navy-100 rounded-lg">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-health-teal-600 flex-shrink-0" />
            <div className="text-[11px] font-semibold text-health-navy-900">
              {systemHealth?.gemini_configured ? 'Gemini AI Connected' : 'Safe Rule Engine Active'}
            </div>
          </div>
          <p className="text-[10px] text-health-slate-500 mt-1">
            {systemHealth?.gemini_configured
              ? 'Real-time generative health education'
              : 'Verified clinical education rules'}
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] text-health-slate-400 justify-center">
          <ShieldCheck className="w-3 h-3 text-health-teal-600" />
          <span>HealthSathi v1.0 • Privacy Preserved</span>
        </div>
      </div>
    </aside>
  );
};
