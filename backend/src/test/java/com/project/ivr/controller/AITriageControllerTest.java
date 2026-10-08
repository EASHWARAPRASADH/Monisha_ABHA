package com.project.ivr.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.ivr.dto.ai.*;
import com.project.ivr.entity.*;
import com.project.ivr.repository.TokenRepository;
import com.project.ivr.service.ai.AITriageService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AITriageController.class)
@AutoConfigureMockMvc(addFilters = false)
class AITriageControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AITriageService aiTriageService;

    @MockBean
    private TokenRepository tokenRepository;

    // Mock other context beans if needed
    @MockBean
    private com.project.ivr.security.UserDetailsServiceImpl userDetailsService;
    @MockBean
    private com.project.ivr.security.AuthEntryPointJwt authEntryPointJwt;
    @MockBean
    private com.project.ivr.security.AuthTokenFilter authTokenFilter;
    @MockBean
    private com.project.ivr.security.JwtUtils jwtUtils;

    @Test
    void testTriageEndpoint() throws Exception {
        SymptomTriageResponse response = SymptomTriageResponse.builder()
                .recommendedDepartmentId(2L)
                .recommendedDepartmentName("Cardiology")
                .recommendedDepartmentCode("CARD")
                .severityLevel("EMERGENCY")
                .confidenceScore(0.95)
                .clinicalRationale("Potential Acute Myocardial Infarction")
                .isEmergencyRedFlag(true)
                .emergencyInstructions("Immediate Casualty referral")
                .aiEngine("EMBEDDED_CLINICAL_NLP (Ontology v1.0)")
                .latencyMs(3L)
                .build();

        when(aiTriageService.triageSymptom(any())).thenReturn(response);

        SymptomTriageRequest request = SymptomTriageRequest.builder()
                .symptoms("Crushing chest pain radiating to arm")
                .language("en")
                .build();

        mockMvc.perform(post("/api/ai/triage")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.recommendedDepartmentName").value("Cardiology"))
                .andExpect(jsonPath("$.severityLevel").value("EMERGENCY"))
                .andExpect(jsonPath("$.isEmergencyRedFlag").value(true));
    }

    @Test
    void testQueuePredictEndpoint() throws Exception {
        QueuePredictionResponse response = QueuePredictionResponse.builder()
                .estimatedWindowStart("10:30 AM")
                .estimatedWindowEnd("10:45 AM")
                .estimatedWaitMinutes(25)
                .patientsAheadInQueue(3)
                .crowdStatus("NORMAL")
                .confidenceScore(0.89)
                .build();

        when(aiTriageService.predictQueueWaitTime(any())).thenReturn(response);

        QueuePredictionRequest request = QueuePredictionRequest.builder()
                .hospitalId(1L)
                .departmentId(1L)
                .tokenSequenceNumber(4)
                .build();

        mockMvc.perform(post("/api/ai/predict-wait-time")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estimatedWaitMinutes").value(25))
                .andExpect(jsonPath("$.crowdStatus").value("NORMAL"));
    }

    @Test
    void testStatusEndpoint() throws Exception {
        AiModelStatusDto statusDto = AiModelStatusDto.builder()
                .isOllamaConnected(false)
                .activeEngine("EMBEDDED_CLINICAL_NLP")
                .operationalMode("HYBRID")
                .systemHealth("ONLINE (Embedded Clinical Fallback Active)")
                .build();

        when(aiTriageService.getModelStatus()).thenReturn(statusDto);

        mockMvc.perform(get("/api/ai/status"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.activeEngine").value("EMBEDDED_CLINICAL_NLP"))
                .andExpect(jsonPath("$.systemHealth").exists());
    }
}
