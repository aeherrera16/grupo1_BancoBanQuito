package com.banquito.core.dto;

import com.banquito.core.enums.MovementTypeEnum;
import com.banquito.core.enums.TransactionStatusEnum;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class TransactionHistoryDTO {

    private Long transactionId;
    private LocalDateTime date;
    private MovementTypeEnum type;
    private String subtypeCode;
    private String subtypeName;
    private String description;
    private BigDecimal amount;
    private BigDecimal resultingBalance;
    private String accountNumber;
    private String counterpartAccountNumber;
    private TransactionStatusEnum status;

    public TransactionHistoryDTO() {
    }

    public TransactionHistoryDTO(Long transactionId, LocalDateTime date, MovementTypeEnum type,
                                 String subtypeCode, String subtypeName, String description,
                                 BigDecimal amount, BigDecimal resultingBalance,
                                 String accountNumber, String counterpartAccountNumber,
                                 TransactionStatusEnum status) {
        this.transactionId = transactionId;
        this.date = date;
        this.type = type;
        this.subtypeCode = subtypeCode;
        this.subtypeName = subtypeName;
        this.description = description;
        this.amount = amount;
        this.resultingBalance = resultingBalance;
        this.accountNumber = accountNumber;
        this.counterpartAccountNumber = counterpartAccountNumber;
        this.status = status;
    }
}
