package ec.edu.espe.banquito.core.service;

import ec.edu.espe.banquito.core.dto.AccountRequestDTO;
import ec.edu.espe.banquito.core.dto.AccountResponseDTO;
import ec.edu.espe.banquito.core.dto.TransactionResponseDTO;

import java.math.BigDecimal;

public interface IAccountService {

    AccountResponseDTO findByAccountNumber(String accountNumber);

    AccountResponseDTO create(AccountRequestDTO request);

    TransactionResponseDTO debitar(String accountNumber, BigDecimal amount);

    TransactionResponseDTO acreditar(String accountNumber, BigDecimal amount);

    TransactionResponseDTO transferir(String origin, String destination, BigDecimal amount, String uuid);
}
