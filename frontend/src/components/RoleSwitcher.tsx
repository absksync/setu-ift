import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/useAuthRole';
import { UserRole } from '../types';
import { Stethoscope, Ambulance, Hospital as HospitalIcon, ShieldCheck, ChevronDown, Check } from 'lucide-react';

export const RoleSwitcher: React.FC = () => {
  const { role, setRole } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const roles: { id: UserRole; label: string; shortLabel: string; icon: React.ReactNode; color: string }[] = [
    {
      id: 'RURAL_HEALTH_WORKER',
      label: 'Rural PHC Clinic (Doctor)',
      shortLabel: 'Rural PHC',
      icon: <Stethoscope className="w-4 h-4 text-emerald-500" />,
      color: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      id: 'AMBULANCE_STAFF',
      label: 'Ambulance EMT (Transit)',
      shortLabel: 'Ambulance',
      icon: <Ambulance className="w-4 h-4 text-blue-500" />,
      color: 'text-blue-600 dark:text-blue-400',
    },
    {
      id: 'HOSPITAL_STAFF',
      label: 'Hospital Triage Team',
      shortLabel: 'Hospital Triage',
      icon: <HospitalIcon className="w-4 h-4 text-rose-500" />,
      color: 'text-rose-600 dark:text-rose-400',
    },
    {
      id: 'ADMINISTRATOR',
      label: 'Health Directorate (Admin)',
      shortLabel: 'Admin Mission',
      icon: <ShieldCheck className="w-4 h-4 text-purple-500" />,
      color: 'text-purple-600 dark:text-purple-400',
    },
  ];

  const currentRole = roles.find((r) => r.id === role) || roles[2];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 transition-all shadow-sm"
        title="Switch Demo User Role"
      >
        <span className="flex items-center gap-1.5">
          {currentRole.icon}
          <span className="hidden sm:inline text-slate-500 dark:text-slate-400 font-normal">Role:</span>
          <span>{currentRole.shortLabel}</span>
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Switch Perspective:
          </div>
          {roles.map((r) => {
            const isSelected = role === r.id;
            return (
              <button
                key={r.id}
                onClick={() => {
                  setRole(r.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs text-left transition-colors ${
                  isSelected
                    ? 'bg-blue-50/80 dark:bg-blue-950/50 text-primary-600 dark:text-primary-400 font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <span className="flex items-center gap-2">
                  {r.icon}
                  <span>{r.label}</span>
                </span>
                {isSelected && <Check className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
