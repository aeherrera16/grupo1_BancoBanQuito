package ec.edu.espe.banquito.core.dto;

import ec.edu.espe.banquito.core.enums.AccountStatusEnum;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
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
