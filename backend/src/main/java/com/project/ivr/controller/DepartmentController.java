package com.project.ivr.controller;

import com.project.ivr.dto.ApiResponse;
import com.project.ivr.dto.DepartmentDto;
import com.project.ivr.entity.Department;
import com.project.ivr.integration.hospital.HospitalIntegrationService;
import com.project.ivr.repository.DepartmentRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/departments")
@RequiredArgsConstructor
@Tag(name = "Departments", description = "Endpoints for OPD clinical specialties")
public class DepartmentController {

    private final DepartmentRepository departmentRepository;
    private final HospitalIntegrationService hospitalIntegrationService;

    @GetMapping
    @Operation(summary = "Get list of all active OPD departments")
    public ResponseEntity<ApiResponse<List<DepartmentDto>>> getAllDepartments() {
        List<DepartmentDto> departments = departmentRepository.findAllByIsActiveTrue().stream()
                .map(d -> DepartmentDto.builder()
                        .id(d.getId())
                        .name(d.getName())
                        .code(d.getCode())
                        .description(d.getDescription())
                        .isActive(d.getIsActive())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(departments));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get department details by ID")
    public ResponseEntity<ApiResponse<DepartmentDto>> getDepartmentById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(hospitalIntegrationService.getDepartmentById(id)));
    }
}
