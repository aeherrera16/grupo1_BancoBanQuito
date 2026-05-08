package ec.edu.espe.banquito.core.dto;

import ec.edu.espe.banquito.core.enums.CustomerTypeEnum;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
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
    private String status;
}
