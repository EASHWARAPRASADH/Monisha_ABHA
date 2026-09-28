package com.project.ivr.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ivr_calls")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IvrCall {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "call_sid", nullable = false, unique = true, length = 100)
    private String callSid;

    @Column(name = "caller_number_hash", length = 100)
    private String callerNumberHash;

    @Column(name = "caller_number", length = 30)
    private String callerNumber;

    @Column(length = 20)
    @Builder.Default
    private String language = "en";

    @Column(name = "start_time")
    private LocalDateTime startTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "current_state", nullable = false, length = 50)
    @Builder.Default
    private IvrState currentState = IvrState.LANGUAGE_SELECTION;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hospital_id")
    private Hospital hospital;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "token_id")
    private Token token;

    @Enumerated(EnumType.STRING)
    @Column(name = "call_status", nullable = false, length = 50)
    @Builder.Default
    private IvrCallStatus callStatus = IvrCallStatus.IN_PROGRESS;

    @Column(name = "failure_reason", length = 255)
    private String failureReason;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (startTime == null) startTime = LocalDateTime.now();
        if (callStatus == null) callStatus = IvrCallStatus.IN_PROGRESS;
        if (currentState == null) currentState = IvrState.LANGUAGE_SELECTION;
    }
}
