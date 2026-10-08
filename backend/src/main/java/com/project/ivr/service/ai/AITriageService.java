package com.project.ivr.service.ai;

import com.project.ivr.dto.ai.*;
import com.project.ivr.entity.SymptomTriageLog;

import java.util.List;

public interface AITriageService {

    /**
     * Triage patient clinical symptoms using Local AI model with zero-cloud on-premise execution.
     */
    SymptomTriageResponse triageSymptom(SymptomTriageRequest request);

    /**
     * Predict dynamic queue wait-time and velocity window.
     */
    QueuePredictionResponse predictQueueWaitTime(QueuePredictionRequest request);

    /**
     * Get health status, active engine (Ollama or Embedded), and diagnostic metrics.
     */
    AiModelStatusDto getModelStatus();

    /**
     * Retrieve recent clinical triage audit logs.
     */
    List<SymptomTriageLog> getRecentTriageLogs();
}
