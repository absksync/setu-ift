from datetime import datetime
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import desc, or_

from backend.app.database.connection import get_db
from backend.app.models.models import Referral, Patient, Hospital, Ambulance, VitalsLog, ReadinessChecklist, Notification
from backend.app.schemas.schemas import (
    ReferralCreate, ReferralResponse, ReferralStatusUpdate,
    ReadinessUpdate, ReadinessResponse, VitalsLogCreate, VitalsLogResponse
)
from backend.app.services.meows_engine import calculate_meows
from backend.app.services.abdm_service import generate_fhir_referral_bundle
from backend.app.websocket.manager import ws_manager

router = APIRouter(prefix="/referrals", tags=["Referrals"])

@router.post("", response_model=ReferralResponse)
async def create_referral(
    referral_in: ReferralCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    # 1. Check Hospital
    hospital = db.query(Hospital).filter(Hospital.id == referral_in.destination_hospital_id).first()
    if not hospital:
        raise HTTPException(status_code=404, detail="Destination hospital not found")

    # 2. Compute MEOWS Score
    v = referral_in.vitals
    meows_result = calculate_meows(
        systolic_bp=v.systolic_bp,
        diastolic_bp=v.diastolic_bp,
        heart_rate=v.heart_rate,
        respiratory_rate=v.respiratory_rate,
        temperature_f=v.temperature_f,
        spo2=v.spo2
    )

    # 3. Create Patient
    patient = Patient(
        full_name=referral_in.patient_name,
        age=referral_in.age,
        abha_id=referral_in.abha_id,
        blood_group=referral_in.blood_group,
        gravida=referral_in.gravida,
        para=referral_in.para,
        gestational_age_weeks=referral_in.gestational_age_weeks,
        contact_phone=referral_in.contact_phone,
        emergency_contact_name=referral_in.emergency_contact_name,
        emergency_contact_phone=referral_in.emergency_contact_phone,
        village_town=referral_in.village_town
    )
    db.add(patient)
    db.flush()

    # 4. Assign Ambulance if not specified
    ambulance_id = referral_in.ambulance_id
    if not ambulance_id:
        available_amb = db.query(Ambulance).filter(Ambulance.status == "AVAILABLE").first()
        if available_amb:
            ambulance_id = available_amb.id
            available_amb.status = "EN_ROUTE"
        else:
            first_amb = db.query(Ambulance).first()
            ambulance_id = first_amb.id if first_amb else None

    # 5. Generate Referral Code
    ref_count = db.query(Referral).count()
    referral_code = f"SETU-REF-2026-{1001 + ref_count}"

    # Estimated time & distance calculation (simulated based on hospital)
    est_time = 22 if meows_result["risk_level"] == "HIGH RISK" else 28
    est_distance = 18.2

    referral = Referral(
        referral_code=referral_code,
        patient_id=patient.id,
        referring_facility_name=referral_in.referring_facility_name,
        referring_facility_type=referral_in.referring_facility_type,
        referring_doctor_name=referral_in.referring_doctor_name,
        referring_doctor_phone=referral_in.referring_doctor_phone,
        destination_hospital_id=hospital.id,
        ambulance_id=ambulance_id,
        primary_diagnosis=referral_in.primary_diagnosis,
        secondary_diagnosis=referral_in.secondary_diagnosis,
        referral_reason=referral_in.referral_reason,
        meows_score=meows_result["total_score"],
        risk_level=meows_result["risk_level"],
        risk_color=meows_result["risk_color"],
        clinical_summary=" | ".join(meows_result["clinical_flags"]) if meows_result["clinical_flags"] else "Baseline parameters recorded.",
        meows_recommendation="; ".join(meows_result["recommendations"]),
        priority="CRITICAL_EMERGENCY" if meows_result["risk_level"] == "HIGH RISK" else ("URGENT" if meows_result["risk_level"] == "MEDIUM RISK" else "STANDARD"),
        status="EN_ROUTE",
        interventions_given=referral_in.interventions_given or "",
        blood_transfusion_needed=referral_in.blood_transfusion_needed,
        blood_units_needed=referral_in.blood_units_needed,
        estimated_time_minutes=est_time,
        distance_km=est_distance,
        origin_lat=18.7200,
        origin_lng=73.8600
    )
    db.add(referral)
    db.flush()

    # 6. Log Initial Vitals
    vitals_log = VitalsLog(
        referral_id=referral.id,
        recorded_by=referral_in.referring_doctor_name,
        location_type="PHC",
        systolic_bp=v.systolic_bp,
        diastolic_bp=v.diastolic_bp,
        heart_rate=v.heart_rate,
        respiratory_rate=v.respiratory_rate,
        temperature_f=v.temperature_f,
        spo2=v.spo2,
        meows_score=meows_result["total_score"],
        risk_level=meows_result["risk_level"],
        notes="Pre-transfer assessment at referring center."
    )
    db.add(vitals_log)

    # 7. Create Readiness Checklist
    readiness = ReadinessChecklist(
        referral_id=referral.id,
        icu_prepared=False,
        blood_prepared=False,
        blood_units_reserved=referral_in.blood_units_needed,
        specialist_alerted=False,
        specialist_name=hospital.on_duty_obstetrician,
        ot_prepared=False,
        medication_prepared=False,
        all_prepared=False,
        last_updated_by="Awaiting Hospital Acknowledgment"
    )
    db.add(readiness)

    # 8. Create Notification
    notif = Notification(
        title=f"🚨 New {meows_result['risk_level']} Referral: {patient.full_name}",
        message=f"Referred from {referral_in.referring_facility_name} to {hospital.name} with {referral_in.primary_diagnosis}. MEOWS: {meows_result['total_score']}. ETA: {est_time} min.",
        category="HIGH_RISK_REFERRAL" if meows_result["risk_level"] == "HIGH RISK" else "NEW_REFERRAL",
        risk_level=meows_result["risk_level"],
        referral_id=referral.id,
        referral_code=referral_code
    )
    db.add(notif)
    db.commit()
    db.refresh(referral)

    # Broadcast WebSocket Event
    payload = {
        "referral_id": referral.id,
        "referral_code": referral.referral_code,
        "patient_name": patient.full_name,
        "risk_level": referral.risk_level,
        "meows_score": referral.meows_score,
        "hospital_id": hospital.id,
        "hospital_name": hospital.name,
        "primary_diagnosis": referral.primary_diagnosis,
        "estimated_time_minutes": referral.estimated_time_minutes,
        "blood_group": patient.blood_group,
        "created_at": referral.created_at.isoformat()
    }
    background_tasks.add_task(ws_manager.broadcast, "NEW_REFERRAL", payload)

    return referral

@router.get("", response_model=List[ReferralResponse])
def get_referrals(
    risk_level: Optional[str] = Query(None, description="Filter by risk: LOW RISK, MEDIUM RISK, HIGH RISK"),
    hospital_id: Optional[int] = Query(None, description="Filter by destination hospital"),
    status: Optional[str] = Query(None, description="Filter by status"),
    search: Optional[str] = Query(None, description="Search by patient name, code, diagnosis"),
    db: Session = Depends(get_db)
):
    query = db.query(Referral).join(Patient)
    
    if risk_level:
        query = query.filter(Referral.risk_level == risk_level)
    if hospital_id:
        query = query.filter(Referral.destination_hospital_id == hospital_id)
    if status:
        query = query.filter(Referral.status == status)
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(
                Patient.full_name.ilike(search_pattern),
                Referral.referral_code.ilike(search_pattern),
                Referral.primary_diagnosis.ilike(search_pattern),
                Referral.referring_facility_name.ilike(search_pattern)
            )
        )
    
    return query.order_by(desc(Referral.created_at)).all()

