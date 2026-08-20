import React from 'react';
import { 
  HeartHandshake, ArrowRight, ShieldAlert, 
  Activity, Clock, Layers, Sparkles, 
  CheckCircle, FileText, Database, Radio,
  Stethoscope, Building2, Droplets, ChevronRight
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (tab: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-16 pb-20 pt-4">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-16 px-6 sm:px-10 lg:px-12 bg-gradient-to-b from-blue-50/80 via-white to-slate-50 dark:from-slate-900/90 dark:via-slate-900 dark:to-slate-950 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        {/* Glow backdrop */}
        <div className="absolute -top-24 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold tracking-wide shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>NATIONAL MATERNAL HEALTH NETWORK • EMERGENCY REFERRAL PLATFORM</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.15]">
            Smart Emergency Inter-Facility Transfer System
          </h1>

          <p className="text-lg sm:text-xl font-bold text-primary-600 dark:text-primary-400 max-w-2xl mx-auto italic">
            "Ensuring patient information reaches before the patient."
          </p>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Eliminating the critical <strong>Third Delay</strong> in maternal emergencies. Frontline health workers log vitals to trigger real-time <strong>MEOWS Risk Assessment</strong>, giving referral hospitals advance notice to prepare ICU beds, blood crossmatches, and specialists before the ambulance arrives.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <button
              onClick={() => onNavigate('hospital')}
              className="px-6 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              <span>Launch Hospital Readiness Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('new-referral')}
              className="px-6 py-3.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-900 dark:text-white font-bold text-xs sm:text-sm rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all"
            >
              <span>Initiate Emergency Referral</span>
            </button>

            <button
              onClick={() => onNavigate('ambulance')}
              className="px-5 py-3.5 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs sm:text-sm rounded-2xl border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1.5"
            >
              <span>Live Transit GPS</span>
            </button>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 max-w-3xl mx-auto">
            <div className="p-4 bg-white/90 dark:bg-slate-850/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-primary-600">23.8 min</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-1">Prep Lead Time Gained</div>
            </div>
            <div className="p-4 bg-white/90 dark:bg-slate-850/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">100%</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-1">Rule-Based MEOWS</div>
            </div>
            <div className="p-4 bg-white/90 dark:bg-slate-850/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-indigo-600">FHIR R4</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-1">ABDM Ecosystem Standard</div>
            </div>
            <div className="p-4 bg-white/90 dark:bg-slate-850/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-rose-600">&lt; 2 sec</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-1">WebSocket Alert Latency</div>
            </div>
          </div>
        </div>
      </section>

      {/* THE 3 DELAYS BREAKDOWN */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            The Maternal Emergency Problem
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Maternal mortality during emergency transfers is governed by the recognized <strong>Three Delays Model</strong>. SETU-IFT directly eliminates the third, most dangerous delay.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center justify-center font-extrabold text-sm">
              1
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Delay in Decision to Seek Care</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Family hesitation recognizing danger signs (convulsions, excessive bleeding) early in labour.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center justify-center font-extrabold text-sm">
              2
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Delay in Reaching Facility</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Road travel distances and ambulance transit times between rural health centres and tertiary hospitals.
            </p>
          </div>

          <div className="p-6 bg-rose-50 dark:bg-rose-950/40 rounded-3xl border-2 border-rose-400/80 dark:border-rose-800 shadow-md space-y-3 relative">
            <div className="w-10 h-10 rounded-2xl bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200 flex items-center justify-center font-extrabold text-sm">
              3
            </div>
            <h3 className="font-bold text-base text-rose-950 dark:text-rose-200">
              Delay in Receiving Care Once at Hospital
            </h3>
            <p className="text-xs text-rose-900/80 dark:text-rose-300 leading-relaxed">
              <strong>The Scramble Gap:</strong> Patient arrives without advance warning. Emergency teams only begin crossmatching blood, reserving ICU beds, and mobilizing specialists <em>after arrival</em>.
            </p>
          </div>
        </div>
      </section>

      {/* BEFORE VS AFTER WORKFLOW */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Workflow Transformation
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Converting a phone-call-dependent process into an automated clinical handover.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Legacy Process */}
          <div className="p-6 bg-slate-100/70 dark:bg-slate-850/80 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
              <ShieldAlert className="w-4 h-4" />
              <span>Current Status Quo (Reactive)</span>
            </div>
            <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                1. Rural clinic detects emergency complication (e.g. severe PPH)
              </div>
              <div className="text-center text-slate-400 text-[11px]">↓ Informal phone call (often unanswered)</div>
              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                2. Ambulance departs with handwritten paper slip only
              </div>
              <div className="text-center text-slate-400 text-[11px]">↓ Zero hospital advance notice</div>
              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                3. Patient arrives; triage assessment starts from ground zero
              </div>
              <div className="text-center text-rose-600 font-bold text-xs pt-1">
                ⚠️ 30-45 minutes lost during critical golden hour
              </div>
            </div>
          </div>

          {/* SETU-IFT Process */}
          <div className="p-6 bg-blue-50/70 dark:bg-blue-950/40 rounded-3xl border-2 border-primary-500/80 shadow-md space-y-4">
            <div className="flex items-center gap-2 text-primary-700 dark:text-primary-300 font-bold text-sm">
              <CheckCircle className="w-4 h-4 text-primary-600" />
              <span>SETU-IFT Proactive Transfer</span>
            </div>
            <div className="space-y-2.5 text-xs text-slate-800 dark:text-slate-200">
              <div className="p-3 bg-white dark:bg-slate-850 rounded-xl border border-blue-200 dark:border-blue-800 shadow-sm">
                1. Vitals entered → <strong>MEOWS Risk Engine</strong> auto-scores severity
              </div>
              <div className="text-center text-primary-600 font-bold text-[11px]">⚡ Sub-second WebSocket broadcast</div>
              <div className="p-3 bg-white dark:bg-slate-850 rounded-xl border border-blue-200 dark:border-blue-800 shadow-sm">
                2. Receiving hospital pre-stages ICU, Blood Bank, OT & Specialists in parallel
              </div>
              <div className="text-center text-primary-600 font-bold text-[11px]">🚑 EMT logs en-route transit vitals</div>
              <div className="p-3 bg-white dark:bg-slate-850 rounded-xl border border-blue-200 dark:border-blue-800 shadow-sm">
                3. Patient arrives: Blood ready, OBGYN scrubbed in, treatment starts immediately
              </div>
              <div className="text-center text-emerald-600 font-bold text-xs pt-1">
                ✅ Zero Scramble Time Achieved
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE CAPABILITIES GRID */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            System Capabilities
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Engineered for high reliability, clinical clarity, and rapid execution.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div 
            onClick={() => onNavigate('new-referral')}
            className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-primary-500 cursor-pointer transition-all shadow-sm group"
          >
            <div className="p-3 bg-blue-100 dark:bg-blue-950 text-blue-600 rounded-2xl w-fit mb-3 group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Smart Referral Entry</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              Standardized digital capture of patient demographics, diagnosis, interventions, and destination capacity.
            </p>
          </div>

          <div 
            onClick={() => onNavigate('new-referral')}
            className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-primary-500 cursor-pointer transition-all shadow-sm group"
          >
            <div className="p-3 bg-rose-100 dark:bg-rose-950 text-rose-600 rounded-2xl w-fit mb-3 group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">MEOWS Scoring Engine</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              Rule-based calculation scoring 5 key vitals into Low, Medium, and High Risk tiers with action directives.
            </p>
          </div>

          <div 
            onClick={() => onNavigate('hospital')}
            className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-primary-500 cursor-pointer transition-all shadow-sm group"
          >
            <div className="p-3 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 rounded-2xl w-fit mb-3 group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Hospital Readiness Matrix</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              5-point parallel preparation checklist (ICU, Blood Bank, Specialist, OT, Medications) with real-time sync.
            </p>
          </div>

          <div 
            onClick={() => onNavigate('ambulance')}
            className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-primary-500 cursor-pointer transition-all shadow-sm group"
          >
            <div className="p-3 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-2xl w-fit mb-3 group-hover:scale-105 transition-transform">
              <Radio className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Live GPS & En-Route Vitals</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              Real-time map tracking with EMT transit observation logging that triggers alarms on vital deterioration.
            </p>
          </div>

          <div 
            onClick={() => onNavigate('analytics')}
            className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-primary-500 cursor-pointer transition-all shadow-sm group"
          >
            <div className="p-3 bg-purple-100 dark:bg-purple-950 text-purple-600 rounded-2xl w-fit mb-3 group-hover:scale-105 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Health Mission Analytics</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              Comprehensive district dashboard tracking referral trends, time savings, and clinical preparedness.
            </p>
          </div>

          <div 
            onClick={() => onNavigate('abdm')}
            className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-primary-500 cursor-pointer transition-all shadow-sm group"
          >
            <div className="p-3 bg-teal-100 dark:bg-teal-950 text-teal-600 rounded-2xl w-fit mb-3 group-hover:scale-105 transition-transform">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">ABDM & FHIR Interoperability</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              ABHA ID verification simulation, HL7 FHIR R4 Bundle generation, and DPDP-aligned consent architecture.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
