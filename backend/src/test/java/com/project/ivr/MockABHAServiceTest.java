package com.project.ivr;

import com.project.ivr.audit.AuditLogService;
import com.project.ivr.dto.AbhaProfileDto;
import com.project.ivr.dto.OtpResponseDto;
import com.project.ivr.entity.AbhaProfile;
import com.project.ivr.entity.OtpVerification;
import com.project.ivr.exception.InvalidOtpException;
import com.project.ivr.exception.OtpExhaustedException;
import com.project.ivr.integration.abha.MockABHAIntegrationService;
import com.project.ivr.repository.AbhaProfileRepository;
import com.project.ivr.repository.OtpVerificationRepository;
import com.project.ivr.repository.PatientRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class MockABHAServiceTest {

    @Mock
    private AbhaProfileRepository abhaProfileRepository;

    @Mock
    private OtpVerificationRepository otpVerificationRepository;

    @Mock
    private PatientRepository patientRepository;

    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private MockABHAIntegrationService abhaService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(abhaService, "fixedMockOtp", "123456");
        ReflectionTestUtils.setField(abhaService, "otpExpirationMinutes", 5);
        ReflectionTestUtils.setField(abhaService, "maxOtpAttempts", 3);
        ReflectionTestUtils.setField(abhaService, "demoMode", true);
    }

    @Test
    @DisplayName("Verify mobile should return mock ABHA profile if present")
    void testVerifyMobileFound() {
        AbhaProfile profile = AbhaProfile.builder()
                .id(1L)
                .abhaId("1234-5678-9012")
                .mobileNumber("9876543210")
                .fullName("Test Patient")
                .gender("Male")
                .dateOfBirth(LocalDate.of(1988, 5, 14))
                .status("ACTIVE")
                .build();

        when(abhaProfileRepository.findByMobileNumber("9876543210")).thenReturn(Optional.of(profile));

        AbhaProfileDto result = abhaService.verifyMobile("9876543210");
        assertNotNull(result);
        assertEquals("1234-5678-9012", result.getAbhaId());
        assertEquals("Test Patient", result.getFullName());
        assertTrue(result.isMockData());
    }

    @Test
    @DisplayName("Send OTP should generate mock OTP and record verification")
    void testSendOtp() {
        when(otpVerificationRepository.save(any(OtpVerification.class))).thenAnswer(i -> i.getArgument(0));

        OtpResponseDto response = abhaService.sendOtp("9876543210");
        assertNotNull(response);
        assertEquals("9876543210", response.getMobileNumber());
        assertEquals("123456", response.getMockOtpCode());
        assertTrue(response.isMockService());
    }

    @Test
    @DisplayName("Verify OTP with valid code should return true")
    void testVerifyOtpSuccess() {
        OtpVerification verification = OtpVerification.builder()
                .mobileNumber("9876543210")
                .otpCode("123456")
                .attempts(0)
                .maxAttempts(3)
                .isVerified(false)
                .expiresAt(LocalDateTime.now().plusMinutes(5))
                .build();

        when(otpVerificationRepository.findTopByMobileNumberAndIsVerifiedFalseOrderByCreatedAtDesc("9876543210"))
                .thenReturn(Optional.of(verification));
        when(patientRepository.findByMobileNumber("9876543210")).thenReturn(Optional.empty());

        boolean verified = abhaService.verifyOtp("9876543210", "123456");
        assertTrue(verified);
        assertTrue(verification.getIsVerified());
    }

    @Test
    @DisplayName("Verify OTP with invalid code should increment attempts and throw InvalidOtpException")
    void testVerifyOtpInvalidCode() {
        OtpVerification verification = OtpVerification.builder()
                .mobileNumber("9876543210")
                .otpCode("999999")
                .attempts(0)
                .maxAttempts(3)
                .isVerified(false)
                .expiresAt(LocalDateTime.now().plusMinutes(5))
                .build();

        ReflectionTestUtils.setField(abhaService, "demoMode", false);

        when(otpVerificationRepository.findTopByMobileNumberAndIsVerifiedFalseOrderByCreatedAtDesc("9876543210"))
                .thenReturn(Optional.of(verification));

        assertThrows(InvalidOtpException.class, () -> abhaService.verifyOtp("9876543210", "000000"));
        assertEquals(1, verification.getAttempts());
    }

    @Test
    @DisplayName("Verify OTP exceeding max attempts should throw OtpExhaustedException")
    void testVerifyOtpExhausted() {
        OtpVerification verification = OtpVerification.builder()
                .mobileNumber("9876543210")
                .otpCode("999999")
                .attempts(3)
                .maxAttempts(3)
                .isVerified(false)
                .expiresAt(LocalDateTime.now().plusMinutes(5))
                .build();

        when(otpVerificationRepository.findTopByMobileNumberAndIsVerifiedFalseOrderByCreatedAtDesc("9876543210"))
                .thenReturn(Optional.of(verification));

        assertThrows(OtpExhaustedException.class, () -> abhaService.verifyOtp("9876543210", "123456"));
    }
}
