package com.banquito.core.service.impl;

import com.banquito.core.dto.AccountRequestDTO;
import com.banquito.core.dto.AccountResponseDTO;
import com.banquito.core.enums.AccountStatusEnum;
import com.banquito.core.exception.AccountNotFoundException;
import com.banquito.core.model.Account;
import com.banquito.core.model.AccountSubtype;
import com.banquito.core.model.Branch;
import com.banquito.core.model.Customer;
import com.banquito.core.repository.AccountRepository;
import com.banquito.core.repository.AccountSubtypeRepository;
import com.banquito.core.repository.BranchRepository;
import com.banquito.core.repository.CustomerRepository;
import com.banquito.core.service.IAccountService;
import com.banquito.core.service.IAuthenticationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AccountService implements IAccountService {

    private final AccountRepository accountRepository;
    private final CustomerRepository customerRepository;
    private final BranchRepository branchRepository;
    private final AccountSubtypeRepository accountSubtypeRepository;
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
        account.setAccountNumber(request.getAccountNumber());
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
                account.getOpeningDate()
        );
    }

    private String resolveCustomerName(Customer customer) {
        if (customer.getLegalName() != null && !customer.getLegalName().isBlank()) {
            return customer.getLegalName();
        }
        return ((customer.getFirstName() != null ? customer.getFirstName() : "") + " " +
                (customer.getLastName() != null ? customer.getLastName() : "")).trim();
    }
}
