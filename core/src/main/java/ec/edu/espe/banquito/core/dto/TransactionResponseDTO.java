package ec.edu.espe.banquito.core.dto;

import ec.edu.espe.banquito.core.enums.MovementTypeEnum;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class TransactionResponseDTO {
    private Integer id;
    private String accountNumber;
    private MovementTypeEnum movementType;
    private BigDecimal amount;
    private BigDecimal resultingBalance;
    private LocalDateTime transactionDate;
    private String transactionUuid;
    private String status;
    private String message;
}
