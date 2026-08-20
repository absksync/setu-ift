from typing import List
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from backend.app.database.connection import get_db
from backend.app.models.models import Ambulance
from backend.app.schemas.schemas import AmbulanceResponse
from backend.app.websocket.manager import ws_manager

router = APIRouter(prefix="/ambulances", tags=["Ambulances"])

@router.get("", response_model=List[AmbulanceResponse])
def list_ambulances(db: Session = Depends(get_db)):
    return db.query(Ambulance).all()

@router.get("/{ambulance_id}", response_model=AmbulanceResponse)
def get_ambulance(ambulance_id: int, db: Session = Depends(get_db)):
    ambulance = db.query(Ambulance).filter(Ambulance.id == ambulance_id).first()
    if not ambulance:
        raise HTTPException(status_code=404, detail="Ambulance not found")
    return ambulance

@router.post("/{ambulance_id}/gps")
async def update_gps(
    ambulance_id: int,
    lat: float,
    lng: float,
    speed: float,
    bearing: float,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    ambulance = db.query(Ambulance).filter(Ambulance.id == ambulance_id).first()
    if not ambulance:
        raise HTTPException(status_code=404, detail="Ambulance not found")

    ambulance.current_lat = lat
    ambulance.current_lng = lng
    ambulance.speed_kmh = speed
    ambulance.bearing = bearing
    db.commit()

    payload = {
        "ambulance_id": ambulance.id,
        "vehicle_number": ambulance.vehicle_number,
        "lat": lat,
        "lng": lng,
        "speed": speed,
        "bearing": bearing,
        "status": ambulance.status
    }
    background_tasks.add_task(ws_manager.broadcast, "AMBULANCE_GPS_TICK", payload)
    return {"status": "ok", "ambulance_id": ambulance_id}
