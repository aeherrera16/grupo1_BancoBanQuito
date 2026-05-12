package com.banquito.core.integration;

import com.banquito.core.dto.BalanceDTO;
import com.banquito.core.dto.TransferResultDTO;

import java.math.BigDecimal;

public interface CoreSwitchService {

    BalanceDTO getBalance(String accountNumber);

    boolean validateAccount(String accountNumber);

    TransferResultDTO transfer(
            String originAccount,
            String destinationAccount,
            BigDecimal amount,
            String uuid
    );

    TransferResultDTO chargeCommission(
            String companyAccountNumber,
            BigDecimal totalAmount,
            String uuid
    );
}