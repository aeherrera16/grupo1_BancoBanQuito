package com.banquito.core.dto;

import com.banquito.core.enums.CustomerStatusEnum;
import com.banquito.core.enums.CustomerTypeEnum;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CustomerResponseDTO {

    private Integer id;
    private String customerCode;
    private CustomerTypeEnum customerType;
    private String identificationType;
    private String identification;
    private String firstName;
    private String lastName;
    private String email;
    private String mobilePhone;
    private String address;
    private CustomerStatusEnum status;

    private String legalName;
    private java.time.LocalDate constitutionDate;
    private Integer legalRepresentativeId;

    public CustomerResponseDTO() {
    }

    public CustomerResponseDTO(Integer id, String customerCode, CustomerTypeEnum customerType, String identificationType,
                               String identification, String firstName, String lastName, String email,
                               String mobilePhone, String address, CustomerStatusEnum status,
                               String legalName, java.time.LocalDate constitutionDate, Integer legalRepresentativeId) {
        this.id = id;
        this.customerCode = customerCode;
        this.customerType = customerType;
        this.identificationType = identificationType;
        this.identification = identification;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.mobilePhone = mobilePhone;
        this.address = address;
        this.status = status;
        this.legalName = legalName;
        this.constitutionDate = constitutionDate;
        this.legalRepresentativeId = legalRepresentativeId;
    }
}
