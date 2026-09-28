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
public class AvailabilityResponseDto {
    private Long hospitalId;
    private String hospitalName;
    private Long departmentId;
    private String departmentName;
    private LocalDate date;
    private Integer totalCapacity;
    private Integer bookedCount;
    private Integer remainingCount;
    private Boolean isAvailable;
    private Boolean opdOpen;
    private String nextEstimatedTime;
}
