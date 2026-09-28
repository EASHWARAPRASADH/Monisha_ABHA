package com.project.ivr.repository;

import com.project.ivr.entity.IvrSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IvrSessionRepository extends JpaRepository<IvrSession, Long> {
    Optional<IvrSession> findByCallSid(String callSid);
    Optional<IvrSession> findBySessionToken(String sessionToken);
    void deleteByCallSid(String callSid);
}
