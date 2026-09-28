package com.project.ivr.controller;

import com.project.ivr.audit.AuditLogService;
import com.project.ivr.dto.ApiResponse;
import com.project.ivr.dto.LoginRequest;
import com.project.ivr.dto.LoginResponse;
import com.project.ivr.entity.User;
import com.project.ivr.repository.UserRepository;
import com.project.ivr.security.JwtUtils;
import com.project.ivr.security.UserDetailsImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Endpoints for user login and token management")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    @PostMapping("/login")
    @Operation(summary = "User login to obtain JWT token")
    public ResponseEntity<ApiResponse<LoginResponse>> authenticateUser(
            @Valid @RequestBody LoginRequest loginRequest,
            HttpServletRequest request) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        String role = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst()
                .orElse("ROLE_STAFF");

        User user = userRepository.findById(userDetails.getId()).orElse(null);
        String hospitalName = (user != null && user.getHospital() != null) ? user.getHospital().getName() : null;

        LoginResponse loginResponse = LoginResponse.builder()
                .token(jwt)
                .type("Bearer")
                .id(userDetails.getId())
                .username(userDetails.getUsername())
                .fullName(userDetails.getFullName())
                .email(userDetails.getEmail())
                .role(role)
                .hospitalId(userDetails.getHospitalId())
                .hospitalName(hospitalName)
                .build();

        auditLogService.logAction(
                userDetails.getUsername(),
                "USER_LOGIN",
                "USER",
                userDetails.getId().toString(),
                request.getRemoteAddr(),
                "User logged in successfully"
        );

        return ResponseEntity.ok(ApiResponse.success("Login successful", loginResponse));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user profile")
    public ResponseEntity<ApiResponse<LoginResponse>> getCurrentUser(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof UserDetailsImpl userDetails)) {
            return ResponseEntity.status(401).body(ApiResponse.error("Not authenticated", "UNAUTHENTICATED"));
        }

        User user = userRepository.findById(userDetails.getId()).orElse(null);
        String hospitalName = (user != null && user.getHospital() != null) ? user.getHospital().getName() : null;
        String role = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst()
                .orElse("ROLE_STAFF");

        LoginResponse profile = LoginResponse.builder()
                .id(userDetails.getId())
                .username(userDetails.getUsername())
                .fullName(userDetails.getFullName())
                .email(userDetails.getEmail())
                .role(role)
                .hospitalId(userDetails.getHospitalId())
                .hospitalName(hospitalName)
                .build();

        return ResponseEntity.ok(ApiResponse.success("Current user profile", profile));
    }
}
