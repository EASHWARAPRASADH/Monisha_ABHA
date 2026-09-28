package com.project.ivr.dto;

import com.project.ivr.entity.RequestChannel;
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
public class RescheduleTokenRequest {
    private Long newHospitalId;

    @NotNull(message = "New department ID is required")
    private Long newDepartmentId;

    private LocalDate newBookingDate;

    private String callerMobile;

    @Builder.Default
    private RequestChannel channel = RequestChannel.WEB;
}
