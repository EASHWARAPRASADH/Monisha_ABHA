package com.project.ivr.exception;

import org.springframework.http.HttpStatus;

public class OtpExhaustedException extends ApiException {
    public OtpExhaustedException(String message) {
        super(message, "OTP_EXHAUSTED", HttpStatus.TOO_MANY_REQUESTS);
    }
}
