package com.project.ivr.integration.abha;

import com.project.ivr.dto.AbhaProfileDto;
import com.project.ivr.dto.OtpResponseDto;

public interface ABHAIntegrationService {
    AbhaProfileDto verifyMobile(String mobileNumber);
    AbhaProfileDto verifyAbhaId(String abhaId);
    OtpResponseDto sendOtp(String mobileNumber);
    boolean verifyOtp(String mobileNumber, String otpCode);
    AbhaProfileDto getPatientById(String idOrAbhaId);
    AbhaProfileDto createOrLinkMockPatient(String mobileNumber, String abhaId, String fullName);
}
