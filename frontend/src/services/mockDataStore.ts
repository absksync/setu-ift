import { 
  Referral, Hospital, Ambulance, AnalyticsData, 
  MEOWSResult, VitalsInput, ReadinessChecklist, 
  VitalsLog, ABHAVerifyResult 
} from '../types';

// Rule-Based MEOWS Calculation in TypeScript
export function calculateMEOWSClient(vitals: VitalsInput): MEOWSResult {
  const { systolic_bp, diastolic_bp, heart_rate, respiratory_rate, temperature_f, spo2 } = vitals;
  const scoreDetails: Record<string, { value: number; score: number }> = {};
  let totalScore = 0;
  const clinicalFlags: string[] = [];
  let redFlags = 0;
  let yellowFlags = 0;

  // 1. Systolic BP
  let sbpScore = 0;
  if (systolic_bp < 90) {
    sbpScore = 3;
    clinicalFlags.push(`Severe Hypotension (SBP ${systolic_bp} mmHg) - risk of hemorrhagic shock`);
  } else if (systolic_bp >= 90 && systolic_bp <= 139) {
    sbpScore = 0;
  } else if (systolic_bp >= 140 && systolic_bp <= 149) {
    sbpScore = 1;
    clinicalFlags.push(`Mild Systolic Hypertension (SBP ${systolic_bp} mmHg)`);
  } else if (systolic_bp >= 150 && systolic_bp <= 159) {
    sbpScore = 2;
    clinicalFlags.push(`Moderate Systolic Hypertension (SBP ${systolic_bp} mmHg)`);
  } else {
    sbpScore = 3;
    clinicalFlags.push(`Severe Hypertensive Crisis (SBP ${systolic_bp} mmHg) - eclampsia risk`);
  }
  scoreDetails['systolic_bp'] = { value: systolic_bp, score: sbpScore };
  totalScore += sbpScore;

  // 2. Diastolic BP
  let dbpScore = 0;
  if (diastolic_bp < 50) {
    dbpScore = 2;
    clinicalFlags.push(`Severe Diastolic Hypotension (DBP ${diastolic_bp} mmHg)`);
  } else if (diastolic_bp >= 50 && diastolic_bp <= 89) {
    dbpScore = 0;
  } else if (diastolic_bp >= 90 && diastolic_bp <= 99) {
    dbpScore = 1;
  } else if (diastolic_bp >= 100 && diastolic_bp <= 109) {
    dbpScore = 2;
    clinicalFlags.push(`Moderate Diastolic Hypertension (DBP ${diastolic_bp} mmHg)`);
  } else {
    dbpScore = 3;
    clinicalFlags.push(`Severe Diastolic Hypertensive Urgency (DBP ${diastolic_bp} mmHg)`);
  }
  scoreDetails['diastolic_bp'] = { value: diastolic_bp, score: dbpScore };
  totalScore += dbpScore;

  // 3. Heart Rate
  let hrScore = 0;
  if (heart_rate < 50) {
    hrScore = 3;
    clinicalFlags.push(`Severe Bradycardia (HR ${heart_rate} bpm)`);
  } else if (heart_rate >= 50 && heart_rate <= 59) {
    hrScore = 1;
  } else if (heart_rate >= 60 && heart_rate <= 99) {
    hrScore = 0;
  } else if (heart_rate >= 100 && heart_rate <= 109) {
    hrScore = 1;
  } else if (heart_rate >= 110 && heart_rate <= 129) {
    hrScore = 2;
    clinicalFlags.push(`Significant Tachycardia (HR ${heart_rate} bpm)`);
  } else {
    hrScore = 3;
    clinicalFlags.push(`Severe Tachycardia (HR ${heart_rate} bpm) - compensatory shock response`);
  }
  scoreDetails['heart_rate'] = { value: heart_rate, score: hrScore };
  totalScore += hrScore;

  // 4. Respiratory Rate
  let rrScore = 0;
  if (respiratory_rate < 10) {
    rrScore = 3;
    clinicalFlags.push(`Severe Bradypnea (RR ${respiratory_rate}/min)`);
  } else if (respiratory_rate >= 10 && respiratory_rate <= 19) {
    rrScore = 0;
  } else if (respiratory_rate >= 20 && respiratory_rate <= 24) {
    rrScore = 1;
  } else if (respiratory_rate >= 25 && respiratory_rate <= 29) {
    rrScore = 2;
    clinicalFlags.push(`Moderate Tachypnea (RR ${respiratory_rate}/min)`);
  } else {
    rrScore = 3;
    clinicalFlags.push(`Severe Tachypnea (RR ${respiratory_rate}/min) - respiratory compromise`);
  }
  scoreDetails['respiratory_rate'] = { value: respiratory_rate, score: rrScore };
  totalScore += rrScore;

  // 5. Temperature
  let tempScore = 0;
  if (temperature_f < 95.0) {
    tempScore = 3;
    clinicalFlags.push(`Severe Hypothermia (${temperature_f}°F)`);
  } else if (temperature_f >= 95.0 && temperature_f <= 96.8) {
    tempScore = 1;
  } else if (temperature_f >= 96.9 && temperature_f <= 99.5) {
    tempScore = 0;
  } else if (temperature_f >= 99.6 && temperature_f <= 100.9) {
    tempScore = 1;
  } else if (temperature_f >= 101.0 && temperature_f <= 102.2) {
    tempScore = 2;
    clinicalFlags.push(`Pyrexia (${temperature_f}°F)`);
  } else {
    tempScore = 3;
    clinicalFlags.push(`Severe Hyperpyrexia (${temperature_f}°F) - sepsis trigger`);
  }
  scoreDetails['temperature_f'] = { value: temperature_f, score: tempScore };
  totalScore += tempScore;

  // 6. Oxygen Saturation
  let spo2Score = 0;
  if (spo2 < 92) {
    spo2Score = 3;
    clinicalFlags.push(`Critical Hypoxia (SpO2 ${spo2}%)`);
  } else if (spo2 >= 92 && spo2 <= 94) {
    spo2Score = 2;
    clinicalFlags.push(`Mild Hypoxia (SpO2 ${spo2}%)`);
  } else {
    spo2Score = 0;
  }
  scoreDetails['spo2'] = { value: spo2, score: spo2Score };
  totalScore += spo2Score;

  for (const key of Object.keys(scoreDetails)) {
    const s = scoreDetails[key].score;
    if (s === 3) redFlags++;
    else if (s > 0) yellowFlags++;
  }

  let riskLevel: 'LOW RISK' | 'MEDIUM RISK' | 'HIGH RISK' = 'LOW RISK';
  let riskColor = '#22C55E';
  let clinicalReason = 'Vital signs within normal obstetric parameters. Continue standard monitoring.';
  const recommendations: string[] = [];

  if (totalScore >= 4 || redFlags >= 1) {
    riskLevel = 'HIGH RISK';
    riskColor = '#EF4444';
    clinicalReason = `CRITICAL MATERNAL EMERGENCY (Score: ${totalScore}, ${redFlags} Red Flags). Immediate intervention required.`;
    recommendations.push('Immediate obstetrician & anesthetist mobilization at receiving facility');
    recommendations.push('Cross-match and reserve blood products immediately');
    recommendations.push('Prepare ICU bed & Emergency OT on arrival');
    recommendations.push('Maintain high-flow oxygen, wide-bore IV access, and fluid resuscitation');
  } else if (totalScore >= 2 || yellowFlags >= 2) {
    riskLevel = 'MEDIUM RISK';
    riskColor = '#F59E0B';
    clinicalReason = `MODERATE RISK (Score: ${totalScore}). Abnormal maternal parameters detected.`;
    recommendations.push('Alert receiving obstetric team for priority triage on arrival');
    recommendations.push('Re-evaluate full vital signs every 10 minutes in transit');
    recommendations.push('Ensure IV patency and monitor maternal urine output');
  } else {
    recommendations.push('Standard transit monitoring. Re-check vitals every 30 minutes.');
  }

  return {
    total_score: totalScore,
    risk_level: riskLevel,
    risk_color: riskColor,
    score_details: scoreDetails,
    clinical_flags: clinicalFlags,
    clinical_reason: clinicalReason,
    recommendations: recommendations,
    red_flags_count: redFlags,
    yellow_flags_count: yellowFlags,
  };
}

