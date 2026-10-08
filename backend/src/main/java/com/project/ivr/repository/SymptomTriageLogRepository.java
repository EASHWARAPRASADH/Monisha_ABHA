package com.project.ivr.repository;

import com.project.ivr.entity.SymptomTriageLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SymptomTriageLogRepository extends JpaRepository<SymptomTriageLog, Long> {

    Optional<SymptomTriageLog> findByCallSid(String callSid);

    List<SymptomTriageLog> findTop20ByOrderByCreatedAtDesc();

    Page<SymptomTriageLog> findAllByOrderByCreatedAtDesc(Pageable pageable);

    long countBySeverityLevel(String severityLevel);

    long countByAiEngineUsedContaining(String engine);
}
