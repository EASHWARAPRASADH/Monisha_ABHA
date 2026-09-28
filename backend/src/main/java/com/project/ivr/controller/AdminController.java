package com.project.ivr.controller;

import com.project.ivr.audit.AuditLogService;
import com.project.ivr.dto.AdminStatsDto;
import com.project.ivr.dto.ApiResponse;
import com.project.ivr.dto.CreateUserRequest;
import com.project.ivr.dto.UserDto;
import com.project.ivr.entity.*;
import com.project.ivr.exception.ApiException;
import com.project.ivr.exception.ResourceNotFoundException;
import com.project.ivr.repository.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Tag(name = "Administration", description = "Admin dashboard KPIs, reports, audit logs, IVR logs, and user management")
public class AdminController {

    private final TokenRepository tokenRepository;
    private final HospitalRepository hospitalRepository;
    private final DepartmentRepository departmentRepository;
    private final IvrCallRepository ivrCallRepository;
    private final SmsLogRepository smsLogRepository;
    private final AuditLogRepository auditLogRepository;
    private final SystemSettingRepository systemSettingRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PatientRepository patientRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    @GetMapping("/dashboard/stats")
    @Operation(summary = "Get aggregated dashboard statistics and chart metrics")
    public ResponseEntity<ApiResponse<AdminStatsDto>> getDashboardStats() {
        LocalDate today = LocalDate.now();

        long totalTokens = tokenRepository.countByBookingDate(today);
        long booked = tokenRepository.countByBookingDateAndStatus(today, TokenStatus.BOOKED);
        long completed = tokenRepository.countByBookingDateAndStatus(today, TokenStatus.COMPLETED);
        long cancelled = tokenRepository.countByBookingDateAndStatus(today, TokenStatus.CANCELLED);
        long noShow = tokenRepository.countByBookingDateAndStatus(today, TokenStatus.NO_SHOW);

        long activeHospitals = hospitalRepository.findAllByIsActiveTrue().size();
        long activeDepartments = departmentRepository.findAllByIsActiveTrue().size();

        long totalCalls = ivrCallRepository.count();
        long successfulCalls = ivrCallRepository.countByCallStatus(IvrCallStatus.COMPLETED);
        long failedCalls = ivrCallRepository.countByCallStatus(IvrCallStatus.FAILED);

        // Tokens by Department Chart data
        List<Map<String, Object>> deptChart = departmentRepository.findAllByIsActiveTrue().stream().map(d -> {
            long count = tokenRepository.findAll().stream()
                    .filter(t -> t.getBookingDate().isEqual(today) && t.getDepartment().getId().equals(d.getId()))
                    .count();
            Map<String, Object> item = new HashMap<>();
            item.put("name", d.getName());
            item.put("count", count);
            return item;
        }).collect(Collectors.toList());

        // Tokens by Hospital Chart data
        List<Map<String, Object>> hospChart = hospitalRepository.findAllByIsActiveTrue().stream().map(h -> {
            long count = tokenRepository.findByHospitalIdAndBookingDate(h.getId(), today).size();
            Map<String, Object> item = new HashMap<>();
            item.put("name", h.getName());
            item.put("count", count);
            return item;
        }).collect(Collectors.toList());

        // Tokens by Status Chart data
        List<Map<String, Object>> statusChart = Arrays.stream(TokenStatus.values()).map(s -> {
            long count = tokenRepository.countByBookingDateAndStatus(today, s);
            Map<String, Object> item = new HashMap<>();
            item.put("status", s.name());
            item.put("count", count);
            return item;
        }).filter(m -> ((Long) m.get("count")) > 0 || "BOOKED".equals(m.get("status")) || "COMPLETED".equals(m.get("status"))).collect(Collectors.toList());

        // Tokens by Hour
        List<Map<String, Object>> hourChart = new ArrayList<>();
        for (int h = 8; h <= 16; h++) {
            int hour = h;
            long count = tokenRepository.findByBookingDate(today).stream()
                    .filter(t -> t.getBookingTime() != null && t.getBookingTime().getHour() == hour)
                    .count();
            Map<String, Object> slot = new HashMap<>();
            slot.put("hour", String.format("%02d:00", hour));
            slot.put("count", count);
            hourChart.add(slot);
        }

        AdminStatsDto stats = AdminStatsDto.builder()
                .totalTokensToday(totalTokens)
                .bookedToday(booked)
                .completedToday(completed)
                .cancelledToday(cancelled)
                .noShowToday(noShow)
                .activeHospitals(activeHospitals)
                .activeDepartments(activeDepartments)
                .totalIvrCalls(totalCalls)
                .successfulIvrCalls(successfulCalls)
                .failedIvrCalls(failedCalls)
                .tokensByDepartment(deptChart)
                .tokensByHospital(hospChart)
                .tokensByStatus(statusChart)
                .tokensByHour(hourChart)
                .build();

        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @GetMapping("/ivr-calls")
    @Operation(summary = "Get paginated IVR Call logs")
    public ResponseEntity<ApiResponse<Page<IvrCall>>> getIvrCalls(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(ivrCallRepository.findAllByOrderByStartTimeDesc(PageRequest.of(page, size))));
    }

