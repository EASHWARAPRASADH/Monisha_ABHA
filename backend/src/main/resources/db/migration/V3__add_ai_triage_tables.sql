-- ==============================================================================
-- V3__add_ai_triage_tables.sql
-- Migration: Add Local AI Symptom Triage Logging and Token Triage Attributes
-- ==============================================================================

CREATE TABLE IF NOT EXISTS symptom_triage_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    call_sid VARCHAR(100) NULL,
    patient_mobile VARCHAR(20) NULL,
    symptom_text TEXT NOT NULL,
    language VARCHAR(10) DEFAULT 'en',
    recommended_department_id BIGINT NULL,
    recommended_department_name VARCHAR(100) NULL,
    severity_level VARCHAR(20) NOT NULL DEFAULT 'ROUTINE',
    confidence_score DOUBLE NOT NULL DEFAULT 0.85,
    clinical_rationale TEXT NULL,
    ai_engine_used VARCHAR(50) NOT NULL DEFAULT 'EMBEDDED_CLINICAL_NLP',
    latency_ms BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_triage_dept (recommended_department_id),
    INDEX idx_triage_created (created_at),
    INDEX idx_triage_mobile (patient_mobile),
    CONSTRAINT fk_triage_dept FOREIGN KEY (recommended_department_id) REFERENCES departments(id) ON DELETE SET NULL
);

ALTER TABLE tokens ADD COLUMN triage_severity VARCHAR(20) DEFAULT 'ROUTINE';
ALTER TABLE tokens ADD COLUMN chief_complaint VARCHAR(500) NULL;