@router.get("/{referral_id}", response_model=ReferralResponse)
def get_referral_by_id(referral_id: int, db: Session = Depends(get_db)):
    referral = db.query(Referral).filter(Referral.id == referral_id).first()
    if not referral:
        raise HTTPException(status_code=404, detail="Referral record not found")
    return referral

@router.patch("/{referral_id}/readiness", response_model=ReadinessResponse)
async def update_readiness(
    referral_id: int,
    readiness_in: ReadinessUpdate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    readiness = db.query(ReadinessChecklist).filter(ReadinessChecklist.referral_id == referral_id).first()
    if not readiness:
        raise HTTPException(status_code=404, detail="Readiness checklist not found for this referral")
    
    now = datetime.utcnow()

    if readiness_in.icu_prepared is not None:
        readiness.icu_prepared = readiness_in.icu_prepared
        readiness.icu_prepared_at = now if readiness_in.icu_prepared else None
    
    if readiness_in.blood_prepared is not None:
        readiness.blood_prepared = readiness_in.blood_prepared
        readiness.blood_prepared_at = now if readiness_in.blood_prepared else None
        
    if readiness_in.specialist_alerted is not None:
        readiness.specialist_alerted = readiness_in.specialist_alerted
        readiness.specialist_alerted_at = now if readiness_in.specialist_alerted else None
        
    if readiness_in.ot_prepared is not None:
        readiness.ot_prepared = readiness_in.ot_prepared
        readiness.ot_prepared_at = now if readiness_in.ot_prepared else None
        
    if readiness_in.medication_prepared is not None:
        readiness.medication_prepared = readiness_in.medication_prepared
        readiness.medication_prepared_at = now if readiness_in.medication_prepared else None

    readiness.all_prepared = bool(
        readiness.icu_prepared and
        readiness.specialist_alerted and
        readiness.medication_prepared
    )
    if readiness_in.last_updated_by:
        readiness.last_updated_by = readiness_in.last_updated_by

    db.commit()
    db.refresh(readiness)

    # Broadcast readiness change
    referral = db.query(Referral).filter(Referral.id == referral_id).first()
    payload = {
        "referral_id": referral_id,
        "referral_code": referral.referral_code if referral else "",
        "patient_name": referral.patient.full_name if referral else "",
        "icu_prepared": readiness.icu_prepared,
        "blood_prepared": readiness.blood_prepared,
        "specialist_alerted": readiness.specialist_alerted,
        "ot_prepared": readiness.ot_prepared,
        "medication_prepared": readiness.medication_prepared,
        "all_prepared": readiness.all_prepared,
        "updated_at": now.isoformat()
    }
    background_tasks.add_task(ws_manager.broadcast, "READINESS_UPDATED", payload)

    return readiness

@router.post("/{referral_id}/vitals", response_model=VitalsLogResponse)
async def log_enroute_vitals(
    referral_id: int,
    vitals_in: VitalsLogCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    referral = db.query(Referral).filter(Referral.id == referral_id).first()
    if not referral:
        raise HTTPException(status_code=404, detail="Referral not found")

    # Compute new MEOWS
    meows_result = calculate_meows(
        systolic_bp=vitals_in.systolic_bp,
        diastolic_bp=vitals_in.diastolic_bp,
        heart_rate=vitals_in.heart_rate,
        respiratory_rate=vitals_in.respiratory_rate,
        temperature_f=vitals_in.temperature_f,
        spo2=vitals_in.spo2
    )

    # Add Vitals Log
    vitals_log = VitalsLog(
        referral_id=referral_id,
        recorded_by=vitals_in.recorded_by or "Ambulance EMT",
        location_type=vitals_in.location_type or "AMBULANCE_TRANSIT",
        systolic_bp=vitals_in.systolic_bp,
        diastolic_bp=vitals_in.diastolic_bp,
        heart_rate=vitals_in.heart_rate,
        respiratory_rate=vitals_in.respiratory_rate,
        temperature_f=vitals_in.temperature_f,
        spo2=vitals_in.spo2,
        meows_score=meows_result["total_score"],
        risk_level=meows_result["risk_level"],
        notes=vitals_in.notes or "En-route transit observation."
    )
    db.add(vitals_log)

    # Update referral current score & risk
    old_risk = referral.risk_level
    referral.meows_score = meows_result["total_score"]
    referral.risk_level = meows_result["risk_level"]
    referral.risk_color = meows_result["risk_color"]
    referral.clinical_summary = " | ".join(meows_result["clinical_flags"]) if meows_result["clinical_flags"] else "Transit vitals updated."
    referral.meows_recommendation = "; ".join(meows_result["recommendations"])
    referral.updated_at = datetime.utcnow()

    # If patient deteriorated, log high risk notification
    if meows_result["risk_level"] == "HIGH RISK" and old_risk != "HIGH RISK":
        notif = Notification(
            title=f"⚠️ TRANSIT ALERT: Patient {referral.patient.full_name} Deteriorating",
            message=f"En-route vitals triggered HIGH RISK (MEOWS: {meows_result['total_score']}). Systolic BP: {vitals_in.systolic_bp}, SpO2: {vitals_in.spo2}%. Immediate emergency OT standby required.",
            category="VITALS_ALERT",
            risk_level="HIGH RISK",
            referral_id=referral.id,
            referral_code=referral.referral_code
        )
        db.add(notif)

    db.commit()
    db.refresh(vitals_log)

    # Broadcast WebSocket Event
    payload = {
        "referral_id": referral.id,
        "referral_code": referral.referral_code,
        "patient_name": referral.patient.full_name,
        "meows_score": meows_result["total_score"],
        "risk_level": meows_result["risk_level"],
        "systolic_bp": vitals_in.systolic_bp,
        "diastolic_bp": vitals_in.diastolic_bp,
        "heart_rate": vitals_in.heart_rate,
        "respiratory_rate": vitals_in.respiratory_rate,
        "temperature_f": vitals_in.temperature_f,
        "spo2": vitals_in.spo2,
        "recorded_at": vitals_log.recorded_at.isoformat()
    }
    background_tasks.add_task(ws_manager.broadcast, "VITALS_UPDATED", payload)

    return vitals_log

@router.patch("/{referral_id}/status", response_model=ReferralResponse)
async def update_referral_status(
    referral_id: int,
    status_in: ReferralStatusUpdate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    referral = db.query(Referral).filter(Referral.id == referral_id).first()
    if not referral:
        raise HTTPException(status_code=404, detail="Referral not found")

    now = datetime.utcnow()
    referral.status = status_in.status
    referral.updated_at = now

    if status_in.status == "ARRIVED" and not referral.arrived_at:
        referral.arrived_at = now
    elif status_in.status == "TREATMENT_STARTED" and not referral.treatment_started_at:
        referral.treatment_started_at = now
        if not referral.arrived_at:
            referral.arrived_at = now

    db.commit()
    db.refresh(referral)

    payload = {
        "referral_id": referral.id,
        "referral_code": referral.referral_code,
        "patient_name": referral.patient.full_name,
        "new_status": referral.status,
        "updated_at": now.isoformat()
    }
    background_tasks.add_task(ws_manager.broadcast, "STATUS_CHANGED", payload)

    return referral

@router.get("/{referral_id}/fhir")
def get_fhir_bundle(referral_id: int, db: Session = Depends(get_db)):
    referral = db.query(Referral).filter(Referral.id == referral_id).first()
    if not referral:
        raise HTTPException(status_code=404, detail="Referral not found")

    referral_dict = {
        "id": referral.id,
        "referral_code": referral.referral_code,
        "patient_id": referral.patient_id,
        "patient_name": referral.patient.full_name,
        "abha_id": referral.patient.abha_id,
        "blood_group": referral.patient.blood_group,
        "referring_doctor_name": referral.referring_doctor_name,
        "primary_diagnosis": referral.primary_diagnosis,
        "referral_reason": referral.referral_reason,
        "meows_score": referral.meows_score,
        "risk_level": referral.risk_level
    }
    return generate_fhir_referral_bundle(referral_dict)
