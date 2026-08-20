import { jsPDF } from 'jspdf';
import { Referral } from '../types';

export function generateReferralPDF(referral: Referral) {
  const doc = new jsPDF();

  // Color Palette
  const primaryColor = [37, 99, 235]; // #2563EB
  const darkColor = [15, 23, 42]; // #0F172A
  const grayColor = [100, 116, 139]; // #64748B
  const redColor = [239, 68, 68];
  const greenColor = [34, 197, 94];
  const amberColor = [245, 158, 11];

  // Header Banner
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, 210, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('SETU-IFT : SMART EMERGENCY INTER-FACILITY REFERRAL', 14, 12);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('National Maternal Emergency Transfer Network — Inter-Facility Handover Document', 14, 18);
  doc.text('ABDM / FHIR R4 Standard Compliant Transfer Record', 14, 23);

  // Referral Metadata Card
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Referral Code: ${referral.referral_code}`, 14, 38);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date(referral.created_at).toLocaleString()}`, 14, 44);
  doc.text(`Priority: ${referral.priority}`, 140, 38);
  doc.text(`Status: ${referral.status}`, 140, 44);

  // Risk Badge
  const isHigh = referral.risk_level === 'HIGH RISK';
  const isMed = referral.risk_level === 'MEDIUM RISK';
  if (isHigh) {
    doc.setFillColor(redColor[0], redColor[1], redColor[2]);
  } else if (isMed) {
    doc.setFillColor(amberColor[0], amberColor[1], amberColor[2]);
  } else {
    doc.setFillColor(greenColor[0], greenColor[1], greenColor[2]);
  }
  doc.roundedRect(14, 48, 182, 10, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`MEOWS STRATIFICATION: ${referral.risk_level} (Total Score: ${referral.meows_score})`, 20, 54.5);

  // Section 1: Patient Information
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('1. PATIENT DEMOGRAPHICS', 14, 68);
  doc.setDrawColor(203, 213, 225);
  doc.line(14, 70, 196, 70);

  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Full Name: ${referral.patient.full_name}`, 14, 76);
  doc.text(`Age: ${referral.patient.age} yrs`, 90, 76);
  doc.text(`Blood Group: ${referral.patient.blood_group}`, 140, 76);

  doc.text(`Obstetric Index: G${referral.patient.gravida} P${referral.patient.para} (${referral.patient.gestational_age_weeks} weeks GA)`, 14, 82);
  doc.text(`ABHA ID: ${referral.patient.abha_id || 'Not Provided'}`, 90, 82);
  doc.text(`Contact: ${referral.patient.contact_phone || 'N/A'}`, 140, 82);

  // Section 2: Transfer Route & Doctor
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('2. FACILITY & CLINICIAN HANDOVER', 14, 94);
  doc.line(14, 96, 196, 96);

  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Referring Facility: ${referral.referring_facility_name} (${referral.referring_facility_type})`, 14, 102);
  doc.text(`Referring Doctor: ${referral.referring_doctor_name} (${referral.referring_doctor_phone})`, 14, 108);
  doc.text(`Destination Hospital: ${referral.destination_hospital?.name || 'Tertiary Center'}`, 14, 114);
  doc.text(`Assigned Ambulance: ${referral.ambulance?.vehicle_number || 'ALS 108'} (EMT: ${referral.ambulance?.emt_name || 'Assigned'})`, 14, 120);

  // Section 3: Clinical Presentation
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('3. EMERGENCY DIAGNOSIS & REASON FOR REFERRAL', 14, 132);
  doc.line(14, 134, 196, 134);

  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`Primary Diagnosis: ${referral.primary_diagnosis}`, 14, 140);
  if (referral.secondary_diagnosis) {
    doc.setFont('helvetica', 'normal');
    doc.text(`Secondary Findings: ${referral.secondary_diagnosis}`, 14, 146);
  }

  doc.setFont('helvetica', 'normal');
  const splitReason = doc.splitTextToSize(`Clinical Referral Reason: ${referral.referral_reason}`, 180);
  doc.text(splitReason, 14, referral.secondary_diagnosis ? 152 : 146);

  // Section 4: Initial Vitals & MEOWS
  const vitalsY = 168;
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('4. VITAL SIGNS & PHYSIOLOGICAL ABNORMALITIES', 14, vitalsY);
  doc.line(14, vitalsY + 2, 196, vitalsY + 2);

  const initialVitals = referral.vitals_history && referral.vitals_history.length > 0 
    ? referral.vitals_history[0] 
    : null;

  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.setFontSize(9);
  if (initialVitals) {
    doc.text(`Blood Pressure: ${initialVitals.systolic_bp}/${initialVitals.diastolic_bp} mmHg`, 14, vitalsY + 8);
    doc.text(`Heart Rate: ${initialVitals.heart_rate} bpm`, 75, vitalsY + 8);
    doc.text(`Respiratory Rate: ${initialVitals.respiratory_rate}/min`, 130, vitalsY + 8);
    doc.text(`Temperature: ${initialVitals.temperature_f} °F`, 14, vitalsY + 14);
    doc.text(`Oxygen Saturation (SpO2): ${initialVitals.spo2}%`, 75, vitalsY + 14);
  }

  if (referral.clinical_summary) {
    doc.setFont('helvetica', 'italic');
    doc.text(`Flagged Deviations: ${referral.clinical_summary}`, 14, vitalsY + 22);
  }

  // Section 5: Pre-referral Interventions
  const intY = vitalsY + 32;
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('5. PRE-REFERRAL INTERVENTIONS & BLOOD REQUIREMENTS', 14, intY);
  doc.line(14, intY + 2, 196, intY + 2);

  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const splitInterventions = doc.splitTextToSize(`Administered: ${referral.interventions_given || 'Standard stabilization protocols.'}`, 180);
  doc.text(splitInterventions, 14, intY + 8);

  doc.setFont('helvetica', 'bold');
  doc.text(`Blood Transfusion Needed: ${referral.blood_transfusion_needed ? `YES (${referral.blood_units_needed} Units ${referral.patient.blood_group})` : 'NO'}`, 14, intY + 18);

  // Signatures
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setDrawColor(148, 163, 184);
  doc.line(14, 260, 70, 260);
  doc.text('Referring Medical Officer Signature', 14, 264);

  doc.line(130, 260, 190, 260);
  doc.text('Receiving Hospital Triage Signature', 130, 264);

  doc.setFontSize(7);
  doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
  doc.text('Powered by SETU-IFT (Smart Emergency Inter-Facility Transfer System) — National Maternal Health Innovation', 14, 280);

  // Save the PDF
  doc.save(`SETU-REFERRAL-${referral.referral_code}.pdf`);
}
