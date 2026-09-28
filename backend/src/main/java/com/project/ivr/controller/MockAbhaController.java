package com.project.ivr.controller;

import com.project.ivr.dto.AbhaProfileDto;
import com.project.ivr.dto.AbhaVerifyRequest;
import com.project.ivr.dto.ApiResponse;
import com.project.ivr.dto.OtpRequest;
import com.project.ivr.dto.OtpResponseDto;
import com.project.ivr.integration.abha.ABHAIntegrationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/mock/abha")
@RequiredArgsConstructor
@Tag(name = "Mock ABHA Service", description = "Mock Ayushman Bharat Digital Mission (ABDM) ABHA endpoints for academic prototype")
public class MockAbhaController {

    private final ABHAIntegrationService abhaIntegrationService;

    @PostMapping("/verify-mobile")
    @Operation(summary = "Mock check if mobile number is linked to an ABHA ID")
    public ResponseEntity<ApiResponse<AbhaProfileDto>> verifyMobile(@RequestBody AbhaVerifyRequest request) {
        AbhaProfileDto profile = abhaIntegrationService.verifyMobile(request.getMobileNumber());
        if (profile != null) {
            return ResponseEntity.ok(ApiResponse.success("Mock ABHA profile found for mobile", profile));
        } else {
            return ResponseEntity.ok(ApiResponse.success("No mock ABHA record found for mobile", null));
        }
    }

    @PostMapping("/verify-id")
    @Operation(summary = "Mock check if ABHA ID exists")
    public ResponseEntity<ApiResponse<AbhaProfileDto>> verifyId(@RequestBody AbhaVerifyRequest request) {
        AbhaProfileDto profile = abhaIntegrationService.verifyAbhaId(request.getAbhaId());
        if (profile != null) {
            return ResponseEntity.ok(ApiResponse.success("Mock ABHA ID verified successfully", profile));
        } else {
            return ResponseEntity.ok(ApiResponse.error("Mock ABHA ID not found in ABDM registry", "ABHA_NOT_FOUND"));
        }
    }

    @PostMapping("/send-otp")
    @Operation(summary = "Send mock OTP to patient registered mobile")
    public ResponseEntity<ApiResponse<OtpResponseDto>> sendOtp(@Valid @RequestBody OtpRequest request) {
        OtpResponseDto response = abhaIntegrationService.sendOtp(request.getMobileNumber());
        return ResponseEntity.ok(ApiResponse.success("Mock OTP dispatched", response));
    }

    @PostMapping("/verify-otp")
    @Operation(summary = "Verify mock OTP code entered by caller")
    public ResponseEntity<ApiResponse<Map<String, Object>>> verifyOtp(@Valid @RequestBody OtpRequest request) {
        boolean verified = abhaIntegrationService.verifyOtp(request.getMobileNumber(), request.getOtpCode());
        return ResponseEntity.ok(ApiResponse.success("OTP verified successfully", Map.of(
                "verified", verified,
                "mobileNumber", request.getMobileNumber(),
                "mockDisclaimer", "ACADEMIC PROTOTYPE ONLY"
        )));
    }

    @GetMapping("/patients/{id}")
    @Operation(summary = "Get mock ABHA patient details by ID or ABHA number")
    public ResponseEntity<ApiResponse<AbhaProfileDto>> getPatientById(@PathVariable String id) {
        AbhaProfileDto profile = abhaIntegrationService.getPatientById(id);
        if (profile != null) {
            return ResponseEntity.ok(ApiResponse.success("Mock patient found", profile));
        }
        return ResponseEntity.status(404).body(ApiResponse.error("Patient not found in mock ABHA database", "PATIENT_NOT_FOUND"));
    }
}
