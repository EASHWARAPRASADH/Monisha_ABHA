-- ============================================================
-- Migration V2: Seed Data for Hospital IVR Prototype (Academic Mocks)
-- ============================================================

-- Roles
INSERT INTO roles (id, name, description) VALUES
(1, 'ROLE_SUPER_ADMIN', 'Super Administrator with system-wide access'),
(2, 'ROLE_HOSPITAL_ADMIN', 'Hospital Administrator managing a specific hospital'),
(3, 'ROLE_HOSPITAL_STAFF', 'Hospital Staff managing OPD tokens and queues'),
(4, 'ROLE_PATIENT', 'Patient accessing booking and appointments');

-- Hospitals
INSERT INTO hospitals (id, name, code, type, address, district, state, contact_number, is_active) VALUES
(1, 'Government General Hospital', 'GGH01', 'Tertiary Care Hospital', 'EVR Periyar Salai, Park Town, Chennai', 'Chennai', 'Tamil Nadu', '044-25305000', TRUE),
(2, 'Government District Hospital', 'GDH02', 'District Headquarters Hospital', 'Hospital Road, Kanchipuram', 'Kanchipuram', 'Tamil Nadu', '044-27222333', TRUE),
(3, 'Government Community Health Centre', 'GCHC03', 'Community Health Centre', 'Main Road, Sriperumbudur', 'Sriperumbudur', 'Tamil Nadu', '044-27162222', TRUE);

-- Departments
INSERT INTO departments (id, name, code, description, is_active) VALUES
(1, 'General Medicine', 'GM', 'Primary medical care, adult medicine, infectious diseases', TRUE),
(2, 'Cardiology', 'CARD', 'Heart disorders, hypertension, cardiovascular diagnostics', TRUE),
(3, 'Orthopaedics', 'ORTHO', 'Bones, joints, fractures, musculoskeletal trauma', TRUE),
(4, 'Dermatology', 'DERM', 'Skin, hair, nails, and allergic conditions', TRUE),
(5, 'ENT', 'ENT', 'Ear, nose, and throat evaluations and surgeries', TRUE),
(6, 'Paediatrics', 'PED', 'Infant, child, and adolescent healthcare', TRUE);

-- Hospital Department Mappings
INSERT INTO hospital_departments (hospital_id, department_id, daily_token_limit, opd_start_time, opd_end_time, slot_duration_minutes, is_active) VALUES
-- Hospital 1 (Government General Hospital)
(1, 1, 50, '08:00', '16:00', 15, TRUE),
(1, 2, 40, '08:00', '16:00', 15, TRUE),
(1, 3, 40, '08:00', '16:00', 15, TRUE),
(1, 4, 35, '08:00', '16:00', 15, TRUE),
(1, 5, 35, '08:00', '16:00', 15, TRUE),
(1, 6, 45, '08:00', '16:00', 15, TRUE),
-- Hospital 2 (Government District Hospital)
(2, 1, 45, '08:00', '16:00', 15, TRUE),
(2, 2, 30, '08:00', '16:00', 15, TRUE),
(2, 3, 35, '08:00', '16:00', 15, TRUE),
(2, 4, 30, '08:00', '16:00', 15, TRUE),
(2, 5, 30, '08:00', '16:00', 15, TRUE),
(2, 6, 35, '08:00', '16:00', 15, TRUE),
-- Hospital 3 (Government Community Health Centre)
(3, 1, 40, '08:00', '14:00', 15, TRUE),
(3, 2, 20, '08:00', '14:00', 15, TRUE),
(3, 3, 25, '08:00', '14:00', 15, TRUE),
(3, 4, 20, '08:00', '14:00', 15, TRUE),
(3, 5, 20, '08:00', '14:00', 15, TRUE),
(3, 6, 30, '08:00', '14:00', 15, TRUE);

-- Users (passwords hashed with BCrypt)
-- superadmin / superadmin123
-- admin_ggh / admin123
-- staff_ggh / staff123
-- patient_test / patient123
INSERT INTO users (id, username, password, full_name, email, phone_number, role_id, hospital_id, is_active) VALUES
(1, 'superadmin', '$2a$10$H.5hxIT2nO6LNwbds0qScOTpP31LFDXD2R/AgV5A8amcRkg9ggmn6', 'Dr. Rajesh Sharma (Director)', 'superadmin@health.gov.in', '919876500001', 1, NULL, TRUE),
(2, 'admin_ggh', '$2a$10$2v/uhQhEwdAC3kv93VIp8uB13CbC1YSAeWPJswb29gKYOmhk5ffTm', 'Dr. Sundaramurthy (Medical Supdt)', 'admin.ggh@health.gov.in', '919876500002', 2, 1, TRUE),
(3, 'staff_ggh', '$2a$10$oCCGv/rS9CbLHMTAFiDEMuymcvm6dhB87SVU42lUbayeVZmJsSUsO', 'Kavitha R (OPD In-Charge)', 'staff.ggh@health.gov.in', '919876500003', 3, 1, TRUE),
(4, 'patient_test', '$2a$10$NmWQ9nXfLMT/L9ZKyS7X0uVaX1sC1Bj7vozJfsvYcuH/8coImPkP2', 'Test Patient', 'test.patient@example.com', '9876543210', 4, NULL, TRUE);

