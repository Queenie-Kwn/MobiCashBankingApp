package jcash.controller;

import jcash.dto.Dtos.ErrorResponse;
import jcash.service.BankingException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BankingException.class)
    public ResponseEntity<ErrorResponse> handle(BankingException e) {
        return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
    }
}
