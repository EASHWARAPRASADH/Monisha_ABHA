package com.project.ivr.integration.sms;

import com.project.ivr.entity.*;
import com.project.ivr.repository.NotificationRepository;
import com.project.ivr.repository.SmsLogRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service("mockNotificationService")
@Primary
@RequiredArgsConstructor
public class MockNotificationService implements NotificationService {

    private static final Logger log = LoggerFactory.getLogger(MockNotificationService.class);

    private final SmsLogRepository smsLogRepository;
    private final NotificationRepository notificationRepository;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd-MM-yyyy");
    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("hh:mm a");

    @Override
    @Transactional
    public SmsLog sendTokenBookingSms(Token token) {
        String dateStr = token.getBookingDate().format(DATE_FMT);
        String timeStr = token.getEstimatedTime().format(TIME_FMT);

        String text = String.format(
                "Government Hospital OPD Token\n\n" +
                "Patient: %s\n" +
                "Hospital: %s\n" +
                "Department: %s\n" +
                "Token: %s\n" +
                "Date: %s\n" +
                "Time: %s\n\n" +
                "Please reach 15 minutes before your estimated time. Keep this SMS for OPD verification.",
                token.getPatient().getFullName(),
                token.getHospital().getName(),
                token.getDepartment().getName(),
                token.getTokenNumber(),
                dateStr,
                timeStr
        );

        return recordSms(token.getPatient().getMobileNumber(), text, token.getPatient());
    }

    @Override
    @Transactional
    public SmsLog sendCancellationSms(Token token) {
        String text = String.format(
                "Government Hospital OPD Token\n\n" +
                "Dear %s, your OPD token %s for %s (%s) on %s has been CANCELLED as requested.\n" +
                "Call our IVR service again anytime to book a new appointment.",
                token.getPatient().getFullName(),
                token.getTokenNumber(),
                token.getDepartment().getName(),
                token.getHospital().getName(),
                token.getBookingDate().format(DATE_FMT)
        );

        return recordSms(token.getPatient().getMobileNumber(), text, token.getPatient());
    }

    @Override
    @Transactional
    public SmsLog sendRescheduleSms(Token oldToken, Token newToken) {
        String dateStr = newToken.getBookingDate().format(DATE_FMT);
        String timeStr = newToken.getEstimatedTime().format(TIME_FMT);

        String text = String.format(
                "Government Hospital OPD Token - RESCHEDULED\n\n" +
                "Patient: %s\n" +
                "Previous Token %s has been updated.\n" +
                "Hospital: %s\n" +
                "Department: %s\n" +
                "New Token: %s\n" +
                "Date: %s\n" +
                "Time: %s",
                newToken.getPatient().getFullName(),
                oldToken.getTokenNumber(),
                newToken.getHospital().getName(),
                newToken.getDepartment().getName(),
                newToken.getTokenNumber(),
                dateStr,
                timeStr
        );

        return recordSms(newToken.getPatient().getMobileNumber(), text, newToken.getPatient());
    }

    @Override
    @Transactional
    public SmsLog sendCustomSms(String recipientPhone, String messageText) {
        return recordSms(recipientPhone, messageText, null);
    }

    private SmsLog recordSms(String phone, String text, Patient patient) {
        String mockMsgId = "MOCK_SMS_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        SmsLog smsLog = SmsLog.builder()
                .recipientPhone(phone)
                .messageText(text)
                .status(SmsStatus.DELIVERED)
                .provider("mock")
                .externalMessageId(mockMsgId)
                .build();

        smsLog = smsLogRepository.save(smsLog);

        if (patient != null) {
            notificationRepository.save(Notification.builder()
                    .patient(patient)
                    .channel("SMS")
                    .message(text)
                    .status("DELIVERED")
                    .build());
        }

        log.info("[MOCK SMS DISPATCHED] To: {} | MsgId: {}\n{}", phone, mockMsgId, text);
        return smsLog;
    }
}
