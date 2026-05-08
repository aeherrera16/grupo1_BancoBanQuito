package ec.edu.espe.banquito.core.dto;

import ec.edu.espe.banquito.core.enums.CustomerTypeEnum;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class CustomerRequestDTO {
    private Integer customerSubtypeId;
    private CustomerTypeEnum customerType;
    private String identificationType;
    private String identification;
    private String firstName;
    private String lastName;
    private LocalDate birthDate;
    private String email;
    private String mobilePhone;
    private String address;
}
