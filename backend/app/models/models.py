from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from backend.app.database.connection import Base

class Hospital(Base):
    __tablename__ = "hospitals"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    facility_type = Column(String(100), default="District Hospital") # District Hospital, Medical College, Apex Tertiary
    code = Column(String(50), unique=True, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    phone = Column(String(50), nullable=False)
    address = Column(String(300), nullable=False)
    district = Column(String(100), default="Pune")
    state = Column(String(100), default="Maharashtra")
    
    total_icu_beds = Column(Integer, default=20)
    available_icu_beds = Column(Integer, default=5)
    blood_bank_status = Column(String(50), default="Operational (24x7)")
    available_blood_units = Column(Text, default="A+: 12, B+: 15, O+: 22, AB+: 6, O-: 4, A-: 3, B-: 2, AB-: 1")
    on_duty_obstetrician = Column(String(150), default="Dr. Sunita Deshmukh (MD OBGYN)")
    on_duty_anesthetist = Column(String(150), default="Dr. Rajesh Kulkarni (MD Anesth)")

    referrals = relationship("Referral", back_populates="destination_hospital")

class Ambulance(Base):
    __tablename__ = "ambulances"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_number = Column(String(50), unique=True, index=True) # e.g. MH-12-EM-1081
    vehicle_type = Column(String(50), default="Advanced Life Support (ALS)")
    driver_name = Column(String(100), default="Ramesh Shinde")
    driver_phone = Column(String(50), default="+91 98765 43210")
    emt_name = Column(String(100), default="Kavita Patil (EMT-B)")
    current_lat = Column(Float, default=18.5204)
    current_lng = Column(Float, default=73.8567)
    bearing = Column(Float, default=0.0)
    speed_kmh = Column(Float, default=45.0)
    status = Column(String(50), default="AVAILABLE") # AVAILABLE, EN_ROUTE, AT_HOSPITAL, RETURNING

    referrals = relationship("Referral", back_populates="ambulance")

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(150), nullable=False)
    age = Column(Integer, nullable=False)
    abha_id = Column(String(50), index=True, nullable=True) # e.g. 91-4829-1029-4821
    blood_group = Column(String(10), nullable=False) # A+, B+, O+, AB+, A-, B-, O-, AB-
    gravida = Column(Integer, default=1)
    para = Column(Integer, default=0)
    gestational_age_weeks = Column(Integer, default=36)
    contact_phone = Column(String(50), nullable=True)
    emergency_contact_name = Column(String(150), nullable=True)
    emergency_contact_phone = Column(String(50), nullable=True)
    village_town = Column(String(150), default="Khed Taluka")
    created_at = Column(DateTime, default=datetime.utcnow)

    referrals = relationship("Referral", back_populates="patient")

class Referral(Base):
    __tablename__ = "referrals"

    id = Column(Integer, primary_key=True, index=True)
    referral_code = Column(String(50), unique=True, index=True) # SETU-REF-2026-001
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    referring_facility_name = Column(String(200), nullable=False) # e.g. Primary Health Centre Chakan
    referring_facility_type = Column(String(50), default="PHC") # PHC, CHC, Sub-Centre
    referring_doctor_name = Column(String(150), nullable=False)
    referring_doctor_phone = Column(String(50), nullable=False)
    
    destination_hospital_id = Column(Integer, ForeignKey("hospitals.id"), nullable=False)
    ambulance_id = Column(Integer, ForeignKey("ambulances.id"), nullable=True)
    
    primary_diagnosis = Column(String(250), nullable=False)
    secondary_diagnosis = Column(String(250), nullable=True)
    referral_reason = Column(Text, nullable=False)
    
    # MEOWS & Risk
    meows_score = Column(Integer, default=0)
    risk_level = Column(String(20), default="LOW RISK") # LOW RISK, MEDIUM RISK, HIGH RISK
    risk_color = Column(String(20), default="#22C55E")
    clinical_summary = Column(Text, nullable=True)
    meows_recommendation = Column(Text, nullable=True)
    
    priority = Column(String(50), default="URGENT") # STANDARD, URGENT, CRITICAL_EMERGENCY
    status = Column(String(50), default="EN_ROUTE") # CREATED, DISPATCHED, EN_ROUTE, ARRIVED, IN_TREATMENT, COMPLETED
    
    interventions_given = Column(Text, default="") # JSON or comma-separated: IV Fluids, MgSO4, Oxytocin, etc.
    blood_transfusion_needed = Column(Boolean, default=False)
    blood_units_needed = Column(Integer, default=0)
    
    estimated_time_minutes = Column(Integer, default=25)
    distance_km = Column(Float, default=18.5)
    
    origin_lat = Column(Float, default=18.7523)
    origin_lng = Column(Float, default=73.8596)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    arrived_at = Column(DateTime, nullable=True)
    treatment_started_at = Column(DateTime, nullable=True)

    patient = relationship("Patient", back_populates="referrals")
    destination_hospital = relationship("Hospital", back_populates="referrals")
    ambulance = relationship("Ambulance", back_populates="referrals")
    vitals_history = relationship("VitalsLog", back_populates="referral", cascade="all, delete-orphan")
    readiness = relationship("ReadinessChecklist", back_populates="referral", uselist=False, cascade="all, delete-orphan")

