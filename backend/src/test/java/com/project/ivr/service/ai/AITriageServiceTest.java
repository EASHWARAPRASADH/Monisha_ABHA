package com.project.ivr.service.ai;

import com.project.ivr.dto.ai.*;
import com.project.ivr.entity.Department;
import com.project.ivr.repository.DepartmentRepository;
import com.project.ivr.repository.HospitalDepartmentRepository;
import com.project.ivr.repository.SymptomTriageLogRepository;
import com.project.ivr.repository.TokenRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AITriageServiceTest {

    @Mock
    private DepartmentRepository departmentRepository;

    @Mock
    private SymptomTriageLogRepository triageLogRepository;

    @Mock
    private TokenRepository tokenRepository;

    @Mock
    private HospitalDepartmentRepository hospitalDepartmentRepository;

    @Mock
    private OllamaLocalAIService ollamaLocalAIService;

    private ClinicalRuleLocalAIService clinicalRuleService;
    private AIQueuePredictorService queuePredictorService;
    private HybridAITriageService hybridAITriageService;

    private List<Department> mockDepartments;

    @BeforeEach
    void setUp() {
        Department med = Department.builder().id(1L).name("General Medicine").code("MED").build();
        Department card = Department.builder().id(2L).name("Cardiology").code("CARD").build();
        Department ortho = Department.builder().id(3L).name("Orthopaedics").code("ORTHO").build();
        Department derm = Department.builder().id(4L).name("Dermatology").code("DERM").build();
        Department ent = Department.builder().id(5L).name("ENT").code("ENT").build();
        Department paed = Department.builder().id(6L).name("Paediatrics").code("PAED").build();

        mockDepartments = Arrays.asList(med, card, ortho, derm, ent, paed);
        lenient().when(departmentRepository.findAll()).thenReturn(mockDepartments);
        lenient().when(departmentRepository.findById(2L)).thenReturn(java.util.Optional.of(card));
        lenient().when(departmentRepository.findById(1L)).thenReturn(java.util.Optional.of(med));

        clinicalRuleService = new ClinicalRuleLocalAIService(departmentRepository);
        queuePredictorService = new AIQueuePredictorService(tokenRepository, departmentRepository, hospitalDepartmentRepository);

        hybridAITriageService = new HybridAITriageService(
                ollamaLocalAIService,
                clinicalRuleService,
                queuePredictorService,
                triageLogRepository,
                departmentRepository
        );

        ReflectionTestUtils.setField(hybridAITriageService, "aiMode", "HYBRID");
        ReflectionTestUtils.setField(hybridAITriageService, "ollamaBaseUrl", "http://localhost:11434");
        ReflectionTestUtils.setField(hybridAITriageService, "configuredModel", "llama3.2");
    }

    @Test
    void testCardiologyEmergencyTriageEnglish() {
        SymptomTriageRequest req = SymptomTriageRequest.builder()
                .symptoms("Crushing chest pain radiating to left arm and shortness of breath")
                .language("en")
                .patientMobile("9876543210")
                .build();

        SymptomTriageResponse res = clinicalRuleService.triage(req);

        assertNotNull(res);
        assertEquals("Cardiology", res.getRecommendedDepartmentName());
        assertEquals("EMERGENCY", res.getSeverityLevel());
        assertTrue(res.getIsEmergencyRedFlag());
        assertNotNull(res.getEmergencyInstructions());
        assertTrue(res.getConfidenceScore() >= 0.85);
    }

    @Test
    void testCardiologyTriageTamil() {
        SymptomTriageRequest req = SymptomTriageRequest.builder()
                .symptoms("தீவிர நெஞ்சு வலி மற்றும் மூச்சு திணறல்")
                .language("ta")
                .patientMobile("9876543210")
                .build();

        SymptomTriageResponse res = clinicalRuleService.triage(req);

        assertNotNull(res);
        assertEquals("Cardiology", res.getRecommendedDepartmentName());
        assertTrue(res.getIsEmergencyRedFlag());
        assertTrue(res.getPatientFriendlyAdvice().contains("108") || res.getPatientFriendlyAdvice().contains("Casualty"));
    }

    @Test
    void testOrthopaedicsTriageHindi() {
        SymptomTriageRequest req = SymptomTriageRequest.builder()
                .symptoms("घुटने में तेज दर्द और जोड़ों में सूजन चलने में परेशानी")
                .language("hi")
                .patientMobile("9876543210")
                .build();

        SymptomTriageResponse res = clinicalRuleService.triage(req);

        assertNotNull(res);
        assertEquals("Orthopaedics", res.getRecommendedDepartmentName());
        assertFalse(res.getIsEmergencyRedFlag());
    }

    @Test
    void testPaediatricsTriage() {
        SymptomTriageRequest req = SymptomTriageRequest.builder()
                .symptoms("Baby infant high fever and constant crying")
                .language("en")
                .patientMobile("9876543210")
                .build();

        SymptomTriageResponse res = clinicalRuleService.triage(req);

        assertNotNull(res);
        assertEquals("Paediatrics", res.getRecommendedDepartmentName());
        assertEquals("PRIORITY", res.getSeverityLevel());
    }

    @Test
    void testDermatologyTriage() {
        SymptomTriageRequest req = SymptomTriageRequest.builder()
                .symptoms("Mild dry skin rash on arm")
                .language("en")
                .patientMobile("9876543210")
                .build();

        SymptomTriageResponse res = clinicalRuleService.triage(req);

        assertNotNull(res);
        assertEquals("Dermatology", res.getRecommendedDepartmentName());
        assertEquals("ROUTINE", res.getSeverityLevel());
    }

    @Test
    void testQueueVelocityPrediction() {
        when(tokenRepository.findByHospitalIdAndBookingDate(eq(1L), any())).thenReturn(Collections.emptyList());

        QueuePredictionRequest req = QueuePredictionRequest.builder()
                .hospitalId(1L)
                .departmentId(2L)
                .tokenSequenceNumber(5)
                .tokenNumber("CARD005")
                .build();

        QueuePredictionResponse res = queuePredictorService.predict(req);

        assertNotNull(res);
        assertNotNull(res.getEstimatedWindowStart());
        assertNotNull(res.getEstimatedWindowEnd());
        assertEquals(4, res.getPatientsAheadInQueue());
        assertTrue(res.getEstimatedWaitMinutes() > 0);
        assertEquals("NORMAL", res.getCrowdStatus());
    }

    @Test
    void testModelStatusDiagnostics() {
        when(ollamaLocalAIService.isConnected()).thenReturn(false);
        when(triageLogRepository.count()).thenReturn(15L);
        when(triageLogRepository.countBySeverityLevel("EMERGENCY")).thenReturn(2L);

        AiModelStatusDto status = hybridAITriageService.getModelStatus();

        assertNotNull(status);
        assertFalse(status.getIsOllamaConnected());
        assertTrue(status.getActiveEngine().contains("EMBEDDED_CLINICAL_NLP"));
        assertEquals(15L, status.getTotalTriageRequestsLogged());
        assertEquals(2L, status.getEmergencyCasesIdentified());
    }
}
