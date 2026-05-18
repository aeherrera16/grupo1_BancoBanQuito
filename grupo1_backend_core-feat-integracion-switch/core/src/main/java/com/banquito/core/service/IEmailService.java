package com.banquito.core.service;

public interface IEmailService {
    void sendStatusChangeEmail(String to, String accountNumber, String newStatus);
    void sendTransactionNotificationEmail(String to, String accountNumber, String movementType,
                                          java.math.BigDecimal amount, java.math.BigDecimal balance,
                                          String description);
}
