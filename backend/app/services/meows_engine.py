from typing import Dict, Any, List

def calculate_meows(
    systolic_bp: int,
    diastolic_bp: int,
    heart_rate: int,
    respiratory_rate: int,
    temperature_f: float,
    spo2: int
) -> Dict[str, Any]:
    """
    Computes rule-based Modified Early Obstetric Warning Score (MEOWS)
    for pregnant and postpartum patients.
    """
    score_details = {}
    total_score = 0
    clinical_flags: List[str] = []
    red_flags_count = 0
    yellow_flags_count = 0

    # 1. Systolic Blood Pressure
    sbp_score = 0
    if systolic_bp < 90:
        sbp_score = 3
        clinical_flags.append(f"Severe Hypotension (SBP {systolic_bp} mmHg) - risk of hemorrhagic/septic shock")
    elif 90 <= systolic_bp <= 139:
        sbp_score = 0
    elif 140 <= systolic_bp <= 149:
        sbp_score = 1
        clinical_flags.append(f"Mild Systolic Hypertension (SBP {systolic_bp} mmHg)")
    elif 150 <= systolic_bp <= 159:
        sbp_score = 2
        clinical_flags.append(f"Moderate Systolic Hypertension (SBP {systolic_bp} mmHg)")
    else: # >= 160
        sbp_score = 3
        clinical_flags.append(f"Severe Hypertensive Crisis (SBP {systolic_bp} mmHg) - high risk of eclamptic seizure / stroke")
    score_details["systolic_bp"] = {"value": systolic_bp, "score": sbp_score}
    total_score += sbp_score

    # 2. Diastolic Blood Pressure
    dbp_score = 0
    if diastolic_bp < 50:
        dbp_score = 2
        clinical_flags.append(f"Low Diastolic Pressure (DBP {diastolic_bp} mmHg)")
    elif 50 <= diastolic_bp <= 89:
        dbp_score = 0
    elif 90 <= diastolic_bp <= 99:
        dbp_score = 1
        clinical_flags.append(f"Mild Diastolic Elevation (DBP {diastolic_bp} mmHg)")
    elif 100 <= diastolic_bp <= 109:
        dbp_score = 2
        clinical_flags.append(f"Moderate Diastolic Hypertension (DBP {diastolic_bp} mmHg)")
    else: # >= 110
        dbp_score = 3
        clinical_flags.append(f"Severe Diastolic Hypertension (DBP {diastolic_bp} mmHg) - imminent eclampsia indicator")
    score_details["diastolic_bp"] = {"value": diastolic_bp, "score": dbp_score}
    total_score += dbp_score

    # 3. Heart Rate
    hr_score = 0
    if heart_rate < 50:
        hr_score = 3
        clinical_flags.append(f"Severe Bradycardia (HR {heart_rate} bpm)")
    elif 50 <= heart_rate <= 59:
        hr_score = 1
    elif 60 <= heart_rate <= 99:
        hr_score = 0
    elif 100 <= heart_rate <= 109:
        hr_score = 1
        clinical_flags.append(f"Mild Tachycardia (HR {heart_rate} bpm)")
    elif 110 <= heart_rate <= 129:
        hr_score = 2
        clinical_flags.append(f"Moderate Tachycardia (HR {heart_rate} bpm) - suspect blood loss or infection")
    else: # >= 130
        hr_score = 3
        clinical_flags.append(f"Severe Tachycardia (HR {heart_rate} bpm) - decompensating shock indicator")
    score_details["heart_rate"] = {"value": heart_rate, "score": hr_score}
    total_score += hr_score

    # 4. Respiratory Rate
    rr_score = 0
    if respiratory_rate < 10:
        rr_score = 3
        clinical_flags.append(f"Bradypnea (RR {respiratory_rate}/min) - CNS depression or MgSO4 toxicity")
    elif 10 <= respiratory_rate <= 19:
        rr_score = 0
    elif 20 <= respiratory_rate <= 24:
        rr_score = 1
        clinical_flags.append(f"Mild Tachypnea (RR {respiratory_rate}/min)")
    elif 25 <= respiratory_rate <= 29:
        rr_score = 2
        clinical_flags.append(f"Moderate Tachypnea (RR {respiratory_rate}/min) - respiratory distress")
    else: # >= 30
        rr_score = 3
        clinical_flags.append(f"Severe Tachypnea (RR {respiratory_rate}/min) - pulmonary edema / metabolic acidosis")
    score_details["respiratory_rate"] = {"value": respiratory_rate, "score": rr_score}
    total_score += rr_score

    # 5. Temperature (°F)
    temp_score = 0
    if temperature_f < 95.0:
        temp_score = 3
        clinical_flags.append(f"Severe Hypothermia ({temperature_f}°F)")
    elif 95.0 <= temperature_f <= 96.8:
        temp_score = 1
    elif 96.9 <= temperature_f <= 99.5:
        temp_score = 0
    elif 99.6 <= temperature_f <= 100.9:
        temp_score = 1
        clinical_flags.append(f"Low-grade Pyrexia ({temperature_f}°F)")
    elif 101.0 <= temperature_f <= 102.2:
        temp_score = 2
        clinical_flags.append(f"Moderate Pyrexia ({temperature_f}°F) - suspect chorioamnionitis or sepsis")
    else: # >= 102.3
        temp_score = 3
        clinical_flags.append(f"High Pyrexia ({temperature_f}°F) - high maternal sepsis risk")
    score_details["temperature_f"] = {"value": temperature_f, "score": temp_score}
    total_score += temp_score

    # 6. SpO2 Oxygen Saturation
    spo2_score = 0
    if spo2 >= 95:
        spo2_score = 0
    elif 92 <= spo2 <= 94:
        spo2_score = 2
        clinical_flags.append(f"Mild Hypoxia (SpO2 {spo2}%) - administer supplemental oxygen")
    else: # < 92
        spo2_score = 3
        clinical_flags.append(f"Critical Hypoxia (SpO2 {spo2}%) - impending acute respiratory compromise")
    score_details["spo2"] = {"value": spo2, "score": spo2_score}
    total_score += spo2_score

    # Count Red (>2) and Yellow (1-2) scores
    for item in score_details.values():
        if item["score"] == 3:
            red_flags_count += 1
        elif item["score"] in (1, 2):
            yellow_flags_count += 1

    # Risk Stratification Logic
    if total_score >= 4 or red_flags_count >= 1 or (sbp_score >= 3 or dbp_score >= 3 or hr_score >= 3 or rr_score >= 3 or spo2_score >= 3):
        risk_level = "HIGH RISK"
        risk_color = "#EF4444" # Red
        clinical_reason = "Critical obstetric deterioration detected. Immediate tertiary team activation required."
        recommendations = [
            "Immediate hospital emergency dispatch with ALS ambulance",
            "Pre-alert receiving Obstetrician and Anesthesiologist on call",
            "Crossmatch and reserve 2+ blood units at destination blood bank",
            "Pre-stage ICU bed with continuous maternal-fetal monitoring",
            "Keep emergency resuscitation tray & IV access ready"
        ]
    elif total_score >= 2 or yellow_flags_count >= 2:
        risk_level = "MEDIUM RISK"
        risk_color = "#F59E0B" # Amber
        clinical_reason = "Moderate maternal physiological deviation. Priority inter-facility transfer indicated."
        recommendations = [
            "Priority referral with continuous en-route vital sign monitoring",
            "Notify destination triage officer in advance",
            "Verify IV patency and administer indicated medications (e.g. initial dose MgSO4/antibiotics)",
            "Maintain oxygen saturation >= 95% via nasal cannula"
        ]
    else:
        risk_level = "LOW RISK"
        risk_color = "#22C55E" # Green
        clinical_reason = "Vitals currently within acceptable range for emergency transfer."
        recommendations = [
            "Standard emergency inter-facility transfer protocol",
            "Routine hospital triage preparation",
            "Re-assess vital signs every 15 minutes during ambulance transit"
        ]

    return {
        "total_score": total_score,
        "risk_level": risk_level,
        "risk_color": risk_color,
        "score_details": score_details,
        "clinical_flags": clinical_flags,
        "clinical_reason": clinical_reason,
        "recommendations": recommendations,
        "red_flags_count": red_flags_count,
        "yellow_flags_count": yellow_flags_count
    }
