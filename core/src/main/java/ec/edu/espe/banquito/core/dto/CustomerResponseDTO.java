package ec.edu.espe.banquito.core.dto;

import ec.edu.espe.banquito.core.enums.CustomerStatusEnum;
import ec.edu.espe.banquito.core.enums.CustomerTypeEnum;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerResponseDTO {
    private Integer id;
    private CustomerTypeEnum customerType;
    private String identificationType;
    private String identification;
    private String firstName;
    private String lastName;
    private String email;
    private String mobilePhone;
    private String address;
    private CustomerStatusEnum status;
}
