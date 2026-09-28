package com.project.ivr.repository;

import com.project.ivr.entity.SmsLog;
import com.project.ivr.entity.SmsStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SmsLogRepository extends JpaRepository<SmsLog, Long> {
    Page<SmsLog> findAllByOrderByCreatedAtDesc(Pageable pageable);
    List<SmsLog> findByRecipientPhoneOrderByCreatedAtDesc(String recipientPhone);
    long countByStatus(SmsStatus status);
}
