package com.project.ivr.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HospitalDto {
    private Long id;
    private String name;
    private String code;
    private String type;
    private String address;
    private String district;
    private String state;
    private String contactNumber;
    private Boolean isActive;
}
