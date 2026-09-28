package com.project.ivr.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ivr_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IvrSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "session_token", nullable = false, unique = true, length = 100)
    private String sessionToken;

    @Column(name = "call_sid", nullable = false, length = 100)
    private String callSid;

    @Column(name = "caller_number", nullable = false, length = 30)
    private String callerNumber;

    @Column(length = 20)
    @Builder.Default
    private String language = "en";

    @Enumerated(EnumType.STRING)
    @Column(name = "current_step", nullable = false, length = 50)
    @Builder.Default
    private IvrState currentStep = IvrState.LANGUAGE_SELECTION;

    @Column(name = "patient_id")
    private Long patientId;

    @Column(name = "hospital_id")
    private Long hospitalId;

    @Column(name = "department_id")
    private Long departmentId;

    @Column(name = "token_id")
    private Long tokenId;

    @Column(name = "last_interaction_time")
    private LocalDateTime lastInteractionTime;

    @Column(name = "data_payload", columnDefinition = "TEXT")
    private String dataPayload;

    @PrePersist
    @PreUpdate
    protected void onPersist() {
        lastInteractionTime = LocalDateTime.now();
        if (language == null) language = "en";
        if (currentStep == null) currentStep = IvrState.LANGUAGE_SELECTION;
    }
}
