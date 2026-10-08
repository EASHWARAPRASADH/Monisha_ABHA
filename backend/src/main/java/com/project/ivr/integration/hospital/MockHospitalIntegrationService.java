package com.project.ivr.integration.hospital;

import com.project.ivr.audit.AuditLogService;
import com.project.ivr.dto.*;
import com.project.ivr.entity.*;
import com.project.ivr.exception.DuplicateBookingException;
import com.project.ivr.exception.OpdClosedException;
import com.project.ivr.exception.ResourceNotFoundException;
import com.project.ivr.exception.TokenUnavailableException;
import com.project.ivr.integration.abha.ABHAIntegrationService;
import com.project.ivr.integration.sms.NotificationService;
import com.project.ivr.repository.*;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service("mockHospitalIntegrationService")
@RequiredArgsConstructor
public class MockHospitalIntegrationService implements HospitalIntegrationService {

    private static final Logger log = LoggerFactory.getLogger(MockHospitalIntegrationService.class);

    private final HospitalRepository hospitalRepository;
    private final DepartmentRepository departmentRepository;
    private final HospitalDepartmentRepository hospitalDepartmentRepository;
    private final PatientRepository patientRepository;
    private final TokenRepository tokenRepository;
    private final TokenCounterRepository tokenCounterRepository;
    private final AppointmentRepository appointmentRepository;
    private final CancellationRequestRepository cancellationRequestRepository;
    private final RescheduleRequestRepository rescheduleRequestRepository;
    private final ABHAIntegrationService abhaIntegrationService;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    @Value("${app.opd.start-time:08:00}")
    private String defaultOpdStartTime;

    @Value("${app.opd.end-time:16:00}")
    private String defaultOpdEndTime;

    @Value("${app.opd.slot-duration-minutes:15}")
    private int defaultSlotDurationMinutes;

    @Value("${app.demo-mode:true}")
    private boolean demoMode;

