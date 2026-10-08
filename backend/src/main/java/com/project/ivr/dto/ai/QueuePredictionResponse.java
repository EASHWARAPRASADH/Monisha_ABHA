package com.project.ivr.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QueuePredictionResponse {

    private String estimatedWindowStart;
    private String estimatedWindowEnd;
    private Integer estimatedWaitMinutes;
    private Integer patientsAheadInQueue;
    private Double departmentAvgMinutesPerPatient;
    private String crowdStatus; // NORMAL, MODERATE, SURGE
    private Double confidenceScore;
    private String predictionAlgorithm; // e.g., "DYNAMIC_BAYESIAN_VELOCITY_MODEL"
}
