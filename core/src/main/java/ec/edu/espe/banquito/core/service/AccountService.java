package ec.edu.espe.banquito.core.service;

import ec.edu.espe.banquito.core.dto.AccountRequestDTO;
import ec.edu.espe.banquito.core.dto.AccountResponseDTO;
import ec.edu.espe.banquito.core.dto.TransactionResponseDTO;
import ec.edu.espe.banquito.core.enums.AccountStatusEnum;
import ec.edu.espe.banquito.core.enums.MovementTypeEnum;
import ec.edu.espe.banquito.core.exception.CuentaInactivaException;
import ec.edu.espe.banquito.core.exception.CuentaNoEncontradaException;
import ec.edu.espe.banquito.core.exception.SaldoInsuficienteException;
import ec.edu.espe.banquito.core.exception.TransaccionDuplicadaException;
import ec.edu.espe.banquito.core.model.Account;
import ec.edu.espe.banquito.core.model.AccountSubtype;
import ec.edu.espe.banquito.core.model.AccountTransaction;
import ec.edu.espe.banquito.core.model.Branch;
import ec.edu.espe.banquito.core.model.Customer;
import ec.edu.espe.banquito.core.repository.AccountRepository;
import ec.edu.espe.banquito.core.repository.AccountSubtypeRepository;
import ec.edu.espe.banquito.core.repository.AccountTransactionRepository;
import ec.edu.espe.banquito.core.repository.BranchRepository;
import ec.edu.espe.banquito.core.repository.CustomerRepository;
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
public class AccountService implements IAccountService {

    private final AccountRepository accountRepository;
    private final AccountTransactionRepository transactionRepository;
    private final TransactionSubtypeRepository transactionSubtypeRepository;
    private final CustomerRepository customerRepository;
    private final BranchRepository branchRepository;
    private final AccountSubtypeRepository accountSubtypeRepository;

