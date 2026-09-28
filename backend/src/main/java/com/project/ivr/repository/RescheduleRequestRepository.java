package com.project.ivr.repository;

import com.project.ivr.entity.RescheduleRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RescheduleRequestRepository extends JpaRepository<RescheduleRequest, Long> {
    Optional<RescheduleRequest> findByOldTokenId(Long oldTokenId);
    List<RescheduleRequest> findByPatientIdOrderByCreatedAtDesc(Long patientId);
}
