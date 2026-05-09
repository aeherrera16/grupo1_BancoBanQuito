package com.banquito.core.integration;

import com.banquito.core.dto.AccountResponseDTO;
import com.banquito.core.dto.BalanceDTO;
import com.banquito.core.dto.TransferResultDTO;
import com.banquito.core.enums.AccountStatusEnum;
import com.banquito.core.service.IAccountService;
import com.banquito.core.service.ITransactionService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class CoreSwitchServiceImpl implements CoreSwitchService {

    private final IAccountService accountService;
    private final ITransactionService transactionService;

    public CoreSwitchServiceImpl(IAccountService accountService,
                                 ITransactionService transactionService) {
        this.accountService = accountService;
        this.transactionService = transactionService;
    }

    @Override
    public BalanceDTO consultarSaldo(String accountNumber) {
        AccountResponseDTO account = accountService.findByAccountNumber(accountNumber);

        return new BalanceDTO(
                account.getAccountNumber(),
                account.getAccountingBalance(),
                account.getAvailableBalance(),
                account.getStatus()
        );
    }

    @Override
    public boolean validarCuenta(String accountNumber) {
        try {
            AccountResponseDTO account = accountService.findByAccountNumber(accountNumber);
            return AccountStatusEnum.ACTIVO.equals(account.getStatus());
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public TransferResultDTO transferir(
            String originAccount,
            String destinationAccount,
            BigDecimal amount,
            String uuid
    ) {
        try {
            accountService.transferir(originAccount, destinationAccount, amount, uuid);

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
                    "TRN-GEN"
            );

            return TransferResultDTO.ok(
                    "Comisión cobrada correctamente",
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