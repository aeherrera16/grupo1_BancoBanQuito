package com.banquito.core.exception;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(AccountNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleAccountNotFound(AccountNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(CustomerNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleCustomerNotFound(CustomerNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(InsufficientBalanceException.class)
    public ResponseEntity<Map<String, String>> handleInsufficientBalance(InsufficientBalanceException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(InactiveAccountException.class)
    public ResponseEntity<Map<String, String>> handleInactiveAccount(InactiveAccountException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(DuplicateTransactionException.class)
    public ResponseEntity<Map<String, String>> handleDuplicateTransaction(DuplicateTransactionException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(AutenticacionException.class)
    public ResponseEntity<Map<String, String>> handleAutenticacion(AutenticacionException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(SecurityException.class)
    public ResponseEntity<Map<String, String>> handleSecurity(SecurityException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> handleDataIntegrity(DataIntegrityViolationException ex) {
        String msg = ex.getMostSpecificCause().getMessage();
        if (msg != null && msg.contains("Duplicate entry")) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Ya existe un registro con esos datos"));
        }
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("error", "Conflicto de datos: " + msg));
    }
}
