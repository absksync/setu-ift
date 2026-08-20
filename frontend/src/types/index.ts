export type UserRole = 
  | 'RURAL_HEALTH_WORKER' 
  | 'AMBULANCE_STAFF' 
  | 'HOSPITAL_STAFF' 
  | 'ADMINISTRATOR';

export interface VitalsInput {
  systolic_bp: number;
  diastolic_bp: number;
  heart_rate: number;
  respiratory_rate: number;
  temperature_f: number;
  spo2: number;
}

export interface MEOWSResult {
  total_score: number;
  risk_level: 'LOW RISK' | 'MEDIUM RISK' | 'HIGH RISK';
  risk_color: string;
  score_details: Record<string, { value: number; score: number }>;
  clinical_flags: string[];
  clinical_reason: string;
  recommendations: string[];
  red_flags_count: number;
  yellow_flags_count: number;
}

export interface Patient {
  id: number;
  full_name: string;
  age: number;
  abha_id?: string;
  blood_group: string;
  gravida: number;
  para: number;
  gestational_age_weeks: number;
  contact_phone?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  village_town?: string;
  created_at: string;
}

export interface Hospital {
  id: number;
  name: string;
  facility_type: string;
  code: string;
  latitude: number;
  longitude: number;
  phone: string;
  address: string;
  district: string;
  state: string;
  total_icu_beds: number;
  available_icu_beds: number;
  blood_bank_status: string;
  available_blood_units: string;
  on_duty_obstetrician: string;
  on_duty_anesthetist: string;
}

export interface Ambulance {
  id: number;
  vehicle_number: string;
  vehicle_type: string;
  driver_name: string;
  driver_phone: string;
  emt_name: string;
  current_lat: number;
  current_lng: number;
  bearing: number;
  speed_kmh: number;
  status: 'AVAILABLE' | 'EN_ROUTE' | 'AT_HOSPITAL' | 'RETURNING';
}

export interface VitalsLog {
  id: number;
  referral_id: number;
  recorded_at: string;
  recorded_by: string;
  location_type: string;
  systolic_bp: number;
  diastolic_bp: number;
  heart_rate: number;
  respiratory_rate: number;
  temperature_f: number;
  spo2: number;
  meows_score: number;
  risk_level: string;
  notes?: string;
}

export interface ReadinessChecklist {
  id: number;
  referral_id: number;
  icu_prepared: boolean;
  icu_bed_number?: string;
  icu_prepared_at?: string;
  blood_prepared: boolean;
  blood_units_reserved: number;
  blood_prepared_at?: string;
  specialist_alerted: boolean;
  specialist_name?: string;
  specialist_alerted_at?: string;
  ot_prepared: boolean;
  ot_number?: string;
  ot_prepared_at?: string;
  medication_prepared: boolean;
  medication_kit_code?: string;
  medication_prepared_at?: string;
  all_prepared: boolean;
  last_updated_by?: string;
}

export interface Referral {
  id: number;
  referral_code: string;
  patient_id: number;
  patient: Patient;
  referring_facility_name: string;
  referring_facility_type: string;
  referring_doctor_name: string;
  referring_doctor_phone: string;
  destination_hospital_id: number;
  destination_hospital?: Hospital;
  ambulance_id?: number;
  ambulance?: Ambulance;
  
  primary_diagnosis: string;
  secondary_diagnosis?: string;
  referral_reason: string;
  
  meows_score: number;
  risk_level: 'LOW RISK' | 'MEDIUM RISK' | 'HIGH RISK';
  risk_color: string;
  clinical_summary?: string;
  meows_recommendation?: string;
  priority: string;
  status: 'CREATED' | 'DISPATCHED' | 'EN_ROUTE' | 'ARRIVED' | 'IN_SURGERY' | 'TREATMENT_STARTED' | 'COMPLETED';
  
  interventions_given: string;
  blood_transfusion_needed: boolean;
  blood_units_needed: number;
  
  estimated_time_minutes: number;
  distance_km: number;
  origin_lat: number;
  origin_lng: number;
  
  created_at: string;
  updated_at: string;
  arrived_at?: string;
  treatment_started_at?: string;
  
  vitals_history: VitalsLog[];
  readiness?: ReadinessChecklist;
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  category: string;
  risk_level: string;
  referral_id?: number;
  referral_code?: string;
  created_at: string;
  is_read: boolean;
}

export interface AnalyticsData {
  metrics: {
    total_referrals: number;
    high_risk_cases: number;
    medium_risk_cases: number;
    low_risk_cases: number;
    avg_preparation_lead_time_min: number;
    avg_transit_duration_min: number;
    overall_preparedness_rate: string;
    blood_readiness_rate: string;
    icu_readiness_rate: string;
    specialist_alert_rate: string;
  };
  risk_distribution: { name: string; value: number; color: string }[];
  diagnosis_distribution: { name: string; count: number; percentage: number }[];
  weekly_trends: { day: string; total: number; high_risk: number; avg_lead_mins: number }[];
  hospital_performance: {
    id: number;
    name: string;
    facility_type: string;
    district: string;
    total_received: number;
    high_risk_received: number;
    available_icu: number;
    avg_prep_time_minutes: number;
    compliance_rate: string;
  }[];
  recent_activity: NotificationItem[];
}

export interface ABHAVerifyResult {
  verified: boolean;
  abha_id: string;
  abha_address: string;
  name: string;
  gender: string;
  dob: string;
  mobile: string;
  kyc_status: string;
  linked_records_count: number;
  message: string;
}
