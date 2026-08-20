import React from 'react';
import { useAuth } from '../hooks/useAuthRole';
import { RoleSwitcher } from './RoleSwitcher';
import { NotificationDrawer } from './NotificationDrawer';
import { NotificationItem } from '../types';
import { 
  HeartHandshake, PlusCircle, LayoutDashboard, 
  Ambulance, BarChart3, Clock, ShieldCheck, 
  Sun, Moon, Volume2, VolumeX 
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
  onSelectReferral?: (referralId: number) => void;
  wsConnected: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  notifications,
  onMarkAllRead,
  onSelectReferral,
  wsConnected,
}) => {
  const { darkMode, toggleDarkMode, audioAlertsEnabled, setAudioAlertsEnabled } = useAuth();

  const navItems = [
    { id: 'landing', label: 'Overview', icon: <HeartHandshake className="w-4 h-4" /> },
    { id: 'hospital', label: 'Hospital Readiness', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'new-referral', label: 'New Referral', icon: <PlusCircle className="w-4 h-4" /> },
    { id: 'ambulance', label: 'Live Transit GPS', icon: <Ambulance className="w-4 h-4" /> },
    { id: 'timeline', label: 'Patient Journey', icon: <Clock className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'abdm', label: 'ABDM Gateway', icon: <ShieldCheck className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-sm">
      {/* Top Clinical Announcement Bar */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white px-4 sm:px-6 lg:px-8 py-1 text-xs">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 truncate">
            <span className="flex h-2 w-2 relative flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <span className="font-bold tracking-wide uppercase text-[11px] truncate">
              SETU-IFT : National Maternal Emergency Inter-Facility Referral Network
            </span>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0 ml-2">
            <span className="inline-flex items-center gap-1.5 bg-black/25 px-2 py-0.5 rounded-full text-[10px] font-mono">
              <span className={`w-1.5 h-1.5 rounded-full ${wsConnected ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
              {wsConnected ? 'LIVE SYNC' : 'CONNECTING'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Header Navigation Bar */}
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo */}
          <div 
            onClick={() => setActiveTab('landing')} 
            className="flex items-center gap-2.5 cursor-pointer group flex-shrink-0"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform flex-shrink-0">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight">
                  SETU<span className="text-primary-600">-IFT</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded border border-blue-200 dark:border-blue-800">
                  MEOWS
                </span>
              </div>
            </div>
          </div>

          {/* Center Navigation Tabs (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1 overflow-x-auto">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-950/70 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800 shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Tools */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <RoleSwitcher />

            {/* Audio toggle */}
            <button
              onClick={() => setAudioAlertsEnabled(!audioAlertsEnabled)}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              title={audioAlertsEnabled ? 'Audio Alerts Enabled' : 'Audio Alerts Muted'}
            >
              {audioAlertsEnabled ? <Volume2 className="w-4 h-4 text-blue-600 dark:text-blue-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>

            {/* Dark mode toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Notification Drawer */}
            <NotificationDrawer
              notifications={notifications}
              onMarkAllRead={onMarkAllRead}
              onSelectReferral={onSelectReferral}
            />
          </div>
        </div>

        {/* Mobile / Tablet Horizontal Navigation Scrollbar */}
        <div className="lg:hidden flex items-center gap-1.5 py-2 overflow-x-auto border-t border-slate-100 dark:border-slate-800">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs whitespace-nowrap font-bold transition-all ${
                  isActive
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