-- 10 Mock ABHA Profiles (Fictional Indian Names & Valid Formats)
INSERT INTO abha_profiles (id, abha_id, abha_address, mobile_number, full_name, gender, date_of_birth, address, status) VALUES
(1, '1234-5678-9012', 'testpatient@abdm', '9876543210', 'Test Patient', 'Male', '1988-05-14', '12 Gandhi Street, Chennai', 'ACTIVE'),
(2, '9123-4567-8901', 'anitha.kumar@abdm', '9876543211', 'Anitha Kumar', 'Female', '1992-11-20', '45 Anna Nagar, Chennai', 'ACTIVE'),
(3, '8234-5678-9012', 'selvam.m@abdm', '9876543212', 'Selvam Murugan', 'Male', '1975-03-08', '78 Nehru Bazaar, Kanchipuram', 'ACTIVE'),
(4, '7345-6789-0123', 'deepa.r@abdm', '9876543213', 'Deepa Ramesh', 'Female', '1984-07-22', '102 MGR Salai, Sriperumbudur', 'ACTIVE'),
(5, '6456-7890-1234', 'karthik.s@abdm', '9876543214', 'Karthik Subramanian', 'Male', '1995-12-01', '33 Temple Street, Madurai', 'ACTIVE'),
(6, '5567-8901-2345', 'lakshmi.p@abdm', '9876543215', 'Lakshmi Priya', 'Female', '1968-09-18', '56 South Car Street, Tiruchirappalli', 'ACTIVE'),
(7, '4678-9012-3456', 'vijay.anand@abdm', '9876543216', 'Vijay Anand', 'Male', '1981-04-12', '89 Kamarajar Avenue, Salem', 'ACTIVE'),
(8, '3789-0123-4567', 'meenakshi.s@abdm', '9876543217', 'Meenakshi Sundaram', 'Female', '1990-08-30', '14 North Veli Street, Madurai', 'ACTIVE'),
(9, '2890-1234-5678', 'suresh.kumar@abdm', '9876543218', 'Suresh Kumar', 'Male', '1979-01-25', '22 West Boulevard, Coimbatore', 'ACTIVE'),
(10, '1901-2345-6789', 'revathi.n@abdm', '9876543219', 'Revathi Narayanan', 'Female', '1993-06-15', '67 East Coast Road, Chengalpattu', 'ACTIVE');

-- 10 Mock Patients corresponding to ABHA profiles
INSERT INTO patients (id, mobile_number, full_name, gender, date_of_birth, address, abha_id, is_verified) VALUES
(1, '9876543210', 'Test Patient', 'Male', '1988-05-14', '12 Gandhi Street, Chennai', '1234-5678-9012', TRUE),
(2, '9876543211', 'Anitha Kumar', 'Female', '1992-11-20', '45 Anna Nagar, Chennai', '9123-4567-8901', TRUE),
(3, '9876543212', 'Selvam Murugan', 'Male', '1975-03-08', '78 Nehru Bazaar, Kanchipuram', '8234-5678-9012', TRUE),
(4, '9876543213', 'Deepa Ramesh', 'Female', '1984-07-22', '102 MGR Salai, Sriperumbudur', '7345-6789-0123', TRUE),
(5, '9876543214', 'Karthik Subramanian', 'Male', '1995-12-01', '33 Temple Street, Madurai', '6456-7890-1234', TRUE),
(6, '9876543215', 'Lakshmi Priya', 'Female', '1968-09-18', '56 South Car Street, Tiruchirappalli', '5567-8901-2345', TRUE),
(7, '9876543216', 'Vijay Anand', 'Male', '1981-04-12', '89 Kamarajar Avenue, Salem', '4678-9012-3456', TRUE),
(8, '9876543217', 'Meenakshi Sundaram', 'Female', '1990-08-30', '14 North Veli Street, Madurai', '3789-0123-4567', TRUE),
(9, '9876543218', 'Suresh Kumar', 'Male', '1979-01-25', '22 West Boulevard, Coimbatore', '2890-1234-5678', TRUE),
(10, '9876543219', 'Revathi Narayanan', 'Female', '1993-06-15', '67 East Coast Road, Chengalpattu', '1901-2345-6789', TRUE);

-- System Settings
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('DEMO_MODE', 'true', 'Flag indicating mock ABHA and hospital integration'),
('SMS_PROVIDER', 'mock', 'Active SMS delivery provider (mock or twilio)'),
('OPD_START_TIME', '08:00', 'Daily OPD consultation opening time'),
('OPD_END_TIME', '16:00', 'Daily OPD consultation closing time'),
('DEFAULT_SLOT_DURATION', '15', 'Consultation time per token in minutes'),
('OTP_EXPIRATION_MINUTES', '5', 'Validity duration for mock OTP verification'),
('MAX_OTP_ATTEMPTS', '3', 'Maximum failed attempts permitted before session abort');

-- Sample Initial SMS Log
INSERT INTO sms_logs (recipient_phone, message_text, status, provider, created_at) VALUES
('9876543210', 'Welcome to Government Hospital OPD Booking Service. Your mock registration is active.', 'DELIVERED', 'mock', CURRENT_TIMESTAMP);

-- Sample Initial Audit Log
INSERT INTO audit_logs (user_id, action, entity_type, entity_id, ip_address, metadata) VALUES
('SYSTEM', 'SYSTEM_INITIALIZATION', 'SYSTEM', '1', '127.0.0.1', 'Database seeded with hospitals, departments, roles and mock patients.');