export const INITIAL_HOSPITALS: Hospital[] = [
  {
    id: 1,
    name: "Sassoon General Hospital & BJ Govt Medical College",
    facility_type: "Apex Tertiary Medical College",
    code: "MH-HOSP-SGH-01",
    latitude: 18.5256,
    longitude: 73.8742,
    phone: "+91 20 2612 8000",
    address: "Near Pune Railway Station, Sangamvadi, Pune",
    district: "Pune",
    state: "Maharashtra",
    total_icu_beds: 35,
    available_icu_beds: 8,
    blood_bank_status: "Operational (24x7 Component Facility)",
    available_blood_units: "A+: 18, B+: 22, O+: 34, AB+: 9, O-: 6, A-: 4, B-: 3, AB-: 2",
    on_duty_obstetrician: "Dr. Sunita Deshmukh (Prof & HOD OBGYN)",
    on_duty_anesthetist: "Dr. Rajesh Kulkarni (Senior Anesthetist)",
  },
  {
    id: 2,
    name: "Pune District Hospital (Aundh Civil Hospital)",
    facility_type: "District Hospital",
    code: "MH-HOSP-ADH-02",
    latitude: 18.5621,
    longitude: 73.8087,
    phone: "+91 20 2727 6000",
    address: "Chest Hospital Campus, Aundh, Pune",
    district: "Pune",
    state: "Maharashtra",
    total_icu_beds: 20,
    available_icu_beds: 4,
    blood_bank_status: "Operational (24x7)",
    available_blood_units: "A+: 10, B+: 14, O+: 18, AB+: 4, O-: 3, A-: 2, B-: 1, AB-: 1",
    on_duty_obstetrician: "Dr. Meera Joshi (Civil Surgeon OBGYN)",
    on_duty_anesthetist: "Dr. Anand Patil (Lead Anesthetist)",
  },
  {
    id: 3,
    name: "Yashwantrao Chavan Memorial Hospital (YCMH)",
    facility_type: "Tertiary Municipal Hospital",
    code: "MH-HOSP-YCM-03",
    latitude: 18.6279,
    longitude: 73.8131,
    phone: "+91 20 2742 2222",
    address: "Sant Tukaram Nagar, Pimpri, Pune",
    district: "Pune",
    state: "Maharashtra",
    total_icu_beds: 25,
    available_icu_beds: 6,
    blood_bank_status: "Operational (24x7)",
    available_blood_units: "A+: 12, B+: 15, O+: 20, AB+: 5, O-: 2, A-: 1, B-: 2, AB-: 1",
    on_duty_obstetrician: "Dr. Sanjay Gaikwad (OBGYN Specialist)",
    on_duty_anesthetist: "Dr. Sneha Shinde (Anesthetist)",
  },
  {
    id: 4,
    name: "KEM Hospital Research Centre Pune",
    facility_type: "Tertiary Charitable Hospital",
    code: "MH-HOSP-KEM-04",
    latitude: 18.5204,
    longitude: 73.8643,
    phone: "+91 20 6603 7300",
    address: "Rasta Peth, Sardar Moodliar Road, Pune",
    district: "Pune",
    state: "Maharashtra",
    total_icu_beds: 28,
    available_icu_beds: 5,
    blood_bank_status: "Operational (24x7 Component Bank)",
    available_blood_units: "A+: 15, B+: 18, O+: 25, AB+: 7, O-: 4, A-: 3, B-: 2, AB-: 2",
    on_duty_obstetrician: "Dr. Rohini Tambe (Consultant OBGYN)",
    on_duty_anesthetist: "Dr. Vikram Seth (Consultant Anesthesia)",
  }
];

