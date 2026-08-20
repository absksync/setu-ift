import datetime
from sqlalchemy.orm import Session
from backend.app.models.models import Hospital, Ambulance, Patient, Referral, VitalsLog, ReadinessChecklist, Notification
from backend.app.services.meows_engine import calculate_meows

def seed_database(db: Session):
    # Check if already seeded
    if db.query(Hospital).first():
        return

    print("Seeding SETU-IFT database with initial demo data...")

    # 1. Create Hospitals
    hospitals_data = [
        Hospital(
            name="Sassoon General Hospital & BJ Govt Medical College",
            facility_type="Apex Tertiary Medical College",
            code="MH-HOSP-SGH-01",
            latitude=18.5256,
            longitude=73.8742,
            phone="+91 20 2612 8000",
            address="Near Pune Railway Station, Sangamvadi, Pune",
            district="Pune",
            state="Maharashtra",
            total_icu_beds=35,
            available_icu_beds=8,
            blood_bank_status="Operational (24x7 Component Facility)",
            available_blood_units="A+: 18, B+: 22, O+: 34, AB+: 9, O-: 6, A-: 4, B-: 3, AB-: 2",
            on_duty_obstetrician="Dr. Sunita Deshmukh (Prof & HOD OBGYN)",
            on_duty_anesthetist="Dr. Rajesh Kulkarni (Senior Anesthetist)"
        ),
        Hospital(
            name="Pune District Hospital (Aundh Civil Hospital)",
            facility_type="District Hospital",
            code="MH-HOSP-ADH-02",
            latitude=18.5621,
            longitude=73.8087,
            phone="+91 20 2727 6000",
            address="Chest Hospital Campus, Aundh, Pune",
            district="Pune",
            state="Maharashtra",
            total_icu_beds=20,
            available_icu_beds=4,
            blood_bank_status="Operational (24x7)",
            available_blood_units="A+: 10, B+: 14, O+: 18, AB+: 4, O-: 3, A-: 2, B-: 1, AB-: 1",
            on_duty_obstetrician="Dr. Meera Joshi (Civil Surgeon OBGYN)",
            on_duty_anesthetist="Dr. Anand Patil (Lead Anesthetist)"
        ),
        Hospital(
            name="Yashwantrao Chavan Memorial Hospital (YCMH)",
            facility_type="Tertiary Municipal Hospital",
            code="MH-HOSP-YCM-03",
            latitude=18.6279,
            longitude=73.8131,
            phone="+91 20 2742 2222",
            address="Sant Tukaram Nagar, Pimpri, Pune",
            district="Pune",
            state="Maharashtra",
            total_icu_beds=25,
            available_icu_beds=6,
            blood_bank_status="Operational (24x7)",
            available_blood_units="A+: 12, B+: 16, O+: 20, AB+: 5, O-: 4, A-: 3, B-: 2, AB-: 1",
            on_duty_obstetrician="Dr. Pradeep Jadhav (Consultant OBGYN)",
            on_duty_anesthetist="Dr. Rohini Shinde (Consultant Anesth)"
        ),
        Hospital(
            name="Sub-District Hospital Manchar (FRU)",
            facility_type="Sub-District First Referral Unit (FRU)",
            code="MH-HOSP-MNC-04",
            latitude=19.0028,
            longitude=73.9421,
            phone="+91 2133 223 100",
            address="Manchar Town, Ambegaon Taluka, Pune",
            district="Pune",
            state="Maharashtra",
            total_icu_beds=8,
            available_icu_beds=2,
            blood_bank_status="Storage Centre Operational",
            available_blood_units="A+: 4, B+: 6, O+: 8, AB+: 2, O-: 1, A-: 1, B-: 0, AB-: 0",
            on_duty_obstetrician="Dr. Amit Bhise (Medical Officer OBGYN)",
            on_duty_anesthetist="Dr. Sneha More (Visiting Anesthetist)"
        )
    ]
    db.add_all(hospitals_data)
    db.commit()

    # 2. Create Ambulances
    ambulances_data = [
        Ambulance(
            vehicle_number="MH-12-EM-1081",
            vehicle_type="Advanced Life Support (ALS)",
            driver_name="Ramesh Shinde",
            driver_phone="+91 98765 43210",
            emt_name="Kavita Patil (EMT-B)",
            current_lat=18.6850,
            current_lng=73.8400,
            bearing=160.0,
            speed_kmh=52.0,
            status="EN_ROUTE"
        ),
        Ambulance(
            vehicle_number="MH-12-EM-1082",
            vehicle_type="Advanced Life Support (ALS)",
            driver_name="Vikas Gaikwad",
            driver_phone="+91 98765 43211",
            emt_name="Sachin Mane (EMT-I)",
            current_lat=18.7200,
            current_lng=73.8900,
            bearing=195.0,
            speed_kmh=48.0,
            status="EN_ROUTE"
        ),
        Ambulance(
            vehicle_number="MH-12-EM-1083",
            vehicle_type="Basic Life Support (BLS)",
            driver_name="Tanaji Jagtap",
            driver_phone="+91 98765 43212",
            emt_name="Anita Jadhav (EMT-B)",
            current_lat=18.5900,
            current_lng=73.7800,
            bearing=110.0,
            speed_kmh=42.0,
            status="EN_ROUTE"
        ),
        Ambulance(
            vehicle_number="MH-12-EM-1084",
            vehicle_type="Advanced Life Support (ALS)",
            driver_name="Santosh Pawar",
            driver_phone="+91 98765 43213",
            emt_name="Pooja Salve (EMT-B)",
            current_lat=18.5300,
            current_lng=73.8700,
            bearing=90.0,
            speed_kmh=0.0,
            status="AT_HOSPITAL"
        ),
        Ambulance(
            vehicle_number="MH-12-EM-1085",
            vehicle_type="Basic Life Support (BLS)",
            driver_name="Mahesh Thorat",
            driver_phone="+91 98765 43214",
            emt_name="Dinesh Kale (EMT-B)",
            current_lat=18.7500,
            current_lng=73.8500,
            bearing=0.0,
            speed_kmh=0.0,
            status="AVAILABLE"
        ),
        Ambulance(
            vehicle_number="MH-12-EM-1086",
            vehicle_type="Advanced Life Support (ALS)",
            driver_name="Ganesh Sawant",
            driver_phone="+91 98765 43215",
            emt_name="Sunil More (EMT-I)",
            current_lat=18.5600,
            current_lng=73.8100,
            bearing=0.0,
            speed_kmh=0.0,
            status="AVAILABLE"
        )
    ]
    db.add_all(ambulances_data)
    db.commit()

    # 3. Create 20 Patients & Referrals:
    # 7 High Risk, 8 Medium Risk, 5 Low Risk
    mock_cases = [
        # --- 7 HIGH RISK CASES ---
        {
            "name": "Pooja Santosh Shinde", "age": 24, "abha": "91-4829-1029-4821", "bg": "O+", "gravida": 2, "para": 1, "ga": 38,
            "phc": "Primary Health Centre Chakan", "doctor": "Dr. Vikas Kadam", "phone": "+91 94220 11001", "hosp_idx": 0, "amb_idx": 0,
            "diag": "Severe Postpartum Hemorrhage (PPH) with Hypovolemic Shock", "sec_diag": "Uterine Atony, estimated blood loss > 1100 ml",
            "reason": "Sudden profuse vaginal bleeding following normal delivery; unresponsive to bimanual compression; patient pale and tachycardic.",
            "interventions": "IV Oxytocin 20 IU infusion started, Misoprostol 800 mcg per rectum, 2 large-bore IV cannulae (16G) with Ringer's Lactate 1000ml, High-flow Oxygen",
            "transfusion": True, "units": 3, "eta": 18, "dist": 16.4, "status": "EN_ROUTE",
            "vitals": {"sbp": 82, "dbp": 48, "hr": 136, "rr": 28, "temp": 96.2, "spo2": 91}
        },
        {
            "name": "Sunita Sanjay Jadhav", "age": 29, "abha": "14-9921-3810-7712", "bg": "B+", "gravida": 3, "para": 2, "ga": 35,
            "phc": "Community Health Centre Khed", "doctor": "Dr. Manisha Rane", "phone": "+91 94220 11002", "hosp_idx": 0, "amb_idx": 1,
            "diag": "Eclampsia with Active Convulsions & Severe Hypertension", "sec_diag": "Proteinuria 3+, Hyperreflexia, altered sensorium",
            "reason": "Patient presented with generalized tonic-clonic seizures, severe frontal headache, blurring of vision. Requires emergency ICU care and delivery.",
            "interventions": "Pritchard Regimen: MgSO4 4g IV + 10g IM loading dose completed, Labetalol 20mg IV bolus administered, Foley catheter inserted, Airway secured",
            "transfusion": False, "units": 0, "eta": 24, "dist": 22.0, "status": "EN_ROUTE",
            "vitals": {"sbp": 178, "dbp": 118, "hr": 124, "rr": 26, "temp": 99.2, "spo2": 93}
        },
        {
            "name": "Kavita Ramesh Gaikwad", "age": 22, "abha": "82-1029-3382-9901", "bg": "A-", "gravida": 1, "para": 0, "ga": 39,
            "phc": "Primary Health Centre Alandi", "doctor": "Dr. Pradip Zaware", "phone": "+91 94220 11003", "hosp_idx": 1, "amb_idx": 2,
            "diag": "Obstructed Labour with Impending Uterine Rupture", "sec_diag": "Bandl's Ring present, deep transverse arrest, caput +++",
            "reason": "Prolonged active second stage of labour > 3 hours. Bandl's retraction ring visible on abdomen. Severe maternal exhaustion and fetal bradycardia (FHR 96 bpm).",
            "interventions": "IV fluids running, Left lateral position, Inj Ampicillin 2g IV given, Catheterized 300ml blood-stained urine drained, Urgent C-Section required",
            "transfusion": True, "units": 2, "eta": 15, "dist": 12.8, "status": "EN_ROUTE",
            "vitals": {"sbp": 146, "dbp": 96, "hr": 132, "rr": 32, "temp": 101.8, "spo2": 94}
        },
        {
            "name": "Rekha Dilip Kamble", "age": 31, "abha": "33-8812-4401-2299", "bg": "O-", "gravida": 4, "para": 3, "ga": 34,
            "phc": "Primary Health Centre Talegaon", "doctor": "Dr. Nilesh Bansode", "phone": "+91 94220 11004", "hosp_idx": 2, "amb_idx": 3,
            "diag": "Antepartum Hemorrhage — Grade 4 Central Placenta Previa", "sec_diag": "Painless bright red vaginal bleeding, severe maternal pallor",
            "reason": "Sudden massive unprovoked antepartum bleeding at home. Hemoglobin 6.2 g/dL. Requires emergent blood transfusion and emergency cesarean hysterectomy standby.",
            "interventions": "Two 16G IV lines, 1500ml Normal Saline infused, Crossmatch sample collected, Pelvic exam avoided, Oxygen 6 L/min via facemask",
            "transfusion": True, "units": 4, "eta": 8, "dist": 6.5, "status": "ARRIVED",
            "vitals": {"sbp": 84, "dbp": 46, "hr": 138, "rr": 24, "temp": 95.8, "spo2": 92}
        },
        {
            "name": "Nisha Sachin Chavan", "age": 27, "abha": "55-2219-9031-1188", "bg": "AB+", "gravida": 2, "para": 1, "ga": 37,
            "phc": "Primary Health Centre Shirur", "doctor": "Dr. Archana Wagh", "phone": "+91 94220 11005", "hosp_idx": 0, "amb_idx": 0,
            "diag": "Severe Maternal Sepsis & Septic Shock secondary to Chorioamnionitis", "sec_diag": "Prolonged rupture of membranes > 36 hours, purulent liquor",
            "reason": "High grade spikes of fever with rigors, foul-smelling liquor, severe maternal tachycardia and hypotension refractory to initial 500ml bolus.",
            "interventions": "IV Ceftriaxone 2g + Metronidazole 500mg given, IV Paracetamol 1g, Noradrenaline infusion started on ALS transport, Blood cultures drawn",
            "transfusion": False, "units": 0, "eta": 32, "dist": 38.0, "status": "EN_ROUTE",
            "vitals": {"sbp": 78, "dbp": 42, "hr": 142, "rr": 34, "temp": 103.4, "spo2": 89}
        },
        {
            "name": "Deepali Rahul More", "age": 20, "abha": "71-3301-4492-6655", "bg": "A+", "gravida": 1, "para": 0, "ga": 36,
            "phc": "Community Health Centre Paud", "doctor": "Dr. Smita Bhor", "phone": "+91 94220 11006", "hosp_idx": 1, "amb_idx": 1,
            "diag": "Severe Pre-eclampsia with Acute Pulmonary Edema", "sec_diag": "Bilateral crepitations, pink frothy sputum, severe respiratory distress",
            "reason": "Known pre-eclamptic patient developed acute breathlessness, orthopnea, and desaturation. Needs urgent ICU admission and CPAP/BiPAP.",
            "interventions": "Inj Furosemide 40mg IV given, Propped up position at 90 degrees, MgSO4 loading dose completed, High-flow 100% O2 via NRBM",
            "transfusion": False, "units": 0, "eta": 20, "dist": 17.5, "status": "EN_ROUTE",
            "vitals": {"sbp": 184, "dbp": 122, "hr": 128, "rr": 38, "temp": 98.4, "spo2": 86}
        },
        {
            "name": "Manjusha Ajay Salunke", "age": 26, "abha": "44-8833-2109-7744", "bg": "B-", "gravida": 2, "para": 1, "ga": 32,
            "phc": "Primary Health Centre Junnar", "doctor": "Dr. Vivek Date", "phone": "+91 94220 11007", "hosp_idx": 3, "amb_idx": 2,
            "diag": "Severe Abruptio Placentae with Disseminated Intravascular Coagulation (DIC)", "sec_diag": "Woody hard tender uterus, non-clotting blood from venipuncture site",
            "reason": "Severe continuous abdominal pain with retroplacental clot. Oozing from IV puncture site. Fetal heart sounds absent. Immediate blood and FFP transfusion needed.",
            "interventions": "Tranexamic Acid 1g IV slow push, 20G cannula changed to 16G, Normal Saline wide open, Urgent referral to Manchar FRU for blood products",
            "transfusion": True, "units": 4, "eta": 12, "dist": 11.0, "status": "EN_ROUTE",
            "vitals": {"sbp": 86, "dbp": 50, "hr": 134, "rr": 26, "temp": 97.4, "spo2": 93}
        },

        # --- 8 MEDIUM RISK CASES ---
        {
            "name": "Varsha Sagar Gholap", "age": 25, "abha": "19-7744-1122-3366", "bg": "O+", "gravida": 2, "para": 1, "ga": 37,
            "phc": "Primary Health Centre Chakan", "doctor": "Dr. Vikas Kadam", "phone": "+91 94220 11001", "hosp_idx": 0, "amb_idx": 0,
            "diag": "Moderate Pre-eclampsia with Persistent Headache", "sec_diag": "Pedal edema grade 2, BP mildly elevated",
            "reason": "Elevated blood pressure, constant epigastric heaviness, needs fetal monitoring and specialty evaluation.",
            "interventions": "Tab Nifedipine 10mg given, IV line secured with DNS, Urine dipstick showed 1+ protein",
            "transfusion": False, "units": 0, "eta": 35, "dist": 28.0, "status": "EN_ROUTE",
            "vitals": {"sbp": 144, "dbp": 94, "hr": 96, "rr": 20, "temp": 98.6, "spo2": 97}
        },
        {
            "name": "Swati Yogesh Jagdale", "age": 28, "abha": "62-1199-8833-4411", "bg": "A+", "gravida": 1, "para": 0, "ga": 40,
            "phc": "Primary Health Centre Moshi", "doctor": "Dr. Seema Kulkarni", "phone": "+91 94220 11008", "hosp_idx": 2, "amb_idx": 1,
            "diag": "Protracted Active Phase Labour with Meconium Stained Liquor", "sec_diag": "Grade 1 meconium, cervical dilation slow",
            "reason": "Slow labour progression with meconium; priority referral for continuous CTG and specialist review.",
            "interventions": "IV RL running at 100ml/hr, Left lateral position, Oxygen 4L/min",
            "transfusion": False, "units": 0, "eta": 16, "dist": 14.0, "status": "EN_ROUTE",
            "vitals": {"sbp": 138, "dbp": 88, "hr": 104, "rr": 22, "temp": 99.8, "spo2": 96}
        },
        {
            "name": "Anita Bhagwan Thorat", "age": 23, "abha": "88-5544-2211-9900", "bg": "B+", "gravida": 1, "para": 0, "ga": 38,
            "phc": "Primary Health Centre Wagholi", "doctor": "Dr. Sanjay Mahajan", "phone": "+91 94220 11009", "hosp_idx": 0, "amb_idx": 2,
            "diag": "Moderate Gestational Anemia in Latent Labour", "sec_diag": "Hemoglobin 7.8 g/dL, mild pallor",
            "reason": "Anemia at term in early labour; needs blood standby and continuous monitoring.",
            "interventions": "IV line established, Blood sample sent for grouping/crossmatch",
            "transfusion": True, "units": 2, "eta": 28, "dist": 21.0, "status": "EN_ROUTE",
            "vitals": {"sbp": 110, "dbp": 70, "hr": 106, "rr": 22, "temp": 98.4, "spo2": 95}
        },
        {
            "name": "Meera Pravin Gorde", "age": 30, "abha": "41-2299-4477-8811", "bg": "AB-", "gravida": 3, "para": 2, "ga": 39,
            "phc": "Primary Health Centre Alandi", "doctor": "Dr. Pradip Zaware", "phone": "+91 94220 11003", "hosp_idx": 1, "amb_idx": 0,
            "diag": "Previous 2 Cesarean Sections in Spontaneous Early Labour", "sec_diag": "Contractions mild, scar intact",
            "reason": "Previous 2 LSCS in labour. Planned emergency repeat cesarean section.",
            "interventions": "NPO status maintained, IV line secured, Antacids administered",
            "transfusion": True, "units": 1, "eta": 22, "dist": 18.0, "status": "EN_ROUTE",
            "vitals": {"sbp": 142, "dbp": 92, "hr": 98, "rr": 21, "temp": 98.8, "spo2": 98}
        },
        {
            "name": "Sheetal Mangesh Landge", "age": 21, "abha": "73-1188-3366-5522", "bg": "O+", "gravida": 1, "para": 0, "ga": 31,
            "phc": "Community Health Centre Khed", "doctor": "Dr. Manisha Rane", "phone": "+91 94220 11002", "hosp_idx": 0, "amb_idx": 1,
            "diag": "Preterm Premature Rupture of Membranes (PPROM)", "sec_diag": "Leaking PV for 12 hours, mild fever",
            "reason": "Preterm pregnancy with confirmed rupture of membranes; needs corticosteroids and NICU readiness.",
            "interventions": "Inj Dexamethasone 6mg IM given, Prophylactic antibiotic started",
            "transfusion": False, "units": 0, "eta": 40, "dist": 31.0, "status": "EN_ROUTE",
            "vitals": {"sbp": 126, "dbp": 82, "hr": 102, "rr": 18, "temp": 100.2, "spo2": 97}
        },
        {
            "name": "Kiran Ganesh Dhavale", "age": 27, "abha": "90-4411-7722-8833", "bg": "B+", "gravida": 2, "para": 1, "ga": 38,
            "phc": "Primary Health Centre Paud", "doctor": "Dr. Smita Bhor", "phone": "+91 94220 11006", "hosp_idx": 1, "amb_idx": 2,
            "diag": "Breech Presentation with Early Labour", "sec_diag": "Frank breech, membranes intact",
            "reason": "Breech presentation in early labour, transfer to higher center for planned cesarean.",
            "interventions": "Left lateral position, IV line with Ringer's Lactate, Continuous FHR monitoring",
            "transfusion": False, "units": 0, "eta": 19, "dist": 15.2, "status": "ARRIVED",
            "vitals": {"sbp": 134, "dbp": 86, "hr": 104, "rr": 21, "temp": 98.4, "spo2": 98}
        },
        {
            "name": "Radhika Nitin Shirole", "age": 26, "abha": "52-9900-1122-4455", "bg": "A-", "gravida": 2, "para": 1, "ga": 36,
            "phc": "Primary Health Centre Talegaon", "doctor": "Dr. Nilesh Bansode", "phone": "+91 94220 11004", "hosp_idx": 2, "amb_idx": 0,
            "diag": "Gestational Diabetes with Polyhydramnios", "sec_diag": "AFI 24cm, elevated blood sugar",
            "reason": "Gestational diabetes with polyhydramnios requiring specialized obstetric surveillance.",
            "interventions": "IV Normal Saline running, Fetal kick counts recorded",
            "transfusion": False, "units": 0, "eta": 25, "dist": 19.5, "status": "EN_ROUTE",
            "vitals": {"sbp": 144, "dbp": 92, "hr": 98, "rr": 20, "temp": 98.2, "spo2": 97}
        },
        {
            "name": "Archana Vijay Tambe", "age": 32, "abha": "38-6611-9944-0022", "bg": "O-", "gravida": 3, "para": 2, "ga": 39,
            "phc": "Primary Health Centre Shirur", "doctor": "Dr. Archana Wagh", "phone": "+91 94220 11005", "hosp_idx": 0, "amb_idx": 1,
            "diag": "Twin Gestation in Active Labour", "sec_diag": "Twin A vertex, Twin B transverse lie",
            "reason": "Twin pregnancy in active labour; needs tertiary delivery unit with dual neonatal resuscitation setup.",
            "interventions": "IV RL started with 18G cannula, Blood group sample sent",
            "transfusion": True, "units": 2, "eta": 38, "dist": 34.0, "status": "EN_ROUTE",
            "vitals": {"sbp": 136, "dbp": 90, "hr": 104, "rr": 22, "temp": 98.8, "spo2": 96}
        },

        # --- 5 LOW RISK CASES ---
        {
            "name": "Pallavi Tushar Sonawane", "age": 22, "abha": "11-8844-3322-9911", "bg": "B+", "gravida": 1, "para": 0, "ga": 39,
            "phc": "Primary Health Centre Chakan", "doctor": "Dr. Vikas Kadam", "phone": "+91 94220 11001", "hosp_idx": 0, "amb_idx": 0,
            "diag": "Prolonged Latent Phase of Labour in Primigravida", "sec_diag": "Cervix 2cm, 50% effaced, uterine contractions irregular for 18 hrs",
            "reason": "Primigravida with slow labour progression; referred for active management of labour and continuous cardiotocography (CTG).",
            "interventions": "IV hydration with Dextrose Normal Saline, Reassurance and maternal support provided",
            "transfusion": False, "units": 0, "eta": 30, "dist": 24.0, "status": "EN_ROUTE",
            "vitals": {"sbp": 118, "dbp": 76, "hr": 82, "rr": 16, "temp": 98.4, "spo2": 99}
        },
        {
            "name": "Jyoti Sandeep Bhalerao", "age": 24, "abha": "67-3311-8844-5500", "bg": "A+", "gravida": 2, "para": 1, "ga": 40,
            "phc": "Primary Health Centre Moshi", "doctor": "Dr. Seema Kulkarni", "phone": "+91 94220 11008", "hosp_idx": 2, "amb_idx": 1,
            "diag": "Post-Dated Pregnancy (40+5 Weeks) for Induction of Labour", "sec_diag": "Bishop Score 4, reactive non-stress test (NST)",
            "reason": "Post-term pregnancy requiring cervical ripening and planned induction at higher facility with round-the-clock OT backup.",
            "interventions": "Fetal heart rate recorded normal (140 bpm), Reassurance given to patient and family",
            "transfusion": False, "units": 0, "eta": 14, "dist": 11.5, "status": "TREATMENT_STARTED",
            "vitals": {"sbp": 122, "dbp": 78, "hr": 78, "rr": 18, "temp": 98.6, "spo2": 99}
        },
        {
            "name": "Snehal Amol Garje", "age": 25, "abha": "94-2200-7733-1188", "bg": "O+", "gravida": 1, "para": 0, "ga": 38,
            "phc": "Primary Health Centre Wagholi", "doctor": "Dr. Sanjay Mahajan", "phone": "+91 94220 11009", "hosp_idx": 0, "amb_idx": 2,
            "diag": "Mild Gestational Hypertension at Term", "sec_diag": "No proteinuria, no epigastric or visual complaints",
            "reason": "Borderline blood pressure elevation at term; referred for institutional delivery under specialist observation.",
            "interventions": "Oral labetalol not yet required, patient resting in quiet room, IV cannula kept patent",
            "transfusion": False, "units": 0, "eta": 26, "dist": 20.0, "status": "ARRIVED",
            "vitals": {"sbp": 132, "dbp": 86, "hr": 84, "rr": 17, "temp": 98.2, "spo2": 98}
        },
        {
            "name": "Urmila Kailas Daund", "age": 23, "abha": "48-1177-3399-6622", "bg": "AB+", "gravida": 2, "para": 1, "ga": 39,
            "phc": "Primary Health Centre Alandi", "doctor": "Dr. Pradip Zaware", "phone": "+91 94220 11003", "hosp_idx": 1, "amb_idx": 0,
            "diag": "Mild Oligohydramnios with Borderline AFI (7.2 cm)", "sec_diag": "Good fetal movements, normal umbilical artery Doppler",
            "reason": "Referred for planned delivery in view of low amniotic fluid volume at 39 weeks.",
            "interventions": "Oral hydration advised, IV line maintained with Normal Saline",
            "transfusion": False, "units": 0, "eta": 21, "dist": 16.0, "status": "EN_ROUTE",
            "vitals": {"sbp": 114, "dbp": 72, "hr": 80, "rr": 16, "temp": 98.4, "spo2": 99}
        },
        {
            "name": "Ashwini Chetan Salve", "age": 27, "abha": "83-5599-2244-1177", "bg": "B+", "gravida": 1, "para": 0, "ga": 37,
            "phc": "Primary Health Centre Talegaon", "doctor": "Dr. Nilesh Bansode", "phone": "+91 94220 11004", "hosp_idx": 2, "amb_idx": 1,
            "diag": "Maternal Anxiety with Mild Early Labour Contractions", "sec_diag": "Reassuring CTG, cervix soft and 1-2cm open",
            "reason": "Patient requested transfer to tertiary center for institutional delivery due to previous family loss.",
            "interventions": "Emotional support, vital signs check, basic IV line placed",
            "transfusion": False, "units": 0, "eta": 18, "dist": 13.5, "status": "COMPLETED",
            "vitals": {"sbp": 120, "dbp": 78, "hr": 86, "rr": 18, "temp": 98.6, "spo2": 99}
        }
    ]

    hospitals = db.query(Hospital).all()
    ambulances = db.query(Ambulance).all()

    now = datetime.datetime.utcnow()

    for idx, item in enumerate(mock_cases):
        # 1. Create Patient
        patient = Patient(
            full_name=item["name"],
            age=item["age"],
            abha_id=item["abha"],
            blood_group=item["bg"],
            gravida=item["gravida"],
            para=item["para"],
            gestational_age_weeks=item["ga"],
            contact_phone=f"+91 98230 {10000 + idx}",
            emergency_contact_name=f"Relative of {item['name'].split()[0]}",
            emergency_contact_phone=f"+91 97640 {20000 + idx}",
            village_town=item["phc"].replace("Primary Health Centre ", "").replace("Community Health Centre ", "") + " Rural Area",
            created_at=now - datetime.timedelta(minutes=45 - idx)
        )
        db.add(patient)
        db.flush()

        # 2. Calculate MEOWS
        v = item["vitals"]
        meows_result = calculate_meows(
            systolic_bp=v["sbp"],
            diastolic_bp=v["dbp"],
            heart_rate=v["hr"],
            respiratory_rate=v["rr"],
            temperature_f=v["temp"],
            spo2=v["spo2"]
        )

        hosp = hospitals[item["hosp_idx"]]
        amb = ambulances[item["amb_idx"] % len(ambulances)]

        # 3. Create Referral
        ref_code = f"SETU-REF-2026-{1001 + idx}"
        referral = Referral(
            referral_code=ref_code,
            patient_id=patient.id,
            referring_facility_name=item["phc"],
            referring_facility_type="PHC" if "PHC" in item["phc"] or "Primary" in item["phc"] else "CHC",
            referring_doctor_name=item["doctor"],
            referring_doctor_phone=item["phone"],
            destination_hospital_id=hosp.id,
            ambulance_id=amb.id,
            primary_diagnosis=item["diag"],
            secondary_diagnosis=item["sec_diag"],
            referral_reason=item["reason"],
            meows_score=meows_result["total_score"],
            risk_level=meows_result["risk_level"],
            risk_color=meows_result["risk_color"],
            clinical_summary=" | ".join(meows_result["clinical_flags"]) if meows_result["clinical_flags"] else "Vitals stable upon departure.",
            meows_recommendation="; ".join(meows_result["recommendations"]),
            priority="CRITICAL_EMERGENCY" if meows_result["risk_level"] == "HIGH RISK" else ("URGENT" if meows_result["risk_level"] == "MEDIUM RISK" else "STANDARD"),
            status=item["status"],
            interventions_given=item["interventions"],
            blood_transfusion_needed=item["transfusion"],
            blood_units_needed=item["units"],
            estimated_time_minutes=item["eta"],
            distance_km=item["dist"],
            origin_lat=18.7000 + (idx * 0.015),
            origin_lng=73.8000 + (idx * 0.012),
            created_at=now - datetime.timedelta(minutes=35 - idx),
            updated_at=now - datetime.timedelta(minutes=5),
            arrived_at=now - datetime.timedelta(minutes=10) if item["status"] in ("ARRIVED", "TREATMENT_STARTED", "COMPLETED") else None,
            treatment_started_at=now - datetime.timedelta(minutes=4) if item["status"] in ("TREATMENT_STARTED", "COMPLETED") else None
        )
        db.add(referral)
        db.flush()

        # 4. Create Initial Vitals Log
        vitals_log = VitalsLog(
            referral_id=referral.id,
            recorded_at=now - datetime.timedelta(minutes=35 - idx),
            recorded_by=item["doctor"],
            location_type="PHC",
            systolic_bp=v["sbp"],
            diastolic_bp=v["dbp"],
            heart_rate=v["hr"],
            respiratory_rate=v["rr"],
            temperature_f=v["temp"],
            spo2=v["spo2"],
            meows_score=meows_result["total_score"],
            risk_level=meows_result["risk_level"],
            notes=f"Initial triage evaluation at {item['phc']}."
        )
        db.add(vitals_log)

        # 5. Create Readiness Checklist
        # If High risk, some items prepared
        is_high = meows_result["risk_level"] == "HIGH RISK"
        is_med = meows_result["risk_level"] == "MEDIUM RISK"
        readiness = ReadinessChecklist(
            referral_id=referral.id,
            icu_prepared=is_high or idx % 2 == 0,
            icu_bed_number=f"ICU-Bed-{idx % 8 + 1:02d}",
            icu_prepared_at=now - datetime.timedelta(minutes=20) if (is_high or idx % 2 == 0) else None,
            blood_prepared=item["transfusion"] and (is_high or idx % 3 == 0),
            blood_units_reserved=item["units"],
            blood_prepared_at=now - datetime.timedelta(minutes=18) if (item["transfusion"] and is_high) else None,
            specialist_alerted=is_high or is_med,
            specialist_name=hosp.on_duty_obstetrician,
            specialist_alerted_at=now - datetime.timedelta(minutes=25) if (is_high or is_med) else None,
            ot_prepared=is_high and idx % 2 == 0,
            ot_number=f"Emergency OT-{(idx % 3) + 1}",
            ot_prepared_at=now - datetime.timedelta(minutes=15) if (is_high and idx % 2 == 0) else None,
            medication_prepared=True,
            medication_kit_code=f"Maternal Kit #{101 + idx}",
            medication_prepared_at=now - datetime.timedelta(minutes=22),
            all_prepared=is_high and idx % 2 == 0 and item["transfusion"],
            last_updated_by="Hospital Emergency Coordinator"
        )
        db.add(readiness)

        # 6. Create Notification
        if is_high or is_med:
            notification = Notification(
                title=f"🚨 {meows_result['risk_level']} Referral: {item['name']}",
                message=f"Incoming from {item['phc']} — {item['diag']} (MEOWS: {meows_result['total_score']}). ETA: {item['eta']} mins.",
                category="HIGH_RISK_REFERRAL" if is_high else "URGENT_REFERRAL",
                risk_level=meows_result["risk_level"],
                referral_id=referral.id,
                referral_code=ref_code,
                created_at=now - datetime.timedelta(minutes=30 - idx),
                is_read=idx > 3
            )
            db.add(notification)

    db.commit()
    print("Database seeding successfully completed with 20 realistic maternal cases!")
