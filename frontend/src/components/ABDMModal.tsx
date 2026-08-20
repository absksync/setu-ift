import React, { useState } from 'react';
import { verifyABHA, fetchFhirBundle, requestABDMConsent } from '../services/api';
import { ABHAVerifyResult } from '../types';
import { ShieldCheck, CheckCircle2, FileCode, Lock, Key, Copy, Check } from 'lucide-react';

interface ABDMModalProps {
  initialAbhaId?: string;
  referralId?: number;
  onClose?: () => void;
}

export const ABDMModal: React.FC<ABDMModalProps> = ({
  initialAbhaId = '91-4829-1029-4821',
  referralId = 1,
  onClose,
}) => {
  const [abhaInput, setAbhaInput] = useState<string>(initialAbhaId);
  const [loading, setLoading] = useState<boolean>(false);
  const [verifyResult, setVerifyResult] = useState<ABHAVerifyResult | null>(null);
  const [fhirBundle, setFhirBundle] = useState<any | null>(null);
  const [consentData, setConsentData] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'verify' | 'fhir' | 'consent'>('verify');
  const [copied, setCopied] = useState<boolean>(false);

  const handleVerify = async () => {
    try {
      setLoading(true);
      const res = await verifyABHA(abhaInput);
      setVerifyResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchFhir = async () => {
    try {
      setLoading(true);
      const res = await fetchFhirBundle(referralId);
      setFhirBundle(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleGrantConsent = async () => {
    try {
      setLoading(true);
      const res = await requestABDMConsent(abhaInput, 'HIU-SGH-PUNE', 'HIP-PHC-CHAKAN');
      setConsentData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const copyFhirJson = () => {
    if (!fhirBundle) return;
    navigator.clipboard.writeText(JSON.stringify(fhirBundle, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden">
      {/* ABDM Header banner */}
      <div className="p-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-xl">
            <ShieldCheck className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base">ABDM Ecosystem Gateway</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                PROTOTYPE SIMULATION
              </span>
            </div>
            <p className="text-xs text-slate-300">
              National Digital Health Mission Interoperability Engine (M1 & M2 Ready)
            </p>
          </div>
        </div>
        {onClose && (
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-white text-sm font-semibold p-1"
          >
            ✕
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 px-4 pt-2 gap-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('verify')}
          className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
            activeTab === 'verify'
              ? 'border-primary-600 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Key className="w-4 h-4" />
          ABHA ID Verification
        </button>
        <button
          onClick={() => {
            setActiveTab('fhir');
            if (!fhirBundle) handleFetchFhir();
          }}
          className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
            activeTab === 'fhir'
              ? 'border-primary-600 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FileCode className="w-4 h-4" />
          FHIR R4 Bundle
        </button>
        <button
          onClick={() => setActiveTab('consent')}
          className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
            activeTab === 'consent'
              ? 'border-primary-600 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Lock className="w-4 h-4" />
          Consent Management
        </button>
      </div>

      {/* Tab Contents */}
      <div className="p-5">
        {activeTab === 'verify' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Ayushman Bharat Health Account (ABHA ID / Number)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={abhaInput}
                  onChange={(e) => setAbhaInput(e.target.value)}
                  placeholder="e.g. 91-4829-1029-4821"
                  className="flex-1 px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 font-mono"
                />
                <button
                  onClick={handleVerify}
                  disabled={loading}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold rounded-xl shadow transition-colors flex items-center gap-1.5"
                >
                  {loading ? 'Verifying...' : 'Verify Sandbox'}
                </button>
              </div>
            </div>

            {verifyResult && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>ABHA Verified via Mock Gateway</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100 rounded font-mono font-semibold">
                    KYC: {verifyResult.kyc_status}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <div className="bg-white/80 dark:bg-slate-850 p-2.5 rounded-lg border border-emerald-100 dark:border-emerald-900">
                    <span className="text-slate-400 text-[10px] block">Patient Name</span>
                    <strong className="text-slate-900 dark:text-white">{verifyResult.name}</strong>
                  </div>
                  <div className="bg-white/80 dark:bg-slate-850 p-2.5 rounded-lg border border-emerald-100 dark:border-emerald-900">
                    <span className="text-slate-400 text-[10px] block">ABHA Address</span>
                    <strong className="text-slate-900 dark:text-white font-mono text-[11px]">{verifyResult.abha_address}</strong>
                  </div>
                  <div className="bg-white/80 dark:bg-slate-850 p-2.5 rounded-lg border border-emerald-100 dark:border-emerald-900">
                    <span className="text-slate-400 text-[10px] block">Mobile / Gender</span>
                    <strong className="text-slate-900 dark:text-white">{verifyResult.gender}, {verifyResult.dob}</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'fhir' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-600 dark:text-slate-400">
                HL7 FHIR R4 Document Bundle (Composition, Patient, Condition, MEOWS Observation)
              </span>
              <button
                onClick={copyFhirJson}
                className="px-2.5 py-1 text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300 flex items-center gap-1 font-medium transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy JSON'}
              </button>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl text-emerald-400 font-mono text-[11px] max-h-72 overflow-y-auto border border-slate-800">
              {loading ? (
                <div className="text-slate-400">Generating FHIR R4 Bundle...</div>
              ) : fhirBundle ? (
                <pre>{JSON.stringify(fhirBundle, null, 2)}</pre>
              ) : (
                <div className="text-slate-500">Click fetch to view bundle</div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'consent' && (
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl text-xs space-y-1">
              <div className="font-bold text-blue-900 dark:text-blue-300">
                ABDM Emergency Consent Exemption & Override Protocol
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                Under Section 4(2) of the Digital Personal Data Protection (DPDP) Act and ABDM emergency care guidelines, instant consent is auto-delegated for emergency obstetric transfer.
              </p>
            </div>

            <button
              onClick={handleGrantConsent}
              disabled={loading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow transition-colors"
            >
              {loading ? 'Processing...' : 'Simulate Consent Artifact Creation'}
            </button>

            {consentData && (
              <div className="p-3.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Consent ID: {consentData.consent_id}
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold rounded text-[10px]">
                    {consentData.status}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400">
                  <div><strong>Scope:</strong> {consentData.data_range_accessible}</div>
                  <div><strong>Authorized:</strong> {consentData.authorized_clinicians?.join(', ')}</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
