package com.project.ivr.exception;

import org.springframework.http.HttpStatus;

public class DuplicateBookingException extends ApiException {
    public DuplicateBookingException(String message) {
        super(message, "DUPLICATE_BOOKING", HttpStatus.CONFLICT);
    }
}
