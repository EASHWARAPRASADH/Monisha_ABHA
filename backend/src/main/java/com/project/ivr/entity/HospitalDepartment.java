package com.project.ivr.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "hospital_departments",
       uniqueConstraints = {@UniqueConstraint(name = "uk_hosp_dept", columnNames = {"hospital_id", "department_id"})})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HospitalDepartment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "hospital_id", nullable = false)
    private Hospital hospital;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @Column(name = "daily_token_limit", nullable = false)
    @Builder.Default
    private Integer dailyTokenLimit = 50;

    @Column(name = "opd_start_time", nullable = false, length = 10)
    @Builder.Default
    private String opdStartTime = "08:00";

    @Column(name = "opd_end_time", nullable = false, length = 10)
    @Builder.Default
    private String opdEndTime = "16:00";

    @Column(name = "slot_duration_minutes", nullable = false)
    @Builder.Default
    private Integer slotDurationMinutes = 15;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (dailyTokenLimit == null) dailyTokenLimit = 50;
        if (opdStartTime == null) opdStartTime = "08:00";
        if (opdEndTime == null) opdEndTime = "16:00";
        if (slotDurationMinutes == null) slotDurationMinutes = 15;
        if (isActive == null) isActive = true;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
