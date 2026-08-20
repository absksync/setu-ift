import React, { useState, useEffect } from 'react';
import { fetchReferrals, fetchHospitals, updateReferralStatus } from '../services/api';
import { generateReferralPDF } from '../services/pdfGenerator';
import { Referral, Hospital } from '../types';
import { MEOWSBadge } from '../components/MEOWSBadge';
import { ReadinessMatrix } from '../components/ReadinessMatrix';
import { 
  Building2, Search, Clock, 
  Droplets, Download, Activity, RefreshCw, CheckCircle2 
} from 'lucide-react';

interface HospitalDashboardPageProps {
  onSelectPatientTimeline?: (referralId: number) => void;
}

export const HospitalDashboardPage: React.FC<HospitalDashboardPageProps> = ({
  onSelectPatientTimeline,
}) => {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedHospitalId, setSelectedHospitalId] = useState<number | undefined>(undefined);
  const [selectedRisk, setSelectedRisk] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [refData, hospData] = await Promise.all([
        fetchReferrals({
          risk_level: selectedRisk !== 'ALL' ? selectedRisk : undefined,
          hospital_id: selectedHospitalId,
          search: searchQuery || undefined,
        }),
        fetchHospitals(),
      ]);
      setReferrals(refData);
      setHospitals(hospData);
      if (refData.length > 0 && !selectedReferral) {
        setSelectedReferral(refData[0]);
      } else if (refData.length > 0 && selectedReferral) {
        const found = refData.find((r) => r.id === selectedReferral.id);
        if (found) setSelectedReferral(found);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedHospitalId, selectedRisk, searchQuery]);

  const handleStatusChange = async (referralId: number, newStatus: string) => {
    try {
      const updated = await updateReferralStatus(referralId, newStatus);
      setReferrals((prev) => prev.map((r) => (r.id === referralId ? updated : r)));
      if (selectedReferral?.id === referralId) {
        setSelectedReferral(updated);
      }
    } catch (err) {
      console.error('Failed to change status', err);
    }
  };

  const currentHospital = hospitals.find((h) => h.id === selectedHospitalId);

  return (
    <div className="w-full space-y-6 pb-16 pt-1">
      {/* Hospital Triage Header & Capacity Summary */}
      <div className="w-full bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="p-3 bg-rose-100 dark:bg-rose-950 text-rose-600 rounded-2xl flex-shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white truncate">
                  Hospital Emergency Readiness Dashboard
                </h1>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                  LIVE TRIAGE
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Incoming referrals queue. Prepare ICU beds, blood crossmatch, specialists & OT in advance.
              </p>
            </div>
          </div>

          {/* Hospital Selector Dropdown & Refresh */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <select
              value={selectedHospitalId || ''}
              onChange={(e) => setSelectedHospitalId(e.target.value ? parseInt(e.target.value) : undefined)}
              className="px-3.5 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 max-w-[220px] sm:max-w-xs"
            >
              <option value="">All Receiving Hospitals</option>
              {hospitals.map((h) => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>

            <button
              onClick={loadData}
              className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl transition-colors"
              title="Refresh Queue"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Selected Hospital Resource Banner */}
        {currentHospital && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div className="p-3 bg-blue-50/70 dark:bg-blue-950/40 rounded-2xl border border-blue-100 dark:border-blue-900 min-w-0">
              <span className="text-slate-500 dark:text-slate-400 text-[10px] block font-semibold">Available ICU Beds</span>
              <strong className="text-primary-700 dark:text-primary-300 text-sm font-bold truncate block">
                {currentHospital.available_icu_beds} / {currentHospital.total_icu_beds} Free
              </strong>
            </div>
            <div className="p-3 bg-rose-50/70 dark:bg-rose-950/40 rounded-2xl border border-rose-100 dark:border-rose-900 min-w-0">
              <span className="text-slate-500 dark:text-slate-400 text-[10px] block font-semibold">Blood Bank Facility</span>
              <strong className="text-rose-700 dark:text-rose-300 text-sm font-bold truncate block">
                {currentHospital.blood_bank_status}
              </strong>
            </div>
            <div className="p-3 bg-purple-50/70 dark:bg-purple-950/40 rounded-2xl border border-purple-100 dark:border-purple-900 min-w-0">
              <span className="text-slate-500 dark:text-slate-400 text-[10px] block font-semibold">On-Duty Obstetrician</span>
              <strong className="text-purple-700 dark:text-purple-300 text-sm font-bold truncate block">
                {currentHospital.on_duty_obstetrician}
              </strong>
            </div>
            <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-2xl border border-emerald-100 dark:border-emerald-900 min-w-0">
              <span className="text-slate-500 dark:text-slate-400 text-[10px] block font-semibold">Duty Anesthesiologist</span>
              <strong className="text-emerald-700 dark:text-emerald-300 text-sm font-bold truncate block">
                {currentHospital.on_duty_anesthetist}
              </strong>
            </div>
          </div>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-100/90 dark:bg-slate-850 p-2 rounded-2xl">
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto scrollbar-none">
          {['ALL', 'HIGH RISK', 'MEDIUM RISK', 'LOW RISK'].map((risk) => (
            <button
              key={risk}
              onClick={() => setSelectedRisk(risk)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedRisk === risk
                  ? risk === 'HIGH RISK'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : risk === 'MEDIUM RISK'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : risk === 'LOW RISK'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-750'
              }`}
            >
              {risk === 'ALL' ? 'All Cases' : risk}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72 flex-shrink-0">
          <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search patient, diagnosis..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* TWO-COLUMN LAYOUT: INCOMING QUEUE (LEFT) + ACTIVE CASE WORKSPACE (RIGHT) */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: REFERRAL LIST */}
        <div className="lg:col-span-5 xl:col-span-5 space-y-3 min-w-0">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            <span>Incoming Queue ({referrals.length})</span>
            <span>By MEOWS Urgency</span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
              Loading emergency referrals queue...
            </div>
          ) : referrals.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
              No matching referrals in queue.
            </div>
          ) : (
            <div className="space-y-3 max-h-[740px] overflow-y-auto pr-1">
              {referrals.map((ref) => {
                const isSelected = selectedReferral?.id === ref.id;
                const isHigh = ref.risk_level === 'HIGH RISK';

                return (
                  <div
                    key={ref.id}
                    onClick={() => setSelectedReferral(ref)}
                    className={`p-4 rounded-3xl border cursor-pointer transition-all min-w-0 ${
                      isSelected
                        ? 'border-primary-600 bg-blue-50/60 dark:bg-blue-950/40 shadow-md ring-2 ring-primary-500/20'
                        : isHigh
                        ? 'border-rose-300 dark:border-rose-900/60 bg-rose-50/30 dark:bg-rose-950/20 hover:border-rose-400'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                            {ref.patient.full_name}
                          </span>
                          <span className="text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950 px-1.5 py-0.2 rounded flex-shrink-0">
                            {ref.patient.blood_group}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5 truncate">
                          {ref.referral_code} • {ref.referring_facility_name}
                        </p>
                      </div>

                      <div className="flex-shrink-0">
                        <MEOWSBadge riskLevel={ref.risk_level} score={ref.meows_score} size="sm" />
                      </div>
                    </div>

                    <div className="mt-2.5">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                        {ref.primary_diagnosis}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs gap-2">
                      <div className="flex items-center gap-1.5 text-primary-600 dark:text-primary-400 font-bold flex-shrink-0">
                        <Clock className="w-3.5 h-3.5" />
                        <span>ETA: ~{ref.estimated_time_minutes} min</span>
                      </div>

                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold truncate ${
                        ref.status === 'ARRIVED'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                          : ref.status === 'TREATMENT_STARTED'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                      }`}>
                        {ref.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: ACTIVE SELECTED REFERRAL WORKSPACE */}
        <div className="lg:col-span-7 xl:col-span-7 space-y-5 min-w-0">
          {selectedReferral ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-md space-y-6 min-w-0">
              {/* Header Handover Details */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs text-slate-400 font-bold">{selectedReferral.referral_code}</span>
                    <MEOWSBadge riskLevel={selectedReferral.risk_level} score={selectedReferral.meows_score} size="md" />
                  </div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1 truncate">
                    {selectedReferral.patient.full_name}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Age {selectedReferral.patient.age} • Blood: <strong className="text-rose-600 font-bold">{selectedReferral.patient.blood_group}</strong> • Obstetric Index: G{selectedReferral.patient.gravida}P{selectedReferral.patient.para} ({selectedReferral.patient.gestational_age_weeks} wks GA)
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => generateReferralPDF(selectedReferral)}
                    className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Download className="w-4 h-4" />
                    PDF Record
                  </button>
                  {onSelectPatientTimeline && (
                    <button
                      onClick={() => onSelectPatientTimeline(selectedReferral.id)}
                      className="px-3.5 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <Activity className="w-4 h-4" />
                      Timeline
                    </button>
                  )}
                </div>
              </div>

              {/* Status Action Banner */}
              <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Transfer Status</span>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
                    <span>Current Stage: {selectedReferral.status.replace('_', ' ')}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {selectedReferral.status === 'EN_ROUTE' && (
                    <button
                      onClick={() => handleStatusChange(selectedReferral.id, 'ARRIVED')}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow transition-colors flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Confirm Arrival at Emergency Bay</span>
                    </button>
                  )}
                  {selectedReferral.status === 'ARRIVED' && (
                    <button
                      onClick={() => handleStatusChange(selectedReferral.id, 'TREATMENT_STARTED')}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow transition-colors flex items-center gap-1.5"
                    >
                      <span>🚀 Initiate Emergency Treatment</span>
                    </button>
                  )}
                  {selectedReferral.status === 'TREATMENT_STARTED' && (
                    <button
                      onClick={() => handleStatusChange(selectedReferral.id, 'COMPLETED')}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow transition-colors"
                    >
                      Complete Handover
                    </button>
                  )}
                </div>
              </div>

              {/* HOSPITAL READINESS MATRIX */}
              <div className="w-full">
                <ReadinessMatrix
                  referral={selectedReferral}
                  onReadinessChanged={(updated) => {
                    setSelectedReferral({ ...selectedReferral, readiness: updated });
                  }}
                />
              </div>

              {/* Diagnosis and Interventions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 min-w-0">
                  <span className="font-bold text-slate-900 dark:text-white block border-b border-slate-200 dark:border-slate-700 pb-1.5">
                    Emergency Diagnosis & Reason
                  </span>
                  <div>
                    <strong className="text-slate-800 dark:text-slate-200 text-xs">{selectedReferral.primary_diagnosis}</strong>
                    {selectedReferral.secondary_diagnosis && (
                      <p className="text-slate-500 text-[11px] mt-0.5">{selectedReferral.secondary_diagnosis}</p>
                    )}
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed pt-1">
                    {selectedReferral.referral_reason}
                  </p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 min-w-0">
                  <span className="font-bold text-slate-900 dark:text-white block border-b border-slate-200 dark:border-slate-700 pb-1.5">
                    Pre-Referral Interventions Administered
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 font-mono text-[11px] leading-relaxed">
                    {selectedReferral.interventions_given || 'Standard stabilization protocols.'}
                  </p>
                  {selectedReferral.blood_transfusion_needed && (
                    <div className="p-2 bg-rose-100 dark:bg-rose-950/60 rounded-xl text-rose-800 dark:text-rose-300 font-bold text-[11px] flex items-center gap-1.5">
                      <Droplets className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{selectedReferral.blood_units_needed} Units {selectedReferral.patient.blood_group} Transfusion Requested</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Vitals History */}
              <div className="space-y-2 text-xs">
                <span className="font-bold text-slate-900 dark:text-white block">
                  Vital Signs Stream (PHC Departure & Transit)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                  {selectedReferral.vitals_history && selectedReferral.vitals_history.length > 0 ? (
                    (() => {
                      const latest = selectedReferral.vitals_history[selectedReferral.vitals_history.length - 1];
                      return (
                        <>
                          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-center min-w-0">
                            <span className="text-[10px] text-slate-400 block font-semibold truncate">Blood Pressure</span>
                            <strong className="text-slate-900 dark:text-white font-mono text-xs">{latest.systolic_bp}/{latest.diastolic_bp}</strong>
                          </div>
                          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-center min-w-0">
                            <span className="text-[10px] text-slate-400 block font-semibold truncate">Heart Rate</span>
                            <strong className="text-slate-900 dark:text-white font-mono text-xs">{latest.heart_rate} bpm</strong>
                          </div>
                          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-center min-w-0">
                            <span className="text-[10px] text-slate-400 block font-semibold truncate">Resp Rate</span>
                            <strong className="text-slate-900 dark:text-white font-mono text-xs">{latest.respiratory_rate}/min</strong>
                          </div>
                          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-center min-w-0">
                            <span className="text-[10px] text-slate-400 block font-semibold truncate">Temp</span>
                            <strong className="text-slate-900 dark:text-white font-mono text-xs">{latest.temperature_f}°F</strong>
                          </div>
                          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-center min-w-0">
                            <span className="text-[10px] text-slate-400 block font-semibold truncate">SpO2</span>
                            <strong className="text-slate-900 dark:text-white font-mono text-xs">{latest.spo2}%</strong>
                          </div>
                          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-center min-w-0">
                            <span className="text-[10px] text-slate-400 block font-semibold truncate">MEOWS Score</span>
                            <strong className="text-rose-600 font-mono text-xs">{latest.meows_score}</strong>
                          </div>
                        </>
                      );
                    })()
                  ) : (
                    <div className="col-span-6 text-slate-400">No vitals logged yet.</div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
              Select an incoming patient from the queue to open the readiness workspace.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
