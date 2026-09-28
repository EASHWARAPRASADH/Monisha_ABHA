package com.project.ivr.integration.hospital;

import com.project.ivr.dto.*;
import com.project.ivr.entity.TokenStatus;

import java.time.LocalDate;
import java.util.List;

public interface HospitalIntegrationService {
    List<HospitalDto> getAllHospitals();
    HospitalDto getHospitalById(Long id);
    List<HospitalDepartmentDto> getHospitalDepartments(Long hospitalId);
    DepartmentDto getDepartmentById(Long id);
    AvailabilityResponseDto checkAvailability(Long hospitalId, Long departmentId, LocalDate date);
    TokenDto bookToken(TokenBookingRequest request);
    TokenDto getTokenById(Long id);
    TokenDto cancelToken(Long tokenId, CancelTokenRequest request);
    TokenDto rescheduleToken(Long tokenId, RescheduleTokenRequest request);
    TokenDto updateTokenStatus(Long tokenId, TokenStatus newStatus, String staffUsername);
    List<TokenDto> getTodayTokensForHospital(Long hospitalId, Long departmentId, TokenStatus status);
    List<TokenDto> getPatientTokens(String mobileNumber);
}
