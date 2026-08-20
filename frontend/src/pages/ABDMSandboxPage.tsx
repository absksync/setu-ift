import React, { useState } from 'react';
import { ABDMModal } from '../components/ABDMModal';
import { ShieldCheck, Database, Key, Lock, FileCode, CheckCircle, Network, Layers } from 'lucide-react';

export const ABDMSandboxPage: React.FC = () => {
  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-teal-100 dark:bg-teal-950 text-teal-600 rounded-xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                ABDM National Health Ecosystem Sandbox
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
                PROTOTYPE SIMULATION
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Interoperability sandbox simulating ABHA ID integration, FHIR R4 transfer records, and consent flows.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300">
            Gateway: ABDM-M2-Ready
          </span>
        </div>
      </div>

      {/* Main Interactive ABDM Component */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <ABDMModal initialAbhaId="91-4829-1029-4821" referralId={1} />
        </div>

        {/* ABDM Architecture Building Blocks Educational Card */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <Network className="w-4 h-4 text-teal-600" />
              ABDM Building Blocks in SETU-IFT
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl space-y-1">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-blue-500" />
                  ABHA (Health ID)
                </div>
                <p className="text-slate-500 text-[11px]">
                  Unique 14-digit identifier linking mother's antenatal and emergency referral records permanently.
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl space-y-1">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <FileCode className="w-3.5 h-3.5 text-rose-500" />
                  FHIR R4 Format
                </div>
                <p className="text-slate-500 text-[11px]">
                  Standardized JSON bundle structure ensuring vital signs & MEOWS scores parse seamlessly into hospital EMRs.
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl space-y-1">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-emerald-500" />
                  HIP & HIU Roles
                </div>
                <p className="text-slate-500 text-[11px]">
                  Rural Clinic acts as Health Info Provider (HIP); Receiving Hospital acts as Health Info User (HIU).
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl space-y-1">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-purple-500" />
                  Consent Exemption in Emergencies
                </div>
                <p className="text-slate-500 text-[11px]">
                  Aligns with India's DPDP Act Section 4(2) enabling instant data sharing during life-threatening obstetric transfers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
