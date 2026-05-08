package ec.edu.espe.banquito.core.dto;

import ec.edu.espe.banquito.core.enums.MovementTypeEnum;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
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
