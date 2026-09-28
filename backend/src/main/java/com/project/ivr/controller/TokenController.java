package com.project.ivr.controller;

import com.project.ivr.dto.*;
import com.project.ivr.entity.TokenStatus;
import com.project.ivr.integration.hospital.HospitalIntegrationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tokens")
@RequiredArgsConstructor
@Tag(name = "Token Management", description = "Endpoints for booking, cancelling, rescheduling and managing OPD tokens")
public class TokenController {

    private final HospitalIntegrationService hospitalIntegrationService;

    @PostMapping
    @Operation(summary = "Generate a new OPD Token")
    public ResponseEntity<ApiResponse<TokenDto>> bookToken(@Valid @RequestBody TokenBookingRequest request) {
        TokenDto token = hospitalIntegrationService.bookToken(request);
        return ResponseEntity.ok(ApiResponse.success("Token generated successfully", token));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get token details by ID")
    public ResponseEntity<ApiResponse<TokenDto>> getTokenById(@PathVariable Long id) {
        TokenDto token = hospitalIntegrationService.getTokenById(id);
        return ResponseEntity.ok(ApiResponse.success(token));
    }

    @PostMapping("/{id}/cancel")
    @Operation(summary = "Cancel an active OPD token")
    public ResponseEntity<ApiResponse<TokenDto>> cancelToken(
            @PathVariable Long id,
            @RequestBody(required = false) CancelTokenRequest request) {
        CancelTokenRequest cancelReq = (request != null) ? request : new CancelTokenRequest();
        TokenDto cancelled = hospitalIntegrationService.cancelToken(id, cancelReq);
        return ResponseEntity.ok(ApiResponse.success("Token cancelled successfully", cancelled));
    }

    @PostMapping("/{id}/reschedule")
    @Operation(summary = "Reschedule an OPD token to a new department or slot")
    public ResponseEntity<ApiResponse<TokenDto>> rescheduleToken(
            @PathVariable Long id,
            @Valid @RequestBody RescheduleTokenRequest request) {
        TokenDto rescheduled = hospitalIntegrationService.rescheduleToken(id, request);
        return ResponseEntity.ok(ApiResponse.success("Token rescheduled successfully", rescheduled));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update token status (Hospital Staff: CALLED, COMPLETED, NO_SHOW)")
    public ResponseEntity<ApiResponse<TokenDto>> updateTokenStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> statusUpdate,
            Authentication authentication) {
        String statusStr = statusUpdate.get("status");
        TokenStatus status = TokenStatus.valueOf(statusStr.toUpperCase());
        String staffUsername = (authentication != null) ? authentication.getName() : "STAFF";

        TokenDto updated = hospitalIntegrationService.updateTokenStatus(id, status, staffUsername);
        return ResponseEntity.ok(ApiResponse.success("Token status updated to " + status, updated));
    }

    @GetMapping
    @Operation(summary = "Get today's tokens for hospital queue management")
    public ResponseEntity<ApiResponse<List<TokenDto>>> getTokens(
            @RequestParam(required = false) Long hospitalId,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) TokenStatus status) {
        List<TokenDto> tokens = hospitalIntegrationService.getTodayTokensForHospital(hospitalId, departmentId, status);
        return ResponseEntity.ok(ApiResponse.success(tokens));
    }

    @GetMapping("/patient/{mobile}")
    @Operation(summary = "Get booking history for a patient mobile number")
    public ResponseEntity<ApiResponse<List<TokenDto>>> getPatientTokens(@PathVariable String mobile) {
        List<TokenDto> tokens = hospitalIntegrationService.getPatientTokens(mobile);
        return ResponseEntity.ok(ApiResponse.success(tokens));
    }
}
