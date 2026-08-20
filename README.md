# SETU-IFT: Smart Emergency Transfer & Unified Referral System

> **"Ensuring patient information reaches before the patient."**  
> *A Digital Health Platform for Maternal Emergency Inter-Facility Transfers.*

---

## 🌟 Executive Summary

In maternal emergency care across India, thousands of mothers are referred from Primary Health Centres (PHCs) and Community Health Centres (CHCs) to tertiary District Hospitals and Medical Colleges. The most dangerous point of this journey is the **"Third Delay"** — the time lost after arriving at the hospital while the emergency team scrambles to diagnose, cross-match blood, find an ICU bed, and mobilize specialists.

**SETU-IFT** converts reactive, unannounced paper referrals into **proactive, digitally coordinated transfers**:
1. **At the Rural PHC:** Doctor logs vital signs → **Rule-based MEOWS Engine** instantly stratifies risk (Low, Medium, High).
2. **Sub-second Dispatch:** WebSocket alert flashes across the receiving hospital triage dashboard *before the ambulance departs*.
3. **Parallel Preparation:** Blood bank cross-matches units, ICU reserves a bed, OT is sterilized, and specialists scrub in.
4. **Transit Tracking:** EMTs stream en-route vitals and live GPS telemetry.
5. **Arrival:** Treatment begins immediately upon docking at the emergency bay.

---

## 🏗️ Technical Architecture & Stack

- **Frontend:** React, TypeScript, Tailwind CSS, Shadcn/UI patterns, Lucide Icons, Leaflet Maps, Recharts, jsPDF.
- **Backend:** FastAPI (Python 3.9+), Pydantic v2, SQLAlchemy 2.0, Uvicorn ASGI.
- **Real-Time Layer:** Bi-directional WebSockets with connection manager & audio tone synthesizer.
- **Database:** PostgreSQL / SQLite with automatic schema creation and 20 pre-seeded clinical maternal emergency cases (7 High, 8 Medium, 5 Low).
- **Standards:** ABDM-ready with simulated ABHA ID verification and HL7 FHIR R4 document bundle exports.

---

## 🚀 Quick Start (Local Development)

### 1. Start the FastAPI Backend
```bash
# From repository root:
cd setu-ift

# Create virtual environment & install requirements
python3 -m venv backend/venv
./backend/venv/bin/pip install -r backend/requirements.txt

# Launch FastAPI ASGI Server
PYTHONPATH=. ./backend/venv/bin/uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
*Backend runs at `http://127.0.0.1:8000` (Swagger UI at `http://127.0.0.1:8000/docs`).*

### 2. Start the React Frontend
```bash
# In a new terminal tab:
cd setu-ift/frontend

# Install dependencies & run Vite dev server
npm install
npm run dev
```
*Frontend runs at `http://localhost:5173`.*

---

## 🐳 Docker Deployment

To launch the full containerized stack:
```bash
docker-compose up --build
```
- Web Application: `http://localhost`
- Backend API: `http://localhost:8000`

---

## 👥 Demo Role Walkthrough

Use the built-in **Role Switcher** in the top navigation bar to experience the platform from all 4 user perspectives:

### 1. 🩺 Role 1: Rural Health Worker (PHC Doctor)
- Go to **New Referral**.
- Use preset buttons (`🩸 PPH Shock`, `⚡ Eclampsia`, `⚠️ Obstructed Labour`) to populate clinical cases.
- Watch the **MEOWS Engine** calculate score, risk tier, and flagged abnormalities in real-time as vitals change.
- Click **Dispatch Referral & Notify Hospital** to broadcast the emergency.
- Download the official **Clinical Handover PDF**.

### 2. 🏥 Role 2: Hospital Staff (Emergency Triage Team)
- Go to **Hospital Readiness**.
- View live incoming referrals sorted by MEOWS urgency and ETA countdowns.
- Click through the **5-Point Readiness Matrix**:
  - 🛏️ `Prepare ICU Bed`
  - 🩸 `Prepare Blood Units`
  - 👨‍⚕️ `Call Specialist (OB-GYN / Anesthetist)`
  - 🏥 `Prepare Operation Theater (OT)`
  - 💊 `Pre-Stage Emergency Medications`
- Click **Confirm Arrival** and **Initiate Treatment** to track patient milestones.

### 3. 🚑 Role 3: Ambulance Staff (EMT / Transit)
- Go to **Ambulance GPS**.
- Watch animated ambulance routes and live speed/location telemetry on the Leaflet map.
- Open the **EMT En-Route Vitals Logger** to submit transit observations. Watch the system recalculate MEOWS and trigger instant hospital alarms if the patient deteriorates in transit!

### 4. 📊 Role 4: Administrator (Health Directorate)
- Go to **Analytics**.
- Inspect Recharts visualizations: Weekly referral curves, MEOWS risk distribution, top maternal complications (PPH, Pre-eclampsia, Obstructed Labour), and hospital compliance benchmarks.

### 5. 🛡️ ABDM Sandbox
- Go to **ABDM Sandbox**.
- Test simulated **ABHA ID verification** (`91-4829-1029-4821`).
- Inspect the **HL7 FHIR R4 Bundle JSON**.
- Simulate DPDP-compliant Emergency Consent token generation.

---

## 📋 MEOWS Scoring Matrix

| Parameter | Score 3 | Score 2 | Score 1 | Score 0 (Normal) | Score 1 | Score 2 | Score 3 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Systolic BP (mmHg)** | < 90 | — | — | 90 – 139 | 140 – 149 | 150 – 159 | ≥ 160 |
| **Diastolic BP (mmHg)**| — | < 50 | — | 50 – 89 | 90 – 99 | 100 – 109 | ≥ 110 |
| **Heart Rate (bpm)** | < 50 | — | 50 – 59 | 60 – 99 | 100 – 109 | 110 – 129 | ≥ 130 |
| **Resp Rate (/min)** | < 10 | — | — | 10 – 19 | 20 – 24 | 25 – 29 | ≥ 30 |
| **Temperature (°F)** | < 95.0°F | — | 95.0–96.8°F| 96.9–99.5°F | 99.6–100.9°F| 101.0–102.2°F| ≥ 102.3°F |
| **SpO2 (%)** | < 92% | 92 – 94% | — | ≥ 95% | — | — | — |

- **High Risk:** Score ≥ 4 or any single red parameter (=3)
- **Medium Risk:** Score 2 – 3
- **Low Risk:** Score 0 – 1

---

## 🎯 Alignment with UN Sustainable Development Goals (SDGs)
- **SDG 3.1:** Reduce global maternal mortality ratio to less than 70 per 100,000 live births.
- **SDG 9:** Build resilient digital health infrastructure connecting rural clinics to tertiary hospitals.
- **SDG 10:** Eliminate healthcare access inequalities in remote tribal and rural areas.
- **SDG 17:** Standardize national public-private digital health exchange via ABDM.

---

## 📄 License
MIT License. Created for National Maternal Emergency Inter-Facility Healthcare Network.
