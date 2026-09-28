package com.project.ivr.repository;

import com.project.ivr.entity.CancellationRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CancellationRequestRepository extends JpaRepository<CancellationRequest, Long> {
    Optional<CancellationRequest> findByTokenId(Long tokenId);
    List<CancellationRequest> findByPatientIdOrderByCreatedAtDesc(Long patientId);
}
