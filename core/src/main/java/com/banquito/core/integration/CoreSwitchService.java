package com.banquito.core.integration;

import com.banquito.core.dto.BalanceDTO;
import com.banquito.core.dto.TransferResultDTO;

import java.math.BigDecimal;

public interface CoreSwitchService {

    BalanceDTO consultarSaldo(String accountNumber);

    boolean validarCuenta(String accountNumber);

    TransferResultDTO transferir(
            String originAccount,
            String destinationAccount,
            BigDecimal amount,
            String uuid
    );

    TransferResultDTO cobrarComision(
            String companyAccountNumber,
            BigDecimal totalAmount,
            String uuid
    );
}