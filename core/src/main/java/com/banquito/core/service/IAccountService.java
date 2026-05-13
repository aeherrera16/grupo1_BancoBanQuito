package com.banquito.core.service;

import com.banquito.core.dto.AccountRequestDTO;
import com.banquito.core.dto.AccountResponseDTO;

import java.util.List;

public interface IAccountService {

    AccountResponseDTO findByAccountNumber(String accountNumber, Integer coreUserId);

    List<AccountResponseDTO> findByCustomerId(Integer customerId, Integer coreUserId);

    AccountResponseDTO create(AccountRequestDTO request, Integer coreUserId);

    AccountResponseDTO inactivate(String accountNumber, Integer coreUserId);

    AccountResponseDTO block(String accountNumber, Integer coreUserId);

    AccountResponseDTO suspend(String accountNumber, Integer coreUserId);
    TransactionResponseDTO credit(String accountNumber, BigDecimal amount);

    TransactionResponseDTO transfer(String origin, String destination, BigDecimal amount, String uuid);

    AccountResponseDTO getFavoriteAccount();
}
