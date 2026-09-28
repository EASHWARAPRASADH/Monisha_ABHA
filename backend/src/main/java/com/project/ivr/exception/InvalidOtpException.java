package com.project.ivr.exception;

import org.springframework.http.HttpStatus;

public class InvalidOtpException extends ApiException {
    public InvalidOtpException(String message) {
        super(message, "INVALID_OTP", HttpStatus.BAD_REQUEST);
    }
}
