package ec.edu.espe.banquito.core.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BranchRequestDTO {
    private String branchCode;
    private String name;
    private String city;
}
