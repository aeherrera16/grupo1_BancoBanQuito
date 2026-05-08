package ec.edu.espe.banquito.core.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class AccountRequestDTO {
    private String accountNumber;
    private Integer customerId;
    private Integer branchId;
    private Integer accountSubtypeId;
    private Boolean isFavorite;
    private BigDecimal initialBalance;
}
