-- SETU-IFT Initial Seed Data (PostgreSQL / SQLite Compatible DML)

INSERT INTO hospitals (id, name, facility_type, code, latitude, longitude, phone, address, district, state, total_icu_beds, available_icu_beds, blood_bank_status, available_blood_units, on_duty_obstetrician, on_duty_anesthetist)
VALUES
(1, 'Sassoon General Hospital & BJ Govt Medical College', 'Apex Tertiary Medical College', 'MH-HOSP-SGH-01', 18.5256, 73.8742, '+91 20 2612 8000', 'Near Pune Railway Station, Sangamvadi, Pune', 'Pune', 'Maharashtra', 35, 8, 'Operational (24x7 Component Facility)', 'A+: 18, B+: 22, O+: 34, AB+: 9, O-: 6, A-: 4, B-: 3, AB-: 2', 'Dr. Sunita Deshmukh (Prof & HOD OBGYN)', 'Dr. Rajesh Kulkarni (Senior Anesthetist)'),
(2, 'Pune District Hospital (Aundh Civil Hospital)', 'District Hospital', 'MH-HOSP-ADH-02', 18.5621, 73.8087, '+91 20 2727 6000', 'Chest Hospital Campus, Aundh, Pune', 'Pune', 'Maharashtra', 20, 4, 'Operational (24x7)', 'A+: 10, B+: 14, O+: 18, AB+: 4, O-: 3, A-: 2, B-: 1, AB-: 1', 'Dr. Meera Joshi (Civil Surgeon OBGYN)', 'Dr. Anand Patil (Lead Anesthetist)'),
(3, 'Yashwantrao Chavan Memorial Hospital (YCMH)', 'Tertiary Municipal Hospital', 'MH-HOSP-YCM-03', 18.6279, 73.8131, '+91 20 2742 2222', 'Sant Tukaram Nagar, Pimpri, Pune', 'Pune', 'Maharashtra', 25, 6, 'Operational (24x7)', 'A+: 12, B+: 16, O+: 20, AB+: 5, O-: 4, A-: 3, B-: 2, AB-: 1', 'Dr. Pradeep Jadhav (Consultant OBGYN)', 'Dr. Rohini Shinde (Consultant Anesth)'),
(4, 'Sub-District Hospital Manchar (FRU)', 'Sub-District First Referral Unit (FRU)', 'MH-HOSP-MNC-04', 19.0028, 73.9421, '+91 2133 223 100', 'Manchar Town, Ambegaon Taluka, Pune', 'Pune', 'Maharashtra', 8, 2, 'Storage Centre Operational', 'A+: 4, B+: 6, O+: 8, AB+: 2, O-: 1, A-: 1, B-: 0, AB-: 0', 'Dr. Amit Bhise (Medical Officer OBGYN)', 'Dr. Sneha More (Visiting Anesthetist)');

INSERT INTO ambulances (id, vehicle_number, vehicle_type, driver_name, driver_phone, emt_name, current_lat, current_lng, bearing, speed_kmh, status)
VALUES
(1, 'MH-12-EM-1081', 'Advanced Life Support (ALS)', 'Ramesh Shinde', '+91 98765 43210', 'Kavita Patil (EMT-B)', 18.6850, 73.8400, 160.0, 52.0, 'EN_ROUTE'),
(2, 'MH-12-EM-1082', 'Advanced Life Support (ALS)', 'Vikas Gaikwad', '+91 98765 43211', 'Sachin Mane (EMT-I)', 18.7200, 73.8900, 195.0, 48.0, 'EN_ROUTE'),
(3, 'MH-12-EM-1083', 'Basic Life Support (BLS)', 'Tanaji Jagtap', '+91 98765 43212', 'Anita Jadhav (EMT-B)', 18.5900, 73.7800, 110.0, 42.0, 'EN_ROUTE'),
(4, 'MH-12-EM-1084', 'Advanced Life Support (ALS)', 'Santosh Pawar', '+91 98765 43213', 'Pooja Salve (EMT-B)', 18.5300, 73.8700, 90.0, 0.0, 'AT_HOSPITAL'),
(5, 'MH-12-EM-1085', 'Basic Life Support (BLS)', 'Mahesh Thorat', '+91 98765 43214', 'Dinesh Kale (EMT-B)', 18.7500, 73.8500, 0.0, 0.0, 'AVAILABLE'),
(6, 'MH-12-EM-1086', 'Advanced Life Support (ALS)', 'Ganesh Sawant', '+91 98765 43215', 'Sunil More (EMT-I)', 18.5600, 73.8100, 0.0, 0.0, 'AVAILABLE');
