from fastapi import APIRouter
from backend.app.schemas.schemas import VitalsInput, MEOWSResponse
from backend.app.services.meows_engine import calculate_meows

router = APIRouter(prefix="/meows", tags=["MEOWS Engine"])

@router.post("/calculate", response_model=MEOWSResponse)
def compute_meows_score(vitals: VitalsInput):
    """
    Evaluates vital signs against clinical criteria and returns total MEOWS score,
    risk category (LOW, MEDIUM, HIGH), flagged abnormalities, and clinical action directives.
    """
    result = calculate_meows(
        systolic_bp=vitals.systolic_bp,
        diastolic_bp=vitals.diastolic_bp,
        heart_rate=vitals.heart_rate,
        respiratory_rate=vitals.respiratory_rate,
        temperature_f=vitals.temperature_f,
        spo2=vitals.spo2
    )
    return result
