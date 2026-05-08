package com.banquito.core.service.impl;

import com.banquito.core.enums.MovementTypeEnum;
import com.banquito.core.exception.*;
import com.banquito.core.model.Account;
import com.banquito.core.model.AccountTransaction;
import com.banquito.core.model.TransactionSubtype;
import com.banquito.core.repository.AccountRepository;
import com.banquito.core.repository.AccountTransactionRepository;
import com.banquito.core.repository.TransactionSubtypeRepository;
import com.banquito.core.service.ITransactionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class TransactionService implements ITransactionService {

    private final AccountRepository accountRepository;
    private final AccountTransactionRepository transactionRepository;
    private final TransactionSubtypeRepository subtypeRepository;

    @Override
    @Transactional
    public void debitar(String accountNumber, BigDecimal amount, String uuid, String subtypeCode) {
        validarIdempotencia(uuid);
        Account account = obtenerCuentaActiva(accountNumber);

        if (account.getAvailableBalance().compareTo(amount) < 0) {
            throw new SaldoInsuficienteException(accountNumber);
        }

        account.setAvailableBalance(account.getAvailableBalance().subtract(amount));
        account.setAccountingBalance(account.getAccountingBalance().subtract(amount));
        account.setLastUpdate(LocalDateTime.now());
        accountRepository.save(account);

        registrarMovimiento(account, amount, MovementTypeEnum.DEBITO, uuid, subtypeCode);
        log.info("Débito exitoso: Cuenta {}, Monto {}, UUID {}", accountNumber, amount, uuid);
    }

    @Override
    @Transactional
    public void acreditar(String accountNumber, BigDecimal amount, String uuid, String subtypeCode) {
        validarIdempotencia(uuid);
        Account account = obtenerCuentaActiva(accountNumber);

        account.setAvailableBalance(account.getAvailableBalance().add(amount));
        account.setAccountingBalance(account.getAccountingBalance().add(amount));
        account.setLastUpdate(LocalDateTime.now());
        accountRepository.save(account);

        registrarMovimiento(account, amount, MovementTypeEnum.CREDITO, uuid, subtypeCode);
        log.info("Crédito exitoso: Cuenta {}, Monto {}, UUID {}", accountNumber, amount, uuid);
    }

    @Override
    @Transactional
    public void transferir(String origin, String destination, BigDecimal amount, String uuid) {
        log.info("Iniciando transferencia de {} a {} por {}", origin, destination, amount);

        debitar(origin, amount, uuid, "TRANSFER");

        acreditar(destination, amount, uuid + "-DST", "TRANSFER");
    }

    private void validarIdempotencia(String uuid) {
        LocalDateTime start = LocalDateTime.now().toLocalDate().atStartOfDay();
        LocalDateTime end = start.plusDays(1);

        if (transactionRepository.existsByTransactionUuidAndTransactionDateBetween(uuid, start, end)) {
            throw new TransaccionDuplicadaException(uuid);
        }
    }

    private Account obtenerCuentaActiva(String accountNumber) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new CuentaNoEncontradaException(accountNumber));

        if (!"ACTIVA".equals(account.getStatus().toString())) {
            throw new CuentaInactivaException(accountNumber);
        }
        return account;
    }

    private void registrarMovimiento(Account account, BigDecimal amount, MovementTypeEnum type, String uuid, String subtypeCode) {
        TransactionSubtype subtype = subtypeRepository.findByCode(subtypeCode)
                .orElseThrow(() -> new RuntimeException("Subtipo de transacción no configurado: " + subtypeCode));

        AccountTransaction tx = new AccountTransaction();
        tx.setAccount(account);
        tx.setTransactionSubtype(subtype);
        tx.setTransactionUuid(uuid);
        tx.setMovementType(type);
        tx.setAmount(amount);
        tx.setResultingBalance(account.getAccountingBalance());
        tx.setStatus("COMPLETADA");
        tx.setTransactionDate(LocalDateTime.now());

        transactionRepository.save(tx);
    }
}