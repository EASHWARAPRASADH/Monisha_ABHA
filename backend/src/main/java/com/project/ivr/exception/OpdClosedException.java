package com.project.ivr.exception;

import org.springframework.http.HttpStatus;

public class OpdClosedException extends ApiException {
    public OpdClosedException(String message) {
        super(message, "OPD_CLOSED", HttpStatus.BAD_REQUEST);
    }
}