export const INITIAL_AMBULANCES: Ambulance[] = [
  {
    id: 1,
    vehicle_number: "MH-14-CL-1081",
    vehicle_type: "ALS (Advanced Life Support 108)",
    driver_name: "Ganesh Shinde",
    driver_phone: "+91 98220 11001",
    emt_name: "Santosh More (EMT-Advanced)",
    current_lat: 18.6350,
    current_lng: 73.8670,
    speed_kmh: 52.0,
    bearing: 170.0,
    status: "EN_ROUTE",
  },
  {
    id: 2,
    vehicle_number: "MH-14-CL-1082",
    vehicle_type: "ALS (Advanced Life Support 108)",
    driver_name: "Prakash Jadhav",
    driver_phone: "+91 98220 11003",
    emt_name: "Mahesh Jagtap (EMT-Paramedic)",
    current_lat: 18.7200,
    current_lng: 73.8850,
    speed_kmh: 48.0,
    bearing: 165.0,
    status: "EN_ROUTE",
  },
  {
    id: 3,
    vehicle_number: "MH-12-RN-1083",
    vehicle_type: "BLS (Basic Life Support 108)",
    driver_name: "Sachin Kadam",
    driver_phone: "+91 98220 11005",
    emt_name: "Pooja Patil (Staff Nurse)",
    current_lat: 18.6100,
    current_lng: 73.8450,
    speed_kmh: 44.0,
    bearing: 190.0,
    status: "EN_ROUTE",
  },
  {
    id: 4,
    vehicle_number: "MH-12-RN-1084",
    vehicle_type: "ALS (Maternal Dedicated Transfer)",
    driver_name: "Ramesh Pawar",
    driver_phone: "+91 98220 11007",
    emt_name: "Deepak Shinde (EMT)",
    current_lat: 18.5256,
    current_lng: 73.8742,
    speed_kmh: 0.0,
    bearing: 0.0,
    status: "AVAILABLE",
  },
  {
    id: 5,
    vehicle_number: "MH-14-EM-1085",
    vehicle_type: "ALS (Advanced Life Support)",
    driver_name: "Amol Gaikwad",
    driver_phone: "+91 98220 11009",
    emt_name: "Rekha Wagh (Emergency Nurse)",
    current_lat: 18.5621,
    current_lng: 73.8087,
    speed_kmh: 0.0,
    bearing: 0.0,
    status: "AVAILABLE",
  },
  {
    id: 6,
    vehicle_number: "MH-12-EM-1086",
    vehicle_type: "BLS (First Responder)",
    driver_name: "Vikas Raut",
    driver_phone: "+91 98220 11011",
    emt_name: "Kishor Mane (EMT)",
    current_lat: 18.6279,
    current_lng: 73.8131,
    speed_kmh: 0.0,
    bearing: 0.0,
    status: "AVAILABLE",
  }
];

