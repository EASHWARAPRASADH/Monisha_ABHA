package com.project.ivr.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OtpResponseDto {
    private String mobileNumber;
    private String message;
    private Integer expiresInMinutes;
    private String mockOtpCode; // Provided only in mock/demo mode for development & testing
    @Builder.Default
    private boolean mockService = true;
}
