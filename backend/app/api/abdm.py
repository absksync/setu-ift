import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException
from backend.app.schemas.schemas import (
    ABHAVerifyRequest, ABHAVerifyResponse,
    ConsentRequest, ConsentResponse
)
from backend.app.services.abdm_service import mock_verify_abha

router = APIRouter(prefix="/abdm", tags=["ABDM Simulation"])

@router.post("/verify-abha", response_model=ABHAVerifyResponse)
def verify_abha_endpoint(req: ABHAVerifyRequest):
    """
    Simulates ABDM M1 / M2 verification of ABHA ID via Aadhaar OTP or Biometric.
    """
    if not req.abha_id:
        raise HTTPException(status_code=400, detail="ABHA ID is required")
    return mock_verify_abha(req.abha_id)

@router.post("/consent/request", response_model=ConsentResponse)
def request_consent_endpoint(req: ConsentRequest):
    """
    Simulates ABDM Consent Manager artifact creation for emergency transfer records.
    """
    consent_id = f"CONSENT-SETU-{uuid.uuid4().hex[:8].upper()}"
    return {
        "consent_id": consent_id,
        "status": "GRANTED",
        "granted_at": datetime.utcnow(),
        "data_range_accessible": "Emergency Obstetric Referral + Vital Logs + Diagnostic Summary",
        "authorized_clinicians": ["On-Duty Obstetrician", "Triage Medical Officer", "Duty Anesthetist"]
    }
