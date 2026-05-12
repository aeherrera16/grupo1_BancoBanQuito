package com.banquito.core.service;

import com.banquito.core.dto.TransactionResponseDTO;
import java.math.BigDecimal;

public interface ITransactionService {

    TransactionResponseDTO debitar(String accountNumber, BigDecimal amount, String uuid, String subtypeCode, String description);

    TransactionResponseDTO acreditar(String accountNumber, BigDecimal amount, String uuid, String subtypeCode, String description);

    TransactionResponseDTO transferir(String originAccount, String destinationAccount, BigDecimal amount,
                                      String uuid, String subtypeCode, String description);
}
