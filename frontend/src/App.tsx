import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuthRole';
import { useWebSocket } from './hooks/useWebSocket';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { HospitalDashboardPage } from './pages/HospitalDashboardPage';
import { NewReferralPage } from './pages/NewReferralPage';
import { AmbulanceTrackingPage } from './pages/AmbulanceTrackingPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { TimelinePage } from './pages/TimelinePage';
import { ABDMSandboxPage } from './pages/ABDMSandboxPage';
import { HeartHandshake } from 'lucide-react';

const MainContent: React.FC = () => {
  const { role } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [selectedTimelineRefId, setSelectedTimelineRefId] = useState<number | undefined>(undefined);

  const { isConnected, notifications, markAllRead } = useWebSocket();

  // Synchronize initial view with role changes
  useEffect(() => {
    if (role === 'RURAL_HEALTH_WORKER') {
      setActiveTab('new-referral');
    } else if (role === 'HOSPITAL_STAFF') {
      setActiveTab('hospital');
    } else if (role === 'AMBULANCE_STAFF') {
      setActiveTab('ambulance');
    } else if (role === 'ADMINISTRATOR') {
      setActiveTab('analytics');
    }
  }, [role]);

  const handleSelectReferralFromNotification = (refId: number) => {
    setSelectedTimelineRefId(refId);
    setActiveTab('timeline');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/70 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200 overflow-x-hidden">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        notifications={notifications}
        onMarkAllRead={markAllRead}
        onSelectReferral={handleSelectReferralFromNotification}
        wsConnected={isConnected}
      />

      <main className="flex-1 w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12">
        {activeTab === 'landing' && <LandingPage onNavigate={setActiveTab} />}
        {activeTab === 'hospital' && (
          <HospitalDashboardPage
            onSelectPatientTimeline={(refId) => {
              setSelectedTimelineRefId(refId);
              setActiveTab('timeline');
            }}
          />
        )}
        {activeTab === 'new-referral' && (
          <NewReferralPage
            onNavigateToDashboard={() => setActiveTab('hospital')}
            onReferralCreated={() => setActiveTab('hospital')}
          />
        )}
        {activeTab === 'ambulance' && <AmbulanceTrackingPage />}
        {activeTab === 'timeline' && <TimelinePage initialReferralId={selectedTimelineRefId} />}
        {activeTab === 'analytics' && <AnalyticsPage />}
        {activeTab === 'abdm' && <ABDMSandboxPage />}
      </main>

      <footer className="mt-auto border-t border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900 py-6 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-primary-600" />
            <span className="font-bold text-slate-800 dark:text-slate-200">SETU-IFT</span>
            <span>— Smart Emergency Transfer & Unified Referral System</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>National Maternal Emergency Transfer Initiative</span>
            <span>•</span>
            <span>ABDM FHIR R4 Ready</span>
            <span>•</span>
            <span className="text-primary-600 font-bold">Standardized Clinical Triage</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}

export default App;
