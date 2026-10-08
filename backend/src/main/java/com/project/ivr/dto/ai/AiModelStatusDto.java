package com.project.ivr.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiModelStatusDto {

    private Boolean isOllamaConnected;
    private String ollamaBaseUrl;
    private String configuredModel;
    private String activeEngine;
    private String operationalMode;
    private List<String> availableLocalModels;
    private Long totalTriageRequestsLogged;
    private Long emergencyCasesIdentified;
    private Double averageLatencyMs;
    private String systemHealth;
    private String complianceNote;
}
