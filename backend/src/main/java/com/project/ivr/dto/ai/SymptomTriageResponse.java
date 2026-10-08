package com.project.ivr.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SymptomTriageResponse {

    private Long recommendedDepartmentId;
    private String recommendedDepartmentName;
    private String recommendedDepartmentCode;

    /**
     * ROUTINE (Green), PRIORITY (Yellow), EMERGENCY (Red)
     */
    private String severityLevel;

    private Double confidenceScore;
    private String clinicalRationale;
    private String patientFriendlyAdvice;

    private Boolean isEmergencyRedFlag;
    private String emergencyInstructions;

    private String aiEngine;
    private Long latencyMs;
}