const RAW_SEED_CASES = [
  {
    id: 1,
    code: "SETU-REF-2026-1021",
    patient: { id: 1, full_name: "Sushila Sandeep Gaikwad", age: 24, blood_group: "O+", gravida: 2, para: 1, gestational_age_weeks: 38, contact_phone: "+91 98230 45678", abha_id: "91-4829-1029-4821", village_town: "Chakan Rural Taluka", created_at: new Date().toISOString() },
    vitals: { systolic_bp: 82, diastolic_bp: 48, heart_rate: 136, respiratory_rate: 28, temperature_f: 96.2, spo2: 91 },
    dx: "Postpartum Hemorrhage (PPH) with Hypovolemic Shock",
    secDx: "Estimated blood loss > 1000ml, active uterine atony",
    reason: "Severe postpartum hemorrhage unresponsive to medical uterotonics. Immediate tertiary blood transfusion & emergency surgical intervention required.",
    interventions: "IV Oxytocin 20 IU in 500ml RL wide open, Misoprostol 800mcg PR given, 2 large bore 16G cannulae running, Oxygen 6L/min",
    blood: true, units: 3, status: "EN_ROUTE" as const, eta: 22, hospId: 1, ambId: 1, fac: "Primary Health Centre Chakan"
  },
  {
    id: 2,
    code: "SETU-REF-2026-1020",
    patient: { id: 2, full_name: "Sunita Sanjay Jadhav", age: 29, blood_group: "B+", gravida: 3, para: 2, gestational_age_weeks: 35, contact_phone: "+91 98230 11223", abha_id: "91-5821-3940-1920", village_town: "Khed Rural", created_at: new Date().toISOString() },
    vitals: { systolic_bp: 178, diastolic_bp: 118, heart_rate: 124, respiratory_rate: 26, temperature_f: 99.2, spo2: 93 },
    dx: "Eclampsia with Generalized Tonic-Clonic Seizures",
    secDx: "Severe Hypertensive Emergency, 3+ Proteinuria, altered sensorium",
    reason: "2 episodes of generalized seizures in labour room. Needs urgent ICU stabilization and emergent cesarean delivery.",
    interventions: "Pritchard Regimen: MgSO4 4g IV + 10g IM loading completed, Labetalol 20mg IV given, Foley catheter draining clear urine",
    blood: false, units: 0, status: "EN_ROUTE" as const, eta: 16, hospId: 1, ambId: 2, fac: "Sub-District Hospital Manchar"
  },
  {
    id: 3,
    code: "SETU-REF-2026-1019",
    patient: { id: 3, full_name: "Kavita Ramesh Gaikwad", age: 22, blood_group: "A-", gravida: 1, para: 0, gestational_age_weeks: 40, contact_phone: "+91 97640 44556", abha_id: "91-9012-4433-2211", village_town: "Alandi Rural", created_at: new Date().toISOString() },
    vitals: { systolic_bp: 146, diastolic_bp: 96, heart_rate: 132, respiratory_rate: 32, temperature_f: 101.8, spo2: 94 },
    dx: "Obstructed Labour with Impending Uterine Rupture",
    secDx: "Bandl's Retraction Ring, second stage arrest > 3 hrs",
    reason: "Cephalopelvic disproportion with deep transverse arrest. Visible Bandl's ring on abdominal palpation. Fetal distress present.",
    interventions: "IV RL wide open, Left lateral position, Inj Ampicillin 2g IV given, Catheter placed, Immediate OT preparation required",
    blood: true, units: 2, status: "EN_ROUTE" as const, eta: 28, hospId: 2, ambId: 3, fac: "Rural Hospital Alandi"
  },
  {
    id: 4,
    code: "SETU-REF-2026-1018",
    patient: { id: 4, full_name: "Pooja Santosh Shinde", age: 26, blood_group: "O-", gravida: 2, para: 1, gestational_age_weeks: 32, contact_phone: "+91 98220 99887", abha_id: "91-3322-1100-9988", village_town: "Rajgurunagar", created_at: new Date().toISOString() },
    vitals: { systolic_bp: 80, diastolic_bp: 46, heart_rate: 138, respiratory_rate: 26, temperature_f: 96.0, spo2: 90 },
    dx: "Placenta Previa with Massive Antepartum Hemorrhage (APH)",
    secDx: "Painless bright red vaginal bleeding ~800ml, maternal shock",
    reason: "Massive unprovoked antepartum hemorrhage. Profound maternal hypotension requiring urgent blood resuscitation and emergent c-section.",
    interventions: "2 wide-bore 16G cannulae with RL & Normal Saline fast infusion, High-flow Oxygen 8L/min, strictly no vaginal exam performed",
    blood: true, units: 4, status: "ARRIVED" as const, eta: 0, hospId: 1, ambId: 4, fac: "Rural Hospital Khed"
  },
  {
    id: 5,
    code: "SETU-REF-2026-1017",
    patient: { id: 5, full_name: "Anita Bhagwan Patil", age: 28, blood_group: "B-", gravida: 4, para: 3, gestational_age_weeks: 37, contact_phone: "+91 94220 33445", abha_id: "91-7788-9900-1122", village_town: "Shirur", created_at: new Date().toISOString() },
    vitals: { systolic_bp: 86, diastolic_bp: 50, heart_rate: 130, respiratory_rate: 30, temperature_f: 103.2, spo2: 92 },
    dx: "Severe Puerperal Sepsis with Septic Shock",
    secDx: "Foul smelling lochia, high fever with rigors, abdominal guarding",
    reason: "Severe pelvic sepsis on Day 4 post home delivery in remote hamlet. Septic shock with altered perfusion.",
    interventions: "IV Ceftriaxone 2g + Metronidazole 500mg IV given, Crystalloid bolus 1500ml given, Oxygen 6L/min, Foley catheterized",
    blood: true, units: 2, status: "TREATMENT_STARTED" as const, eta: 0, hospId: 3, ambId: 5, fac: "Community Health Centre Shirur"
  },
  {
    id: 6,
    code: "SETU-REF-2026-1016",
    patient: { id: 6, full_name: "Manjusha Vikas More", age: 23, blood_group: "A+", gravida: 1, para: 0, gestational_age_weeks: 34, contact_phone: "+91 97650 77889", abha_id: "91-4455-6677-8899", village_town: "Junnar Taluka", created_at: new Date().toISOString() },
    vitals: { systolic_bp: 182, diastolic_bp: 122, heart_rate: 118, respiratory_rate: 32, temperature_f: 99.0, spo2: 91 },
    dx: "Severe Pre-Eclampsia with Acute Pulmonary Edema",
    secDx: "Bilateral crepitations, pink frothy sputum, intense headache",
    reason: "Hypertensive crisis complicated by acute left ventricular failure / pulmonary edema in preterm primigravida.",
    interventions: "Propped-up position, Oxygen 8L/min, IV Furosemide 40mg given, MgSO4 loading dose completed, IV Labetalol infusion started",
    blood: false, units: 0, status: "COMPLETED" as const, eta: 0, hospId: 1, ambId: 1, fac: "Sub-District Hospital Junnar"
  },
  {
    id: 7,
    code: "SETU-REF-2026-1015",
    patient: { id: 7, full_name: "Laxmi Sanjay Bhosale", age: 31, blood_group: "AB-", gravida: 3, para: 2, gestational_age_weeks: 36, contact_phone: "+91 98210 22334", abha_id: "91-1122-3344-5566", village_town: "Otur Rural", created_at: new Date().toISOString() },
    vitals: { systolic_bp: 84, diastolic_bp: 52, heart_rate: 134, respiratory_rate: 28, temperature_f: 96.6, spo2: 92 },
    dx: "Severe Placental Abruption with Coagulopathy (DIC)",
    secDx: "Tense woody uterus, severe continuous abdominal pain, dark hemorrhage",
    reason: "Abruptio placentae following blunt abdominal trauma. Clinical suspicion of DIC with absent fetal heart sounds.",
    interventions: "2 16G IV lines, 2000ml RL infused, Tranexamic acid 1g IV given, Urgent O-Negative crossmatch requested",
    blood: true, units: 4, status: "COMPLETED" as const, eta: 0, hospId: 4, ambId: 2, fac: "Primary Health Centre Otur"
  },
  {
    id: 8,
    code: "SETU-REF-2026-1014",
    patient: { id: 8, full_name: "Meena Datta Jagtap", age: 25, blood_group: "B+", gravida: 2, para: 1, gestational_age_weeks: 37, contact_phone: "+91 98500 12345", abha_id: "91-9988-7766-5544", village_town: "Chakan", created_at: new Date().toISOString() },
    vitals: { systolic_bp: 146, diastolic_bp: 94, heart_rate: 96, respiratory_rate: 18, temperature_f: 98.6, spo2: 97 },
    dx: "Moderate Gestational Hypertension at Term",
    secDx: "Trace proteinuria, persistent frontal headache",
    reason: "Gestational hypertension requiring specialist assessment, CTG monitoring, and induction of labour.",
    interventions: "Tab Nifedipine 10mg given, maternal lateral rest, serial BP chart maintained",
    blood: false, units: 0, status: "EN_ROUTE" as const, eta: 34, hospId: 2, ambId: 3, fac: "PHC Chakan"
  },
  {
    id: 9,
    code: "SETU-REF-2026-1013",
    patient: { id: 9, full_name: "Asha Rahul Salunke", age: 27, blood_group: "A+", gravida: 1, para: 0, gestational_age_weeks: 39, contact_phone: "+91 97630 88990", abha_id: "91-6655-4433-2211", village_town: "Talegaon", created_at: new Date().toISOString() },
    vitals: { systolic_bp: 124, diastolic_bp: 78, heart_rate: 114, respiratory_rate: 22, temperature_f: 100.8, spo2: 97 },
    dx: "Prolonged Rupture of Membranes (PROM > 24 hrs) with Chorioamnionitis",
    secDx: "Maternal low-grade pyrexia, fetal tachycardia 168 bpm",
    reason: "Pre-labour rupture of membranes > 24 hours with maternal subfebrility and fetal tachycardia. Requires active labor management.",
    interventions: "Inj Ampicillin 1g IV + Gentamicin 80mg IV given, sterile pad applied",
    blood: false, units: 0, status: "ARRIVED" as const, eta: 0, hospId: 3, ambId: 4, fac: "Rural Hospital Talegaon"
  },
  {
    id: 10,
    code: "SETU-REF-2026-1012",
    patient: { id: 10, full_name: "Shobha Anil Kamble", age: 24, blood_group: "O+", gravida: 2, para: 1, gestational_age_weeks: 38, contact_phone: "+91 94230 66778", abha_id: "91-2233-4455-6677", village_town: "Manchar", created_at: new Date().toISOString() },
    vitals: { systolic_bp: 104, diastolic_bp: 64, heart_rate: 118, respiratory_rate: 22, temperature_f: 98.4, spo2: 96 },
    dx: "Severe Nutritional Anemia in Labour (Hb 6.4 g/dL)",
    secDx: "Early active labour, pale conjunctivae and nailbeds",
    reason: "Severe uncorrected anemia presenting in active labour. Risk of intrapartum cardiac failure and PPH.",
    interventions: "IV DNS running, strict fluid restriction, 2 units packed red blood cells arranged on standby",
    blood: true, units: 2, status: "TREATMENT_STARTED" as const, eta: 0, hospId: 1, ambId: 5, fac: "Sub-District Hospital Manchar"
  },
  {
    id: 11,
    code: "SETU-REF-2026-1011",
    patient: { id: 11, full_name: "Deepali Mahesh Ghule", age: 29, blood_group: "B-", gravida: 3, para: 2, gestational_age_weeks: 39, contact_phone: "+91 98221 44556", abha_id: "91-8899-0011-2233", village_town: "Daund", created_at: new Date().toISOString() },
    vitals: { systolic_bp: 132, diastolic_bp: 84, heart_rate: 106, respiratory_rate: 22, temperature_f: 99.8, spo2: 96 },
    dx: "Previous 2 Cesarean Sections in Active Labour (TOLAC Contradiction)",
    secDx: "Cervix 4cm dilated, lower segment scar tenderness",
    reason: "Previous 2 LSCS in active labour with scar tenderness. High risk of uterine dehiscence. Emergency repeat cesarean required.",
    interventions: "IV access secured, strictly nil by mouth, blood crossmatch sent",
    blood: true, units: 2, status: "ARRIVED" as const, eta: 0, hospId: 4, ambId: 6, fac: "Rural Hospital Daund"
  },
  {
    id: 12,
    code: "SETU-REF-2026-1010",
    patient: { id: 12, full_name: "Vaishali Ganesh Thorat", age: 21, blood_group: "AB+", gravida: 1, para: 0, gestational_age_weeks: 33, contact_phone: "+91 97620 33445", abha_id: "91-5544-3322-1100", village_town: "Khed", created_at: new Date().toISOString() },
    vitals: { systolic_bp: 112, diastolic_bp: 72, heart_rate: 108, respiratory_rate: 20, temperature_f: 98.6, spo2: 97 },
    dx: "Threatened Preterm Labour with Twin Gestation",
    secDx: "Regular uterine contractions 1 in 8 min, cervix 2cm effaced",
    reason: "Preterm twin pregnancy at 33 weeks with established contractions requiring tocolysis and NICU standby.",
    interventions: "Inj Betamethasone 12mg IM given, IV fluids, Tab Isoxsuprine administered",
    blood: false, units: 0, status: "TREATMENT_STARTED" as const, eta: 0, hospId: 1, ambId: 1, fac: "PHC Khed"
  },
  {
    id: 13,
    code: "SETU-REF-2026-1009",
    patient: { id: 13, full_name: "Sarika Nitin Walunj", age: 30, blood_group: "A+", gravida: 2, para: 1, gestational_age_weeks: 37, contact_phone: "+91 98233 77889", abha_id: "91-1100-9988-7766", village_town: "Narayangaon", created_at: new Date().toISOString() },
    vitals: { systolic_bp: 148, diastolic_bp: 96, heart_rate: 98, respiratory_rate: 20, temperature_f: 98.4, spo2: 97 },
    dx: "Gestational Diabetes with Fetal Macrosomia (EFW 4.1 kg)",
    secDx: "Sub-optimally controlled fasting blood sugar 142 mg/dL",
    reason: "Suspected macrosomic infant in diabetic mother for planned delivery at apex center to prevent shoulder dystocia.",
    interventions: "CBG chart monitored, IV Normal Saline running, pediatric team alerted",
    blood: false, units: 0, status: "COMPLETED" as const, eta: 0, hospId: 2, ambId: 2, fac: "CHC Narayangaon"
  },
  {
    id: 14,
    code: "SETU-REF-2026-1008",
    patient: { id: 14, full_name: "Rohini Balu Shirole", age: 26, blood_group: "O+", gravida: 1, para: 0, gestational_age_weeks: 38, contact_phone: "+91 97660 55667", abha_id: "91-7766-5544-3322", village_town: "Wada", created_at: new Date().toISOString() },
    vitals: { systolic_bp: 120, diastolic_bp: 76, heart_rate: 116, respiratory_rate: 22, temperature_f: 100.6, spo2: 96 },
    dx: "Intrapartum Maternal Pyrexia with Meconium Stained Liquor",
    secDx: "Grade II thick meconium stained amniotic fluid, maternal tachycardia",
    reason: "Thick meconium liquor with maternal fever in active phase. Needs continuous fetal CTG and neonatal resuscitation team on standby.",
    interventions: "Inj Ampicillin 2g IV given, Paracetamol 1g IV given, Maternal hydration with 1000ml RL",
    blood: false, units: 0, status: "COMPLETED" as const, eta: 0, hospId: 3, ambId: 3, fac: "PHC Wada"
  },
  {
    id: 15,
    code: "SETU-REF-2026-1007",
    patient: { id: 15, full_name: "Priyanka Sachin Hande", age: 22, blood_group: "B+", gravida: 2, para: 1, gestational_age_weeks: 39, contact_phone: "+91 98212 99001", abha_id: "91-3344-5566-7788", village_town: "Bhor", created_at: new Date().toISOString() },
    vitals: { systolic_bp: 110, diastolic_bp: 70, heart_rate: 112, respiratory_rate: 22, temperature_f: 98.4, spo2: 96 },
    dx: "Breech Presentation in Active Labour in Primigravida",
    secDx: "Frank breech, membranes ruptured 1 hr ago, cervix 5cm",
    reason: "Breech presentation diagnosed in active labor in primigravida. Emergency cesarean section recommended.",
    interventions: "IV access maintained, left lateral tilt, immediate referral to tertiary center",
    blood: true, units: 1, status: "COMPLETED" as const, eta: 0, hospId: 1, ambId: 4, fac: "Rural Hospital Bhor"
  },
  {
    id: 16,
    code: "SETU-REF-2026-1006",
    patient: { id: 16, full_name: "Pallavi Tushar Sonawane", age: 22, blood_group: "B+", gravida: 1, para: 0, gestational_age_weeks: 39, contact_phone: "+91 94220 88776", abha_id: "91-9900-1122-3344", village_town: "Chakan", created_at: new Date().toISOString() },
    vitals: { systolic_bp: 118, diastolic_bp: 76, heart_rate: 82, respiratory_rate: 16, temperature_f: 98.4, spo2: 99 },
    dx: "Prolonged Latent Phase of Labour",
    secDx: "Cervix 2cm dilated, membranes intact, fetal heart rate 140 bpm",
    reason: "Referred for augmentation of labour and active intrapartum monitoring at first referral unit.",
    interventions: "IV DNS running, maternal hydration and emotional reassurance",
    blood: false, units: 0, status: "EN_ROUTE" as const, eta: 40, hospId: 2, ambId: 5, fac: "PHC Chakan"
  },
  {
    id: 17,
    code: "SETU-REF-2026-1005",
    patient: { id: 17, full_name: "Gauri Sagar Deshmukh", age: 25, blood_group: "A+", gravida: 2, para: 1, gestational_age_weeks: 40, contact_phone: "+91 98234 55667", abha_id: "91-6677-8899-0011", village_town: "Khed", created_at: new Date().toISOString() },
    vitals: { systolic_bp: 122, diastolic_bp: 78, heart_rate: 86, respiratory_rate: 16, temperature_f: 98.6, spo2: 98 },
    dx: "Post-Dated Pregnancy (40+5 Weeks) for Induction of Labour",
    secDx: "AFI 9cm, reassuring non-stress test (NST)",
    reason: "Post-term surveillance and planned induction with Dinoprostone gel at higher facility.",
    interventions: "Admission counseling, routine baseline investigations checked",
    blood: false, units: 0, status: "ARRIVED" as const, eta: 0, hospId: 3, ambId: 6, fac: "PHC Khed"
  },
  {
    id: 18,
    code: "SETU-REF-2026-1004",
    patient: { id: 18, full_name: "Swati Pravin Kolhe", age: 27, blood_group: "O+", gravida: 1, para: 0, gestational_age_weeks: 38, contact_phone: "+91 97654 33221", abha_id: "91-2211-0099-8877", village_town: "Manchar", created_at: new Date().toISOString() },
    vitals: { systolic_bp: 114, diastolic_bp: 72, heart_rate: 78, respiratory_rate: 16, temperature_f: 98.2, spo2: 99 },
    dx: "Spontaneous Rupture of Membranes with Clear Liquor",
    secDx: "Cervix 1cm, not in active labour, FHR 144 bpm",
    reason: "Spontaneous rupture of membranes at 38 weeks for safe institutional delivery.",
    interventions: "Sterile perineal pad, vitals monitored, maternal antibiotic prophylaxis started",
    blood: false, units: 0, status: "TREATMENT_STARTED" as const, eta: 0, hospId: 1, ambId: 1, fac: "Sub-District Hospital Manchar"
  },
  {
    id: 19,
    code: "SETU-REF-2026-1003",
    patient: { id: 19, full_name: "Rupali Dnyaneshwar Wable", age: 23, blood_group: "B+", gravida: 2, para: 1, gestational_age_weeks: 39, contact_phone: "+91 94231 22334", abha_id: "91-8877-6655-4433", village_town: "Otur", created_at: new Date().toISOString() },
    vitals: { systolic_bp: 120, diastolic_bp: 74, heart_rate: 80, respiratory_rate: 16, temperature_f: 98.4, spo2: 98 },
    dx: "Normal First Stage Labour with Maternal Anxiety",
    secDx: "Cervix 4cm dilated, clear liquor, regular uterine contractions",
    reason: "Transfer requested by family for delivery at tertiary medical college facility.",
    interventions: "Partograph initiated, psychological support, IV access placed",
    blood: false, units: 0, status: "COMPLETED" as const, eta: 0, hospId: 4, ambId: 2, fac: "PHC Otur"
  },
  {
    id: 20,
    code: "SETU-REF-2026-1002",
    patient: { id: 20, full_name: "Archana Mahesh Garje", age: 26, blood_group: "O+", gravida: 1, para: 0, gestational_age_weeks: 38, contact_phone: "+91 98213 11223", abha_id: "91-4433-2211-0099", village_town: "Daund", created_at: new Date().toISOString() },
    vitals: { systolic_bp: 124, diastolic_bp: 76, heart_rate: 84, respiratory_rate: 18, temperature_f: 98.6, spo2: 99 },
    dx: "Borderline Oligohydramnios with Reassuring Biophysical Profile",
    secDx: "AFI 7.4 cm, normal doppler indices, cephalic presentation",
    reason: "Elective referral for specialized obstetric ultrasound and continuous CTG monitoring during labour.",
    interventions: "Oral hydration, non-stress test verified, referral documents compiled",
    blood: false, units: 0, status: "COMPLETED" as const, eta: 0, hospId: 1, ambId: 3, fac: "Rural Hospital Daund"
  }
];

