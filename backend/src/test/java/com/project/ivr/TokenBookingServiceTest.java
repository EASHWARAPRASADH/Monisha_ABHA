package com.project.ivr;

import com.project.ivr.audit.AuditLogService;
import com.project.ivr.dto.CancelTokenRequest;
import com.project.ivr.dto.RescheduleTokenRequest;
import com.project.ivr.dto.TokenBookingRequest;
import com.project.ivr.dto.TokenDto;
import com.project.ivr.entity.*;
import com.project.ivr.exception.DuplicateBookingException;
import com.project.ivr.exception.TokenUnavailableException;
import com.project.ivr.integration.abha.ABHAIntegrationService;
import com.project.ivr.integration.hospital.MockHospitalIntegrationService;
import com.project.ivr.integration.sms.NotificationService;
import com.project.ivr.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class TokenBookingServiceTest {

    @Mock
    private HospitalRepository hospitalRepository;
    @Mock
    private DepartmentRepository departmentRepository;
    @Mock
    private HospitalDepartmentRepository hospitalDepartmentRepository;
    @Mock
    private PatientRepository patientRepository;
    @Mock
    private TokenRepository tokenRepository;
    @Mock
    private TokenCounterRepository tokenCounterRepository;
    @Mock
    private AppointmentRepository appointmentRepository;
    @Mock
    private CancellationRequestRepository cancellationRequestRepository;
    @Mock
    private RescheduleRequestRepository rescheduleRequestRepository;
    @Mock
    private ABHAIntegrationService abhaIntegrationService;
    @Mock
    private NotificationService notificationService;
    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private MockHospitalIntegrationService hospitalService;

    private Patient testPatient;
    private Hospital testHospital;
    private Department testDept;
    private HospitalDepartment testHd;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(hospitalService, "defaultOpdStartTime", "08:00");
        ReflectionTestUtils.setField(hospitalService, "defaultOpdEndTime", "23:59");
        ReflectionTestUtils.setField(hospitalService, "defaultSlotDurationMinutes", 15);

        testPatient = Patient.builder()
                .id(1L)
                .mobileNumber("9876543210")
                .fullName("Test Patient")
                .gender("Male")
                .isVerified(true)
                .build();

        testHospital = Hospital.builder()
                .id(1L)
                .name("Government General Hospital")
                .code("GGH01")
                .type("General")
                .address("Chennai")
                .district("Chennai")
                .state("Tamil Nadu")
                .contactNumber("044-25305000")
                .isActive(true)
                .build();

        testDept = Department.builder()
                .id(1L)
                .name("General Medicine")
                .code("GM")
                .isActive(true)
                .build();

        testHd = HospitalDepartment.builder()
                .id(1L)
                .hospital(testHospital)
                .department(testDept)
                .dailyTokenLimit(50)
                .opdStartTime("08:00")
                .opdEndTime("23:59")
                .slotDurationMinutes(15)
                .isActive(true)
                .build();
    }

    @Test
    @DisplayName("Successfully book OPD token when valid request and capacity available")
    void testBookTokenSuccess() {
        when(patientRepository.findByMobileNumber("9876543210")).thenReturn(Optional.of(testPatient));
        when(tokenRepository.findByPatientIdAndBookingDateAndStatusIn(anyLong(), any(LocalDate.class), anyList()))
                .thenReturn(Collections.emptyList());
        when(hospitalRepository.findById(1L)).thenReturn(Optional.of(testHospital));
        when(departmentRepository.findById(1L)).thenReturn(Optional.of(testDept));
        when(hospitalDepartmentRepository.findByHospitalIdAndDepartmentId(1L, 1L)).thenReturn(Optional.of(testHd));

        TokenCounter counter = TokenCounter.builder()
                .hospital(testHospital)
                .department(testDept)
                .counterDate(LocalDate.now())
                .currentNumber(0)
                .build();
        when(tokenCounterRepository.findWithLock(anyLong(), anyLong(), any(LocalDate.class))).thenReturn(Optional.of(counter));

        when(tokenRepository.save(any(Token.class))).thenAnswer(i -> {
            Token t = i.getArgument(0);
            t.setId(101L);
            return t;
        });

        TokenBookingRequest request = TokenBookingRequest.builder()
                .patientMobile("9876543210")
                .hospitalId(1L)
                .departmentId(1L)
                .bookingDate(LocalDate.now())
                .build();

        TokenDto dto = hospitalService.bookToken(request);

        assertNotNull(dto);
        assertEquals("A001", dto.getTokenNumber());
        assertEquals("General Medicine", dto.getDepartmentName());
        assertEquals(TokenStatus.BOOKED, dto.getStatus());
        verify(notificationService, times(1)).sendTokenBookingSms(any(Token.class));
    }

    @Test
    @DisplayName("Reject booking if patient already has an active token for today")
    void testDuplicateBookingRejection() {
        Token existingToken = Token.builder()
                .id(99L)
                .tokenNumber("A005")
                .patient(testPatient)
                .hospital(testHospital)
                .department(testDept)
                .bookingDate(LocalDate.now())
                .bookingTime(LocalTime.of(8, 30))
                .estimatedTime(LocalTime.of(9, 0))
                .status(TokenStatus.BOOKED)
                .build();

        when(patientRepository.findByMobileNumber("9876543210")).thenReturn(Optional.of(testPatient));
        when(tokenRepository.findByPatientIdAndBookingDateAndStatusIn(anyLong(), any(LocalDate.class), anyList()))
                .thenReturn(List.of(existingToken));

        TokenBookingRequest request = TokenBookingRequest.builder()
                .patientMobile("9876543210")
                .hospitalId(1L)
                .departmentId(1L)
                .bookingDate(LocalDate.now())
                .build();

        assertThrows(DuplicateBookingException.class, () -> hospitalService.bookToken(request));
    }

    @Test
    @DisplayName("Reject booking if department daily capacity reached")
    void testTokenCapacityReached() {
        when(patientRepository.findByMobileNumber("9876543210")).thenReturn(Optional.of(testPatient));
        when(tokenRepository.findByPatientIdAndBookingDateAndStatusIn(anyLong(), any(LocalDate.class), anyList()))
                .thenReturn(Collections.emptyList());
        when(hospitalRepository.findById(1L)).thenReturn(Optional.of(testHospital));
        when(departmentRepository.findById(1L)).thenReturn(Optional.of(testDept));
        when(hospitalDepartmentRepository.findByHospitalIdAndDepartmentId(1L, 1L)).thenReturn(Optional.of(testHd));

        TokenCounter fullCounter = TokenCounter.builder()
                .hospital(testHospital)
                .department(testDept)
                .counterDate(LocalDate.now())
                .currentNumber(50) // limit is 50
                .build();
        when(tokenCounterRepository.findWithLock(anyLong(), anyLong(), any(LocalDate.class))).thenReturn(Optional.of(fullCounter));

        TokenBookingRequest request = TokenBookingRequest.builder()
                .patientMobile("9876543210")
                .hospitalId(1L)
                .departmentId(1L)
                .bookingDate(LocalDate.now())
                .build();

        assertThrows(TokenUnavailableException.class, () -> hospitalService.bookToken(request));
    }

    @Test
    @DisplayName("Cancel token should mark status CANCELLED and send SMS")
    void testCancelToken() {
        Token token = Token.builder()
                .id(101L)
                .tokenNumber("A001")
                .patient(testPatient)
                .hospital(testHospital)
                .department(testDept)
                .bookingDate(LocalDate.now())
                .bookingTime(LocalTime.of(8, 0))
                .estimatedTime(LocalTime.of(8, 0))
                .status(TokenStatus.BOOKED)
                .build();

        when(tokenRepository.findById(101L)).thenReturn(Optional.of(token));
        when(tokenRepository.save(any(Token.class))).thenAnswer(i -> i.getArgument(0));

        TokenDto cancelled = hospitalService.cancelToken(101L, new CancelTokenRequest());

        assertEquals(TokenStatus.CANCELLED, cancelled.getStatus());
        verify(notificationService, times(1)).sendCancellationSms(any(Token.class));
    }
}
