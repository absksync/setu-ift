import React, { useState, useEffect } from 'react';
import { fetchReferrals, fetchReferralById } from '../services/api';
import { generateReferralPDF } from '../services/pdfGenerator';
import { Referral } from '../types';
import { MEOWSBadge } from '../components/MEOWSBadge';
import { 
  Clock, CheckCircle2, AlertCircle, 
  Download, Stethoscope, Ambulance, Building2, 
  Heart, Zap, ShieldCheck 
} from 'lucide-react';

interface TimelinePageProps {
  initialReferralId?: number;
}

export const TimelinePage: React.FC<TimelinePageProps> = ({ initialReferralId }) => {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchReferrals()
      .then((data) => {
        setReferrals(data);
        if (data.length > 0) {
          const match = initialReferralId ? data.find((r) => r.id === initialReferralId) : data[0];
          setSelectedReferral(match || data[0]);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [initialReferralId]);

  if (loading || !selectedReferral) {
    return (
      <div className="p-12 text-center text-xs text-slate-400">
        Loading patient timeline...
      </div>
    );
  }

  const createdTime = new Date(selectedReferral.created_at);
  const baseTime = createdTime.getTime();

  // Milestone Stages Definition
  const milestones = [
    {
      id: 1,
      title: '1. Emergency Detected at Rural Clinic',
      subtitle: `${selectedReferral.referring_facility_name} (${selectedReferral.referring_facility_type})`,
      time: new Date(baseTime - 8 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      icon: <Stethoscope className="w-5 h-5 text-emerald-600" />,
      bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
      description: `Obstetric complication identified by ${selectedReferral.referring_doctor_name}. Diagnosis: ${selectedReferral.primary_diagnosis}.`,
      completed: true,
    },
    {
      id: 2,
      title: '2. MEOWS Calculated & Digital Referral Created',
      subtitle: `System Score: ${selectedReferral.meows_score} (${selectedReferral.risk_level})`,
      time: createdTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      icon: <Zap className="w-5 h-5 text-rose-600" />,
      bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800',
      description: `Rule engine evaluated 5 vital signs. Automatic ${selectedReferral.risk_level} trigger initiated. Referral Code: ${selectedReferral.referral_code}.`,
      completed: true,
    },
    {
      id: 3,
      title: '3. Destination Hospital Alerted via WebSockets',
      subtitle: `${selectedReferral.destination_hospital?.name || 'Tertiary Center'}`,
      time: new Date(baseTime + 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      icon: <Building2 className="w-5 h-5 text-blue-600" />,
      bg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800',
      description: `Triage dashboard notified in sub-second latency. Advance lead time window of ~${selectedReferral.estimated_time_minutes} minutes unlocked.`,
      completed: true,
    },
    {
      id: 4,
      title: '4. Ambulance Dispatched & En-Route Transit',
      subtitle: `Vehicle: ${selectedReferral.ambulance?.vehicle_number || 'ALS 108'}`,
      time: new Date(baseTime + 3 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      icon: <Ambulance className="w-5 h-5 text-blue-600" />,
      bg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800',
      description: `Patient stabilized with pre-referral interventions: ${selectedReferral.interventions_given || 'Standard fluids'}. Live GPS tracking initiated.`,
      completed: true,
    },
    {
      id: 5,
      title: '5. Hospital Parallel Preparedness Completed',
      subtitle: 'ICU Bed, Blood Bank & Specialists Ready',
      time: new Date(baseTime + 12 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      icon: <ShieldCheck className="w-5 h-5 text-indigo-600" />,
      bg: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800',
      description: selectedReferral.readiness?.all_prepared
        ? 'All 5 hospital readiness checkpoints verified and ready for immediate reception.'
        : 'Hospital blood bank, ICU staff, and duty obstetrician briefed and placed on urgent standby.',
      completed: true,
    },
    {
      id: 6,
      title: '6. Patient Arrived at Hospital Emergency Bay',
      subtitle: 'Seamless Zero-Delay Handover',
      time: selectedReferral.arrived_at 
        ? new Date(selectedReferral.arrived_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : `ETA in ~${selectedReferral.estimated_time_minutes} min`,
      icon: <CheckCircle2 className="w-5 h-5 text-purple-600" />,
      bg: selectedReferral.arrived_at ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
      description: selectedReferral.arrived_at 
        ? 'Ambulance docked at Emergency Entrance. Clinical data previously loaded on hospital terminals.'
        : 'Ambulance currently in transit on Highway 60.',
      completed: !!selectedReferral.arrived_at,
    },
    {
      id: 7,
      title: '7. Definitive Medical & Surgical Treatment Commenced',
      subtitle: 'Zero Scramble Time Achieved',
      time: selectedReferral.treatment_started_at
        ? new Date(selectedReferral.treatment_started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : 'Immediate on arrival',
      icon: <Heart className="w-5 h-5 text-rose-600" />,
      bg: selectedReferral.treatment_started_at ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
      description: selectedReferral.treatment_started_at
        ? 'Crossmatched blood infused / patient shifted to Emergency OT without admission delay.'
        : 'Care team prepped to begin treatment within 3 minutes of arrival.',
      completed: !!selectedReferral.treatment_started_at,
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              Patient Clinical Journey Timeline
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              End-to-end milestone audit trail from rural emergency detection to definitive tertiary care.
            </p>
          </div>
        </div>

        {/* Patient Selector Dropdown & PDF Export */}
        <div className="flex items-center gap-3">
          <select
            value={selectedReferral.id}
            onChange={(e) => {
              const match = referrals.find((r) => r.id === parseInt(e.target.value));
              if (match) setSelectedReferral(match);
            }}
            className="px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200"
          >
            {referrals.map((r) => (
              <option key={r.id} value={r.id}>
                {r.referral_code} — {r.patient.full_name} ({r.risk_level})
              </option>
            ))}
          </select>

          <button
            onClick={() => generateReferralPDF(selectedReferral)}
            className="px-3.5 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export Record PDF</span>
          </button>
        </div>
      </div>

      {/* Selected Patient Banner */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              {selectedReferral.patient.full_name}
            </h2>
            <MEOWSBadge riskLevel={selectedReferral.risk_level} score={selectedReferral.meows_score} size="sm" />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Age {selectedReferral.patient.age} • Blood Group: <strong className="text-rose-600">{selectedReferral.patient.blood_group}</strong> • {selectedReferral.primary_diagnosis}
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="text-right">
            <span className="text-slate-400 block text-[10px]">Transfer Route</span>
            <strong className="text-slate-800 dark:text-slate-200">
              {selectedReferral.referring_facility_name} → {selectedReferral.destination_hospital?.name?.split(' ')[0]}
            </strong>
          </div>
        </div>
      </div>

      {/* VISUAL VERTICAL TIMELINE */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md">
        <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
          {milestones.map((step) => (
            <div key={step.id} className="relative group">
              {/* Dot / Icon indicator on vertical line */}
              <div className={`absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 bg-white dark:bg-slate-900 flex items-center justify-center shadow-sm ${
                step.completed ? 'border-primary-600 text-primary-600' : 'border-slate-300 text-slate-400'
              }`}>
                {step.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-primary-600" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                )}
              </div>

              {/* Milestone Card */}
              <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${step.bg}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      {step.title}
                    </h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                    {step.time}
                  </span>
                </div>

                <p className="text-xs font-semibold text-primary-700 dark:text-primary-400 mt-1">
                  {step.subtitle}
                </p>

                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
