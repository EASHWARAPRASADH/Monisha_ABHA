package com.project.ivr.integration.abha;

import com.project.ivr.audit.AuditLogService;
import com.project.ivr.dto.AbhaProfileDto;
import com.project.ivr.dto.OtpResponseDto;
import com.project.ivr.entity.AbhaProfile;
import com.project.ivr.entity.OtpVerification;
import com.project.ivr.entity.Patient;
import com.project.ivr.exception.InvalidOtpException;
import com.project.ivr.exception.OtpExhaustedException;
import com.project.ivr.exception.ResourceNotFoundException;
import com.project.ivr.repository.AbhaProfileRepository;
import com.project.ivr.repository.OtpVerificationRepository;
import com.project.ivr.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class MockABHAIntegrationService implements ABHAIntegrationService {

    private static final Logger log = LoggerFactory.getLogger(MockABHAIntegrationService.class);

    private final AbhaProfileRepository abhaProfileRepository;
    private final OtpVerificationRepository otpVerificationRepository;
    private final PatientRepository patientRepository;
    private final AuditLogService auditLogService;

    @Value("${app.otp.fixed-mock-otp:123456}")
    private String fixedMockOtp;

    @Value("${app.otp.expiration-minutes:5}")
    private int otpExpirationMinutes;

    @Value("${app.otp.max-attempts:3}")
    private int maxOtpAttempts;

    @Value("${app.demo-mode:true}")
    private boolean demoMode;

    @Override
    @Transactional(readOnly = true)
    public AbhaProfileDto verifyMobile(String mobileNumber) {
        log.info("[MOCK ABHA] Verifying mobile number: {}", mobileNumber);
        String cleanNumber = cleanMobile(mobileNumber);

        return abhaProfileRepository.findByMobileNumber(cleanNumber)
                .map(this::mapToDto)
                .orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public AbhaProfileDto verifyAbhaId(String abhaId) {
        log.info("[MOCK ABHA] Verifying ABHA ID: {}", abhaId);
        String cleanAbha = cleanAbhaId(abhaId);

        return abhaProfileRepository.findByAbhaId(cleanAbha)
                .map(this::mapToDto)
                .orElse(null);
    }

    @Override
    @Transactional
    public OtpResponseDto sendOtp(String mobileNumber) {
        String cleanNumber = cleanMobile(mobileNumber);
        String otp = demoMode ? fixedMockOtp : String.format("%06d", new Random().nextInt(999999));

        OtpVerification verification = OtpVerification.builder()
                .mobileNumber(cleanNumber)
                .otpCode(otp)
                .attempts(0)
                .maxAttempts(maxOtpAttempts)
                .isVerified(false)
                .expiresAt(LocalDateTime.now().plusMinutes(otpExpirationMinutes))
                .build();

        otpVerificationRepository.save(verification);

        auditLogService.logAction(
                "MOCK_ABHA",
                "OTP_GENERATED",
                "OTP_VERIFICATION",
                cleanNumber,
                "SYSTEM",
                "Mock OTP generated for mobile: " + cleanNumber
        );

        log.info("[MOCK ABHA] Generated OTP for mobile {}: {}", cleanNumber, otp);

        return OtpResponseDto.builder()
                .mobileNumber(cleanNumber)
                .message("Mock verification code sent successfully to " + cleanNumber)
                .expiresInMinutes(otpExpirationMinutes)
                .mockOtpCode(demoMode ? otp : null)
                .mockService(true)
                .build();
    }

    @Override
    @Transactional
    public boolean verifyOtp(String mobileNumber, String otpCode) {
        String cleanNumber = cleanMobile(mobileNumber);
        OtpVerification verification = otpVerificationRepository
                .findTopByMobileNumberAndIsVerifiedFalseOrderByCreatedAtDesc(cleanNumber)
                .orElseThrow(() -> new InvalidOtpException("No active OTP request found for this mobile number"));

        if (verification.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new InvalidOtpException("OTP has expired. Please request a new OTP.");
        }

        if (verification.getAttempts() >= verification.getMaxAttempts()) {
            auditLogService.logAction(
                    "MOCK_ABHA",
                    "OTP_EXHAUSTED",
                    "OTP_VERIFICATION",
                    cleanNumber,
                    "SYSTEM",
                    "Max OTP attempts exceeded"
            );
            throw new OtpExhaustedException("Maximum OTP verification attempts exceeded. Session terminated.");
        }

        if (verification.getOtpCode().equals(otpCode.trim()) || (demoMode && fixedMockOtp.equals(otpCode.trim()))) {
            verification.setIsVerified(true);
            otpVerificationRepository.save(verification);

            auditLogService.logAction(
                    "MOCK_ABHA",
                    "OTP_VERIFIED",
                    "OTP_VERIFICATION",
                    cleanNumber,
                    "SYSTEM",
                    "OTP verified successfully"
            );

            // Also mark patient verified if exists
            patientRepository.findByMobileNumber(cleanNumber).ifPresent(p -> {
                p.setIsVerified(true);
                patientRepository.save(p);
            });

            return true;
        } else {
            verification.setAttempts(verification.getAttempts() + 1);
            otpVerificationRepository.save(verification);

            int remaining = verification.getMaxAttempts() - verification.getAttempts();
            auditLogService.logAction(
                    "MOCK_ABHA",
                    "OTP_FAILED",
                    "OTP_VERIFICATION",
                    cleanNumber,
                    "SYSTEM",
                    "Failed OTP attempt. Remaining: " + remaining
            );

            if (remaining <= 0) {
                throw new OtpExhaustedException("Maximum OTP verification attempts exceeded.");
            }
            throw new InvalidOtpException("Invalid OTP code. " + remaining + " attempts remaining.");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public AbhaProfileDto getPatientById(String idOrAbhaId) {
        try {
            Long id = Long.parseLong(idOrAbhaId);
            return abhaProfileRepository.findById(id).map(this::mapToDto).orElse(null);
        } catch (NumberFormatException e) {
            return abhaProfileRepository.findByAbhaId(cleanAbhaId(idOrAbhaId))
                    .map(this::mapToDto)
                    .orElse(null);
        }
    }

    @Override
    @Transactional
    public AbhaProfileDto createOrLinkMockPatient(String mobileNumber, String abhaId, String fullName) {
        String cleanNumber = cleanMobile(mobileNumber);
        String finalAbha = (abhaId != null && !abhaId.isBlank()) ? cleanAbhaId(abhaId) : "1000-0000-" + cleanNumber.substring(Math.max(0, cleanNumber.length() - 4));
        String name = (fullName != null && !fullName.isBlank()) ? fullName : "Citizen " + cleanNumber.substring(Math.max(0, cleanNumber.length() - 4));

        AbhaProfile profile = abhaProfileRepository.findByAbhaId(finalAbha)
                .orElseGet(() -> abhaProfileRepository.save(AbhaProfile.builder()
                        .abhaId(finalAbha)
                        .abhaAddress(cleanNumber + "@abdm")
                        .mobileNumber(cleanNumber)
                        .fullName(name)
                        .gender("Other")
                        .dateOfBirth(LocalDate.of(1990, 1, 1))
                        .address("Tamil Nadu, India")
                        .status("ACTIVE")
                        .build()));

        if (!patientRepository.existsByMobileNumber(cleanNumber)) {
            patientRepository.save(Patient.builder()
                    .mobileNumber(cleanNumber)
                    .fullName(name)
                    .gender(profile.getGender())
                    .dateOfBirth(profile.getDateOfBirth())
                    .address(profile.getAddress())
                    .abhaId(profile.getAbhaId())
                    .isVerified(true)
                    .build());
        }

        return mapToDto(profile);
    }

    private AbhaProfileDto mapToDto(AbhaProfile p) {
        return AbhaProfileDto.builder()
                .id(p.getId())
                .abhaId(p.getAbhaId())
                .abhaAddress(p.getAbhaAddress())
                .mobileNumber(p.getMobileNumber())
                .fullName(p.getFullName())
                .gender(p.getGender())
                .dateOfBirth(p.getDateOfBirth())
                .address(p.getAddress())
                .status(p.getStatus())
                .mockData(true)
                .disclaimer("ACADEMIC PROTOTYPE ONLY - MOCK ABHA PROFILE")
                .build();
    }

    private String cleanMobile(String mobile) {
        if (mobile == null) return "";
        String cleaned = mobile.replaceAll("[^0-9]", "");
        if (cleaned.length() > 10) {
            cleaned = cleaned.substring(cleaned.length() - 10);
        }
        return cleaned;
    }

    private String cleanAbhaId(String abha) {
        if (abha == null) return "";
        return abha.trim();
    }
}
