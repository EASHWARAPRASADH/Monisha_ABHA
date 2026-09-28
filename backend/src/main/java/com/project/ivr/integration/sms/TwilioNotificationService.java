package com.project.ivr.integration.sms;

import com.project.ivr.entity.SmsLog;
import com.project.ivr.entity.SmsStatus;
import com.project.ivr.entity.Token;
import com.project.ivr.repository.SmsLogRepository;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;

@Service("twilioNotificationService")
@RequiredArgsConstructor
public class TwilioNotificationService implements NotificationService {

    private static final Logger log = LoggerFactory.getLogger(TwilioNotificationService.class);

    private final SmsLogRepository smsLogRepository;
    private final MockNotificationService mockNotificationService;

    @Value("${app.twilio.account-sid}")
    private String accountSid;

    @Value("${app.twilio.auth-token}")
    private String authToken;

    @Value("${app.twilio.phone-number}")
    private String fromNumber;

    @Value("${app.sms-provider:mock}")
    private String configuredProvider;

    @Override
    public SmsLog sendTokenBookingSms(Token token) {
        if (!"twilio".equalsIgnoreCase(configuredProvider) || accountSid.startsWith("ACmock")) {
            return mockNotificationService.sendTokenBookingSms(token);
        }

        try {
            Twilio.init(accountSid, authToken);
            String text = String.format(
                    "Government Hospital OPD Token\n\nPatient: %s\nHospital: %s\nDepartment: %s\nToken: %s\nDate: %s\nTime: %s",
                    token.getPatient().getFullName(),
                    token.getHospital().getName(),
                    token.getDepartment().getName(),
                    token.getTokenNumber(),
                    token.getBookingDate().format(DateTimeFormatter.ofPattern("dd-MM-yyyy")),
                    token.getEstimatedTime().format(DateTimeFormatter.ofPattern("hh:mm a"))
            );

            Message message = Message.creator(
                    new PhoneNumber(token.getPatient().getMobileNumber()),
                    new PhoneNumber(fromNumber),
                    text
            ).create();

            SmsLog smsLog = SmsLog.builder()
                    .recipientPhone(token.getPatient().getMobileNumber())
                    .messageText(text)
                    .status(SmsStatus.SENT)
                    .provider("twilio")
                    .externalMessageId(message.getSid())
                    .build();

            return smsLogRepository.save(smsLog);
        } catch (Exception ex) {
            log.error("Twilio SMS dispatch failed, falling back to mock: {}", ex.getMessage());
            return mockNotificationService.sendTokenBookingSms(token);
        }
    }

    @Override
    public SmsLog sendCancellationSms(Token token) {
        return mockNotificationService.sendCancellationSms(token);
    }

    @Override
    public SmsLog sendRescheduleSms(Token oldToken, Token newToken) {
        return mockNotificationService.sendRescheduleSms(oldToken, newToken);
    }

    @Override
    public SmsLog sendCustomSms(String recipientPhone, String messageText) {
        return mockNotificationService.sendCustomSms(recipientPhone, messageText);
    }
}
