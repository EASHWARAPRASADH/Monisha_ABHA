package com.project.ivr.integration.sms;

import com.project.ivr.entity.SmsLog;
import com.project.ivr.entity.Token;

public interface NotificationService {
    SmsLog sendTokenBookingSms(Token token);
    SmsLog sendCancellationSms(Token token);
    SmsLog sendRescheduleSms(Token oldToken, Token newToken);
    SmsLog sendCustomSms(String recipientPhone, String messageText);
}
