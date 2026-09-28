package com.project.ivr.audit;

import com.project.ivr.entity.AuditLog;
import com.project.ivr.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private static final Logger log = LoggerFactory.getLogger(AuditLogService.class);
    private final AuditLogRepository auditLogRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logAction(String userId, String action, String entityType, String entityId, String ipAddress, String metadata) {
        try {
            AuditLog auditLog = AuditLog.builder()
                    .userId(userId != null ? userId : "ANONYMOUS")
                    .action(action)
                    .entityType(entityType)
                    .entityId(entityId)
                    .ipAddress(ipAddress != null ? ipAddress : "0.0.0.0")
                    .metadata(metadata)
                    .timestamp(LocalDateTime.now())
                    .build();
            auditLogRepository.save(auditLog);
            log.info("AUDIT: user={}, action={}, entity={}:{}", userId, action, entityType, entityId);
        } catch (Exception ex) {
            log.error("Failed to write audit log: ", ex);
        }
    }

    public Page<AuditLog> getAuditLogs(Pageable pageable) {
        return auditLogRepository.findAllByOrderByTimestampDesc(pageable);
    }
}
