package com.banquito.core.service;

import com.banquito.core.dto.AccountRequestDTO;
import com.banquito.core.dto.AccountResponseDTO;
public interface IAccountService {

    AccountResponseDTO findByAccountNumber(String accountNumber, Integer coreUserId);

    AccountResponseDTO create(AccountRequestDTO request, Integer coreUserId);

    AccountResponseDTO inactivate(String accountNumber, Integer coreUserId);

    AccountResponseDTO block(String accountNumber, Integer coreUserId);

    AccountResponseDTO suspend(String accountNumber, Integer coreUserId);
}
