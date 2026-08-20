# SETU-IFT System Architecture

SETU-IFT (*Smart Emergency Transfer & Unified Referral System for Inter-Facility Transfers*) is architected as an asynchronous, event-driven digital healthcare platform specifically engineered to bridge the clinical information gap between primary rural clinics, ambulances, and tertiary hospitals.

---

## High-Level Component Diagram

```
+-----------------------------------------------------------------------------------+
|                                 CLIENT LAYER                                      |
|                                                                                   |
|  +---------------------+   +---------------------+   +-------------------------+  |
|  |  Rural PHC Clinic   |   |   Ambulance Portal  |   |  Hospital Triage Center |  |
|  |  (React/TypeScript) |   |  (React/TypeScript) |   |    (React/TypeScript)   |  |
|  +----------+----------+   +----------+----------+   +------------+------------+  |
+-------------|-------------------------|---------------------------|---------------+
              | HTTPS (REST API)        | HTTPS / WS                | WebSocket (Push)
              +-------------------------+                           |
                                        v                           v
+-----------------------------------------------------------------------------------+
|                            FASTAPI BACKEND SERVICES                               |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  |                             FastAPI Web Framework                           |  |
|  |    - CORS Security Middleware                                               |  |
|  |    - Asynchronous Request Router                                            |  |
|  |    - Pydantic Schema Validation Layer                                       |  |
|  +-----------------------------------------------------------------------------+  |
|                                                                                   |
|  +----------------------+  +---------------------+  +--------------------------+  |
|  | MEOWS Scoring Engine |  | WebSocket Manager   |  | Background Simulator     |  |
|  | (Rule-Based Triage)  |  | (Event Broadcast)   |  | (GPS Telemetry Engine)   |  |
|  +----------------------+  +---------------------+  +--------------------------+  |
+---------------------------------------+-------------------------------------------+
                                        |
                                        v
+-----------------------------------------------------------------------------------+
|                             PERSISTENCE & STANDARDS                               |
|                                                                                   |
|  +-------------------------------------+   +-----------------------------------+  |
|  |       PostgreSQL / SQLite DB        |   |           ABDM Gateway            |  |
|  |  - Patients, Referrals, Vitals      |   |  - ABHA ID Verification           |  |
|  |  - Readiness, Hospitals, Fleet      |   |  - HL7 FHIR R4 Bundle Generator   |  |
|  |  - ACID Integrity Guarantees        |   |  - DPDP Consent Architecture      |  |
|  +-------------------------------------+   +-----------------------------------+  |
+-----------------------------------------------------------------------------------+
```

---

## Architectural Decisions & Rationale

1. **Rule-Based MEOWS vs. Blackbox ML**:
   - In time-critical obstetric emergencies, algorithmic explainability and clinical auditability are paramount. Frontline clinicians must trust why a patient is categorized as *High Risk*. The MEOWS engine computes scores transparently from 5 standard physiological parameters.

2. **Sub-Second WebSocket Broadcast**:
   - Rather than relying on polled REST requests, SETU-IFT's bi-directional WebSocket connection ensures that when a PHC doctor submits a referral, hospital monitors flash within milliseconds.

3. **ABDM & FHIR R4 Native Structure**:
   - Avoids creating an isolated data silo. Every referral record can be serialized on-demand into an ABDM-compliant FHIR R4 Document Bundle.
