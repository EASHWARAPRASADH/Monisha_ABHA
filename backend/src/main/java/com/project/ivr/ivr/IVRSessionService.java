package com.project.ivr.ivr;

import com.project.ivr.entity.*;
import com.project.ivr.repository.IvrCallRepository;
import com.project.ivr.repository.IvrSessionRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class IVRSessionService {

    private static final Logger log = LoggerFactory.getLogger(IVRSessionService.class);

    private final IvrSessionRepository ivrSessionRepository;
    private final IvrCallRepository ivrCallRepository;

    @Transactional
    public IvrSession getOrCreateSession(String callSid, String callerNumber) {
        String safeCallSid = (callSid != null && !callSid.isBlank()) ? callSid : "CALL_" + UUID.randomUUID().toString().substring(0, 12);
        String safeCaller = (callerNumber != null && !callerNumber.isBlank()) ? callerNumber : "9876543210";

        return ivrSessionRepository.findByCallSid(safeCallSid)
                .orElseGet(() -> {
                    // Create session
                    IvrSession session = IvrSession.builder()
                            .sessionToken(UUID.randomUUID().toString())
                            .callSid(safeCallSid)
                            .callerNumber(safeCaller)
                            .language("en")
                            .currentStep(IvrState.LANGUAGE_SELECTION)
                            .lastInteractionTime(LocalDateTime.now())
                            .build();
                    session = ivrSessionRepository.save(session);

                    // Create call record if not exists
                    if (ivrCallRepository.findByCallSid(safeCallSid).isEmpty()) {
                        IvrCall call = IvrCall.builder()
                                .callSid(safeCallSid)
                                .callerNumber(safeCaller)
                                .callerNumberHash(hashCallerNumber(safeCaller))
                                .language("en")
                                .startTime(LocalDateTime.now())
                                .currentState(IvrState.LANGUAGE_SELECTION)
                                .callStatus(IvrCallStatus.IN_PROGRESS)
                                .build();
                        ivrCallRepository.save(call);
                    }

                    return session;
                });
    }

    @Transactional(readOnly = true)
    public Optional<IvrSession> getSession(String callSid) {
        return ivrSessionRepository.findByCallSid(callSid);
    }

    @Transactional
    public void updateStep(String callSid, IvrState newState) {
        ivrSessionRepository.findByCallSid(callSid).ifPresent(s -> {
            s.setCurrentStep(newState);
            ivrSessionRepository.save(s);
        });

        ivrCallRepository.findByCallSid(callSid).ifPresent(c -> {
            c.setCurrentState(newState);
            ivrCallRepository.save(c);
        });
    }

    @Transactional
    public void updateLanguage(String callSid, String lang) {
        ivrSessionRepository.findByCallSid(callSid).ifPresent(s -> {
            s.setLanguage(lang);
            ivrSessionRepository.save(s);
        });

        ivrCallRepository.findByCallSid(callSid).ifPresent(c -> {
            c.setLanguage(lang);
            ivrCallRepository.save(c);
        });
    }

    @Transactional
    public void updateHospital(String callSid, Long hospitalId) {
        ivrSessionRepository.findByCallSid(callSid).ifPresent(s -> {
            s.setHospitalId(hospitalId);
            ivrSessionRepository.save(s);
        });
    }

    @Transactional
    public void updateDepartment(String callSid, Long departmentId) {
        ivrSessionRepository.findByCallSid(callSid).ifPresent(s -> {
            s.setDepartmentId(departmentId);
            ivrSessionRepository.save(s);
        });
    }

    @Transactional
    public void updatePatient(String callSid, Long patientId) {
        ivrSessionRepository.findByCallSid(callSid).ifPresent(s -> {
            s.setPatientId(patientId);
            ivrSessionRepository.save(s);
        });
    }

    @Transactional
    public void updateTokenAndComplete(String callSid, Long tokenId, Hospital hospital, Department department, Token token) {
        ivrSessionRepository.findByCallSid(callSid).ifPresent(s -> {
            s.setTokenId(tokenId);
            s.setCurrentStep(IvrState.COMPLETED);
            ivrSessionRepository.save(s);
        });

        ivrCallRepository.findByCallSid(callSid).ifPresent(c -> {
            c.setToken(token);
            c.setHospital(hospital);
            c.setDepartment(department);
            c.setCurrentState(IvrState.COMPLETED);
            c.setCallStatus(IvrCallStatus.COMPLETED);
            c.setEndTime(LocalDateTime.now());
            ivrCallRepository.save(c);
        });
    }

    @Transactional
    public void markCallFailed(String callSid, String reason) {
        ivrCallRepository.findByCallSid(callSid).ifPresent(c -> {
            c.setCallStatus(IvrCallStatus.FAILED);
            c.setFailureReason(reason);
            c.setEndTime(LocalDateTime.now());
            ivrCallRepository.save(c);
        });
    }

    public String hashCallerNumber(String number) {
        if (number == null) return "";
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(number.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString().substring(0, 16);
        } catch (Exception e) {
            return "HASH_ERR";
        }
    }
}
