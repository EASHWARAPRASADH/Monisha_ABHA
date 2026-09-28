package com.project.ivr.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "token_counters",
       uniqueConstraints = {@UniqueConstraint(name = "uk_counter", columnNames = {"hospital_id", "department_id", "counter_date"})})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TokenCounter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hospital_id", nullable = false)
    private Hospital hospital;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @Column(name = "counter_date", nullable = false)
    private LocalDate counterDate;

    @Column(name = "current_number", nullable = false)
    @Builder.Default
    private Integer currentNumber = 0;

    @Version
    @Column(nullable = false)
    @Builder.Default
    private Long version = 0L;
}
