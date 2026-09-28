package com.project.ivr.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HospitalDepartmentDto {
    private Long id;
    private Long hospitalId;
    private String hospitalName;
    private Long departmentId;
    private String departmentName;
    private String departmentCode;
    private Integer dailyTokenLimit;
    private String opdStartTime;
    private String opdEndTime;
    private Integer slotDurationMinutes;
    private Integer bookedCount;
    private Integer availableCount;
    private Boolean isAvailable;
}
