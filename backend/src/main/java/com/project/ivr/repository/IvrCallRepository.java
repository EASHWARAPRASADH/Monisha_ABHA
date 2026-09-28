package com.project.ivr.repository;

import com.project.ivr.entity.IvrCall;
import com.project.ivr.entity.IvrCallStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface IvrCallRepository extends JpaRepository<IvrCall, Long> {
    Optional<IvrCall> findByCallSid(String callSid);
    long countByCallStatus(IvrCallStatus status);
    long countByStartTimeAfter(LocalDateTime time);
    Page<IvrCall> findAllByOrderByStartTimeDesc(Pageable pageable);
}
