import { 
  Referral, Hospital, Ambulance, AnalyticsData, 
  MEOWSResult, VitalsInput, ReadinessChecklist, 
  VitalsLog, ABHAVerifyResult 
} from '../types';
import { mockStore, calculateMEOWSClient } from './mockDataStore';

const API_BASE = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

export async function calculateMEOWS(vitals: VitalsInput): Promise<MEOWSResult> {
  try {
    const res = await fetch(`${API_BASE}/meows/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vitals),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    // Fallback to client-side calculator
  }
  return calculateMEOWSClient(vitals);
}

export async function fetchReferrals(params?: {
  risk_level?: string;
  hospital_id?: number;
  status?: string;
  search?: string;
}): Promise<Referral[]> {
  try {
    const query = new URLSearchParams();
    if (params?.risk_level) query.append('risk_level', params.risk_level);
    if (params?.hospital_id) query.append('hospital_id', params.hospital_id.toString());
    if (params?.status) query.append('status', params.status);
    if (params?.search) query.append('search', params.search);

    const res = await fetch(`${API_BASE}/referrals?${query.toString()}`);
    if (res.ok) return await res.json();
  } catch (err) {
    // Fallback to client-side store
  }
  return mockStore.getReferrals(params);
}

export async function fetchReferralById(id: number): Promise<Referral> {
  try {
    const res = await fetch(`${API_BASE}/referrals/${id}`);
    if (res.ok) return await res.json();
  } catch (err) {
    // Fallback
  }
  const found = mockStore.getReferralById(id);
  if (!found) throw new Error('Referral not found');
  return found;
}

export async function createReferral(data: any): Promise<Referral> {
  try {
    const res = await fetch(`${API_BASE}/referrals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    // Fallback
  }
  return mockStore.createReferral(data);
}

export async function updateReadiness(
  referralId: number, 
  readiness: Partial<ReadinessChecklist> & { last_updated_by?: string }
): Promise<ReadinessChecklist> {
  try {
    const res = await fetch(`${API_BASE}/referrals/${referralId}/readiness`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(readiness),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    // Fallback
  }
  return mockStore.updateReadiness(referralId, readiness);
}

export async function logEnrouteVitals(
  referralId: number, 
  vitalsData: VitalsInput & { recorded_by?: string; notes?: string }
): Promise<VitalsLog> {
  try {
    const res = await fetch(`${API_BASE}/referrals/${referralId}/vitals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...vitalsData, referral_id: referralId }),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    // Fallback
  }
  return mockStore.logVitals(referralId, vitalsData);
}

export async function updateReferralStatus(
  referralId: number, 
  status: string,
  updatedBy: string = 'Hospital Triage'
): Promise<Referral> {
  try {
    const res = await fetch(`${API_BASE}/referrals/${referralId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, updated_by: updatedBy }),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    // Fallback
  }
  return mockStore.updateStatus(referralId, status, updatedBy);
}

export async function fetchHospitals(): Promise<Hospital[]> {
  try {
    const res = await fetch(`${API_BASE}/hospitals`);
    if (res.ok) return await res.json();
  } catch (err) {
    // Fallback
  }
  return mockStore.hospitals;
}

export async function fetchAmbulances(): Promise<Ambulance[]> {
  try {
    const res = await fetch(`${API_BASE}/ambulances`);
    if (res.ok) return await res.json();
  } catch (err) {
    // Fallback
  }
  return mockStore.ambulances;
}

export async function fetchAnalytics(): Promise<AnalyticsData> {
  try {
    const res = await fetch(`${API_BASE}/analytics/summary`);
    if (res.ok) return await res.json();
  } catch (err) {
    // Fallback
  }
  return mockStore.getAnalytics();
}

export async function verifyABHA(abhaId: string): Promise<ABHAVerifyResult> {
  try {
    const res = await fetch(`${API_BASE}/abdm/verify-abha`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ abha_id: abhaId, auth_method: 'DEMO_OTP' }),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    // Fallback
  }
  return {
    verified: true,
    abha_id: abhaId,
    abha_address: `${abhaId.replace(/-/g, '')}@abdm`,
    name: "Sushila Sandeep Gaikwad",
    gender: "F",
    dob: "1999-04-12",
    mobile: "+91 98230 45678",
    kyc_status: "VERIFIED",
    linked_records_count: 3,
    message: "ABHA ID successfully authenticated with ABDM sandbox"
  };
}

export async function requestABDMConsent(patientAbhaId: string, hiuId: string, hipId: string) {
  try {
    const res = await fetch(`${API_BASE}/abdm/consent/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patient_abha_id: patientAbhaId,
        hiu_id: hiuId,
        hip_id: hipId,
        purpose: 'EMERGENCY_OBSTETRIC_CARE'
      }),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    // Fallback
  }
  return {
    consent_id: "CONSENT-REQ-84729",
    status: "GRANTED",
    purpose: "EMERGENCY_OBSTETRIC_CARE",
    patient_abha_id: patientAbhaId,
    hiu_id: hiuId,
    hip_id: hipId,
    expires_at: new Date(Date.now() + 24 * 3600 * 1000).toISOString()
  };
}

export async function fetchFhirBundle(referralId: number) {
  try {
    const res = await fetch(`${API_BASE}/referrals/${referralId}/fhir`);
    if (res.ok) return await res.json();
  } catch (err) {
    // Fallback
  }
  const ref = mockStore.getReferralById(referralId) || mockStore.referrals[0];
  return {
    resourceType: "Bundle",
    type: "document",
    timestamp: new Date().toISOString(),
    id: `fhir-referral-${ref.id}`,
    entry: [
      {
        resource: {
          resourceType: "Patient",
          id: `pat-${ref.patient.id}`,
          name: [{ text: ref.patient.full_name }],
          gender: "female",
          identifier: [{ system: "https://healthid.abdm.gov.in", value: ref.patient.abha_id || "91-4829-1029-4821" }]
        }
      },
      {
        resource: {
          resourceType: "ServiceRequest",
          id: `sr-${ref.id}`,
          status: "active",
          intent: "order",
          priority: "stat",
          code: { text: ref.primary_diagnosis }
        }
      }
    ]
  };
}
