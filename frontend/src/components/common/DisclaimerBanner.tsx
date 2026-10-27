import React from 'react';
import { AlertTriangle, PhoneCall } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useHealthData } from '../../contexts/HealthDataContext';

export const DisclaimerBanner: React.FC = () => {
  const { t } = useLanguage();
  const { setEmergencyModalOpen } = useHealthData();

  return (
    <aside aria-label="Medical Disclaimer" className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs md:text-sm text-amber-900 flex flex-wrap items-center justify-between gap-2 shadow-sm">
      <div className="flex items-center gap-2 max-w-4xl">
        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
        <span className="font-medium text-amber-950">
          {t.disclaimerShort}
        </span>
        <span className="hidden md:inline text-amber-800 text-xs">
          Never disregard professional medical advice.
        </span>
      </div>

      <button
        onClick={() => setEmergencyModalOpen(true)}
        className="flex items-center gap-1.5 px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-md transition-colors shadow-sm ml-auto"
      >
        <PhoneCall className="w-3.5 h-3.5 animate-pulse" />
        <span>{t.nav.emergency}</span>
      </button>
    </aside>
  );
};
