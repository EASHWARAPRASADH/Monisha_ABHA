package com.project.ivr.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "reschedule_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RescheduleRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "old_token_id", nullable = false)
    private Token oldToken;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "new_token_id", nullable = false)
    private Token newToken;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Enumerated(EnumType.STRING)
    @Column(name = "requested_via", nullable = false, length = 50)
    @Builder.Default
    private RequestChannel requestedVia = RequestChannel.IVR;

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String status = "APPROVED";

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (requestedVia == null) requestedVia = RequestChannel.IVR;
        if (status == null) status = "APPROVED";
    }
}
