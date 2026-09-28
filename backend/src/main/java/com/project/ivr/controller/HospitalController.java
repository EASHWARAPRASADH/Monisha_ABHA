package com.project.ivr.controller;

import com.project.ivr.dto.ApiResponse;
import com.project.ivr.dto.AvailabilityResponseDto;
import com.project.ivr.dto.HospitalDepartmentDto;
import com.project.ivr.dto.HospitalDto;
import com.project.ivr.integration.hospital.HospitalIntegrationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/hospitals")
@RequiredArgsConstructor
@Tag(name = "Hospital HMIS", description = "Endpoints for hospitals, departments and slot availability")
public class HospitalController {

    private final HospitalIntegrationService hospitalIntegrationService;

    @GetMapping
    @Operation(summary = "Get list of all active government hospitals")
    public ResponseEntity<ApiResponse<List<HospitalDto>>> getAllHospitals() {
        return ResponseEntity.ok(ApiResponse.success(hospitalIntegrationService.getAllHospitals()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get hospital details by ID")
    public ResponseEntity<ApiResponse<HospitalDto>> getHospitalById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(hospitalIntegrationService.getHospitalById(id)));
    }

    @GetMapping("/{id}/departments")
    @Operation(summary = "Get active OPD departments and remaining capacity for a hospital")
    public ResponseEntity<ApiResponse<List<HospitalDepartmentDto>>> getHospitalDepartments(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(hospitalIntegrationService.getHospitalDepartments(id)));
    }

    @GetMapping("/{id}/availability")
    @Operation(summary = "Check OPD token availability for a specific hospital and department")
    public ResponseEntity<ApiResponse<AvailabilityResponseDto>> checkAvailability(
            @PathVariable Long id,
            @RequestParam Long departmentId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        AvailabilityResponseDto availability = hospitalIntegrationService.checkAvailability(id, departmentId, date);
        return ResponseEntity.ok(ApiResponse.success(availability));
    }
}