class VitalsLog(Base):
    __tablename__ = "vitals_logs"

    id = Column(Integer, primary_key=True, index=True)
    referral_id = Column(Integer, ForeignKey("referrals.id"), nullable=False)
    recorded_at = Column(DateTime, default=datetime.utcnow)
    recorded_by = Column(String(100), default="Frontline Staff")
    location_type = Column(String(50), default="PHC") # PHC, AMBULANCE_TRANSIT, HOSPITAL_BAY
    
    systolic_bp = Column(Integer, nullable=False)
    diastolic_bp = Column(Integer, nullable=False)
    heart_rate = Column(Integer, nullable=False)
    respiratory_rate = Column(Integer, nullable=False)
    temperature_f = Column(Float, nullable=False)
    spo2 = Column(Integer, nullable=False)
    
    meows_score = Column(Integer, default=0)
    risk_level = Column(String(20), default="LOW RISK")
    notes = Column(String(250), nullable=True)

    referral = relationship("Referral", back_populates="vitals_history")

class ReadinessChecklist(Base):
    __tablename__ = "readiness_checklists"

    id = Column(Integer, primary_key=True, index=True)
    referral_id = Column(Integer, ForeignKey("referrals.id"), unique=True, nullable=False)
    
    icu_prepared = Column(Boolean, default=False)
    icu_bed_number = Column(String(50), default="ICU-Bed-04")
    icu_prepared_at = Column(DateTime, nullable=True)
    
    blood_prepared = Column(Boolean, default=False)
    blood_units_reserved = Column(Integer, default=2)
    blood_prepared_at = Column(DateTime, nullable=True)
    
    specialist_alerted = Column(Boolean, default=False)
    specialist_name = Column(String(150), default="Dr. Sunita Deshmukh (Obstetrician)")
    specialist_alerted_at = Column(DateTime, nullable=True)
    
    ot_prepared = Column(Boolean, default=False)
    ot_number = Column(String(50), default="Emergency OT-2")
    ot_prepared_at = Column(DateTime, nullable=True)
    
    medication_prepared = Column(Boolean, default=False)
    medication_kit_code = Column(String(100), default="Maternal Hemorrhage Kit #03")
    medication_prepared_at = Column(DateTime, nullable=True)
    
    all_prepared = Column(Boolean, default=False)
    last_updated_by = Column(String(100), default="Triage Coordinator")

    referral = relationship("Referral", back_populates="readiness")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    category = Column(String(50), default="HIGH_RISK_REFERRAL") # HIGH_RISK_REFERRAL, READINESS_UPDATE, VITALS_ALERT, ARRIVAL_ALERT
    risk_level = Column(String(20), default="HIGH")
    referral_id = Column(Integer, nullable=True)
    referral_code = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_read = Column(Boolean, default=False)
