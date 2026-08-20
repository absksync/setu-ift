import React, { useState, useEffect } from 'react';
import { fetchAmbulances, fetchHospitals, fetchReferrals, logEnrouteVitals } from '../services/api';
import { Ambulance, Hospital, Referral } from '../types';
import { MapViewer } from '../components/MapViewer';
import { MEOWSBadge } from '../components/MEOWSBadge';
import { 
  Ambulance as AmbIcon, Activity, Radio, 
  Send, Phone, Navigation, Clock, ShieldCheck, CheckCircle2 
} from 'lucide-react';

export const AmbulanceTrackingPage: React.FC = () => {
  const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [selectedAmbulance, setSelectedAmbulance] = useState<Ambulance | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // EMT En-route Vitals Form State
  const [transitVitals, setTransitVitals] = useState({
    systolic_bp: 80,
    diastolic_bp: 46,
    heart_rate: 140,
    respiratory_rate: 30,
    temperature_f: 96.0,
    spo2: 90,
    notes: 'Patient showing increased pallor and active vaginal soaking in transit.',
  });
  const [loggingVitals, setLoggingVitals] = useState<boolean>(false);
  const [vitalsLoggedSuccess, setVitalsLoggedSuccess] = useState<boolean>(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ambData, hospData, refData] = await Promise.all([
        fetchAmbulances(),
        fetchHospitals(),
        fetchReferrals({ status: 'EN_ROUTE' }),
      ]);
      setAmbulances(ambData);
      setHospitals(hospData);
      setReferrals(refData);
      if (ambData.length > 0 && !selectedAmbulance) {
        setSelectedAmbulance(ambData[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeReferral = referrals.find((r) => r.ambulance_id === selectedAmbulance?.id);

  const handleLogTransitVitals = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReferral) return;
    try {
      setLoggingVitals(true);
      await logEnrouteVitals(activeReferral.id, {
        ...transitVitals,
        recorded_by: selectedAmbulance?.emt_name || 'Ambulance EMT',
      });
      setVitalsLoggedSuccess(true);
      setTimeout(() => setVitalsLoggedSuccess(false), 4000);
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoggingVitals(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 dark:bg-blue-950 text-blue-600 rounded-xl">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                Live Ambulance Transit & GPS Tracking
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                ALS / BLS FLEET
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Real-time vehicle movement, speed telemetry, and en-route clinical observation stream.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-xl flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            GPS Telemetry Active
          </span>
        </div>
      </div>

      {/* Main Split: Map (Left/Center) + Fleet Status & EMT Logger (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* MAP CONTAINER */}
        <div className="lg:col-span-8 space-y-4">
          <MapViewer
            ambulances={ambulances}
            hospitals={hospitals}
            activeReferrals={referrals}
            selectedReferral={activeReferral}
            zoom={11}
          />

          {/* Quick Fleet Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {ambulances.map((amb) => {
              const isSelected = selectedAmbulance?.id === amb.id;
              const assigned = referrals.find((r) => r.ambulance_id === amb.id);

              return (
                <div
                  key={amb.id}
                  onClick={() => setSelectedAmbulance(amb)}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-primary-600 bg-blue-50/60 dark:bg-blue-950/40 shadow-sm ring-2 ring-primary-500/20'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1">
                      <AmbIcon className="w-4 h-4 text-blue-600" />
                      <span>{amb.vehicle_number}</span>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                      amb.status === 'EN_ROUTE' 
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' 
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      {amb.status}
                    </span>
                  </div>

                  <div className="mt-2 text-[11px] text-slate-600 dark:text-slate-400 space-y-0.5">
                    <div>EMT: {amb.emt_name}</div>
                    <div className="font-semibold text-primary-600">{amb.speed_kmh.toFixed(0)} km/h • Lat: {amb.current_lat.toFixed(3)}</div>
                  </div>

                  {assigned && (
                    <div className="mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate max-w-[110px]">
                        {assigned.patient.full_name}
                      </span>
                      <MEOWSBadge riskLevel={assigned.risk_level} score={assigned.meows_score} size="sm" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: EMT EN-ROUTE VITALS LOGGER */}
        <div className="lg:col-span-4 space-y-5">
          {selectedAmbulance ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-md space-y-5">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-blue-600">{selectedAmbulance.vehicle_number}</span>
                  <span className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded font-semibold">
                    {selectedAmbulance.vehicle_type}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  Ambulance Command & EMT Portal
                </h3>
                <p className="text-xs text-slate-500">
                  Driver: {selectedAmbulance.driver_name} ({selectedAmbulance.driver_phone})
                </p>
              </div>

              {activeReferral ? (
                <div className="space-y-4">
                  {/* Assigned Patient Info Card */}
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <strong className="text-slate-900 dark:text-white text-sm">{activeReferral.patient.full_name}</strong>
                      <MEOWSBadge riskLevel={activeReferral.risk_level} score={activeReferral.meows_score} size="sm" />
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px] line-clamp-2">
                      {activeReferral.primary_diagnosis}
                    </p>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-700 text-slate-500">
                      <span className="flex items-center gap-1 text-primary-600 font-bold">
                        <Clock className="w-3 h-3" /> ETA: {activeReferral.estimated_time_minutes} min
                      </span>
                      <span>Dest: {activeReferral.destination_hospital?.name?.split(' ')[0]}</span>
                    </div>
                  </div>

                  {/* EMT Vitals Logger Form */}
                  <form onSubmit={handleLogTransitVitals} className="space-y-3 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Activity className="w-4 h-4 text-rose-500" />
                        Log En-Route Vitals (Transit)
                      </span>
                      <span className="text-[10px] text-slate-400">Updates MEOWS</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">Systolic BP</label>
                        <input
                          type="number"
                          value={transitVitals.systolic_bp}
                          onChange={(e) => setTransitVitals({ ...transitVitals, systolic_bp: parseInt(e.target.value) || 0 })}
                          className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">Diastolic BP</label>
                        <input
                          type="number"
                          value={transitVitals.diastolic_bp}
                          onChange={(e) => setTransitVitals({ ...transitVitals, diastolic_bp: parseInt(e.target.value) || 0 })}
                          className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">Heart Rate (bpm)</label>
                        <input
                          type="number"
                          value={transitVitals.heart_rate}
                          onChange={(e) => setTransitVitals({ ...transitVitals, heart_rate: parseInt(e.target.value) || 0 })}
                          className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">SpO2 (%)</label>
                        <input
                          type="number"
                          value={transitVitals.spo2}
                          onChange={(e) => setTransitVitals({ ...transitVitals, spo2: parseInt(e.target.value) || 0 })}
                          className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">EMT Observations / Notes</label>
                      <textarea
                        rows={2}
                        value={transitVitals.notes}
                        onChange={(e) => setTransitVitals({ ...transitVitals, notes: e.target.value })}
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                      />
                    </div>

                    {vitalsLoggedSuccess && (
                      <div className="p-2.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs flex items-center gap-1.5 font-bold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Vitals & MEOWS Transmitted to Hospital!</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loggingVitals}
                      className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{loggingVitals ? 'Broadcasting...' : 'Broadcast Transit Vitals'}</span>
                    </button>
                  </form>
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-850 rounded-2xl">
                  This ambulance is currently on standby or returning to depot.
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
              Select an ambulance from the fleet list.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
