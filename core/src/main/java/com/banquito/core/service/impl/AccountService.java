package com.banquito.core.service.impl;

import com.banquito.core.dto.AccountRequestDTO;
import com.banquito.core.dto.AccountResponseDTO;
import com.banquito.core.dto.BalanceDTO;
import com.banquito.core.dto.TransactionResponseDTO;
import com.banquito.core.enums.AccountStatusEnum;
import com.banquito.core.exception.AccountNotFoundException;
import com.banquito.core.exception.DuplicateTransactionException;
import com.banquito.core.exception.InactiveAccountException;
import com.banquito.core.exception.InsufficientBalanceException;
import com.banquito.core.model.Account;
import com.banquito.core.model.AccountSubtype;
import com.banquito.core.model.Branch;
import com.banquito.core.model.Customer;
import com.banquito.core.repository.AccountRepository;
import com.banquito.core.repository.AccountSubtypeRepository;
import com.banquito.core.repository.AccountTransactionRepository;
import com.banquito.core.repository.BranchRepository;
import com.banquito.core.repository.CustomerRepository;
import com.banquito.core.service.IAccountService;
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

    @Transactional(readOnly = true)
    @Override
    public List<AccountResponseDTO> findAll(Integer coreUserId) {
        return accountRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    @Override
    public AccountResponseDTO findByAccountNumber(String accountNumber, Integer coreUserId) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new AccountNotFoundException(accountNumber));
        return toResponse(account);
    }

    @Transactional(readOnly = true)
    @Override
    public List<AccountResponseDTO> findByCustomerId(Integer customerId, Integer coreUserId) {
        return accountRepository.findByCustomer_Id(customerId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    @Override
    public AccountResponseDTO create(AccountRequestDTO request, Integer coreUserId) {
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
        
        String accountNumber = resolveAccountNumber(request.getAccountNumber(), branch);
        account.setAccountNumber(accountNumber);
        
        account.setCustomer(customer);
        account.setBranch(branch);
        account.setAccountSubtype(subtype);
        account.setStatus(AccountStatusEnum.ACTIVO);
        account.setAccountingBalance(initialBalance);
        account.setAvailableBalance(initialBalance);
        account.setIsFavorite(Boolean.TRUE.equals(request.getIsFavorite()));
        account.setOpeningDate(now);
        account.setLastUpdate(now);

        return toResponse(accountRepository.save(account));
    }

    @Transactional
    @Override
    public AccountResponseDTO activate(String accountNumber, Integer coreUserId) {
        return changeStatus(accountNumber, AccountStatusEnum.ACTIVO, coreUserId);
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
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new AccountNotFoundException(accountNumber));
        account.setStatus(status);
        account.setLastUpdate(LocalDateTime.now());
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
                account.getStatus());
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

        String uuid = generateTransactionUuid();
        validateIdempotency(account, uuid);

        account.setAvailableBalance(account.getAvailableBalance().subtract(amount));
        account.setAccountingBalance(account.getAccountingBalance().subtract(amount));
        account.setLastUpdate(LocalDateTime.now());
        accountRepository.save(account);

        return new TransactionResponseDTO(
                null,
                accountNumber,
                com.banquito.core.enums.MovementTypeEnum.DEBITO,
                amount,
                account.getAccountingBalance(),
                LocalDateTime.now(),
                uuid,
                com.banquito.core.enums.TransactionStatusEnum.COMPLETADA,
                "Debito procesado"
        );
    }

    @Transactional
    @Override
    public TransactionResponseDTO credit(String accountNumber, BigDecimal amount) {
        validateAmount(amount);
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new AccountNotFoundException(accountNumber));

        if (account.getStatus() != AccountStatusEnum.ACTIVO) {
            throw new InactiveAccountException(accountNumber);
        }

        String uuid = generateTransactionUuid();
        validateIdempotency(account, uuid);

        account.setAvailableBalance(account.getAvailableBalance().add(amount));
        account.setAccountingBalance(account.getAccountingBalance().add(amount));
        account.setLastUpdate(LocalDateTime.now());
        accountRepository.save(account);

        return new TransactionResponseDTO(
                null,
                accountNumber,
                com.banquito.core.enums.MovementTypeEnum.CREDITO,
                amount,
                account.getAccountingBalance(),
                LocalDateTime.now(),
                uuid,
                com.banquito.core.enums.TransactionStatusEnum.COMPLETADA,
                "Credito procesado"
        );
    }

    @Transactional
    @Override
    public TransactionResponseDTO transfer(String originAccountNumber, String destinationAccountNumber, BigDecimal amount) {
        validateAmount(amount);
        if (originAccountNumber.equals(destinationAccountNumber)) {
            throw new IllegalArgumentException("Cuentas deben ser distintas");
        }

        Account origin = accountRepository.findByAccountNumber(originAccountNumber)
                .orElseThrow(() -> new AccountNotFoundException(originAccountNumber));
        Account dest = accountRepository.findByAccountNumber(destinationAccountNumber)
                .orElseThrow(() -> new AccountNotFoundException(destinationAccountNumber));

        if (origin.getStatus() != AccountStatusEnum.ACTIVO) {
            throw new InactiveAccountException(originAccountNumber);
        }
        if (dest.getStatus() != AccountStatusEnum.ACTIVO) {
            throw new InactiveAccountException(destinationAccountNumber);
        }
        if (origin.getAvailableBalance().compareTo(amount) < 0) {
            throw new InsufficientBalanceException(originAccountNumber);
        }

        String uuid = generateTransactionUuid();
        validateIdempotency(origin, uuid);

        origin.setAvailableBalance(origin.getAvailableBalance().subtract(amount));
        origin.setAccountingBalance(origin.getAccountingBalance().subtract(amount));
        origin.setLastUpdate(LocalDateTime.now());

        dest.setAvailableBalance(dest.getAvailableBalance().add(amount));
        dest.setAccountingBalance(dest.getAccountingBalance().add(amount));
        dest.setLastUpdate(LocalDateTime.now());

        accountRepository.save(origin);
        accountRepository.save(dest);

        return new TransactionResponseDTO(
                null,
                originAccountNumber,
                com.banquito.core.enums.MovementTypeEnum.DEBITO,
                amount,
                origin.getAccountingBalance(),
                LocalDateTime.now(),
                uuid,
                com.banquito.core.enums.TransactionStatusEnum.COMPLETADA,
                "Transferencia a " + destinationAccountNumber
        );
    }

    @Transactional(readOnly = true)
    @Override
    public List<com.banquito.core.model.AccountSubtype> findAllSubtypes() {
        return accountSubtypeRepository.findAll();
    }

    @Transactional(readOnly = true)
    @Override
    public List<TransactionResponseDTO> getTransactions(String accountNumber, Integer limit) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new AccountNotFoundException(accountNumber));
        return transactionRepository.findTop10ByAccount_IdOrderByTransactionDateDesc(account.getId())
                .stream()
                .map(t -> new TransactionResponseDTO(
                        t.getId(),
                        t.getAccount().getAccountNumber(),
                        t.getMovementType(),
                        t.getAmount(),
                        t.getResultingBalance(),
                        t.getTransactionDate(),
                        t.getTransactionUuid(),
                        t.getStatus(),
                        t.getDescription()
                ))
                .collect(Collectors.toList());
    }

    private void validateAmount(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("El monto debe ser mayor a cero");
        }
    }

    private void validateIdempotency(Account account, String uuid) {
        LocalDateTime startOfDay = LocalDateTime.now().toLocalDate().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);

        if (transactionRepository.existsByAccount_IdAndTransactionUuidAndTransactionDateBetween(
                account.getId(), uuid, startOfDay, endOfDay)) {
            throw new DuplicateTransactionException(uuid);
        }
    }

    private String resolveAccountNumber(String requestedAccountNumber, Branch branch) {
        if (requestedAccountNumber != null && !requestedAccountNumber.isBlank()) {
            if (!requestedAccountNumber.startsWith(branch.getBranchCode() + "-")) {
                throw new IllegalArgumentException("El numero de cuenta debe iniciar con el codigo de la sucursal");
            }
            return requestedAccountNumber;
        }
        return branch.getBranchCode() + "-"
                + UUID.randomUUID().toString().replace("-", "").substring(0, 9).toUpperCase();
    }

    @Transactional
    @Override
    public AccountResponseDTO setFavorite(String accountNumber) {
        Account accountToFavorite = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new AccountNotFoundException("Account not found: " + accountNumber));

        accountRepository.findByIsFavoriteTrue()
                .ifPresent(currentFavorite -> {
                    currentFavorite.setIsFavorite(false);
                    accountRepository.save(currentFavorite);
                });

        accountToFavorite.setIsFavorite(true);
        Account saved = accountRepository.save(accountToFavorite);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    @Override
    public AccountResponseDTO getFavoriteAccount() {
        Account account = accountRepository.findByIsFavoriteTrue()
                .orElseThrow(() -> new AccountNotFoundException("No existe cuenta favorita configurada"));
        return toResponse(account);
    }

    private String generateTransactionUuid() {
        return UUID.randomUUID().toString().replace("-", "");
    }

    private AccountResponseDTO toResponse(Account account) {
        String customerName = resolveCustomerName(account.getCustomer());
        return new AccountResponseDTO(
                account.getId(),
                account.getAccountNumber(),
                customerName,
                account.getBranch().getName(),
                account.getAccountSubtype().getDescription(),
                account.getStatus(),
                account.getAccountingBalance(),
                account.getAvailableBalance(),
                account.getIsFavorite(),
                account.getOpeningDate());
    }

    private String resolveCustomerName(Customer customer) {
        if (customer.getLegalName() != null && !customer.getLegalName().isBlank()) {
            return customer.getLegalName();
        }
        return ((customer.getFirstName() != null ? customer.getFirstName() : "") + " " +
                (customer.getLastName() != null ? customer.getLastName() : "")).trim();
    }
}
