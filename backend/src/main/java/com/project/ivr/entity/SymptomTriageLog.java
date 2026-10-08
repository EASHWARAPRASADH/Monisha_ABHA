package com.project.ivr.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "symptom_triage_logs",
       indexes = {
           @Index(name = "idx_triage_dept", columnList = "recommended_department_id"),
           @Index(name = "idx_triage_created", columnList = "created_at"),
           @Index(name = "idx_triage_mobile", columnList = "patient_mobile")
       })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SymptomTriageLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "call_sid", length = 100)
    private String callSid;

    @Column(name = "patient_mobile", length = 20)
    private String patientMobile;

    @Column(name = "symptom_text", nullable = false, columnDefinition = "TEXT")
    private String symptomText;

    @Column(name = "language", length = 10)
    @Builder.Default
    private String language = "en";

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "recommended_department_id")
    private Department recommendedDepartment;

    @Column(name = "recommended_department_name", length = 100)
    private String recommendedDepartmentName;

    @Column(name = "severity_level", nullable = false, length = 20)
    @Builder.Default
    private String severityLevel = "ROUTINE";

    @Column(name = "confidence_score", nullable = false)
    @Builder.Default
    private Double confidenceScore = 0.85;

    @Column(name = "clinical_rationale", columnDefinition = "TEXT")
    private String clinicalRationale;

    @Column(name = "ai_engine_used", nullable = false, length = 50)
    @Builder.Default
    private String aiEngineUsed = "EMBEDDED_CLINICAL_NLP";

    @Column(name = "latency_ms", nullable = false)
    @Builder.Default
    private Long latencyMs = 0L;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (severityLevel == null) severityLevel = "ROUTINE";
        if (confidenceScore == null) confidenceScore = 0.85;
        if (aiEngineUsed == null) aiEngineUsed = "EMBEDDED_CLINICAL_NLP";
        if (latencyMs == null) latencyMs = 0L;
        if (language == null) language = "en";
    }
}
