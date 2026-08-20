import { 
  Referral, Hospital, Ambulance, AnalyticsData, 
  MEOWSResult, VitalsInput, ReadinessChecklist, 
  VitalsLog, ABHAVerifyResult 
} from '../types';

const API_BASE = '/api';

export async function calculateMEOWS(vitals: VitalsInput): Promise<MEOWSResult> {
  const res = await fetch(`${API_BASE}/meows/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(vitals),
  });
  if (!res.ok) throw new Error('Failed to compute MEOWS score');
  return res.json();
}

export async function fetchReferrals(params?: {
  risk_level?: string;
  hospital_id?: number;
  status?: string;
  search?: string;
}): Promise<Referral[]> {
  const query = new URLSearchParams();
  if (params?.risk_level) query.append('risk_level', params.risk_level);
  if (params?.hospital_id) query.append('hospital_id', params.hospital_id.toString());
  if (params?.status) query.append('status', params.status);
  if (params?.search) query.append('search', params.search);

  const res = await fetch(`${API_BASE}/referrals?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch referrals');
  return res.json();
}

export async function fetchReferralById(id: number): Promise<Referral> {
  const res = await fetch(`${API_BASE}/referrals/${id}`);
  if (!res.ok) throw new Error('Failed to fetch referral details');
  return res.json();
}

export async function createReferral(data: any): Promise<Referral> {
  const res = await fetch(`${API_BASE}/referrals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Failed to create referral');
  }
  return res.json();
}

export async function updateReadiness(
  referralId: number, 
  readiness: Partial<ReadinessChecklist> & { last_updated_by?: string }
): Promise<ReadinessChecklist> {
  const res = await fetch(`${API_BASE}/referrals/${referralId}/readiness`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(readiness),
  });
  if (!res.ok) throw new Error('Failed to update hospital readiness');
  return res.json();
}

export async function logEnrouteVitals(
  referralId: number, 
  vitalsData: VitalsInput & { recorded_by?: string; notes?: string }
): Promise<VitalsLog> {
  const res = await fetch(`${API_BASE}/referrals/${referralId}/vitals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...vitalsData, referral_id: referralId }),
  });
  if (!res.ok) throw new Error('Failed to submit en-route vitals');
  return res.json();
}

export async function updateReferralStatus(
  referralId: number, 
  status: string,
  updatedBy: string = 'Hospital Triage'
): Promise<Referral> {
  const res = await fetch(`${API_BASE}/referrals/${referralId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, updated_by: updatedBy }),
  });
  if (!res.ok) throw new Error('Failed to update referral status');
  return res.json();
}

export async function fetchHospitals(): Promise<Hospital[]> {
  const res = await fetch(`${API_BASE}/hospitals`);
  if (!res.ok) throw new Error('Failed to fetch hospitals');
  return res.json();
}

export async function fetchAmbulances(): Promise<Ambulance[]> {
  const res = await fetch(`${API_BASE}/ambulances`);
  if (!res.ok) throw new Error('Failed to fetch ambulances');
  return res.json();
}

export async function fetchAnalytics(): Promise<AnalyticsData> {
  const res = await fetch(`${API_BASE}/analytics/summary`);
  if (!res.ok) throw new Error('Failed to fetch analytics');
  return res.json();
}

export async function verifyABHA(abhaId: string): Promise<ABHAVerifyResult> {
  const res = await fetch(`${API_BASE}/abdm/verify-abha`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ abha_id: abhaId, auth_method: 'DEMO_OTP' }),
  });
  if (!res.ok) throw new Error('ABHA verification failed');
  return res.json();
}

export async function requestABDMConsent(patientAbhaId: string, hiuId: string, hipId: string) {
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
  if (!res.ok) throw new Error('Consent request failed');
  return res.json();
}

export async function fetchFhirBundle(referralId: number) {
  const res = await fetch(`${API_BASE}/referrals/${referralId}/fhir`);
  if (!res.ok) throw new Error('Failed to fetch FHIR bundle');
  return res.json();
}
