package ec.edu.espe.banquito.core.service;

import ec.edu.espe.banquito.core.enums.MovementTypeEnum;
import ec.edu.espe.banquito.core.exception.CuentaInactivaException;
import ec.edu.espe.banquito.core.exception.CuentaNoEncontradaException;
import ec.edu.espe.banquito.core.exception.SaldoInsuficienteException;
import ec.edu.espe.banquito.core.exception.TransaccionDuplicadaException;
import ec.edu.espe.banquito.core.model.Account;
import ec.edu.espe.banquito.core.model.AccountTransaction;
import ec.edu.espe.banquito.core.repository.AccountRepository;
import ec.edu.espe.banquito.core.repository.AccountTransactionRepository;
import ec.edu.espe.banquito.core.repository.TransactionSubtypeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository accountRepository;
    private final AccountTransactionRepository transactionRepository;
    private final TransactionSubtypeRepository transactionSubtypeRepository;

    @Transactional(readOnly = true)
    public Account findByAccountNumber(String accountNumber) {
        return accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new CuentaNoEncontradaException(accountNumber));
    }

    @Transactional
    public Account create(Account account) {
        log.info("Creando cuenta: {}", account.getAccountNumber());
        return accountRepository.save(account);
    }

    @Transactional
    public void debitar(String accountNumber, BigDecimal amount) {
        Account account = findByAccountNumber(accountNumber);

        if (!"ACTIVO".equals(account.getStatus())) {
            throw new CuentaInactivaException(accountNumber);
        }
        if (account.getAvailableBalance().compareTo(amount) < 0) {
            throw new SaldoInsuficienteException(accountNumber);
        }

        account.setAvailableBalance(account.getAvailableBalance().subtract(amount));
        account.setAccountingBalance(account.getAccountingBalance().subtract(amount));
        account.setLastUpdate(LocalDateTime.now());
        accountRepository.save(account);

        registrarTransaccion(account, amount, MovementTypeEnum.DEBITO, account.getAvailableBalance(), UUID.randomUUID().toString());
        log.info("Débito de {} en cuenta {}", amount, accountNumber);
    }

    @Transactional
    public void acreditar(String accountNumber, BigDecimal amount) {
        Account account = findByAccountNumber(accountNumber);

        if (!"ACTIVO".equals(account.getStatus())) {
            throw new CuentaInactivaException(accountNumber);
        }

        account.setAvailableBalance(account.getAvailableBalance().add(amount));
        account.setAccountingBalance(account.getAccountingBalance().add(amount));
        account.setLastUpdate(LocalDateTime.now());
        accountRepository.save(account);

        registrarTransaccion(account, amount, MovementTypeEnum.CREDITO, account.getAvailableBalance(), UUID.randomUUID().toString());
        log.info("Crédito de {} en cuenta {}", amount, accountNumber);
    }

    @Transactional
    public void transferir(String origin, String destination, BigDecimal amount, String uuid) {
        LocalDateTime startOfDay = LocalDateTime.now().toLocalDate().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);

        if (transactionRepository.existsByTransactionUuidAndTransactionDateBetween(uuid, startOfDay, endOfDay)) {
            throw new TransaccionDuplicadaException(uuid);
        }

        Account accountOrigin = findByAccountNumber(origin);
        Account accountDestination = findByAccountNumber(destination);

        if (!"ACTIVO".equals(accountOrigin.getStatus())) {
            throw new CuentaInactivaException(origin);
        }
        if (!"ACTIVO".equals(accountDestination.getStatus())) {
            throw new CuentaInactivaException(destination);
        }
        if (accountOrigin.getAvailableBalance().compareTo(amount) < 0) {
            throw new SaldoInsuficienteException(origin);
        }

        accountOrigin.setAvailableBalance(accountOrigin.getAvailableBalance().subtract(amount));
        accountOrigin.setAccountingBalance(accountOrigin.getAccountingBalance().subtract(amount));
        accountOrigin.setLastUpdate(LocalDateTime.now());
        accountRepository.save(accountOrigin);

        accountDestination.setAvailableBalance(accountDestination.getAvailableBalance().add(amount));
        accountDestination.setAccountingBalance(accountDestination.getAccountingBalance().add(amount));
        accountDestination.setLastUpdate(LocalDateTime.now());
        accountRepository.save(accountDestination);

        registrarTransaccion(accountOrigin, amount, MovementTypeEnum.DEBITO, accountOrigin.getAvailableBalance(), uuid);
        registrarTransaccion(accountDestination, amount, MovementTypeEnum.CREDITO, accountDestination.getAvailableBalance(), uuid + "-DEST");

        log.info("Transferencia de {} de {} a {}", amount, origin, destination);
    }

    private void registrarTransaccion(Account account, BigDecimal amount, MovementTypeEnum type,
                                      BigDecimal resultingBalance, String uuid) {
        AccountTransaction transaction = new AccountTransaction();
        transaction.setAccount(account);
        transaction.setMovementType(type);
        transaction.setAmount(amount);
        transaction.setResultingBalance(resultingBalance);
        transaction.setTransactionUuid(uuid);
        transaction.setStatus("COMPLETADA");
        transaction.setTransactionSubtype(transactionSubtypeRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new RuntimeException("No hay subtipos de transacción configurados")));
        transactionRepository.save(transaction);
    }
}
