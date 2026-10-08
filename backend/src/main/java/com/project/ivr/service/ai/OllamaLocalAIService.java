package com.project.ivr.service.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.ivr.dto.ai.SymptomTriageRequest;
import com.project.ivr.dto.ai.SymptomTriageResponse;
import com.project.ivr.entity.Department;
import com.project.ivr.exception.OllamaUnavailableException;
import com.project.ivr.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.*;

/**
 * Client for local Ollama on-premise LLM server.
 * Ensures zero patient data leaves the local hospital environment.
 */
@Service
@RequiredArgsConstructor
public class OllamaLocalAIService {

    private static final Logger log = LoggerFactory.getLogger(OllamaLocalAIService.class);

    private final DepartmentRepository departmentRepository;
    private final ObjectMapper objectMapper;

    @Value("${app.ai.ollama.base-url:http://localhost:11434}")
    private String ollamaBaseUrl;

    @Value("${app.ai.ollama.model:llama3.2}")
    private String defaultModel;

    @Value("${app.ai.ollama.timeout-ms:2500}")
    private int timeoutMs;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofMillis(1500))
            .build();

    public boolean isConnected() {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(ollamaBaseUrl + "/api/tags"))
                    .timeout(Duration.ofMillis(1200))
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            return response.statusCode() == 200;
        } catch (Exception e) {
            log.debug("Ollama is not reachable at {}: {}", ollamaBaseUrl, e.getMessage());
            return false;
        }
    }

    public List<String> getAvailableModels() {
        List<String> models = new ArrayList<>();
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(ollamaBaseUrl + "/api/tags"))
                    .timeout(Duration.ofMillis(1200))
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() == 200) {
                JsonNode root = objectMapper.readTree(response.body());
                JsonNode modelsNode = root.get("models");
                if (modelsNode != null && modelsNode.isArray()) {
                    for (JsonNode m : modelsNode) {
                        if (m.has("name")) {
                            models.add(m.get("name").asText());
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.debug("Could not fetch Ollama models: {}", e.getMessage());
        }
        return models;
    }

    public SymptomTriageResponse triage(SymptomTriageRequest triageRequest) {
        long startTime = System.currentTimeMillis();
        String symptoms = triageRequest.getSymptoms();
        String lang = triageRequest.getLanguage() != null ? triageRequest.getLanguage() : "en";

        String systemPrompt = "You are a clinical OPD triage AI assistant for Indian Government Civil Hospitals. " +
                "Evaluate the patient's symptoms and classify into one of these OPD departments: " +
                "General Medicine, Cardiology, Orthopaedics, Dermatology, ENT, Paediatrics. " +
                "Respond ONLY with valid JSON with keys: " +
                "\"department\" (one of the 6 listed), " +
                "\"severity\" (\"ROUTINE\" or \"PRIORITY\" or \"EMERGENCY\"), " +
                "\"confidence\" (float 0.0 to 1.0), " +
                "\"rationale\" (short clinical reasoning string), " +
                "\"advice\" (patient friendly instruction in the user's language: " + lang + ").";

        Map<String, Object> requestBodyMap = new HashMap<>();
        requestBodyMap.put("model", defaultModel);
        requestBodyMap.put("prompt", systemPrompt + "\nPatient symptoms: \"" + symptoms + "\"\nLanguage: " + lang);
        requestBodyMap.put("stream", false);
        requestBodyMap.put("format", "json");

        try {
            String jsonPayload = objectMapper.writeValueAsString(requestBodyMap);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(ollamaBaseUrl + "/api/generate"))
                    .header("Content-Type", "application/json")
                    .timeout(Duration.ofMillis(timeoutMs))
                    .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                throw new OllamaUnavailableException("Ollama returned HTTP status " + response.statusCode());
            }

            JsonNode root = objectMapper.readTree(response.body());
            String responseText = root.path("response").asText();

            JsonNode parsedTriage = objectMapper.readTree(responseText);
            String deptName = parsedTriage.path("department").asText("General Medicine");
            String severity = parsedTriage.path("severity").asText("ROUTINE").toUpperCase();
            double confidence = parsedTriage.path("confidence").asDouble(0.85);
            String rationale = parsedTriage.path("rationale").asText("Triaged by local LLM");
            String advice = parsedTriage.path("advice").asText("Please report to OPD");

            boolean isEmergency = "EMERGENCY".equalsIgnoreCase(severity);

            // Match DB Department
            List<Department> allDepts = departmentRepository.findAll();
            Department matchedDept = allDepts.stream()
                    .filter(d -> d.getName().equalsIgnoreCase(deptName) || d.getName().toLowerCase().contains(deptName.toLowerCase()))
                    .findFirst()
                    .orElse(allDepts.isEmpty() ? null : allDepts.get(0));

            Long deptId = matchedDept != null ? matchedDept.getId() : 1L;
            String finalDeptName = matchedDept != null ? matchedDept.getName() : deptName;
            String finalDeptCode = matchedDept != null ? matchedDept.getCode() : "MED";

            long latency = System.currentTimeMillis() - startTime;

            return SymptomTriageResponse.builder()
                    .recommendedDepartmentId(deptId)
                    .recommendedDepartmentName(finalDeptName)
                    .recommendedDepartmentCode(finalDeptCode)
                    .severityLevel(severity)
                    .confidenceScore(Math.round(confidence * 100.0) / 100.0)
                    .clinicalRationale(rationale)
                    .patientFriendlyAdvice(advice)
                    .isEmergencyRedFlag(isEmergency)
                    .emergencyInstructions(isEmergency ? "EMERGENCY DETECTED by Local LLM: Report to casualty immediately or call 108" : null)
                    .aiEngine("OLLAMA_LOCAL (" + defaultModel + ")")
                    .latencyMs(latency)
                    .build();

        } catch (Exception e) {
            log.warn("Ollama inference failed or timed out: {}", e.getMessage());
            throw new OllamaUnavailableException("Ollama local LLM unavailable: " + e.getMessage(), e);
        }
    }
}
