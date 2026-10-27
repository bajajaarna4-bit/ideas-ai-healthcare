import React, { useState } from 'react';
import { HeartPulse, Globe, PhoneCall, Menu, X, Shield, Sparkles } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useHealthData } from '../../contexts/HealthDataContext';
import { LANGUAGE_OPTIONS } from '../../i18n';
import { SupportedLanguage } from '../../types';

export const Navbar: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { setEmergencyModalOpen, activeTab, setActiveTab, systemHealth } = useHealthData();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: t.nav.dashboard },
    { id: 'assistant', label: t.nav.assistant },
    { id: 'symptoms', label: t.nav.symptoms },
    { id: 'reports', label: t.nav.reports },
    { id: 'preventive', label: t.nav.preventive },
    { id: 'settings', label: t.nav.settings },
  ];

  return (
    <header className="bg-white border-b border-health-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-health-teal-600 to-health-navy-700 flex items-center justify-center text-white shadow-md shadow-health-teal-600/20">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg text-health-navy-900 tracking-tight">
                  Health<span className="text-health-teal-600">Sathi</span> AI
                </span>
                <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-health-teal-50 text-health-teal-700 border border-health-teal-200">
                  <Sparkles className="w-2.5 h-2.5 mr-0.5 text-health-teal-600" />
                  Multilingual
                </span>
              </div>
              <p className="text-[11px] text-health-slate-500 hidden sm:block">
                {t.appTagline}
              </p>
            </div>
          </div>

          {/* Right side controls: Language switcher + Emergency Button + Mobile Toggle */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Language Switcher Pill */}
            <div className="flex items-center bg-health-slate-100 rounded-lg p-0.5 border border-health-slate-200">
              <Globe className="w-3.5 h-3.5 ml-2 text-health-slate-500 hidden sm:inline" />
              {LANGUAGE_OPTIONS.map((opt) => (
                <button
                  key={opt.code}
                  onClick={() => setLanguage(opt.code)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                    language === opt.code
                      ? 'bg-white text-health-teal-700 shadow-sm font-bold'
                      : 'text-health-slate-600 hover:text-health-slate-900'
                  }`}
                  title={opt.label}
                >
                  {opt.nativeLabel}
                </button>
              ))}
            </div>

            {/* Emergency Hotline Button */}
            <button
              onClick={() => setEmergencyModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">112 / 108</span>
              <span className="sm:hidden">112</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-health-slate-600 hover:text-health-slate-900 hover:bg-health-slate-100 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-health-slate-200 px-4 pt-2 pb-4 space-y-1 shadow-lg animate-in slide-in-from-top duration-200">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === item.id
                  ? 'bg-health-teal-50 text-health-teal-700 font-bold border-l-4 border-health-teal-600'
                  : 'text-health-slate-700 hover:bg-health-slate-50'
              }`}
            >
              {item.label}
            </button>
          ))}
          <div className="pt-2 border-t border-health-slate-100 flex items-center justify-between text-xs text-health-slate-500">
            <span>{t.syntheticNotice}</span>
          </div>
        </div>
      )}
    </header>
  );
};
