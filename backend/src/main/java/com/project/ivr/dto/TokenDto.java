package com.project.ivr.dto;

import com.project.ivr.entity.TokenStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TokenDto {
    private Long id;
    private String tokenNumber;
    private Long patientId;
    private String patientName;
    private String patientMobile;
    private String abhaId;
    private Long hospitalId;
    private String hospitalName;
    private Long departmentId;
    private String departmentName;
    private String departmentCode;
    private LocalDate bookingDate;
    private LocalTime bookingTime;
    private LocalTime estimatedTime;
    private TokenStatus status;
    private String triageSeverity;
    private String chiefComplaint;
    private Boolean smsSent;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
