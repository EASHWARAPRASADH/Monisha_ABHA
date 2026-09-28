package com.project.ivr.exception;

import org.springframework.http.HttpStatus;

public class TokenUnavailableException extends ApiException {
    public TokenUnavailableException(String message) {
        super(message, "TOKEN_UNAVAILABLE", HttpStatus.BAD_REQUEST);
    }
}
