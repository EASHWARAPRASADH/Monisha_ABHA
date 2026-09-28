package com.project.ivr.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatsDto {
    private long totalTokensToday;
    private long bookedToday;
    private long completedToday;
    private long cancelledToday;
    private long noShowToday;
    private long activeHospitals;
    private long activeDepartments;
    private long totalIvrCalls;
    private long successfulIvrCalls;
    private long failedIvrCalls;

    // Charts
    private List<Map<String, Object>> tokensByDepartment;
    private List<Map<String, Object>> tokensByHospital;
    private List<Map<String, Object>> tokensByStatus;
    private List<Map<String, Object>> tokensByHour;
}
