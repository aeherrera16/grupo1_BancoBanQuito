package com.banquito.core.integration;

import com.banquito.core.dto.BalanceDTO;
import com.banquito.core.dto.TransferResultDTO;
import com.banquito.core.enums.AccountStatusEnum;
import com.banquito.core.model.Account;
import com.banquito.core.repository.AccountRepository;
import com.banquito.core.service.ITransactionService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
public class CoreSwitchServiceImpl implements CoreSwitchService {

    private final AccountRepository accountRepository;
    private final ITransactionService transactionService;

    public CoreSwitchServiceImpl(AccountRepository accountRepository,
                                 ITransactionService transactionService) {
        this.accountRepository = accountRepository;
        this.transactionService = transactionService;
    }

    @Override
    @Transactional(readOnly = true)
    public BalanceDTO consultarSaldo(String accountNumber) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new IllegalArgumentException("Cuenta no encontrada: " + accountNumber));

        return new BalanceDTO(
                account.getAccountNumber(),
                account.getAccountingBalance(),
                account.getAvailableBalance(),
                account.getStatus()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public boolean validarCuenta(String accountNumber) {
        return accountRepository.findByAccountNumber(accountNumber)
                .map(account -> AccountStatusEnum.ACTIVO == account.getStatus())
                .orElse(false);
    }

    @Override
    public TransferResultDTO transferir(
            String originAccount,
            String destinationAccount,
            BigDecimal amount,
            String uuid
    ) {
        try {
            transactionService.transferir(
                    originAccount,
                    destinationAccount,
                    amount,
                    uuid,
                    "TRANSFER",
                    "Transferencia entre cuentas"
            );

            return TransferResultDTO.ok(
                    "Transferencia procesada correctamente",
                    uuid
            );
        } catch (Exception e) {
            return TransferResultDTO.rejected(
                    "TRANSFER_ERROR",
                    e.getMessage(),
                    uuid
            );
        }
    }

    @Override
    public TransferResultDTO cobrarComision(
            String companyAccountNumber,
            BigDecimal totalAmount,
            String uuid
    ) {
        try {
            transactionService.debitar(
                    companyAccountNumber,
                    totalAmount,
                    uuid,
                    "TRN-GEN",
                    "Cobro de comision"
            );

            return TransferResultDTO.ok(
                    "Comision cobrada correctamente",
                    uuid
            );
        } catch (Exception e) {
            return TransferResultDTO.rejected(
                    "COMMISSION_ERROR",
                    e.getMessage(),
                    uuid
            );
        }
    }
}