    @Transactional(readOnly = true)
    @Override
    public AccountResponseDTO findByAccountNumber(String accountNumber) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new CuentaNoEncontradaException(accountNumber));
        return toResponse(account);
    }

    @Transactional
    @Override
    public AccountResponseDTO create(AccountRequestDTO request) {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado: " + request.getCustomerId()));
        Branch branch = branchRepository.findById(request.getBranchId())
                .orElseThrow(() -> new RuntimeException("Sucursal no encontrada: " + request.getBranchId()));
        AccountSubtype subtype = accountSubtypeRepository.findById(request.getAccountSubtypeId())
                .orElseThrow(() -> new RuntimeException("Subtipo no encontrado: " + request.getAccountSubtypeId()));

        Account account = new Account();
        account.setAccountNumber(request.getAccountNumber());
        account.setCustomer(customer);
        account.setBranch(branch);
        account.setAccountSubtype(subtype);
        account.setStatus(AccountStatusEnum.ACTIVO);
        BigDecimal initial = request.getInitialBalance() != null ? request.getInitialBalance() : BigDecimal.ZERO;
        account.setAccountingBalance(initial);
        account.setAvailableBalance(initial);
        account.setIsFavorite(request.getIsFavorite() != null ? request.getIsFavorite() : false);
        account.setOpeningDate(LocalDateTime.now());

        log.info("Creando cuenta: {}", account.getAccountNumber());
        return toResponse(accountRepository.save(account));
    }

    @Transactional
    @Override
    public TransactionResponseDTO debitar(String accountNumber, BigDecimal amount) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new CuentaNoEncontradaException(accountNumber));

        if (account.getStatus() != AccountStatusEnum.ACTIVO) {
            throw new CuentaInactivaException(accountNumber);
        }
        if (account.getAvailableBalance().compareTo(amount) < 0) {
            throw new SaldoInsuficienteException(accountNumber);
        }

        account.setAvailableBalance(account.getAvailableBalance().subtract(amount));
        account.setAccountingBalance(account.getAccountingBalance().subtract(amount));
        account.setLastUpdate(LocalDateTime.now());
        accountRepository.save(account);

        String uuid = UUID.randomUUID().toString();
        AccountTransaction tx = registrarTransaccion(account, amount, MovementTypeEnum.DEBITO, account.getAvailableBalance(), uuid);
        log.info("Débito de {} en cuenta {}", amount, accountNumber);
        return toTransactionResponse(tx, accountNumber, "Débito realizado exitosamente");
    }

    @Transactional
    @Override
    public TransactionResponseDTO acreditar(String accountNumber, BigDecimal amount) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new CuentaNoEncontradaException(accountNumber));

        if (account.getStatus() != AccountStatusEnum.ACTIVO) {
            throw new CuentaInactivaException(accountNumber);
        }

        account.setAvailableBalance(account.getAvailableBalance().add(amount));
        account.setAccountingBalance(account.getAccountingBalance().add(amount));
        account.setLastUpdate(LocalDateTime.now());
        accountRepository.save(account);

        String uuid = UUID.randomUUID().toString();
        AccountTransaction tx = registrarTransaccion(account, amount, MovementTypeEnum.CREDITO, account.getAvailableBalance(), uuid);
        log.info("Crédito de {} en cuenta {}", amount, accountNumber);
        return toTransactionResponse(tx, accountNumber, "Crédito realizado exitosamente");
    }

    @Transactional
    @Override
    public TransactionResponseDTO transferir(String origin, String destination, BigDecimal amount, String uuid) {
        LocalDateTime startOfDay = LocalDateTime.now().toLocalDate().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);

        if (transactionRepository.existsByTransactionUuidAndTransactionDateBetween(uuid, startOfDay, endOfDay)) {
            throw new TransaccionDuplicadaException(uuid);
        }

        Account accountOrigin = accountRepository.findByAccountNumber(origin)
                .orElseThrow(() -> new CuentaNoEncontradaException(origin));
        Account accountDestination = accountRepository.findByAccountNumber(destination)
                .orElseThrow(() -> new CuentaNoEncontradaException(destination));

        if (accountOrigin.getStatus() != AccountStatusEnum.ACTIVO) {
            throw new CuentaInactivaException(origin);
        }
        if (accountDestination.getStatus() != AccountStatusEnum.ACTIVO) {
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

        AccountTransaction txOrigen = registrarTransaccion(accountOrigin, amount, MovementTypeEnum.DEBITO, accountOrigin.getAvailableBalance(), uuid);
        registrarTransaccion(accountDestination, amount, MovementTypeEnum.CREDITO, accountDestination.getAvailableBalance(), uuid + "-DEST");

        log.info("Transferencia de {} de {} a {}", amount, origin, destination);
        return toTransactionResponse(txOrigen, origin, "Transferencia realizada exitosamente");
    }

    private AccountTransaction registrarTransaccion(Account account, BigDecimal amount, MovementTypeEnum type,
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
        return transactionRepository.save(transaction);
    }

    private AccountResponseDTO toResponse(Account account) {
        AccountResponseDTO dto = new AccountResponseDTO();
        dto.setId(account.getId());
        dto.setAccountNumber(account.getAccountNumber());
        dto.setCustomerFullName(account.getCustomer().getFirstName() + " " + account.getCustomer().getLastName());
        dto.setBranchName(account.getBranch().getName());
        dto.setAccountSubtypeDescription(account.getAccountSubtype().getDescription());
        dto.setStatus(account.getStatus());
        dto.setAccountingBalance(account.getAccountingBalance());
        dto.setAvailableBalance(account.getAvailableBalance());
        dto.setIsFavorite(account.getIsFavorite());
        dto.setOpeningDate(account.getOpeningDate());
        return dto;
    }

    private TransactionResponseDTO toTransactionResponse(AccountTransaction tx, String accountNumber, String message) {
        TransactionResponseDTO dto = new TransactionResponseDTO();
        dto.setId(Math.toIntExact(tx.getId()));
        dto.setAccountNumber(accountNumber);
        dto.setMovementType(tx.getMovementType());
        dto.setAmount(tx.getAmount());
        dto.setResultingBalance(tx.getResultingBalance());
        dto.setTransactionDate(tx.getTransactionDate());
        dto.setTransactionUuid(tx.getTransactionUuid());
        dto.setStatus(tx.getStatus());
        dto.setMessage(message);
        return dto;
    }
}
