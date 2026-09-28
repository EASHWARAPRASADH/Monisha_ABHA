-- ============================================================
-- Migration V1: Initial Normalized Schema for Hospital IVR System
-- ============================================================

CREATE TABLE IF NOT EXISTS roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS hospitals (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    type VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    district VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS departments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    description VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS hospital_departments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    hospital_id BIGINT NOT NULL,
    department_id BIGINT NOT NULL,
    daily_token_limit INT NOT NULL DEFAULT 50,
    opd_start_time VARCHAR(10) NOT NULL DEFAULT '08:00',
    opd_end_time VARCHAR(10) NOT NULL DEFAULT '16:00',
    slot_duration_minutes INT NOT NULL DEFAULT 15,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uk_hosp_dept UNIQUE (hospital_id, department_id),
    CONSTRAINT fk_hd_hospital FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE CASCADE,
    CONSTRAINT fk_hd_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE,
    phone_number VARCHAR(20) NOT NULL,
    role_id BIGINT NOT NULL,
    hospital_id BIGINT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id),
    CONSTRAINT fk_users_hospital FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS abha_profiles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    abha_id VARCHAR(50) NOT NULL UNIQUE,
    abha_address VARCHAR(100) UNIQUE,
    mobile_number VARCHAR(20) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    gender VARCHAR(20) NOT NULL,
    date_of_birth DATE NOT NULL,
    address TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_abha_mobile (mobile_number)
);

CREATE TABLE IF NOT EXISTS patients (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    mobile_number VARCHAR(20) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    gender VARCHAR(20) NOT NULL,
    date_of_birth DATE,
    address TEXT,
    abha_id VARCHAR(50) NULL,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_patient_mobile (mobile_number),
    INDEX idx_patient_abha (abha_id)
);

CREATE TABLE IF NOT EXISTS tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    token_number VARCHAR(20) NOT NULL,
    patient_id BIGINT NOT NULL,
    hospital_id BIGINT NOT NULL,
    department_id BIGINT NOT NULL,
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    estimated_time TIME NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'BOOKED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uk_token_slot UNIQUE (hospital_id, department_id, booking_date, token_number),
    CONSTRAINT fk_token_patient FOREIGN KEY (patient_id) REFERENCES patients(id),
    CONSTRAINT fk_token_hospital FOREIGN KEY (hospital_id) REFERENCES hospitals(id),
    CONSTRAINT fk_token_department FOREIGN KEY (department_id) REFERENCES departments(id),
    INDEX idx_token_status_date (booking_date, status),
    INDEX idx_token_patient_date (patient_id, booking_date)
);

CREATE TABLE IF NOT EXISTS token_counters (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    hospital_id BIGINT NOT NULL,
    department_id BIGINT NOT NULL,
    counter_date DATE NOT NULL,
    current_number INT NOT NULL DEFAULT 0,
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT uk_counter UNIQUE (hospital_id, department_id, counter_date),
    CONSTRAINT fk_counter_hosp FOREIGN KEY (hospital_id) REFERENCES hospitals(id),
    CONSTRAINT fk_counter_dept FOREIGN KEY (department_id) REFERENCES departments(id)
);

CREATE TABLE IF NOT EXISTS appointments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    token_id BIGINT NOT NULL UNIQUE,
    patient_id BIGINT NOT NULL,
    hospital_id BIGINT NOT NULL,
    department_id BIGINT NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_app_token FOREIGN KEY (token_id) REFERENCES tokens(id) ON DELETE CASCADE,
    CONSTRAINT fk_app_patient FOREIGN KEY (patient_id) REFERENCES patients(id),
    CONSTRAINT fk_app_hospital FOREIGN KEY (hospital_id) REFERENCES hospitals(id),
    CONSTRAINT fk_app_department FOREIGN KEY (department_id) REFERENCES departments(id)
);

CREATE TABLE IF NOT EXISTS ivr_calls (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    call_sid VARCHAR(100) NOT NULL UNIQUE,
    caller_number_hash VARCHAR(100),
    caller_number VARCHAR(30),
    language VARCHAR(20) DEFAULT 'en',
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP NULL,
    current_state VARCHAR(50) NOT NULL,
    hospital_id BIGINT NULL,
    department_id BIGINT NULL,
    token_id BIGINT NULL,
    call_status VARCHAR(50) NOT NULL DEFAULT 'IN_PROGRESS',
    failure_reason VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_ivr_call_sid (call_sid),
    INDEX idx_ivr_start_time (start_time)
);

CREATE TABLE IF NOT EXISTS ivr_sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_token VARCHAR(100) NOT NULL UNIQUE,
    call_sid VARCHAR(100) NOT NULL,
    caller_number VARCHAR(30) NOT NULL,
    language VARCHAR(20) DEFAULT 'en',
    current_step VARCHAR(50) NOT NULL,
    patient_id BIGINT NULL,
    hospital_id BIGINT NULL,
    department_id BIGINT NULL,
    token_id BIGINT NULL,
    last_interaction_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_payload TEXT,
    INDEX idx_ivr_session_call (call_sid)
);

CREATE TABLE IF NOT EXISTS otp_verifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    mobile_number VARCHAR(30) NOT NULL,
    otp_code VARCHAR(10) NOT NULL,
    attempts INT NOT NULL DEFAULT 0,
    max_attempts INT NOT NULL DEFAULT 3,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_otp_mobile (mobile_number)
);

CREATE TABLE IF NOT EXISTS sms_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    recipient_phone VARCHAR(30) NOT NULL,
    message_text TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    provider VARCHAR(50) NOT NULL DEFAULT 'mock',
    external_message_id VARCHAR(100),
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_sms_status (status),
    INDEX idx_sms_phone (recipient_phone)
);

CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT NULL,
    channel VARCHAR(50) NOT NULL DEFAULT 'SMS',
    message TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'SENT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notif_patient FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS cancellation_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    token_id BIGINT NOT NULL,
    patient_id BIGINT NOT NULL,
    reason VARCHAR(255),
    requested_via VARCHAR(50) NOT NULL DEFAULT 'IVR',
    status VARCHAR(50) NOT NULL DEFAULT 'APPROVED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cancel_token FOREIGN KEY (token_id) REFERENCES tokens(id),
    CONSTRAINT fk_cancel_patient FOREIGN KEY (patient_id) REFERENCES patients(id)
);

CREATE TABLE IF NOT EXISTS reschedule_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    old_token_id BIGINT NOT NULL,
    new_token_id BIGINT NOT NULL,
    patient_id BIGINT NOT NULL,
    requested_via VARCHAR(50) NOT NULL DEFAULT 'IVR',
    status VARCHAR(50) NOT NULL DEFAULT 'APPROVED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_resched_old FOREIGN KEY (old_token_id) REFERENCES tokens(id),
    CONSTRAINT fk_resched_new FOREIGN KEY (new_token_id) REFERENCES tokens(id),
    CONSTRAINT fk_resched_patient FOREIGN KEY (patient_id) REFERENCES patients(id)
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(100),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100),
    ip_address VARCHAR(50),
    metadata TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_audit_action (action),
    INDEX idx_audit_time (timestamp)
);

CREATE TABLE IF NOT EXISTS system_settings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    description VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
