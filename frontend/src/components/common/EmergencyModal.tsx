import React from 'react';
import { AlertCircle, Phone, X, ShieldAlert, HeartPulse, UserX } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useHealthData } from '../../contexts/HealthDataContext';

export const EmergencyModal: React.FC = () => {
  const { language } = useLanguage();
  const { emergencyModalOpen, setEmergencyModalOpen } = useHealthData();

  if (!emergencyModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-red-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-rose-700 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 animate-bounce" />
            <h2 className="text-lg font-bold">
              {language === 'hi' ? 'आपातकालीन सहायता प्रोटोकॉल' : (language === 'mr' ? 'आपत्कालीन मदत प्रोटोकॉल' : 'Emergency Assistance Protocol')}
            </h2>
          </div>
          <button
            onClick={() => setEmergencyModalOpen(false)}
            className="p-1 rounded-full hover:bg-white/20 transition-colors text-white"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-r-lg text-sm text-red-950">
            <p className="font-semibold">
              {language === 'hi'
                ? 'यदि आप या कोई अन्य व्यक्ति निम्नलिखित गंभीर लक्षणों का सामना कर रहा है, तो तुरंत 112 या 108 पर कॉल करें:'
                : language === 'mr'
                ? 'खालीलपैकी कोणतीही गंभीर लक्षणे आढळल्यास विलंब न करता ११२ किंवा १०८ वर त्वरित संपर्क करा:'
                : 'If you or someone else is experiencing any of the following life-threatening signs, call 112 / 108 immediately:'}
            </p>
          </div>

          <ul className="space-y-2 text-xs md:text-sm text-slate-700">
            <li className="flex items-start gap-2">
              <HeartPulse className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <span>
                <strong>{language === 'hi' ? 'छाती में तेज दर्द' : (language === 'mr' ? 'छातीत तीव्र वेदना' : 'Severe Chest Pressure/Pain')}</strong>
                {language === 'hi' ? ' - जो बायीं बांह, गर्दन या जबड़े में फैल रहा हो।' : (language === 'mr' ? ' - जी डाव्या हाताकडे किंवा जबड्याकडे पसरत असेल.' : ' radiating to left arm, back, or jaw.')}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <span>
                <strong>{language === 'hi' ? 'सांस लेने में अत्यधिक कठिनाई' : (language === 'mr' ? 'श्वास घेण्यास तीव्र अडचण' : 'Acute Shortness of Breath')}</strong>
                {language === 'hi' ? ' या नीले होंठ/चेहरा।' : (language === 'mr' ? ' किंवा ओठ निळे पडणे.' : ' or gasping for air.')}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <UserX className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <span>
                <strong>{language === 'hi' ? 'स्ट्रोक चेतावनी (FAST)' : (language === 'mr' ? 'स्ट्रोक धोक्याचे संकेत (FAST)' : 'Stroke Warning Signs (FAST)')}</strong>
                {language === 'hi' ? ' - चेहरे का लटकना, बांह में कमजोरी, लड़खड़ाती आवाज।' : (language === 'mr' ? ' - चेहरा एका बाजूला झुकणे, हात अशक्त होणे, बोलताना अडखळणे.' : ' - Face drooping, arm weakness, slurred speech.')}
              </span>
            </li>
          </ul>

          {/* Emergency Call Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <a
              href="tel:112"
              className="flex items-center justify-center gap-2 py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm shadow-md transition-all text-center"
            >
              <Phone className="w-4 h-4" />
              <span>112 (National)</span>
            </a>
            <a
              href="tel:108"
              className="flex items-center justify-center gap-2 py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-sm shadow-md transition-all text-center"
            >
              <Phone className="w-4 h-4" />
              <span>108 (Ambulance)</span>
            </a>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg text-xs text-slate-600 border border-slate-200">
            <p>
              <strong>{language === 'hi' ? 'सुरक्षा निर्देश:' : (language === 'mr' ? 'सुरक्षा सूचना:' : 'Safety Instructions:')}</strong>{' '}
              {language === 'hi'
                ? 'कृपया स्वयं वाहन चलाकर अस्पताल न जाएं। किसी परिजन, पड़ोसी या एम्बुलेंस सेवा की सहायता लें।'
                : language === 'mr'
                ? 'कृपया स्वतः गाडी चालवून दवाखान्यात जाऊ नका. कुटुंबीय किंवा रुग्णवाहिकेची मदत घ्या.'
                : 'Do not attempt to drive yourself to the hospital. Ask a companion or wait for emergency medical responders.'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={() => setEmergencyModalOpen(false)}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold transition-colors"
          >
            {language === 'hi' ? 'बंद करें' : (language === 'mr' ? 'बंद करा' : 'Close')}
          </button>
        </div>
      </div>
    </div>
  );
};
