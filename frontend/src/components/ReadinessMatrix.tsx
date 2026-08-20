import React, { useState } from 'react';
import { Referral, ReadinessChecklist } from '../types';
import { updateReadiness } from '../services/api';
import { 
  Bed, Droplets, UserCheck, Scissors, 
  Pill, CheckCircle2, Clock 
} from 'lucide-react';

interface ReadinessMatrixProps {
  referral: Referral;
  onReadinessChanged?: (updated: ReadinessChecklist) => void;
}

export const ReadinessMatrix: React.FC<ReadinessMatrixProps> = ({
  referral,
  onReadinessChanged,
}) => {
  const readiness = referral.readiness;
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const handleToggle = async (key: 'icu_prepared' | 'blood_prepared' | 'specialist_alerted' | 'ot_prepared' | 'medication_prepared') => {
    if (!readiness) return;
    try {
      setLoadingAction(key);
      const currentValue = readiness[key];
      const updated = await updateReadiness(referral.id, {
        [key]: !currentValue,
        last_updated_by: 'Hospital Emergency Team'
      });
      if (onReadinessChanged) {
        onReadinessChanged(updated);
      }
    } catch (err) {
      console.error('Failed to toggle readiness item', err);
    } finally {
      setLoadingAction(null);
    }
  };

  if (!readiness) {
    return (
      <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-center text-xs text-slate-500">
        Readiness checklist initializing...
      </div>
    );
  }

  const items = [
    {
      key: 'icu_prepared' as const,
      label: 'ICU Bed',
      subtitle: readiness.icu_prepared ? `Reserved: ${readiness.icu_bed_number || 'Bed-04'}` : 'Reserve ICU Bed',
      icon: <Bed className="w-4 h-4" />,
      active: readiness.icu_prepared,
      timestamp: readiness.icu_prepared_at,
      badgeColor: 'text-blue-600 bg-blue-100 dark:bg-blue-950/60 dark:text-blue-300',
      activeBg: 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20',
    },
    {
      key: 'blood_prepared' as const,
      label: 'Blood Bank',
      subtitle: readiness.blood_prepared 
        ? `${readiness.blood_units_reserved || referral.blood_units_needed || 2} Units ${referral.patient.blood_group} Ready` 
        : `Prepare ${referral.blood_units_needed || 2} Units ${referral.patient.blood_group}`,
      icon: <Droplets className="w-4 h-4" />,
      active: readiness.blood_prepared,
      timestamp: readiness.blood_prepared_at,
      badgeColor: 'text-rose-600 bg-rose-100 dark:bg-rose-950/60 dark:text-rose-300',
      activeBg: 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-500/20',
    },
    {
      key: 'specialist_alerted' as const,
      label: 'Specialist',
      subtitle: readiness.specialist_alerted 
        ? `Alerted: ${readiness.specialist_name?.split('(')[0] || 'Dr. Deshmukh'}` 
        : 'Mobilize Obstetrician/Anesth',
      icon: <UserCheck className="w-4 h-4" />,
      active: readiness.specialist_alerted,
      timestamp: readiness.specialist_alerted_at,
      badgeColor: 'text-purple-600 bg-purple-100 dark:bg-purple-950/60 dark:text-purple-300',
      activeBg: 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-500/20',
    },
    {
      key: 'ot_prepared' as const,
      label: 'Emergency OT',
      subtitle: readiness.ot_prepared ? `Ready: ${readiness.ot_number || 'OT-2'}` : 'Prepare Operation Theater',
      icon: <Scissors className="w-4 h-4" />,
      active: readiness.ot_prepared,
      timestamp: readiness.ot_prepared_at,
      badgeColor: 'text-amber-600 bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300',
      activeBg: 'bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-500/20',
    },
    {
      key: 'medication_prepared' as const,
      label: 'Emergency Meds',
      subtitle: readiness.medication_prepared 
        ? `Staged: ${readiness.medication_kit_code || 'Maternal Kit'}` 
        : 'Pre-Stage Oxytocin / MgSO4',
      icon: <Pill className="w-4 h-4" />,
      active: readiness.medication_prepared,
      timestamp: readiness.medication_prepared_at,
      badgeColor: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300',
      activeBg: 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-500/20',
    },
  ];

  const completedCount = items.filter(i => i.active).length;
  const progressPercent = Math.round((completedCount / items.length) * 100);

  return (
    <div className="space-y-3.5">
      {/* Header with progress */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
            Parallel Hospital Preparation:
          </span>
          <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
            progressPercent === 100 
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
              : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
          }`}>
            {completedCount} / {items.length} Ready ({progressPercent}%)
          </span>
        </div>

        {readiness.last_updated_by && (
          <span className="text-slate-400 text-[11px] hidden sm:inline">
            {readiness.last_updated_by}
          </span>
        )}
      </div>

      {/* Progress track */}
      <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-500 ${
            progressPercent === 100 ? 'bg-emerald-500' : 'bg-primary-600'
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* 5 Distinct Readiness Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 pt-1">
        {items.map((item) => {
          const isLoading = loadingAction === item.key;

          return (
            <button
              key={item.key}
              onClick={() => handleToggle(item.key)}
              disabled={isLoading}
              className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden group flex flex-col justify-between min-h-[92px] ${
                item.active
                  ? item.activeBg
                  : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800 hover:border-primary-400 dark:hover:border-primary-600 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className={`p-2 rounded-xl ${item.active ? 'bg-white/20 text-white' : item.badgeColor}`}>
                  {item.icon}
                </div>
                {item.active ? (
                  <CheckCircle2 className="w-4 h-4 text-white" />
                ) : (
                  <span className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600 group-hover:border-primary-500"></span>
                )}
              </div>

              <div className="mt-2">
                <p className={`font-bold text-xs ${item.active ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                  {item.label}
                </p>
                <p className={`text-[11px] mt-0.5 truncate ${item.active ? 'text-white/90' : 'text-slate-500 dark:text-slate-400'}`}>
                  {item.subtitle}
                </p>
              </div>

              {item.timestamp && (
                <div className={`mt-2 pt-1 border-t text-[10px] flex items-center gap-1 ${
                  item.active ? 'border-white/20 text-white/80' : 'border-slate-100 dark:border-slate-800 text-slate-400'
                }`}>
                  <Clock className="w-2.5 h-2.5 flex-shrink-0" />
                  <span className="truncate">{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
