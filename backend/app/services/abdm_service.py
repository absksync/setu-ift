from datetime import datetime
import uuid
from typing import Dict, Any, List

def mock_verify_abha(abha_id: str) -> Dict[str, Any]:
    """
    Simulates Ayushman Bharat Health Account (ABHA) lookup & verification.
    """
    # Clean input
    clean_id = abha_id.strip()
    
    # Known mock profiles or dynamic generation
    names_pool = {
        "91-4829-1029-4821": ("Priya Sharma", "1997-04-12", "F", "priya.sharma@abdm", "+91 98231 11223"),
        "14-9921-3810-7712": ("Sunita Jadhav", "1994-08-25", "F", "sunita.jadhav@abdm", "+91 97654 44332"),
        "82-1029-3382-9901": ("Anita Devi", "2000-11-03", "F", "anita.devi@abdm", "+91 94220 77889"),
        "33-8812-4401-2299": ("Meenakshi Patil", "1995-02-17", "F", "meenakshi.p@abdm", "+91 91580 33445"),
    }
    
    if clean_id in names_pool:
        name, dob, gender, address, mobile = names_pool[clean_id]
    else:
        name = "Kavita Ramesh Gaikwad"
        dob = "1998-06-15"
        gender = "F"
        address = f"user.{clean_id.replace('-', '')[-6:]}@abdm"
        mobile = "+91 98810 54321"

    return {
        "verified": True,
        "abha_id": clean_id if clean_id else "91-4829-1029-4821",
        "abha_address": address,
        "name": name,
        "gender": gender,
        "dob": dob,
        "mobile": mobile,
        "kyc_status": "VERIFIED_AADHAAR_MOCK",
        "linked_records_count": 4,
        "message": "ABHA ID successfully verified via ABDM Sandbox Gateway (Simulation)"
    }

def generate_fhir_referral_bundle(referral_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generates an HL7 FHIR (Fast Healthcare Interoperability Resources) R4 Bundle
    for maternal emergency inter-facility transfer compliant with ABDM standards.
    """
    bundle_id = f"bundle-{uuid.uuid4().hex[:12]}"
    timestamp = datetime.utcnow().isoformat() + "Z"
    
    patient_id = f"Patient-{referral_data.get('patient_id', '101')}"
    encounter_id = f"Encounter-{referral_data.get('referral_code', 'REF-001')}"
    
    entries = [
        # 1. Composition (Document Header)
        {
            "fullUrl": f"urn:uuid:{uuid.uuid4()}",
            "resource": {
                "resourceType": "Composition",
                "id": f"comp-{referral_data.get('id', '1')}",
                "status": "final",
                "type": {
                    "coding": [
                        {
                            "system": "http://snomed.info/sct",
                            "code": "371535009",
                            "display": "Transfer summary report"
                        }
                    ],
                    "text": "Emergency Inter-Facility Maternal Transfer Summary"
                },
                "subject": {"reference": patient_id, "display": referral_data.get("patient_name")},
                "encounter": {"reference": encounter_id},
                "date": timestamp,
                "author": [{"display": referral_data.get("referring_doctor_name")}],
                "title": "SETU-IFT Emergency Referral Record"
            }
        },
        # 2. Patient Resource
        {
            "fullUrl": f"urn:uuid:{uuid.uuid4()}",
            "resource": {
                "resourceType": "Patient",
                "id": patient_id,
                "identifier": [
                    {
                        "system": "https://healthid.ndhm.gov.in",
                        "value": referral_data.get("abha_id", "NOT_LINKED")
                    }
                ],
                "name": [{"text": referral_data.get("patient_name")}],
                "gender": "female",
                "extension": [
                    {
                        "url": "http://hl7.org/fhir/StructureDefinition/patient-bloodGroup",
                        "valueString": referral_data.get("blood_group", "O+")
                    }
                ]
            }
        },
        # 3. Condition (Primary Diagnosis)
        {
            "fullUrl": f"urn:uuid:{uuid.uuid4()}",
            "resource": {
                "resourceType": "Condition",
                "id": f"cond-{uuid.uuid4().hex[:8]}",
                "clinicalStatus": {
                    "coding": [{"system": "http://terminology.hl7.org/CodeSystem/condition-clinical", "code": "active"}]
                },
                "verificationStatus": {
                    "coding": [{"system": "http://terminology.hl7.org/CodeSystem/condition-ver-status", "code": "confirmed"}]
                },
                "category": [
                    {"coding": [{"system": "http://terminology.hl7.org/CodeSystem/condition-category", "code": "encounter-diagnosis"}]}
                ],
                "code": {
                    "text": referral_data.get("primary_diagnosis")
                },
                "subject": {"reference": patient_id},
                "note": [{"text": referral_data.get("referral_reason")}]
            }
        },
        # 4. Observation (MEOWS Score)
        {
            "fullUrl": f"urn:uuid:{uuid.uuid4()}",
            "resource": {
                "resourceType": "Observation",
                "id": f"obs-meows-{uuid.uuid4().hex[:8]}",
                "status": "final",
                "code": {
                    "coding": [{"system": "http://loinc.org", "code": "96552-5", "display": "Modified early obstetric warning score"}],
                    "text": "MEOWS Score"
                },
                "subject": {"reference": patient_id},
                "valueInteger": referral_data.get("meows_score", 0),
                "interpretation": [
                    {
                        "coding": [
                            {
                                "system": "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation",
                                "code": "H" if referral_data.get("risk_level") == "HIGH RISK" else "N",
                                "display": referral_data.get("risk_level", "LOW RISK")
                            }
                        ]
                    }
                ]
            }
        }
    ]

    return {
        "resourceType": "Bundle",
        "id": bundle_id,
        "meta": {
            "lastUpdated": timestamp,
            "profile": ["https://nrces.in/ndhm/fhir/r4/StructureDefinition/DocumentBundle"]
        },
        "identifier": {
            "system": "https://setu-ift.nhm.gov.in/bundles",
            "value": bundle_id
        },
        "type": "document",
        "timestamp": timestamp,
        "simulation_notice": "Standard ABDM-Compliant FHIR R4 Bundle (Prototype Simulation)",
        "entry": entries
    }
