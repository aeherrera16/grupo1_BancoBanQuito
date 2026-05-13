package com.banquito.core.service.impl;

import com.banquito.core.dto.AccountRequestDTO;
import com.banquito.core.dto.AccountResponseDTO;
import com.banquito.core.dto.BalanceDTO;
import com.banquito.core.dto.TransactionResponseDTO;
import com.banquito.core.enums.AccountStatusEnum;
import com.banquito.core.enums.MovementTypeEnum;
import com.banquito.core.enums.TransactionStatusEnum;
import com.banquito.core.exception.AccountNotFoundException;
import com.banquito.core.exception.DuplicateTransactionException;
import com.banquito.core.exception.InactiveAccountException;
import com.banquito.core.exception.InsufficientBalanceException;
import com.banquito.core.model.*;
import com.banquito.core.repository.*;
import com.banquito.core.service.IAccountService;
import com.banquito.core.service.IAuthenticationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AccountService implements IAccountService {

    private final AccountRepository accountRepository;
    private final CustomerRepository customerRepository;
    private final BranchRepository branchRepository;
    private final AccountSubtypeRepository accountSubtypeRepository;
    private final AccountTransactionRepository transactionRepository;
    private final TransactionSubtypeRepository transactionSubtypeRepository;
    private final NotificationRepository notificationRepository;
    private final IAuthenticationService authenticationService;

    @Transactional(readOnly = true)
    @Override
    public AccountResponseDTO findByAccountNumber(String accountNumber, Integer coreUserId) {
        authenticationService.validateActiveCoreUser(coreUserId);
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new AccountNotFoundException(accountNumber));
        return toResponse(account);
    }

    @Transactional(readOnly = true)
    @Override
    public List<AccountResponseDTO> findByCustomerId(Integer customerId, Integer coreUserId) {
        authenticationService.validateActiveCoreUser(coreUserId);
        return accountRepository.findByCustomer_Id(customerId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    @Override
    public AccountResponseDTO create(AccountRequestDTO request, Integer coreUserId) {
        authenticationService.validateActiveCoreUser(coreUserId);

        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado: " + request.getCustomerId()));
        Branch branch = branchRepository.findById(request.getBranchId())
                .orElseThrow(() -> new RuntimeException("Sucursal no encontrada: " + request.getBranchId()));
        AccountSubtype subtype = accountSubtypeRepository.findById(request.getAccountSubtypeId())
                .orElseThrow(() -> new RuntimeException("Subtipo no encontrado: " + request.getAccountSubtypeId()));

        BigDecimal initialBalance = request.getInitialBalance() != null ? request.getInitialBalance() : BigDecimal.ZERO;
        if (initialBalance.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("El saldo inicial no puede ser negativo");
        }

        LocalDateTime now = LocalDateTime.now();
        Account account = new Account();
        // RF-02: Generación automática por sucursal secuencial
        account.setAccountNumber(resolveAccountNumber(null, branch));
        account.setCustomer(customer);
        account.setBranch(branch);
        account.setAccountSubtype(subtype);
        account.setStatus(AccountStatusEnum.ACTIVO);
        account.setAccountingBalance(initialBalance);
        account.setAvailableBalance(initialBalance);
        account.setIsFavorite(Boolean.TRUE.equals(request.getIsFavorite()));
        account.setOpeningDate(now);
        account.setLastUpdate(now);

        log.info("CoreUser {} crea cuenta {}", coreUserId, account.getAccountNumber());
        return toResponse(accountRepository.save(account));
    }

    @Transactional
    @Override
    public AccountResponseDTO inactivate(String accountNumber, Integer coreUserId) {
        return changeStatus(accountNumber, AccountStatusEnum.INACTIVO, coreUserId);
    }

    @Transactional
    @Override
    public AccountResponseDTO block(String accountNumber, Integer coreUserId) {
        return changeStatus(accountNumber, AccountStatusEnum.BLOQUEADO, coreUserId);
    }

    @Transactional
    @Override
    public AccountResponseDTO suspend(String accountNumber, Integer coreUserId) {
        return changeStatus(accountNumber, AccountStatusEnum.SUSPENDIDO, coreUserId);
    }

    private AccountResponseDTO changeStatus(String accountNumber, AccountStatusEnum status, Integer coreUserId) {
        authenticationService.validateActiveCoreUser(coreUserId);
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new AccountNotFoundException(accountNumber));
        account.setStatus(status);
        account.setLastUpdate(LocalDateTime.now());
        log.info("CoreUser {} cambia cuenta {} a {}", coreUserId, accountNumber, status);
        return toResponse(accountRepository.save(account));
    }

    @Transactional(readOnly = true)
    @Override
    public BalanceDTO getBalance(String accountNumber) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new AccountNotFoundException(accountNumber));
        return new BalanceDTO(
                account.getAccountNumber(),
                account.getAccountingBalance(),
                account.getAvailableBalance(),
                account.getStatus()
        );
    }

    @Transactional(readOnly = true)
    @Override
    public List<TransactionResponseDTO> getTransactions(String accountNumber, Integer limit) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new AccountNotFoundException(accountNumber));
        return transactionRepository.findTop10ByAccount_IdOrderByTransactionDateDesc(account.getId())
                .stream()
                .map(tx -> toTransactionResponse(tx, accountNumber, tx.getTransactionSubtype().getName()))
                .collect(Collectors.toList());
    }

    @Transactional
    @Override
    public TransactionResponseDTO debit(String accountNumber, BigDecimal amount) {
        validateAmount(amount);
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new AccountNotFoundException(accountNumber));

        if (account.getStatus() != AccountStatusEnum.ACTIVO) {
            throw new InactiveAccountException(accountNumber);
        }
        if (account.getAvailableBalance().compareTo(amount) < 0) {
            throw new InsufficientBalanceException(accountNumber);
        }

        account.setAvailableBalance(account.getAvailableBalance().subtract(amount));
        account.setAccountingBalance(account.getAccountingBalance().subtract(amount));
        account.setLastUpdate(LocalDateTime.now());
        accountRepository.save(account);

        String uuid = generateTransactionUuid();
        AccountTransaction transaction = registerTransaction(account, amount, MovementTypeEnum.DEBITO, account.getAvailableBalance(), uuid, "RETIRO_ATM");
        
        createNotification(account.getCustomer(), "Retiro realizado", 
            "Se ha realizado un débito de $" + amount + " de tu cuenta.", 
            "Referencia: " + uuid, "DEBITO");

        return toTransactionResponse(transaction, accountNumber, "Debito realizado exitosamente");
    }

    @Transactional
    @Override
    public TransactionResponseDTO credit(String accountNumber, BigDecimal amount) {
        validateAmount(amount);
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new AccountNotFoundException(accountNumber));

        if (account.getStatus() == AccountStatusEnum.SUSPENDIDO) {
            throw new InactiveAccountException(accountNumber);
        }

        account.setAvailableBalance(account.getAvailableBalance().add(amount));
        account.setAccountingBalance(account.getAccountingBalance().add(amount));
        account.setLastUpdate(LocalDateTime.now());
        accountRepository.save(account);

        String uuid = generateTransactionUuid();
        AccountTransaction transaction = registerTransaction(account, amount, MovementTypeEnum.CREDITO, account.getAvailableBalance(), uuid, "DEPOSITO");
        
        createNotification(account.getCustomer(), "Depósito recibido", 
            "Has recibido un crédito de $" + amount + " en tu cuenta.", 
            "Referencia: " + uuid, "CREDITO");

        return toTransactionResponse(transaction, accountNumber, "Credito realizado exitosamente");
    }

    @Transactional
    @Override
    public TransactionResponseDTO transfer(String origin, String destination, BigDecimal amount, String uuid) {
        validateAmount(amount);
        if (origin == null || origin.isBlank() || destination == null || destination.isBlank()) {
            throw new IllegalArgumentException("Las cuentas origen y destino son obligatorias");
        }
        if (origin.equals(destination)) {
            throw new IllegalArgumentException("La cuenta origen y destino no pueden ser iguales");
        }

        Account originAccount = accountRepository.findByAccountNumber(origin)
                .orElseThrow(() -> new AccountNotFoundException(origin));
        Account destinationAccount = accountRepository.findByAccountNumber(destination)
                .orElseThrow(() -> new AccountNotFoundException(destination));

        validateIdempotency(uuid);

        if (originAccount.getStatus() != AccountStatusEnum.ACTIVO) {
            throw new InactiveAccountException(origin);
        }
        if (destinationAccount.getStatus() == AccountStatusEnum.SUSPENDIDO) {
            throw new InactiveAccountException(destination);
        }
        if (originAccount.getAvailableBalance().compareTo(amount) < 0) {
            throw new InsufficientBalanceException(origin);
        }

        originAccount.setAvailableBalance(originAccount.getAvailableBalance().subtract(amount));
        originAccount.setAccountingBalance(originAccount.getAccountingBalance().subtract(amount));
        originAccount.setLastUpdate(LocalDateTime.now());
        accountRepository.save(originAccount);

        destinationAccount.setAvailableBalance(destinationAccount.getAvailableBalance().add(amount));
        destinationAccount.setAccountingBalance(destinationAccount.getAccountingBalance().add(amount));
        destinationAccount.setLastUpdate(LocalDateTime.now());
        accountRepository.save(destinationAccount);

        AccountTransaction originTransaction = registerTransaction(originAccount, amount, MovementTypeEnum.DEBITO, originAccount.getAvailableBalance(), uuid, "TRANSFER");
        registerTransaction(destinationAccount, amount, MovementTypeEnum.CREDITO, destinationAccount.getAvailableBalance(), uuid, "TRANSFER");

        createNotification(originAccount.getCustomer(), "Transferencia Enviada", 
            "Has enviado $" + amount + " a " + resolveCustomerName(destinationAccount.getCustomer()) + ".", 
            "Cuenta destino: " + destination + ". Ref: " + uuid, "DEBITO");
        
        createNotification(destinationAccount.getCustomer(), "Transferencia Recibida", 
            "Has recibido $" + amount + " de " + resolveCustomerName(originAccount.getCustomer()) + ".", 
            "Cuenta origen: " + origin + ". Ref: " + uuid, "CREDITO");

        return toTransactionResponse(originTransaction, origin, "Transferencia realizada exitosamente");
    }

    @Transactional
    @Override
    public AccountResponseDTO setFavorite(String accountNumber) {
        Account accountToFavorite = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new AccountNotFoundException(accountNumber));

        accountRepository.findByIsFavoriteTrue().ifPresent(current -> {
            current.setIsFavorite(false);
            accountRepository.save(current);
        });

        accountToFavorite.setIsFavorite(true);
        return toResponse(accountRepository.save(accountToFavorite));
    }

    @Override
    public AccountResponseDTO getFavoriteAccount() {
        return accountRepository.findByIsFavoriteTrue().stream().findFirst().map(this::toResponse).orElse(null);
    }

    @Override
    public List<AccountSubtype> findAllSubtypes() {
        return accountSubtypeRepository.findAll();
    }

    private void createNotification(Customer customer, String title, String msg, String detail, String type) {
        if (customer == null) return;
        try {
            Notification n = new Notification();
            n.setUserId(customer.getId().toString());
            n.setTitle(title);
            n.setMessage(msg);
            n.setDetail(detail);
            n.setType(type);
            n.setIsUnread(true);
            n.setCreatedAt(LocalDateTime.now());
            notificationRepository.save(n);
        } catch (Exception e) {
            log.error("Error creating notification: {}", e.getMessage());
        }
    }

    private AccountTransaction registerTransaction(Account account, BigDecimal amount, MovementTypeEnum type,
                                                   BigDecimal resultingBalance, String uuid, String subtypeCode) {
        validateUuid(uuid);
        AccountTransaction transaction = new AccountTransaction();
        transaction.setAccount(account);
        transaction.setMovementType(type);
        transaction.setAmount(amount);
        transaction.setResultingBalance(resultingBalance);
        transaction.setTransactionUuid(uuid);
        transaction.setStatus(TransactionStatusEnum.COMPLETADA);
        transaction.setTransactionDate(LocalDateTime.now());
        transaction.setTransactionSubtype(transactionSubtypeRepository.findByCode(subtypeCode)
                .orElseThrow(() -> new RuntimeException("Subtipo de transaccion no configurado: " + subtypeCode)));
        return transactionRepository.save(transaction);
    }

    private void validateIdempotency(String uuid) {
        if (transactionRepository.existsByTransactionUuid(uuid)) {
            throw new DuplicateTransactionException("Transaccion ya procesada: " + uuid);
        }
    }

    private void validateAmount(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("El monto debe ser mayor a cero");
        }
    }

    private void validateUuid(String uuid) {
        if (uuid == null || uuid.isBlank()) {
            throw new IllegalArgumentException("El UUID de transaccion es obligatorio");
        }
    }

    private String generateTransactionUuid() {
        return UUID.randomUUID().toString().replace("-", "");
    }

    private String resolveAccountNumber(String requestedNumber, Branch branch) {
        if (requestedNumber != null && !requestedNumber.isBlank()) {
            return requestedNumber;
        }
        long count = accountRepository.countByBranch_Id(branch.getId());
        return branch.getBranchCode() + "-" + (100000 + count + 1);
    }

    private String resolveCustomerName(Customer customer) {
        if (customer.getLegalName() != null && !customer.getLegalName().isBlank()) {
            return customer.getLegalName();
        }
        return ((customer.getFirstName() != null ? customer.getFirstName() : "") + " " +
                (customer.getLastName() != null ? customer.getLastName() : "")).trim();
    }

    private AccountResponseDTO toResponse(Account account) {
        AccountResponseDTO dto = new AccountResponseDTO();
        dto.setId(account.getId());
        dto.setAccountNumber(account.getAccountNumber());
        dto.setCustomerFullName(resolveCustomerName(account.getCustomer()));
        dto.setBranchName(account.getBranch().getName());
        dto.setAccountSubtypeDescription(account.getAccountSubtype().getName());
        dto.setStatus(account.getStatus());
        dto.setAccountingBalance(account.getAccountingBalance());
        dto.setAvailableBalance(account.getAvailableBalance());
        dto.setIsFavorite(account.getIsFavorite());
        dto.setOpeningDate(account.getOpeningDate());
        return dto;
    }

    private TransactionResponseDTO toTransactionResponse(AccountTransaction tx, String accountNumber, String message) {
        TransactionResponseDTO dto = new TransactionResponseDTO();
        dto.setId(tx.getId());
        dto.setAccountNumber(accountNumber);
        dto.setAmount(tx.getAmount());
        dto.setMovementType(tx.getMovementType());
        dto.setResultingBalance(tx.getResultingBalance());
        dto.setTransactionUuid(tx.getTransactionUuid());
        dto.setTransactionDate(tx.getTransactionDate());
        dto.setStatus(tx.getStatus());
        dto.setMessage(message);
        return dto;
    }
}
