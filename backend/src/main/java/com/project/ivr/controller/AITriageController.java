package com.project.ivr.controller;

import com.project.ivr.dto.ai.*;
import com.project.ivr.entity.SymptomTriageLog;
import com.project.ivr.entity.Token;
import com.project.ivr.repository.TokenRepository;
import com.project.ivr.service.ai.AITriageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Tag(name = "AI Clinical Triage & Queue Forecasting", description = "On-Premise Local AI Model integration for symptom routing and dynamic wait times")
public class AITriageController {

    private final AITriageService aiTriageService;
    private final TokenRepository tokenRepository;

    @PostMapping("/triage")
    @Operation(summary = "Triage patient clinical symptoms", description = "Analyzes multilingual symptoms using local Ollama model or embedded clinical ontology")
    public ResponseEntity<SymptomTriageResponse> triageSymptoms(@Valid @RequestBody SymptomTriageRequest request) {
        SymptomTriageResponse response = aiTriageService.triageSymptom(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/predict-wait-time")
    @Operation(summary = "Predict dynamic queue wait time", description = "Calculates queue velocity and estimated consultation time window")
    public ResponseEntity<QueuePredictionResponse> predictWaitTime(@Valid @RequestBody QueuePredictionRequest request) {
        QueuePredictionResponse response = aiTriageService.predictQueueWaitTime(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/status")
    @Operation(summary = "Get Local AI Model health and diagnostics", description = "Returns Ollama connectivity, active model, and system metrics")
    public ResponseEntity<AiModelStatusDto> getModelStatus() {
        AiModelStatusDto status = aiTriageService.getModelStatus();
        return ResponseEntity.ok(status);
    }

    @GetMapping("/logs")
    @Operation(summary = "Get recent AI triage logs", description = "Returns audit history of symptom triage inferences")
    public ResponseEntity<List<SymptomTriageLog>> getRecentLogs() {
        return ResponseEntity.ok(aiTriageService.getRecentTriageLogs());
    }

    @PostMapping("/clinical-brief/{tokenId}")
    @Operation(summary = "Generate doctor pre-consultation summary", description = "Generates clinical summary and screening recommendations for OPD doctor")
    public ResponseEntity<Map<String, Object>> getDoctorClinicalBrief(@PathVariable Long tokenId) {
        Token token = tokenRepository.findById(tokenId).orElse(null);
        Map<String, Object> result = new HashMap<>();

        if (token == null) {
            result.put("error", "Token not found");
            return ResponseEntity.badRequest().body(result);
        }

        String complaint = token.getChiefComplaint() != null && !token.getChiefComplaint().isBlank()
                ? token.getChiefComplaint()
                : "Routine general consultation / follow-up check";

        // Triage analysis
        SymptomTriageResponse triage = aiTriageService.triageSymptom(SymptomTriageRequest.builder()
                .symptoms(complaint)
                .hospitalId(token.getHospital().getId())
                .patientMobile(token.getPatient().getMobileNumber())
                .build());

        result.put("tokenNumber", token.getTokenNumber());
        result.put("patientName", token.getPatient().getFullName());
        result.put("patientMobile", token.getPatient().getMobileNumber());
        result.put("abhaId", token.getPatient().getAbhaId());
        result.put("department", token.getDepartment().getName());
        result.put("chiefComplaint", complaint);
        result.put("urgencyLevel", triage.getSeverityLevel());
        result.put("aiTriageEngine", triage.getAiEngine());
        result.put("clinicalRationale", triage.getClinicalRationale());
        result.put("confidenceScore", triage.getConfidenceScore());

        // Recommended screening checklist for the doctor
        List<String> doctorQuestions = switch (token.getDepartment().getName()) {
            case "Cardiology" -> List.of(
                    "Any radiation of chest pain to left arm, neck, or jaw?",
                    "Onset: Is the pain aggravated by physical exertion or stress?",
                    "Check for associated cold sweats, nausea, or shortness of breath.",
                    "Record BP, 12-lead ECG stat, and verify Cardiac Enzymes if indicated."
            );
            case "Orthopaedics" -> List.of(
                    "History of recent trauma, fall, or twisting injury?",
                    "Weight-bearing capability: Can patient walk unassisted?",
                    "Check joint swelling, crepitus, and active range of motion.",
                    "Evaluate need for plain radiograph (X-ray)."
            );
            case "Paediatrics" -> List.of(
                    "Duration of fever and response to antipyretics?",
                    "Fluid intake: Has the child been drinking water or feeding normally?",
                    "Check for lethargy, respiratory retraction, or rash.",
                    "Verify child immunization card / ABHA child record."
            );
            case "Dermatology" -> List.of(
                    "Duration and progression of skin eruption/lesion?",
                    "Presence of pruritus (nighttime itching)?",
                    "Recent exposure to new topical products, medications, or allergens.",
                    "Inspect lesion distribution, morphology, and mucous membrane sparing."
            );
            case "ENT" -> List.of(
                    "Any discharge from ear (purulent, serous, or bloody)?",
                    "Degree of hearing reduction or tinnitus?",
                    "Inspect throat for tonsillar exudate, uvular deviation, and trismus.",
                    "Check cervical lymph node enlargement."
            );
            default -> List.of(
                    "Duration of primary complaint and onset acute vs chronic?",
                    "Check vital signs: Temperature, BP, Pulse, SpO2.",
                    "Screen for chronic co-morbidities (Diabetes, Hypertension, TB history).",
                    "Order routine baseline investigations if indicated (CBC, RBS)."
            );
        };
        result.put("suggestedDoctorQuestions", doctorQuestions);

        // ABDM FHIR Clinical Document draft
        result.put("draftFhirNote", String.format(
                "ABDM OPD Clinical Record\nPatient: %s (ABHA: %s)\nDept: %s | Token: %s\nPresenting Complaint: %s\nInitial Triage: %s (%s)\nSuggested Doctor Actions: %s",
                token.getPatient().getFullName(),
                token.getPatient().getAbhaId() != null ? token.getPatient().getAbhaId() : "UNLINKED",
                token.getDepartment().getName(),
                token.getTokenNumber(),
                complaint,
                triage.getSeverityLevel(),
                triage.getClinicalRationale(),
                doctorQuestions.get(0)
        ));

        return ResponseEntity.ok(result);
    }
}
