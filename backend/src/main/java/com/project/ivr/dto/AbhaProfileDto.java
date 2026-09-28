package com.project.ivr.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AbhaProfileDto {
    private Long id;
    private String abhaId;
    private String abhaAddress;
    private String mobileNumber;
    private String fullName;
    private String gender;
    private LocalDate dateOfBirth;
    private String address;
    private String status;
    @Builder.Default
    private boolean mockData = true;
    @Builder.Default
    private String disclaimer = "ACADEMIC PROTOTYPE ONLY - MOCK ABHA PROFILE";
}