function generateInitialReferrals(): Referral[] {
  return RAW_SEED_CASES.map((item) => {
    const meows = calculateMEOWSClient(item.vitals);
    const hosp = INITIAL_HOSPITALS.find((h) => h.id === item.hospId) || INITIAL_HOSPITALS[0];
    const amb = INITIAL_AMBULANCES.find((a) => a.id === item.ambId) || INITIAL_AMBULANCES[0];

    const isHigh = meows.risk_level === 'HIGH RISK';
    const isMed = meows.risk_level === 'MEDIUM RISK';

    const readiness: ReadinessChecklist = {
      id: item.id,
      referral_id: item.id,
      icu_prepared: isHigh,
      icu_bed_number: isHigh ? `ICU-Bed-0${(item.id % 6) + 1}` : undefined,
      icu_prepared_at: isHigh ? new Date().toISOString() : undefined,
      blood_prepared: item.blood,
      blood_units_reserved: item.units,
      blood_prepared_at: item.blood ? new Date().toISOString() : undefined,
      specialist_alerted: isHigh || isMed,
      specialist_name: isHigh ? "Dr. Sunita Deshmukh (OB-GYN HOD)" : "Dr. Rajesh Kulkarni (Duty OB-GYN)",
      specialist_alerted_at: (isHigh || isMed) ? new Date().toISOString() : undefined,
      ot_prepared: isHigh,
      ot_number: isHigh ? `OT-0${(item.id % 3) + 1}` : undefined,
      ot_prepared_at: isHigh ? new Date().toISOString() : undefined,
      medication_prepared: true,
      medication_kit_code: isHigh ? "EMERG-PPH-KIT-A" : "MATERNAL-STABILIZATION-KIT",
      medication_prepared_at: new Date().toISOString(),
      all_prepared: isHigh ? (item.blood ? true : false) : true,
      last_updated_by: "Hospital Emergency Triage Team",
    };

    const initialLog: VitalsLog = {
      id: item.id,
      referral_id: item.id,
      recorded_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      recorded_by: "PHC Medical Officer",
      location_type: "DEPARTURE_FACILITY",
      systolic_bp: item.vitals.systolic_bp,
      diastolic_bp: item.vitals.diastolic_bp,
      heart_rate: item.vitals.heart_rate,
      respiratory_rate: item.vitals.respiratory_rate,
      temperature_f: item.vitals.temperature_f,
      spo2: item.vitals.spo2,
      meows_score: meows.total_score,
      risk_level: meows.risk_level,
      notes: "Baseline vitals logged prior to transfer departure."
    };

    return {
      id: item.id,
      referral_code: item.code,
      patient_id: item.patient.id,
      patient: item.patient,
      referring_facility_name: item.fac,
      referring_facility_type: "PHC / CHC",
      referring_doctor_name: "Dr. Vikas Kadam (Medical Officer)",
      referring_doctor_phone: "+91 94220 11001",
      destination_hospital_id: item.hospId,
      destination_hospital: hosp,
      ambulance_id: item.ambId,
      ambulance: amb,
      primary_diagnosis: item.dx,
      secondary_diagnosis: item.secDx,
      referral_reason: item.reason,
      interventions_given: item.interventions,
      blood_transfusion_needed: item.blood,
      blood_units_needed: item.units,
      priority: isHigh ? "CRITICAL_EMERGENCY" : isMed ? "URGENT" : "STANDARD",
      status: item.status,
      meows_score: meows.total_score,
      risk_level: meows.risk_level,
      risk_color: meows.risk_color,
      estimated_time_minutes: item.eta,
      distance_km: 24.5,
      origin_lat: 18.7523,
      origin_lng: 73.8596,
      created_at: new Date(Date.now() - item.id * 15 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
      readiness: readiness,
      vitals_history: [initialLog],
    };
  });
}

class ClientDataStore {
  public referrals: Referral[] = [];
  public hospitals: Hospital[] = INITIAL_HOSPITALS;
  public ambulances: Ambulance[] = INITIAL_AMBULANCES;
  private listeners: ((event: string, data: any) => void)[] = [];

  constructor() {
    this.referrals = generateInitialReferrals();
    this.startSimulation();
  }

  public subscribe(listener: (event: string, data: any) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private emit(event: string, data: any) {
    this.listeners.forEach((l) => l(event, data));
  }

  private startSimulation() {
    let step = 0;
    setInterval(() => {
      step++;
      this.ambulances.forEach((amb, idx) => {
        if (amb.status === 'EN_ROUTE') {
          const deltaLat = (Math.sin(step * 0.1 + idx) * 0.001);
          const deltaLng = (Math.cos(step * 0.1 + idx) * 0.001);
          amb.current_lat = +(amb.current_lat + deltaLat).toFixed(5);
          amb.current_lng = +(amb.current_lng + deltaLng).toFixed(5);
          amb.speed_kmh = Math.floor(45 + Math.random() * 15);

          this.emit('AMBULANCE_GPS_TICK', {
            ambulance_id: amb.id,
            vehicle_number: amb.vehicle_number,
            lat: amb.current_lat,
            lng: amb.current_lng,
            speed: amb.speed_kmh,
            bearing: 170.0,
            status: amb.status
          });
        }
      });
    }, 4000);
  }

  public getReferrals(params?: { risk_level?: string; hospital_id?: number; status?: string; search?: string }): Referral[] {
    let list = [...this.referrals];
    if (params?.risk_level && params.risk_level !== 'ALL') {
      list = list.filter((r) => r.risk_level === params.risk_level);
    }
    if (params?.hospital_id) {
      list = list.filter((r) => r.destination_hospital_id === params.hospital_id);
    }
    if (params?.status) {
      list = list.filter((r) => r.status === params.status);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (r) =>
          r.patient.full_name.toLowerCase().includes(q) ||
          r.primary_diagnosis.toLowerCase().includes(q) ||
          r.referral_code.toLowerCase().includes(q)
      );
    }
    return list;
  }

  public getReferralById(id: number): Referral | undefined {
    return this.referrals.find((r) => r.id === id);
  }

  public createReferral(data: any): Referral {
    const meows = calculateMEOWSClient(data.vitals);
    const newId = this.referrals.length + 1;
    const hosp = this.hospitals.find((h) => h.id === data.destination_hospital_id) || this.hospitals[0];
    const amb = this.ambulances[0];

    const newPatient = {
      id: newId + 100,
      full_name: data.patient_name,
      age: data.age,
      blood_group: data.blood_group,
      gravida: data.gravida,
      para: data.para,
      gestational_age_weeks: data.gestational_age_weeks,
      contact_phone: data.contact_phone,
      emergency_contact_name: data.emergency_contact_name,
      emergency_contact_phone: data.emergency_contact_phone,
      abha_id: data.abha_id,
      village_town: data.village_town || 'Chakan Rural',
      created_at: new Date().toISOString(),
    };

    const isHigh = meows.risk_level === 'HIGH RISK';

    const readiness: ReadinessChecklist = {
      id: newId,
      referral_id: newId,
      icu_prepared: false,
      blood_prepared: false,
      blood_units_reserved: data.blood_units_needed || 0,
      specialist_alerted: false,
      ot_prepared: false,
      medication_prepared: true,
      all_prepared: false,
      last_updated_by: "Hospital Emergency Team",
    };

    const initialLog: VitalsLog = {
      id: newId * 10,
      referral_id: newId,
      recorded_at: new Date().toISOString(),
      recorded_by: data.referring_doctor_name || "PHC Doctor",
      location_type: "DEPARTURE_FACILITY",
      systolic_bp: data.vitals.systolic_bp,
      diastolic_bp: data.vitals.diastolic_bp,
      heart_rate: data.vitals.heart_rate,
      respiratory_rate: data.vitals.respiratory_rate,
      temperature_f: data.vitals.temperature_f,
      spo2: data.vitals.spo2,
      meows_score: meows.total_score,
      risk_level: meows.risk_level,
      notes: "Emergency referral departure vitals"
    };

    const newRef: Referral = {
      id: newId,
      referral_code: `SETU-REF-2026-${1022 + newId}`,
      patient_id: newPatient.id,
      patient: newPatient,
      referring_facility_name: data.referring_facility_name || "PHC Chakan",
      referring_facility_type: data.referring_facility_type || "PHC",
      referring_doctor_name: data.referring_doctor_name,
      referring_doctor_phone: data.referring_doctor_phone,
      destination_hospital_id: hosp.id,
      destination_hospital: hosp,
      ambulance_id: amb.id,
      ambulance: amb,
      primary_diagnosis: data.primary_diagnosis,
      secondary_diagnosis: data.secondary_diagnosis,
      referral_reason: data.referral_reason,
      interventions_given: data.interventions_given,
      blood_transfusion_needed: data.blood_transfusion_needed,
      blood_units_needed: data.blood_units_needed || 0,
      priority: data.priority || (isHigh ? "CRITICAL_EMERGENCY" : "URGENT"),
      status: "EN_ROUTE",
      meows_score: meows.total_score,
      risk_level: meows.risk_level,
      risk_color: meows.risk_color,
      estimated_time_minutes: 24,
      distance_km: 24.5,
      origin_lat: 18.7523,
      origin_lng: 73.8596,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      readiness: readiness,
      vitals_history: [initialLog]
    };

    this.referrals.unshift(newRef);
    this.emit('NEW_REFERRAL', {
      referral_id: newRef.id,
      referral_code: newRef.referral_code,
      patient_name: newRef.patient.full_name,
      risk_level: newRef.risk_level,
      meows_score: newRef.meows_score,
      primary_diagnosis: newRef.primary_diagnosis,
      estimated_time_minutes: newRef.estimated_time_minutes,
      destination_hospital: hosp.name
    });

    return newRef;
  }

  public updateReadiness(referralId: number, update: Partial<ReadinessChecklist> & { last_updated_by?: string }): ReadinessChecklist {
    const ref = this.referrals.find((r) => r.id === referralId);
    if (!ref || !ref.readiness) throw new Error("Referral not found");

    Object.assign(ref.readiness, update, {
      last_updated_by: update.last_updated_by || "Hospital Triage Team"
    });

    this.emit('READINESS_UPDATED', {
      referral_id: referralId,
      readiness: ref.readiness
    });

    return ref.readiness;
  }

  public logVitals(referralId: number, vitalsData: VitalsInput & { recorded_by?: string; notes?: string }): VitalsLog {
    const ref = this.referrals.find((r) => r.id === referralId);
    if (!ref) throw new Error("Referral not found");

    const meows = calculateMEOWSClient(vitalsData);
    ref.meows_score = meows.total_score;
    ref.risk_level = meows.risk_level;
    ref.risk_color = meows.risk_color;

    const log: VitalsLog = {
      id: Date.now(),
      referral_id: referralId,
      recorded_at: new Date().toISOString(),
      recorded_by: vitalsData.recorded_by || "Ambulance EMT",
      location_type: "AMBULANCE_TRANSIT",
      systolic_bp: vitalsData.systolic_bp,
      diastolic_bp: vitalsData.diastolic_bp,
      heart_rate: vitalsData.heart_rate,
      respiratory_rate: vitalsData.respiratory_rate,
      temperature_f: vitalsData.temperature_f,
      spo2: vitalsData.spo2,
      meows_score: meows.total_score,
      risk_level: meows.risk_level,
      notes: vitalsData.notes
    };

    if (!ref.vitals_history) ref.vitals_history = [];
    ref.vitals_history.push(log);

    this.emit('VITALS_UPDATED', {
      referral_id: referralId,
      vitals: log,
      new_meows_score: meows.total_score,
      new_risk_level: meows.risk_level
    });

    return log;
  }

  public updateStatus(referralId: number, status: string, updatedBy: string = "Hospital Staff"): Referral {
    const ref = this.referrals.find((r) => r.id === referralId);
    if (!ref) throw new Error("Referral not found");

    ref.status = status as any;
    this.emit('STATUS_CHANGED', {
      referral_id: referralId,
      new_status: status,
      updated_by: updatedBy
    });

    return ref;
  }

  public getAnalytics(): AnalyticsData {
    const total = this.referrals.length;
    const high = this.referrals.filter((r) => r.risk_level === 'HIGH RISK').length;
    const med = this.referrals.filter((r) => r.risk_level === 'MEDIUM RISK').length;
    const low = this.referrals.filter((r) => r.risk_level === 'LOW RISK').length;

    return {
      metrics: {
        total_referrals: total,
        high_risk_cases: high,
        medium_risk_cases: med,
        low_risk_cases: low,
        avg_preparation_lead_time_min: 23.8,
        avg_transit_duration_min: 26.2,
        overall_preparedness_rate: "75.0%",
        blood_readiness_rate: "25.0%",
        icu_readiness_rate: "65.0%",
        specialist_alert_rate: "75.0%"
      },
      risk_distribution: [
        { name: "High Risk (Score ≥4)", value: high, color: "#EF4444" },
        { name: "Medium Risk (Score 2-3)", value: med, color: "#F59E0B" },
        { name: "Low Risk (Score 0-1)", value: low, color: "#22C55E" }
      ],
      diagnosis_distribution: [
        { name: "Postpartum Hemorrhage (PPH)", count: 6, percentage: 30 },
        { name: "Eclampsia / Severe Pre-eclampsia", count: 5, percentage: 25 },
        { name: "Obstructed / Prolonged Labour", count: 4, percentage: 20 },
        { name: "Sepsis / Chorioamnionitis", count: 2, percentage: 10 },
        { name: "Antepartum Hemorrhage / Abruption", count: 3, percentage: 15 }
      ],
      weekly_trends: [
        { day: "Mon", total: 2, high_risk: 1, avg_lead_mins: 22 },
        { day: "Tue", total: 3, high_risk: 1, avg_lead_mins: 24 },
        { day: "Wed", total: 4, high_risk: 2, avg_lead_mins: 25 },
        { day: "Thu", total: 3, high_risk: 1, avg_lead_mins: 20 },
        { day: "Fri", total: 5, high_risk: 2, avg_lead_mins: 26 },
        { day: "Sat", total: 2, high_risk: 0, avg_lead_mins: 21 },
        { day: "Sun", total: 1, high_risk: 0, avg_lead_mins: 23 }
      ],
      hospital_performance: [
        { id: 1, name: "Sassoon General Hospital", facility_type: "Medical College", district: "Pune", total_received: 9, high_risk_received: 5, available_icu: 8, avg_prep_time_minutes: 18, compliance_rate: "94%" },
        { id: 2, name: "Pune District Hospital (Aundh)", facility_type: "District Hospital", district: "Pune", total_received: 5, high_risk_received: 2, available_icu: 4, avg_prep_time_minutes: 22, compliance_rate: "88%" },
        { id: 3, name: "YCM Hospital Pimpri", facility_type: "Municipal Hospital", district: "Pune", total_received: 4, high_risk_received: 1, available_icu: 6, avg_prep_time_minutes: 20, compliance_rate: "90%" },
        { id: 4, name: "KEM Hospital Pune", facility_type: "Charitable Hospital", district: "Pune", total_received: 2, high_risk_received: 1, available_icu: 5, avg_prep_time_minutes: 19, compliance_rate: "92%" }
      ],
      recent_activity: []
    };
  }
}

export const mockStore = new ClientDataStore();
