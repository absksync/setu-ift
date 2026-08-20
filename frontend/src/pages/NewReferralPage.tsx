import React, { useState, useEffect } from 'react';
import { 
  createReferral, calculateMEOWS, 
  fetchHospitals, verifyABHA 
} from '../services/api';
import { generateReferralPDF } from '../services/pdfGenerator';
import { Hospital, MEOWSResult, Referral } from '../types';
import { MEOWSBadge } from '../components/MEOWSBadge';
import { 
  Send, Activity, AlertTriangle, CheckCircle, 
  Download, Navigation, Building2, Stethoscope, Check 
} from 'lucide-react';

interface NewReferralPageProps {
  onReferralCreated?: (ref: Referral) => void;
  onNavigateToDashboard?: () => void;
}

export const NewReferralPage: React.FC<NewReferralPageProps> = ({
  onReferralCreated,
  onNavigateToDashboard,
}) => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loadingHospitals, setLoadingHospitals] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [verifyingAbha, setVerifyingAbha] = useState<boolean>(false);
  const [abhaVerified, setAbhaVerified] = useState<boolean>(false);
  const [createdReferral, setCreatedReferral] = useState<Referral | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    patient_name: 'Sushila Sandeep Gaikwad',
    age: 24,
    abha_id: '91-4829-1029-4821',
    blood_group: 'O+',
    gravida: 2,
    para: 1,
    gestational_age_weeks: 38,
    contact_phone: '+91 98230 45678',
    emergency_contact_name: 'Sandeep Gaikwad (Husband)',
    emergency_contact_phone: '+91 97640 12345',
    village_town: 'Chakan Rural Taluka',
    referring_facility_name: 'Primary Health Centre Chakan',
    referring_facility_type: 'PHC',
    referring_doctor_name: 'Dr. Vikas Kadam (MBBS, Medical Officer)',
    referring_doctor_phone: '+91 94220 11001',
    destination_hospital_id: 1,
    primary_diagnosis: 'Postpartum Hemorrhage (PPH) with Uterine Atony',
    secondary_diagnosis: 'Estimated blood loss ~ 900ml, severe maternal pallor',
    referral_reason: 'Sudden continuous heavy vaginal bleeding post-delivery unresponsive to initial fundal massage. Requires emergency tertiary intervention and blood transfusion.',
    interventions_given: 'IV Oxytocin 20 IU in 500ml RL wide open, Misoprostol 800mcg per rectum given, 2 large-bore 16G IV lines, Oxygen 6L/min via facemask',
    blood_transfusion_needed: true,
    blood_units_needed: 2,
    priority: 'CRITICAL_EMERGENCY',
  });

  // Vitals State
  const [vitals, setVitals] = useState({
    systolic_bp: 86,
    diastolic_bp: 52,
    heart_rate: 132,
    respiratory_rate: 28,
    temperature_f: 96.4,
    spo2: 92,
  });

  // Live MEOWS Result State
  const [meowsResult, setMeowsResult] = useState<MEOWSResult | null>(null);

  // Load Hospitals on mount
  useEffect(() => {
    fetchHospitals()
      .then((data) => {
        setHospitals(data);
        if (data.length > 0) {
          setFormData((prev) => ({ ...prev, destination_hospital_id: data[0].id }));
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoadingHospitals(false));
  }, []);

  // Recalculate MEOWS dynamically on any vitals change
  useEffect(() => {
    calculateMEOWS(vitals)
      .then((res) => setMeowsResult(res))
      .catch((err) => console.error(err));
  }, [vitals]);

  const handleVerifyAbha = async () => {
    if (!formData.abha_id) return;
    try {
      setVerifyingAbha(true);
      const res = await verifyABHA(formData.abha_id);
      if (res.verified) {
        setAbhaVerified(true);
        setFormData((prev) => ({
          ...prev,
          patient_name: res.name,
        }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setVerifyingAbha(false);
    }
  };

  const handleQuickCaseTemplate = (caseType: 'pph' | 'eclampsia' | 'obstructed' | 'stable') => {
    if (caseType === 'pph') {
      setFormData((prev) => ({
        ...prev,
        patient_name: 'Pooja Santosh Shinde',
        age: 24,
        blood_group: 'O+',
        primary_diagnosis: 'Severe Postpartum Hemorrhage (PPH) with Hypovolemic Shock',
        secondary_diagnosis: 'Uterine Atony, active bleeding > 1100ml',
        referral_reason: 'Uncontrolled hemorrhage post delivery at PHC. Unresponsive to bimanual compression. Emergent blood transfusion & surgical intervention required.',
        interventions_given: 'IV Oxytocin 20 IU, Misoprostol 800mcg PR, Tranexamic Acid 1g IV slow push, 2 16G cannulae with RL running, Oxygen 6L/min',
        blood_transfusion_needed: true,
        blood_units_needed: 3,
        priority: 'CRITICAL_EMERGENCY',
      }));
      setVitals({
        systolic_bp: 82,
        diastolic_bp: 48,
        heart_rate: 136,
        respiratory_rate: 28,
        temperature_f: 96.2,
        spo2: 91,
      });
    } else if (caseType === 'eclampsia') {
      setFormData((prev) => ({
        ...prev,
        patient_name: 'Sunita Sanjay Jadhav',
        age: 29,
        blood_group: 'B+',
        primary_diagnosis: 'Eclampsia with Generalized Tonic-Clonic Seizures',
        secondary_diagnosis: 'Severe Hypertensive Emergency, 3+ Proteinuria, altered sensorium',
        referral_reason: 'Patient experienced 2 episodes of generalized seizures in labour room. Needs urgent ICU stabilization and emergent cesarean delivery.',
        interventions_given: 'Pritchard Regimen: MgSO4 4g IV + 10g IM loading completed, Labetalol 20mg IV given, Foley catheter draining clear urine, Airway maintained',
        blood_transfusion_needed: false,
        blood_units_needed: 0,
        priority: 'CRITICAL_EMERGENCY',
      }));
      setVitals({
        systolic_bp: 178,
        diastolic_bp: 118,
        heart_rate: 124,
        respiratory_rate: 26,
        temperature_f: 99.2,
        spo2: 93,
      });
    } else if (caseType === 'obstructed') {
      setFormData((prev) => ({
        ...prev,
        patient_name: 'Kavita Ramesh Gaikwad',
        age: 22,
        blood_group: 'A-',
        primary_diagnosis: 'Obstructed Labour with Impending Uterine Rupture',
        secondary_diagnosis: 'Bandl\'s Retraction Ring, second stage arrest > 3 hrs',
        referral_reason: 'Cephalopelvic disproportion with deep transverse arrest. Visible Bandl\'s ring on abdominal palpation. Fetal distress present.',
        interventions_given: 'IV RL wide open, Left lateral position, Inj Ampicillin 2g IV given, Catheter placed, Immediate OT preparation required',
        blood_transfusion_needed: true,
        blood_units_needed: 2,
        priority: 'CRITICAL_EMERGENCY',
      }));
      setVitals({
        systolic_bp: 146,
        diastolic_bp: 96,
        heart_rate: 132,
        respiratory_rate: 32,
        temperature_f: 101.8,
        spo2: 94,
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        patient_name: 'Pallavi Tushar Sonawane',
        age: 22,
        blood_group: 'B+',
        primary_diagnosis: 'Prolonged Latent Phase of Labour in Primigravida',
        secondary_diagnosis: 'Cervix 2cm, membranes intact, reassuring fetal heart rate',
        referral_reason: 'Referred for active management of labour and continuous cardiotocography at first referral unit.',
        interventions_given: 'IV DNS running, maternal reassurance, vital sign monitoring',
        blood_transfusion_needed: false,
        blood_units_needed: 0,
        priority: 'STANDARD',
      }));
      setVitals({
        systolic_bp: 118,
        diastolic_bp: 76,
        heart_rate: 82,
        respiratory_rate: 16,
        temperature_f: 98.4,
        spo2: 99,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        vitals: vitals,
      };
      const res = await createReferral(payload);
      setCreatedReferral(res);
      if (onReferralCreated) {
        onReferralCreated(res);
      }
    } catch (err: any) {
      alert(`Error creating referral: ${err.message || 'Check input fields'}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16 pt-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-blue-100 dark:bg-blue-950 text-primary-600 rounded-2xl">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Smart Emergency Maternal Referral
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Frontline PHC / CHC Digital Clinical Handover with Real-Time MEOWS Scoring
            </p>
          </div>
        </div>

        {/* Quick Fill Preset Case Templates */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-slate-400 mr-1">Templates:</span>
          <button
            type="button"
            onClick={() => handleQuickCaseTemplate('pph')}
            className="px-3 py-1.5 bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-bold hover:bg-rose-200 transition-colors"
          >
            🩸 PPH Shock
          </button>
          <button
            type="button"
            onClick={() => handleQuickCaseTemplate('eclampsia')}
            className="px-3 py-1.5 bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 rounded-xl text-xs font-bold hover:bg-amber-200 transition-colors"
          >
            ⚡ Eclampsia
          </button>
          <button
            type="button"
            onClick={() => handleQuickCaseTemplate('obstructed')}
            className="px-3 py-1.5 bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 rounded-xl text-xs font-bold hover:bg-purple-200 transition-colors"
          >
            ⚠️ Obstructed
          </button>
          <button
            type="button"
            onClick={() => handleQuickCaseTemplate('stable')}
            className="px-3 py-1.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-bold hover:bg-emerald-200 transition-colors"
          >
            🌿 Standard
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT 7 COLS: PATIENT & CLINICAL FORM */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Patient Demographics & ABHA */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-950 text-primary-600 flex items-center justify-center text-xs font-bold">
                    1
                  </span>
                  Patient Demographics & Identification
                </h2>
                <span className="text-[11px] text-primary-600 font-bold">ABDM Ready</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    ABHA ID / Number (Optional)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.abha_id}
                      onChange={(e) => setFormData({ ...formData, abha_id: e.target.value })}
                      placeholder="e.g. 91-4829-1029-4821"
                      className="flex-1 px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyAbha}
                      disabled={verifyingAbha}
                      className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-600 flex items-center gap-1"
                    >
                      {verifyingAbha ? 'Verifying...' : abhaVerified ? '✓ Verified' : 'Verify'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Blood Group *
                  </label>
                  <select
                    value={formData.blood_group}
                    onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 font-bold"
                  >
                    {['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-', 'AB-'].map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Patient Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.patient_name}
                    onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Age (Years) *
                  </label>
                  <input
                    type="number"
                    required
                    min={14}
                    max={60}
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 20 })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Obstetric Index (Gravida / Para)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="G"
                      value={formData.gravida}
                      onChange={(e) => setFormData({ ...formData, gravida: parseInt(e.target.value) || 1 })}
                      className="w-1/2 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-center font-bold"
                    />
                    <input
                      type="number"
                      placeholder="P"
                      value={formData.para}
                      onChange={(e) => setFormData({ ...formData, para: parseInt(e.target.value) || 0 })}
                      className="w-1/2 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-center font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Destination Hospital */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-950 text-primary-600 flex items-center justify-center text-xs font-bold">
                    2
                  </span>
                  Destination Referral Hospital
                </h2>
                <span className="text-[11px] text-slate-400">Live Hospital Resources</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Select Receiving Facility *
                </label>
                {loadingHospitals ? (
                  <div className="text-xs text-slate-400">Loading hospitals...</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {hospitals.map((hosp) => {
                      const isSelected = formData.destination_hospital_id === hosp.id;
                      return (
                        <div
                          key={hosp.id}
                          onClick={() => setFormData({ ...formData, destination_hospital_id: hosp.id })}
                          className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'border-primary-600 bg-primary-50/60 dark:bg-primary-950/40 shadow-sm ring-2 ring-primary-500/20'
                              : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                              <Building2 className="w-4 h-4 text-primary-600 flex-shrink-0" />
                              <span className="line-clamp-1">{hosp.name}</span>
                            </div>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold flex-shrink-0">
                              {hosp.available_icu_beds} ICU
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{hosp.facility_type}</p>
                          <div className="text-[10px] text-slate-600 dark:text-slate-400 mt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-1.5">
                            <span>🩸 {hosp.blood_bank_status}</span>
                            <span className="font-bold text-primary-600">~22 min ETA</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Referring Medical Officer Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.referring_doctor_name}
                    onChange={(e) => setFormData({ ...formData, referring_doctor_name: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Referring Doctor Phone *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.referring_doctor_phone}
                    onChange={(e) => setFormData({ ...formData, referring_doctor_phone: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>

            {/* 3. Clinical Diagnosis & Emergency Interventions */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-950 text-primary-600 flex items-center justify-center text-xs font-bold">
                    3
                  </span>
                  Clinical Diagnosis & Reason for Transfer
                </h2>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Primary Maternal Emergency Diagnosis *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.primary_diagnosis}
                    onChange={(e) => setFormData({ ...formData, primary_diagnosis: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Clinical Referral Reason / Trigger *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={formData.referral_reason}
                    onChange={(e) => setFormData({ ...formData, referral_reason: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Emergency Interventions & Medications Administered
                  </label>
                  <textarea
                    rows={2}
                    value={formData.interventions_given}
                    onChange={(e) => setFormData({ ...formData, interventions_given: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 font-mono text-[11px] leading-relaxed"
                  />
                </div>

                <div className="flex items-center gap-4 pt-1">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.blood_transfusion_needed}
                      onChange={(e) => setFormData({ ...formData, blood_transfusion_needed: e.target.checked })}
                      className="w-4 h-4 text-primary-600 rounded"
                    />
                    <span>Blood Transfusion Standby Required</span>
                  </label>

                  {formData.blood_transfusion_needed && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">Units:</span>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={formData.blood_units_needed}
                        onChange={(e) => setFormData({ ...formData, blood_units_needed: parseInt(e.target.value) || 2 })}
                        className="w-16 px-2 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-center font-bold"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT 5 COLS: LIVE INTERACTIVE MEOWS SIDEBAR */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 sticky top-24">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-rose-500 animate-pulse" />
                  <h2 className="font-black text-sm text-slate-900 dark:text-white">
                    MEOWS Risk Engine
                  </h2>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 rounded-md">
                  Live Calculator
                </span>
              </div>

              {/* Vitals Input Controls */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Systolic BP (mmHg)
                  </label>
                  <input
                    type="number"
                    value={vitals.systolic_bp}
                    onChange={(e) => setVitals({ ...vitals, systolic_bp: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Diastolic BP (mmHg)
                  </label>
                  <input
                    type="number"
                    value={vitals.diastolic_bp}
                    onChange={(e) => setVitals({ ...vitals, diastolic_bp: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Heart Rate (bpm)
                  </label>
                  <input
                    type="number"
                    value={vitals.heart_rate}
                    onChange={(e) => setVitals({ ...vitals, heart_rate: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Resp Rate (/min)
                  </label>
                  <input
                    type="number"
                    value={vitals.respiratory_rate}
                    onChange={(e) => setVitals({ ...vitals, respiratory_rate: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Temperature (°F)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={vitals.temperature_f}
                    onChange={(e) => setVitals({ ...vitals, temperature_f: parseFloat(e.target.value) || 98.6 })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    SpO2 Saturation (%)
                  </label>
                  <input
                    type="number"
                    value={vitals.spo2}
                    onChange={(e) => setVitals({ ...vitals, spo2: parseInt(e.target.value) || 98 })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono font-bold"
                  />
                </div>
              </div>

              {/* Live MEOWS Result Badge & Rationale */}
              {meowsResult && (
                <div className="p-4 rounded-2xl border bg-slate-50/90 dark:bg-slate-850 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Calculated MEOWS:
                    </span>
                    <MEOWSBadge
                      riskLevel={meowsResult.risk_level}
                      score={meowsResult.total_score}
                      size="md"
                    />
                  </div>

                  {meowsResult.clinical_flags.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Flagged Deviations:
                      </span>
                      {meowsResult.clinical_flags.map((flag, idx) => (
                        <div key={idx} className="text-[11px] text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{flag}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="border-t border-slate-200 dark:border-slate-700 pt-2 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Clinical Action Directives:
                    </span>
                    <ul className="text-[11px] text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside">
                      {meowsResult.recommendations.slice(0, 3).map((rec, idx) => (
                        <li key={idx} className="line-clamp-1">{rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Submit Referral Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Transmitting Referral...' : 'Dispatch Referral & Alert Hospital'}</span>
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* CONFIRMATION / CREATED MODAL */}
      {createdReferral && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Emergency Referral Dispatched!
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Hospital notified via WebSockets. Ambulance assigned and en-route.
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Referral Code:</span>
                <strong className="font-mono text-slate-900 dark:text-white">{createdReferral.referral_code}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Patient:</span>
                <strong className="text-slate-900 dark:text-white">{createdReferral.patient.full_name} ({createdReferral.patient.blood_group})</strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">MEOWS Risk Level:</span>
                <MEOWSBadge riskLevel={createdReferral.risk_level} score={createdReferral.meows_score} size="sm" />
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Destination:</span>
                <span className="font-semibold text-primary-600">{createdReferral.destination_hospital?.name}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => generateReferralPDF(createdReferral)}
                className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export Handover PDF
              </button>

              <button
                onClick={() => {
                  setCreatedReferral(null);
                  if (onNavigateToDashboard) onNavigateToDashboard();
                }}
                className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow transition-colors"
              >
                <Navigation className="w-4 h-4" />
                Track on Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
