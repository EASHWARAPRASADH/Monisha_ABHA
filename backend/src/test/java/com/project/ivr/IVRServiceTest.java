package com.project.ivr;

import com.project.ivr.entity.IvrSession;
import com.project.ivr.entity.IvrState;
import com.project.ivr.entity.Patient;
import com.project.ivr.integration.abha.ABHAIntegrationService;
import com.project.ivr.integration.hospital.HospitalIntegrationService;
import com.project.ivr.ivr.IVRPromptService;
import com.project.ivr.ivr.IVRService;
import com.project.ivr.ivr.IVRSessionService;
import com.project.ivr.repository.DepartmentRepository;
import com.project.ivr.repository.HospitalRepository;
import com.project.ivr.repository.PatientRepository;
import com.project.ivr.repository.TokenRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class IVRServiceTest {

    @Mock
    private IVRSessionService sessionService;
    @Mock
    private IVRPromptService promptService;
    @Mock
    private HospitalIntegrationService hospitalIntegrationService;
    @Mock
    private ABHAIntegrationService abhaIntegrationService;
    @Mock
    private PatientRepository patientRepository;
    @Mock
    private HospitalRepository hospitalRepository;
    @Mock
    private DepartmentRepository departmentRepository;
    @Mock
    private TokenRepository tokenRepository;

    @InjectMocks
    private IVRService ivrService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(ivrService, "ivrBaseUrl", "http://localhost:8080");
    }

    @Test
    @DisplayName("Incoming call should return TwiML with Welcome and language selection Gather")
    void testHandleIncoming() {
        IvrSession session = IvrSession.builder()
                .callSid("CA12345")
                .callerNumber("9876543210")
                .currentStep(IvrState.LANGUAGE_SELECTION)
                .build();

        when(sessionService.getOrCreateSession(anyString(), anyString())).thenReturn(session);
        when(promptService.getPrompt(eq("ivr.welcome"), eq("en"))).thenReturn("Welcome to Government Hospital OPD.");
        when(promptService.getPrompt(eq("ivr.language.select"), eq("en"))).thenReturn("For English press 1.");
        when(promptService.getPrompt(eq("ivr.error.timeout"), eq("en"))).thenReturn("Timeout.");

        String twiml = ivrService.handleIncoming("CA12345", "9876543210");
        assertNotNull(twiml);
        assertTrue(twiml.contains("<Gather action=\"http://localhost:8080/api/ivr/language\""));
        assertTrue(twiml.contains("<Say"));
        assertTrue(twiml.contains("<Response>"));
    }

    @Test
    @DisplayName("Language selection with recognized caller mobile presents main menu")
    void testHandleLanguageRecognizedPatient() {
        IvrSession session = IvrSession.builder()
                .callSid("CA12345")
                .callerNumber("9876543210")
                .language("en")
                .currentStep(IvrState.LANGUAGE_SELECTION)
                .build();

        Patient patient = Patient.builder()
                .id(1L)
                .fullName("Test Patient")
                .mobileNumber("9876543210")
                .build();

        when(sessionService.getOrCreateSession(anyString(), anyString())).thenReturn(session);
        when(patientRepository.findByMobileNumber("9876543210")).thenReturn(Optional.of(patient));
        when(promptService.getPrompt(eq("ivr.patient.recognized"), anyString(), any())).thenReturn("Welcome Test Patient.");
        when(promptService.getPrompt(eq("ivr.main.menu"), anyString())).thenReturn("Press 1 to book.");
        when(promptService.getPrompt(eq("ivr.error.timeout"), anyString())).thenReturn("Timeout.");

        String twiml = ivrService.handleLanguage("CA12345", "1", "9876543210");
        assertNotNull(twiml);
        assertTrue(twiml.contains("<Gather action=\"http://localhost:8080/api/ivr/verify\""));
        verify(sessionService).updatePatient("CA12345", 1L);
        verify(sessionService).updateLanguage("CA12345", "en");
    }
}
