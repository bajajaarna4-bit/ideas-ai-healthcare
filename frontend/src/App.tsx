import React from 'react';
import { LanguageProvider } from './contexts/LanguageContext';
import { HealthDataProvider, useHealthData } from './contexts/HealthDataContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { DisclaimerBanner } from './components/common/DisclaimerBanner';
import { EmergencyModal } from './components/common/EmergencyModal';

// Pages
import { Dashboard } from './pages/Dashboard';
import { ChatAssistant } from './pages/ChatAssistant';
import { SymptomGuidance } from './pages/SymptomGuidance';
import { ReportSimplifier } from './pages/ReportSimplifier';
import { PreventiveCare } from './pages/PreventiveCare';
import { Settings } from './pages/Settings';

const MainLayout: React.FC = () => {
  const { activeTab } = useHealthData();

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'assistant':
        return <ChatAssistant />;
      case 'symptoms':
        return <SymptomGuidance />;
      case 'reports':
        return <ReportSimplifier />;
      case 'preventive':
        return <PreventiveCare />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-health-slate-50 flex flex-col selection:bg-health-teal-100 selection:text-health-teal-900">
      {/* Top medical safety disclaimer */}
      <DisclaimerBanner />

      {/* Main navigation header */}
      <Navbar />

      {/* Sidebar + Active Content */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        <Sidebar />
        <main className="flex-1 min-w-0 overflow-y-auto">
          {renderActivePage()}
        </main>
      </div>

      {/* Emergency Hotline Protocol Modal */}
      <EmergencyModal />
    </div>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <HealthDataProvider>
        <MainLayout />
      </HealthDataProvider>
    </LanguageProvider>
  );
}
