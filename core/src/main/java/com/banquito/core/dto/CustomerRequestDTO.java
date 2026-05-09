package com.banquito.core.dto;

import com.banquito.core.enums.CustomerTypeEnum;
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

    public CustomerRequestDTO() {
    }

    public CustomerRequestDTO(Integer customerSubtypeId, CustomerTypeEnum customerType,
                              String identificationType, String identification, String firstName,
                              String lastName, LocalDate birthDate, String email,
                              String mobilePhone, String address) {
        this.customerSubtypeId = customerSubtypeId;
        this.customerType = customerType;
        this.identificationType = identificationType;
        this.identification = identification;
        this.firstName = firstName;
        this.lastName = lastName;
        this.birthDate = birthDate;
        this.email = email;
        this.mobilePhone = mobilePhone;
        this.address = address;
    }
}
