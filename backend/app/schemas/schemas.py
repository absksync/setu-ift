from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

# --- MEOWS Schemas ---
class VitalsInput(BaseModel):
    systolic_bp: int = Field(..., ge=40, le=260, description="Systolic Blood Pressure (mmHg)")
    diastolic_bp: int = Field(..., ge=20, le=180, description="Diastolic Blood Pressure (mmHg)")
    heart_rate: int = Field(..., ge=30, le=220, description="Heart Rate (bpm)")
    respiratory_rate: int = Field(..., ge=5, le=60, description="Respiratory Rate (breaths/min)")
    temperature_f: float = Field(..., ge=90.0, le=110.0, description="Temperature in °F")
    spo2: int = Field(..., ge=50, le=100, description="Oxygen Saturation (%)")

class MEOWSResponse(BaseModel):
    total_score: int
    risk_level: str
    risk_color: str
    score_details: Dict[str, Any]
    clinical_flags: List[str]
    clinical_reason: str
    recommendations: List[str]
    red_flags_count: int
    yellow_flags_count: int

# --- Patient Schemas ---
class PatientBase(BaseModel):
    full_name: str
    age: int
    abha_id: Optional[str] = None
    blood_group: str
    gravida: int = 1
    para: int = 0
    gestational_age_weeks: int = 36
    contact_phone: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    village_town: Optional[str] = "Khed Taluka"

class PatientCreate(PatientBase):
    pass

class PatientResponse(PatientBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

# --- Vitals Log Schemas ---
class VitalsLogCreate(VitalsInput):
    referral_id: int
    recorded_by: Optional[str] = "Frontline EMT"
    location_type: Optional[str] = "AMBULANCE_TRANSIT"
    notes: Optional[str] = None

class VitalsLogResponse(BaseModel):
    id: int
    referral_id: int
    recorded_at: datetime
    recorded_by: str
    location_type: str
    systolic_bp: int
    diastolic_bp: int
    heart_rate: int
    respiratory_rate: int
    temperature_f: float
    spo2: int
    meows_score: int
    risk_level: str
    notes: Optional[str]
    class Config:
        from_attributes = True

# --- Readiness Schemas ---
class ReadinessUpdate(BaseModel):
    icu_prepared: Optional[bool] = None
    blood_prepared: Optional[bool] = None
    specialist_alerted: Optional[bool] = None
    ot_prepared: Optional[bool] = None
    medication_prepared: Optional[bool] = None
    notes: Optional[str] = None
    last_updated_by: Optional[str] = "Triage Staff"

class ReadinessResponse(BaseModel):
    id: int
    referral_id: int
    icu_prepared: bool
    icu_bed_number: Optional[str]
    icu_prepared_at: Optional[datetime]
    blood_prepared: bool
    blood_units_reserved: int
    blood_prepared_at: Optional[datetime]
    specialist_alerted: bool
    specialist_name: Optional[str]
    specialist_alerted_at: Optional[datetime]
    ot_prepared: bool
    ot_number: Optional[str]
    ot_prepared_at: Optional[datetime]
    medication_prepared: bool
    medication_kit_code: Optional[str]
    medication_prepared_at: Optional[datetime]
    all_prepared: bool
    last_updated_by: Optional[str]
    class Config:
        from_attributes = True

# --- Hospital & Ambulance Schemas ---
class HospitalResponse(BaseModel):
    id: int
    name: str
    facility_type: str
    code: str
    latitude: float
    longitude: float
    phone: str
    address: str
    district: str
    state: str
    total_icu_beds: int
    available_icu_beds: int
    blood_bank_status: str
    available_blood_units: str
    on_duty_obstetrician: str
    on_duty_anesthetist: str
    class Config:
        from_attributes = True

class AmbulanceResponse(BaseModel):
    id: int
    vehicle_number: str
    vehicle_type: str
    driver_name: str
    driver_phone: str
    emt_name: str
    current_lat: float
    current_lng: float
    bearing: float
    speed_kmh: float
    status: str
    class Config:
        from_attributes = True

# --- Referral Schemas ---
class ReferralCreate(BaseModel):
    # Patient info
    patient_name: str
    age: int
    abha_id: Optional[str] = None
    blood_group: str
    gravida: int = 1
    para: int = 0
    gestational_age_weeks: int = 36
    contact_phone: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    village_town: Optional[str] = "Rural Clinic Area"
    
    # Facility & Doctor info
    referring_facility_name: str
    referring_facility_type: str = "PHC"
    referring_doctor_name: str
    referring_doctor_phone: str
    destination_hospital_id: int
    ambulance_id: Optional[int] = None
    
    # Clinical details
    primary_diagnosis: str
    secondary_diagnosis: Optional[str] = None
    referral_reason: str
    interventions_given: Optional[str] = ""
    blood_transfusion_needed: bool = False
    blood_units_needed: int = 0
    priority: str = "URGENT"
    
    # Initial Vitals for MEOWS calculation
    vitals: VitalsInput

class ReferralStatusUpdate(BaseModel):
    status: str # CREATED, DISPATCHED, EN_ROUTE, ARRIVED, IN_SURGERY, TREATMENT_STARTED, COMPLETED
    updated_by: Optional[str] = "Hospital Triage"

class ReferralResponse(BaseModel):
    id: int
    referral_code: str
    patient_id: int
    patient: PatientResponse
    referring_facility_name: str
    referring_facility_type: str
    referring_doctor_name: str
    referring_doctor_phone: str
    destination_hospital_id: int
    destination_hospital: Optional[HospitalResponse]
    ambulance_id: Optional[int]
    ambulance: Optional[AmbulanceResponse]
    
    primary_diagnosis: str
    secondary_diagnosis: Optional[str]
    referral_reason: str
    
    meows_score: int
    risk_level: str
    risk_color: str
    clinical_summary: Optional[str]
    meows_recommendation: Optional[str]
    priority: str
    status: str
    
    interventions_given: str
    blood_transfusion_needed: bool
    blood_units_needed: int
    
    estimated_time_minutes: int
    distance_km: float
    origin_lat: float
    origin_lng: float
    
    created_at: datetime
    updated_at: datetime
    arrived_at: Optional[datetime]
    treatment_started_at: Optional[datetime]
    
    vitals_history: List[VitalsLogResponse] = []
    readiness: Optional[ReadinessResponse] = None

    class Config:
        from_attributes = True

# --- Notification Schema ---
class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str
    category: str
    risk_level: str
    referral_id: Optional[int]
    referral_code: Optional[str]
    created_at: datetime
    is_read: bool
    class Config:
        from_attributes = True

# --- ABDM Simulation Schemas ---
class ABHAVerifyRequest(BaseModel):
    abha_id: str
    auth_method: str = "DEMO_OTP" # DEMO_OTP, DEMO_BIOMETRIC, DEMO_PASSWORD

class ABHAVerifyResponse(BaseModel):
    verified: bool
    abha_id: str
    abha_address: str
    name: str
    gender: str
    dob: str
    mobile: str
    kyc_status: str
    linked_records_count: int
    message: str

class ConsentRequest(BaseModel):
    patient_abha_id: str
    hiu_id: str
    hip_id: str
    purpose: str = "EMERGENCY_OBSTETRIC_CARE"

class ConsentResponse(BaseModel):
    consent_id: str
    status: str # GRANTED, PENDING, EXPIRED
    granted_at: datetime
    data_range_accessible: str
    authorized_clinicians: List[str]