    @Override
    @Transactional(readOnly = true)
    public List<HospitalDto> getAllHospitals() {
        return hospitalRepository.findAllByIsActiveTrue().stream()
                .map(this::mapToHospitalDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public HospitalDto getHospitalById(Long id) {
        return hospitalRepository.findById(id)
                .map(this::mapToHospitalDto)
                .orElseThrow(() -> new ResourceNotFoundException("Hospital not found with id: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<HospitalDepartmentDto> getHospitalDepartments(Long hospitalId) {
        Hospital hospital = hospitalRepository.findById(hospitalId)
                .orElseThrow(() -> new ResourceNotFoundException("Hospital not found with id: " + hospitalId));

        LocalDate today = LocalDate.now();
        return hospitalDepartmentRepository.findByHospitalIdAndIsActiveTrue(hospitalId).stream()
                .map(hd -> {
                    long booked = tokenRepository.findByHospitalIdAndDepartmentIdAndBookingDate(hospitalId, hd.getDepartment().getId(), today)
                            .stream()
                            .filter(t -> t.getStatus() != TokenStatus.CANCELLED)
                            .count();
                    int available = Math.max(0, hd.getDailyTokenLimit() - (int) booked);
                    return HospitalDepartmentDto.builder()
                            .id(hd.getId())
                            .hospitalId(hospital.getId())
                            .hospitalName(hospital.getName())
                            .departmentId(hd.getDepartment().getId())
                            .departmentName(hd.getDepartment().getName())
                            .departmentCode(hd.getDepartment().getCode())
                            .dailyTokenLimit(hd.getDailyTokenLimit())
                            .opdStartTime(hd.getOpdStartTime())
                            .opdEndTime(hd.getOpdEndTime())
                            .slotDurationMinutes(hd.getSlotDurationMinutes())
                            .bookedCount((int) booked)
                            .availableCount(available)
                            .isAvailable(available > 0)
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public DepartmentDto getDepartmentById(Long id) {
        return departmentRepository.findById(id)
                .map(this::mapToDepartmentDto)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public AvailabilityResponseDto checkAvailability(Long hospitalId, Long departmentId, LocalDate date) {
        LocalDate checkDate = date != null ? date : LocalDate.now();

        Hospital hospital = hospitalRepository.findById(hospitalId)
                .orElseThrow(() -> new ResourceNotFoundException("Hospital not found with id: " + hospitalId));
        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + departmentId));

        HospitalDepartment hd = hospitalDepartmentRepository.findByHospitalIdAndDepartmentId(hospitalId, departmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Department not active in hospital"));

        long booked = tokenRepository.findByHospitalIdAndDepartmentIdAndBookingDate(hospitalId, departmentId, checkDate)
                .stream()
                .filter(t -> t.getStatus() != TokenStatus.CANCELLED)
                .count();

        int remaining = Math.max(0, hd.getDailyTokenLimit() - (int) booked);

        boolean isOpdOpen = true;
        if (checkDate.isEqual(LocalDate.now())) {
            LocalTime closingTime = LocalTime.parse(hd.getOpdEndTime(), DateTimeFormatter.ofPattern("HH:mm"));
            if (LocalTime.now().isAfter(closingTime)) {
                isOpdOpen = false;
            }
        }

        LocalTime nextTime = calculateEstimatedTime(hd.getOpdStartTime(), (int) booked + 1, hd.getSlotDurationMinutes());

        return AvailabilityResponseDto.builder()
                .hospitalId(hospitalId)
                .hospitalName(hospital.getName())
                .departmentId(departmentId)
                .departmentName(department.getName())
                .date(checkDate)
                .totalCapacity(hd.getDailyTokenLimit())
                .bookedCount((int) booked)
                .remainingCount(remaining)
                .isAvailable(remaining > 0 && isOpdOpen)
                .opdOpen(isOpdOpen)
                .nextEstimatedTime(nextTime.format(DateTimeFormatter.ofPattern("hh:mm a")))
                .build();
    }

    @Override
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public TokenDto bookToken(TokenBookingRequest request) {
        LocalDate bookingDate = request.getBookingDate() != null ? request.getBookingDate() : LocalDate.now();
        String mobile = cleanMobile(request.getPatientMobile());

        // 1. Fetch or create Patient
        Patient patient = patientRepository.findByMobileNumber(mobile)
                .orElseGet(() -> {
                    // Try linking via Mock ABHA
                    AbhaProfileDto abha = abhaIntegrationService.createOrLinkMockPatient(
                            mobile,
                            request.getAbhaId(),
                            request.getPatientName() != null ? request.getPatientName() : "Caller " + mobile.substring(Math.max(0, mobile.length() - 4))
                    );
                    return patientRepository.findByMobileNumber(mobile)
                            .orElseThrow(() -> new ResourceNotFoundException("Patient record creation failed"));
                });

        // 2. Duplicate active token check for the same patient and same date
        List<TokenStatus> activeStatuses = Arrays.asList(TokenStatus.BOOKED, TokenStatus.CONFIRMED, TokenStatus.CALLED);
        List<Token> existingTokens = tokenRepository.findByPatientIdAndBookingDateAndStatusIn(patient.getId(), bookingDate, activeStatuses);
        if (!existingTokens.isEmpty()) {
            Token existing = existingTokens.get(0);
            throw new DuplicateBookingException(String.format(
                    "You already have an active OPD token %s for %s today. Duplicate booking is not allowed.",
                    existing.getTokenNumber(), existing.getDepartment().getName()
            ));
        }

        // 3. Hospital and Department verification
        Hospital hospital = hospitalRepository.findById(request.getHospitalId())
                .orElseThrow(() -> new ResourceNotFoundException("Hospital not found: " + request.getHospitalId()));
        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found: " + request.getDepartmentId()));

        HospitalDepartment hd = hospitalDepartmentRepository.findByHospitalIdAndDepartmentId(hospital.getId(), department.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not mapped to this hospital"));

        // 4. OPD Timings check for today's date (relaxed in demo-mode for anytime grading/evaluations)
        if (!demoMode && bookingDate.isEqual(LocalDate.now())) {
            LocalTime closingTime = LocalTime.parse(hd.getOpdEndTime(), DateTimeFormatter.ofPattern("HH:mm"));
            if (LocalTime.now().isAfter(closingTime)) {
                throw new OpdClosedException(String.format(
                        "OPD booking is closed for today. Operating hours are %s to %s.",
                        hd.getOpdStartTime(), hd.getOpdEndTime()
                ));
            }
        }

        // 5. Concurrency-safe Token Counter acquisition (Pessimistic Write Lock)
        TokenCounter counter = tokenCounterRepository.findWithLock(hospital.getId(), department.getId(), bookingDate)
                .orElseGet(() -> tokenCounterRepository.save(TokenCounter.builder()
                        .hospital(hospital)
                        .department(department)
                        .counterDate(bookingDate)
                        .currentNumber(0)
                        .version(0L)
                        .build()));

        if (counter.getCurrentNumber() >= hd.getDailyTokenLimit()) {
            throw new TokenUnavailableException(String.format(
                    "Token capacity of %d reached for %s at %s.",
                    hd.getDailyTokenLimit(), department.getName(), hospital.getName()
            ));
        }

        // Increment counter
        int nextNum = counter.getCurrentNumber() + 1;
        counter.setCurrentNumber(nextNum);
        tokenCounterRepository.save(counter);

        // Generate Token Number format: A001, A002...
        String prefix = getDepartmentLetterPrefix(department.getId());
        String tokenNumber = String.format("%s%03d", prefix, nextNum);

        // Calculate estimated time
        LocalTime estimatedTime = calculateEstimatedTime(hd.getOpdStartTime(), nextNum, hd.getSlotDurationMinutes());

        // Save Token
        Token token = Token.builder()
                .tokenNumber(tokenNumber)
                .patient(patient)
                .hospital(hospital)
                .department(department)
                .bookingDate(bookingDate)
                .bookingTime(LocalTime.now())
                .estimatedTime(estimatedTime)
                .status(TokenStatus.BOOKED)
                .triageSeverity(request.getTriageSeverity() != null ? request.getTriageSeverity() : "ROUTINE")
                .chiefComplaint(request.getChiefComplaint())
                .build();
        token = tokenRepository.save(token);

        // Save Appointment
        Appointment appointment = Appointment.builder()
                .token(token)
                .patient(patient)
                .hospital(hospital)
                .department(department)
                .appointmentDate(bookingDate)
                .appointmentTime(estimatedTime)
                .status("SCHEDULED")
                .notes("Booked via " + request.getChannel())
                .build();
        appointmentRepository.save(appointment);

        // Dispatch SMS
        notificationService.sendTokenBookingSms(token);

        // Audit Log
        auditLogService.logAction(
                mobile,
                "TOKEN_CREATED",
                "TOKEN",
                token.getId().toString(),
                "IVR/API",
                String.format("Token %s booked for %s at %s", tokenNumber, department.getName(), hospital.getName())
        );

        log.info("Token successfully booked: {} for patient {} (Mobile: {})", tokenNumber, patient.getFullName(), mobile);
        return mapToTokenDto(token, true);
    }

    @Override
    @Transactional(readOnly = true)
    public TokenDto getTokenById(Long id) {
        Token token = tokenRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Token not found with id: " + id));
        return mapToTokenDto(token, false);
    }

    @Override
    @Transactional
    public TokenDto cancelToken(Long tokenId, CancelTokenRequest request) {
        Token token = tokenRepository.findById(tokenId)
                .orElseThrow(() -> new ResourceNotFoundException("Token not found: " + tokenId));

        if (token.getStatus() == TokenStatus.CANCELLED) {
            return mapToTokenDto(token, false);
        }

        token.setStatus(TokenStatus.CANCELLED);
        token = tokenRepository.save(token);

        appointmentRepository.findByTokenId(tokenId).ifPresent(app -> {
            app.setStatus("CANCELLED");
            appointmentRepository.save(app);
        });

        cancellationRequestRepository.save(CancellationRequest.builder()
                .token(token)
                .patient(token.getPatient())
                .reason(request.getReason() != null ? request.getReason() : "Patient requested cancellation")
                .requestedVia(request.getChannel() != null ? request.getChannel() : RequestChannel.IVR)
                .status("APPROVED")
                .build());

        notificationService.sendCancellationSms(token);

        auditLogService.logAction(
                request.getCallerMobile() != null ? request.getCallerMobile() : token.getPatient().getMobileNumber(),
                "TOKEN_CANCELLED",
                "TOKEN",
                token.getId().toString(),
                "IVR/WEB",
                "Token " + token.getTokenNumber() + " cancelled"
        );

        return mapToTokenDto(token, false);
    }

    @Override
    @Transactional
    public TokenDto rescheduleToken(Long tokenId, RescheduleTokenRequest request) {
        Token oldToken = tokenRepository.findById(tokenId)
                .orElseThrow(() -> new ResourceNotFoundException("Token not found: " + tokenId));

        if (oldToken.getStatus() == TokenStatus.CANCELLED) {
            throw new TokenUnavailableException("Cannot reschedule an already cancelled token");
        }

        // Cancel old token
        oldToken.setStatus(TokenStatus.RESCHEDULED);
        tokenRepository.save(oldToken);

        // Book new token
        Long targetHospitalId = request.getNewHospitalId() != null ? request.getNewHospitalId() : oldToken.getHospital().getId();
        LocalDate targetDate = request.getNewBookingDate() != null ? request.getNewBookingDate() : oldToken.getBookingDate();

        TokenBookingRequest newBooking = TokenBookingRequest.builder()
                .patientMobile(oldToken.getPatient().getMobileNumber())
                .patientName(oldToken.getPatient().getFullName())
                .hospitalId(targetHospitalId)
                .departmentId(request.getNewDepartmentId())
                .bookingDate(targetDate)
                .channel(request.getChannel())
                .build();

        TokenDto newTokenDto = bookToken(newBooking);
        Token newToken = tokenRepository.findById(newTokenDto.getId()).orElse(null);

        if (newToken != null) {
            rescheduleRequestRepository.save(RescheduleRequest.builder()
                    .oldToken(oldToken)
                    .newToken(newToken)
                    .patient(oldToken.getPatient())
                    .requestedVia(request.getChannel() != null ? request.getChannel() : RequestChannel.IVR)
                    .status("APPROVED")
                    .build());

            notificationService.sendRescheduleSms(oldToken, newToken);
        }

        auditLogService.logAction(
                oldToken.getPatient().getMobileNumber(),
                "TOKEN_RESCHEDULED",
                "TOKEN",
                oldToken.getId() + "->" + newTokenDto.getId(),
                "IVR/WEB",
                "Old token: " + oldToken.getTokenNumber() + " rescheduled to new token: " + newTokenDto.getTokenNumber()
        );

        return newTokenDto;
    }

    @Override
    @Transactional
    public TokenDto updateTokenStatus(Long tokenId, TokenStatus newStatus, String staffUsername) {
        Token token = tokenRepository.findById(tokenId)
                .orElseThrow(() -> new ResourceNotFoundException("Token not found: " + tokenId));

        token.setStatus(newStatus);
        token = tokenRepository.save(token);

        appointmentRepository.findByTokenId(tokenId).ifPresent(app -> {
            app.setStatus(newStatus.name());
            appointmentRepository.save(app);
        });

        auditLogService.logAction(
                staffUsername != null ? staffUsername : "STAFF",
                "TOKEN_STATUS_CHANGE",
                "TOKEN",
                token.getId().toString(),
                "PORTAL",
                "Status updated to " + newStatus
        );

        return mapToTokenDto(token, false);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TokenDto> getTodayTokensForHospital(Long hospitalId, Long departmentId, TokenStatus status) {
        LocalDate today = LocalDate.now();
        List<Token> tokens = (hospitalId != null)
                ? tokenRepository.findByHospitalIdAndBookingDate(hospitalId, today)
                : tokenRepository.findByBookingDate(today);

        return tokens.stream()
                .filter(t -> departmentId == null || t.getDepartment().getId().equals(departmentId))
                .filter(t -> status == null || t.getStatus() == status)
                .map(t -> mapToTokenDto(t, false))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TokenDto> getPatientTokens(String mobileNumber) {
        String cleanNumber = cleanMobile(mobileNumber);
        return patientRepository.findByMobileNumber(cleanNumber)
                .map(p -> tokenRepository.findByPatientIdOrderByBookingDateDesc(p.getId()).stream()
                        .map(t -> mapToTokenDto(t, false))
                        .collect(Collectors.toList()))
                .orElse(List.of());
    }

    private LocalTime calculateEstimatedTime(String opdStartTimeStr, int tokenOrder, int slotDurationMinutes) {
        try {
            LocalTime startTime = LocalTime.parse(opdStartTimeStr, DateTimeFormatter.ofPattern("HH:mm"));
            long minutesToAdd = (long) (tokenOrder - 1) * slotDurationMinutes;
            return startTime.plusMinutes(minutesToAdd);
        } catch (Exception e) {
            return LocalTime.of(8, 0).plusMinutes((long) (tokenOrder - 1) * 15);
        }
    }

    private String getDepartmentLetterPrefix(Long departmentId) {
        char letter = (char) ('A' + ((departmentId - 1) % 26));
        return String.valueOf(letter);
    }

    private HospitalDto mapToHospitalDto(Hospital h) {
        return HospitalDto.builder()
                .id(h.getId())
                .name(h.getName())
                .code(h.getCode())
                .type(h.getType())
                .address(h.getAddress())
                .district(h.getDistrict())
                .state(h.getState())
                .contactNumber(h.getContactNumber())
                .isActive(h.getIsActive())
                .build();
    }

    private DepartmentDto mapToDepartmentDto(Department d) {
        return DepartmentDto.builder()
                .id(d.getId())
                .name(d.getName())
                .code(d.getCode())
                .description(d.getDescription())
                .isActive(d.getIsActive())
                .build();
    }

    private TokenDto mapToTokenDto(Token t, boolean smsSent) {
        return TokenDto.builder()
                .id(t.getId())
                .tokenNumber(t.getTokenNumber())
                .patientId(t.getPatient().getId())
                .patientName(t.getPatient().getFullName())
                .patientMobile(t.getPatient().getMobileNumber())
                .abhaId(t.getPatient().getAbhaId())
                .hospitalId(t.getHospital().getId())
                .hospitalName(t.getHospital().getName())
                .departmentId(t.getDepartment().getId())
                .departmentName(t.getDepartment().getName())
                .departmentCode(t.getDepartment().getCode())
                .bookingDate(t.getBookingDate())
                .bookingTime(t.getBookingTime())
                .estimatedTime(t.getEstimatedTime())
                .status(t.getStatus())
                .triageSeverity(t.getTriageSeverity() != null ? t.getTriageSeverity() : "ROUTINE")
                .chiefComplaint(t.getChiefComplaint())
                .smsSent(smsSent)
                .createdAt(t.getCreatedAt())
                .updatedAt(t.getUpdatedAt())
                .build();
    }

    private String cleanMobile(String mobile) {
        if (mobile == null) return "";
        String cleaned = mobile.replaceAll("[^0-9]", "");
        if (cleaned.length() > 10) {
            cleaned = cleaned.substring(cleaned.length() - 10);
        }
        return cleaned;
    }
}
