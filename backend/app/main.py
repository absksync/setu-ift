import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from backend.app.database.connection import engine, Base, SessionLocal
from backend.app.services.seed_data import seed_database
from backend.app.websocket.manager import ws_manager
from backend.app.models.models import Ambulance

# Import API Routers
from backend.app.api.referrals import router as referrals_router
from backend.app.api.meows import router as meows_router
from backend.app.api.hospitals import router as hospitals_router
from backend.app.api.ambulances import router as ambulances_router
from backend.app.api.analytics import router as analytics_router
from backend.app.api.abdm import router as abdm_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("setu_ift")

# Background task for realistic ambulance GPS route animation
async def simulate_ambulance_movements():
    """
    Periodically animates en-route ambulances along realistic routes
    towards destination hospitals in Pune district.
    """
    logger.info("Starting background ambulance simulation engine...")
    routes = [
        # Ambulance 1: Chakan (18.75) -> Sassoon Hospital (18.525)
        {"id": 1, "start_lat": 18.7523, "start_lng": 73.8596, "end_lat": 18.5256, "end_lng": 73.8742, "step": 0, "max_steps": 40},
        # Ambulance 2: Khed (18.84) -> Sassoon Hospital (18.525)
        {"id": 2, "start_lat": 18.8420, "start_lng": 73.9010, "end_lat": 18.5256, "end_lng": 73.8742, "step": 5, "max_steps": 50},
        # Ambulance 3: Alandi (18.67) -> Aundh District Hospital (18.562)
        {"id": 3, "start_lat": 18.6760, "start_lng": 73.8980, "end_lat": 18.5621, "end_lng": 73.8087, "step": 12, "max_steps": 35},
    ]

    while True:
        try:
            await asyncio.sleep(4) # Tick every 4 seconds
            db = SessionLocal()
            try:
                for r in routes:
                    r["step"] = (r["step"] + 1) % r["max_steps"]
                    fraction = r["step"] / float(r["max_steps"])
                    
                    cur_lat = r["start_lat"] + (r["end_lat"] - r["start_lat"]) * fraction
                    cur_lng = r["start_lng"] + (r["end_lng"] - r["start_lng"]) * fraction
                    
                    amb = db.query(Ambulance).filter(Ambulance.id == r["id"]).first()
                    if amb:
                        amb.current_lat = round(cur_lat, 5)
                        amb.current_lng = round(cur_lng, 5)
                        amb.speed_kmh = 48.0 + (r["step"] % 8)
                        db.commit()

                        # Broadcast GPS tick to all connected clients
                        await ws_manager.broadcast("AMBULANCE_GPS_TICK", {
                            "ambulance_id": amb.id,
                            "vehicle_number": amb.vehicle_number,
                            "lat": amb.current_lat,
                            "lng": amb.current_lng,
                            "speed": amb.speed_kmh,
                            "bearing": 170.0,
                            "status": amb.status
                        })
            finally:
                db.close()
        except asyncio.CancelledError:
            break
        except Exception as e:
            logger.error(f"Error in ambulance simulation loop: {e}")
            await asyncio.sleep(5)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create tables and seed data
    logger.info("Initializing SETU-IFT Database Schema...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
        
    # Start GPS simulation loop in background
    sim_task = asyncio.create_task(simulate_ambulance_movements())
    yield
    # Shutdown
    sim_task.cancel()
    try:
        await sim_task
    except asyncio.CancelledError:
        pass

app = FastAPI(
    title="SETU-IFT API",
    description="Smart Emergency Transfer & Unified Referral System for Inter-Facility Transfers (Maternal Care)",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers under /api
app.include_router(referrals_router, prefix="/api")
app.include_router(meows_router, prefix="/api")
app.include_router(hospitals_router, prefix="/api")
app.include_router(ambulances_router, prefix="/api")
app.include_router(analytics_router, prefix="/api")
app.include_router(abdm_router, prefix="/api")

@app.get("/")
def root():
    return {
        "project": "SETU-IFT",
        "name": "Smart Emergency Transfer & Unified Referral System for Inter-Facility Transfers",
        "tagline": "Ensuring patient information reaches before the patient.",
        "status": "Operational",
        "docs": "/docs",
        "api_prefix": "/api"
    }

@app.get("/api/health")
def health_check():
    return {"status": "HEALTHY", "service": "SETU-IFT Core Backend"}

# Real-time WebSocket Endpoint
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            # Keep connection alive and listen for client pings or client requests
            data = await websocket.receive_text()
            # Echo or acknowledge
            await websocket.send_text(f'{{"type": "ACK", "message": "SETU-IFT WS Connected"}}')
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        ws_manager.disconnect(websocket)
