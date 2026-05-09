package com.banquito.core.dto;

import com.banquito.core.enums.AccountStatusEnum;

import java.math.BigDecimal;

public class BalanceDTO {

    private String accountNumber;
    private BigDecimal accountingBalance;
    private BigDecimal availableBalance;
    private AccountStatusEnum status;

    public BalanceDTO() {
    }

    public BalanceDTO(String accountNumber,
                      BigDecimal accountingBalance,
                      BigDecimal availableBalance,
                      AccountStatusEnum status) {
        this.accountNumber = accountNumber;
        this.accountingBalance = accountingBalance;
        this.availableBalance = availableBalance;
        this.status = status;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public BigDecimal getAccountingBalance() {
        return accountingBalance;
    }

    public BigDecimal getAvailableBalance() {
        return availableBalance;
    }

    public AccountStatusEnum getStatus() {
        return status;
    }
}