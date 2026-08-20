# ABDM (Ayushman Bharat Digital Mission) Integration Guide

SETU-IFT is designed for native alignment with India's national digital health infrastructure:

---

## Key ABDM Building Blocks

1. **ABHA (Ayushman Bharat Health Account)**:
   - 14-digit unique health identifier.
   - Links the emergency transfer record to the mother's longitudinal health locker.

2. **HL7 FHIR R4 Bundle Standard**:
   - Structured JSON document containing:
     - `Composition`: Transfer summary document header.
     - `Patient`: Patient demographics & blood group extension.
     - `Condition`: ICD-10 / SNOMED CT coded primary & secondary diagnoses.
     - `Observation`: LOINC 96552-5 coded MEOWS score & individual vital signs.

3. **HIP & HIU Roles**:
   - Referring Rural Clinic acts as **Health Information Provider (HIP)** creating the transfer bundle.
   - Receiving District Hospital acts as **Health Information User (HIU)** receiving and pulling the clinical summary into local hospital information management systems.

4. **Emergency Consent Exemption**:
   - Aligns with DPDP Act Section 4(2) provisions where emergency medical care takes legal precedence to enable immediate uninhibited transmission of life-critical vitals.
