package com.banquito.core.service;

import com.banquito.core.model.AccountTransaction;
import java.math.BigDecimal;

public interface ITransactionService {

    void debitar(String accountNumber, BigDecimal amount, String uuid, String subtypeCode);

    void acreditar(String accountNumber, BigDecimal amount, String uuid, String subtypeCode);

    void transferir(String originAccount, String destinationAccount, BigDecimal amount, String uuid);
}