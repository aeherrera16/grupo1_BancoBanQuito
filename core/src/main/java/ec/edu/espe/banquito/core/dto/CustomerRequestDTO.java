package ec.edu.espe.banquito.core.dto;

import ec.edu.espe.banquito.core.enums.CustomerTypeEnum;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
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
