package com.project.ivr.dto;

import com.project.ivr.entity.RequestChannel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TokenBookingRequest {

    @NotBlank(message = "Patient mobile number is required")
    private String patientMobile;

    private String patientName;

    private String abhaId;

    @NotNull(message = "Hospital ID is required")
    private Long hospitalId;

    @NotNull(message = "Department ID is required")
    private Long departmentId;

    private LocalDate bookingDate;

    @Builder.Default
    private RequestChannel channel = RequestChannel.WEB;
}
