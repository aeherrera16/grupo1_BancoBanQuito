package ec.edu.espe.banquito.core.dto;

import ec.edu.espe.banquito.core.enums.AccountStatusEnum;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class AccountResponseDTO {
    private Integer id;
    private String accountNumber;
    private String customerFullName;
    private String branchName;
    private String accountSubtypeDescription;
    private AccountStatusEnum status;
    private BigDecimal accountingBalance;
    private BigDecimal availableBalance;
    private Boolean isFavorite;
    private LocalDateTime openingDate;
}
