-- SETU-IFT Database Schema (PostgreSQL / SQLite Compatible DDL)
-- Smart Emergency Transfer & Unified Referral System for Inter-Facility Transfers

CREATE TABLE IF NOT EXISTS hospitals (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    facility_type VARCHAR(100) DEFAULT 'District Hospital',
    code VARCHAR(50) UNIQUE NOT NULL,
    latitude FLOAT NOT NULL,
    longitude FLOAT NOT NULL,
    phone VARCHAR(50) NOT NULL,
    address VARCHAR(300) NOT NULL,
    district VARCHAR(100) DEFAULT 'Pune',
    state VARCHAR(100) DEFAULT 'Maharashtra',
    total_icu_beds INT DEFAULT 20,
    available_icu_beds INT DEFAULT 5,
    blood_bank_status VARCHAR(50) DEFAULT 'Operational (24x7)',
    available_blood_units TEXT,
    on_duty_obstetrician VARCHAR(150),
    on_duty_anesthetist VARCHAR(150)
);

CREATE TABLE IF NOT EXISTS ambulances (
    id SERIAL PRIMARY KEY,
    vehicle_number VARCHAR(50) UNIQUE NOT NULL,
    vehicle_type VARCHAR(50) DEFAULT 'Advanced Life Support (ALS)',
    driver_name VARCHAR(100),
    driver_phone VARCHAR(50),
    emt_name VARCHAR(100),
    current_lat FLOAT DEFAULT 18.5204,
    current_lng FLOAT DEFAULT 73.8567,
    bearing FLOAT DEFAULT 0.0,
    speed_kmh FLOAT DEFAULT 45.0,
    status VARCHAR(50) DEFAULT 'AVAILABLE'
);

CREATE TABLE IF NOT EXISTS patients (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    age INT NOT NULL,
    abha_id VARCHAR(50),
    blood_group VARCHAR(10) NOT NULL,
    gravida INT DEFAULT 1,
    para INT DEFAULT 0,
    gestational_age_weeks INT DEFAULT 36,
    contact_phone VARCHAR(50),
    emergency_contact_name VARCHAR(150),
    emergency_contact_phone VARCHAR(50),
    village_town VARCHAR(150),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS referrals (
    id SERIAL PRIMARY KEY,
    referral_code VARCHAR(50) UNIQUE NOT NULL,
    patient_id INT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    referring_facility_name VARCHAR(200) NOT NULL,
    referring_facility_type VARCHAR(50) DEFAULT 'PHC',
    referring_doctor_name VARCHAR(150) NOT NULL,
    referring_doctor_phone VARCHAR(50) NOT NULL,
    destination_hospital_id INT NOT NULL REFERENCES hospitals(id),
    ambulance_id INT REFERENCES ambulances(id),
    primary_diagnosis VARCHAR(250) NOT NULL,
    secondary_diagnosis VARCHAR(250),
    referral_reason TEXT NOT NULL,
    meows_score INT DEFAULT 0,
    risk_level VARCHAR(20) DEFAULT 'LOW RISK',
    risk_color VARCHAR(20) DEFAULT '#22C55E',
    clinical_summary TEXT,
    meows_recommendation TEXT,
    priority VARCHAR(50) DEFAULT 'URGENT',
    status VARCHAR(50) DEFAULT 'EN_ROUTE',
    interventions_given TEXT,
    blood_transfusion_needed BOOLEAN DEFAULT FALSE,
    blood_units_needed INT DEFAULT 0,
    estimated_time_minutes INT DEFAULT 25,
    distance_km FLOAT DEFAULT 18.5,
    origin_lat FLOAT DEFAULT 18.7523,
    origin_lng FLOAT DEFAULT 73.8596,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    arrived_at TIMESTAMP,
    treatment_started_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vitals_logs (
    id SERIAL PRIMARY KEY,
    referral_id INT NOT NULL REFERENCES referrals(id) ON DELETE CASCADE,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    recorded_by VARCHAR(100),
    location_type VARCHAR(50) DEFAULT 'PHC',
    systolic_bp INT NOT NULL,
    diastolic_bp INT NOT NULL,
    heart_rate INT NOT NULL,
    respiratory_rate INT NOT NULL,
    temperature_f FLOAT NOT NULL,
    spo2 INT NOT NULL,
    meows_score INT DEFAULT 0,
    risk_level VARCHAR(20) DEFAULT 'LOW RISK',
    notes VARCHAR(250)
);

CREATE TABLE IF NOT EXISTS readiness_checklists (
    id SERIAL PRIMARY KEY,
    referral_id INT UNIQUE NOT NULL REFERENCES referrals(id) ON DELETE CASCADE,
    icu_prepared BOOLEAN DEFAULT FALSE,
    icu_bed_number VARCHAR(50),
    icu_prepared_at TIMESTAMP,
    blood_prepared BOOLEAN DEFAULT FALSE,
    blood_units_reserved INT DEFAULT 2,
    blood_prepared_at TIMESTAMP,
    specialist_alerted BOOLEAN DEFAULT FALSE,
    specialist_name VARCHAR(150),
    specialist_alerted_at TIMESTAMP,
    ot_prepared BOOLEAN DEFAULT FALSE,
    ot_number VARCHAR(50),
    ot_prepared_at TIMESTAMP,
    medication_prepared BOOLEAN DEFAULT FALSE,
    medication_kit_code VARCHAR(100),
    medication_prepared_at TIMESTAMP,
    all_prepared BOOLEAN DEFAULT FALSE,
    last_updated_by VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'HIGH_RISK_REFERRAL',
    risk_level VARCHAR(20) DEFAULT 'HIGH',
    referral_id INT,
    referral_code VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_referrals_risk ON referrals(risk_level);
CREATE INDEX IF NOT EXISTS idx_referrals_dest ON referrals(destination_hospital_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);
CREATE INDEX IF NOT EXISTS idx_patients_abha ON patients(abha_id);