    @GetMapping("/sms-logs")
    @Operation(summary = "Get paginated SMS dispatch logs")
    public ResponseEntity<ApiResponse<Page<SmsLog>>> getSmsLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(smsLogRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size))));
    }

    @GetMapping("/audit-logs")
    @Operation(summary = "Get paginated security and system audit logs")
    public ResponseEntity<ApiResponse<Page<AuditLog>>> getAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(auditLogRepository.findAllByOrderByTimestampDesc(PageRequest.of(page, size))));
    }

    @GetMapping("/settings")
    @Operation(summary = "Get system settings")
    public ResponseEntity<ApiResponse<List<SystemSetting>>> getSystemSettings() {
        return ResponseEntity.ok(ApiResponse.success(systemSettingRepository.findAll()));
    }

    @PutMapping("/settings/{key}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Update a system configuration setting")
    public ResponseEntity<ApiResponse<SystemSetting>> updateSetting(
            @PathVariable String key,
            @RequestBody Map<String, String> body,
            HttpServletRequest request) {
        SystemSetting setting = systemSettingRepository.findBySettingKey(key)
                .orElseThrow(() -> new ResourceNotFoundException("Setting not found with key: " + key));

        String newVal = body.get("settingValue");
        setting.setSettingValue(newVal);
        setting = systemSettingRepository.save(setting);

        auditLogService.logAction("ADMIN", "SETTING_UPDATED", "SETTING", key, request.getRemoteAddr(), "Value changed to: " + newVal);

        return ResponseEntity.ok(ApiResponse.success("Setting updated", setting));
    }

    @GetMapping("/users")
    @Operation(summary = "Get all hospital staff and administrators")
    public ResponseEntity<ApiResponse<List<UserDto>>> getUsers() {
        List<UserDto> users = userRepository.findAll().stream().map(u -> UserDto.builder()
                .id(u.getId())
                .username(u.getUsername())
                .fullName(u.getFullName())
                .email(u.getEmail())
                .phoneNumber(u.getPhoneNumber())
                .role(u.getRole().getName())
                .hospitalId(u.getHospital() != null ? u.getHospital().getId() : null)
                .hospitalName(u.getHospital() != null ? u.getHospital().getName() : null)
                .isActive(u.getIsActive())
                .createdAt(u.getCreatedAt())
                .build()).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @PostMapping("/users")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HOSPITAL_ADMIN')")
    @Operation(summary = "Create a new hospital staff or admin user")
    public ResponseEntity<ApiResponse<UserDto>> createUser(@Valid @RequestBody CreateUserRequest request, HttpServletRequest httpRequest) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ApiException("Username already taken", "USERNAME_EXISTS", HttpStatus.CONFLICT);
        }

        Role role = roleRepository.findByName(request.getRole())
                .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + request.getRole()));

        Hospital hospital = null;
        if (request.getHospitalId() != null) {
            hospital = hospitalRepository.findById(request.getHospitalId())
                    .orElseThrow(() -> new ResourceNotFoundException("Hospital not found: " + request.getHospitalId()));
        }

        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phoneNumber(request.getPhoneNumber())
                .role(role)
                .hospital(hospital)
                .isActive(true)
                .build();
        user = userRepository.save(user);

        auditLogService.logAction(
                httpRequest.getUserPrincipal() != null ? httpRequest.getUserPrincipal().getName() : "ADMIN",
                "USER_CREATED",
                "USER",
                user.getId().toString(),
                httpRequest.getRemoteAddr(),
                "Created user: " + user.getUsername()
        );

        UserDto dto = UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .role(user.getRole().getName())
                .hospitalId(hospital != null ? hospital.getId() : null)
                .hospitalName(hospital != null ? hospital.getName() : null)
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt())
                .build();

        return ResponseEntity.ok(ApiResponse.success("User created successfully", dto));
    }

    @GetMapping("/patients")
    @Operation(summary = "Get list of registered and verified patients")
    public ResponseEntity<ApiResponse<List<Patient>>> getPatients() {
        return ResponseEntity.ok(ApiResponse.success(patientRepository.findAll()));
    }
}
