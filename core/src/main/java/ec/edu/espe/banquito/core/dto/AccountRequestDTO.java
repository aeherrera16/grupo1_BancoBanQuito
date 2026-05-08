package ec.edu.espe.banquito.core.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AccountRequestDTO {
    private String accountNumber;
    private Integer customerId;
    private Integer branchId;
    private Integer accountSubtypeId;
    private Boolean isFavorite;
    private BigDecimal initialBalance;
}
