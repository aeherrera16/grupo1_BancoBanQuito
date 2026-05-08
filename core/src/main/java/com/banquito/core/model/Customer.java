package com.banquito.core.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(
        name = "CUSTOMER",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"identification_type", "identification"})
        }
)
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "customer_subtype_id", nullable = false)
    private CustomerSubtype customerSubtype;

    @Column(name = "customer_type", nullable = false, length = 15)
    private String customerType; // NATURAL, JURIDICO (validado por CHECK en DB)

    @Column(name = "identification_type", nullable = false, length = 15)
    private String identificationType; // CEDULA, RUC, PASAPORTE

    @Column(name = "identification", nullable = false, length = 20)
    private String identification;

    // Campos para persona NATURAL
    @Column(name = "first_name", length = 100)
    private String firstName;

    @Column(name = "last_name", length = 100)
    private String lastName;

    @Column(name = "birth_date")
    private LocalDate birthDate;

    // Campos para persona JURIDICA
    @Column(name = "legal_name", length = 150)
    private String legalName;

    @Column(name = "constitution_date")
    private LocalDate constitutionDate;

    // Relación recursiva: Representante legal (otro cliente)
    @ManyToOne
    @JoinColumn(name = "legal_representative_id")
    private Customer legalRepresentative;

    @Column(name = "email", nullable = false, length = 100)
    private String email;

    @Column(name = "mobile_phone", nullable = false, length = 20)
    private String mobilePhone;

    @Column(name = "address", nullable = false, length = 255)
    private String address;

    @Column(name = "latitude", precision = 10, scale = 8)
    private BigDecimal latitude;

    @Column(name = "longitude", precision = 11, scale = 8)
    private BigDecimal longitude;

    @Column(name = "status", nullable = false, length = 15)
    private String status;

    @Column(name = "registration_date", insertable = false, updatable = false)
    private LocalDateTime registrationDate;

    public Customer() {}

    public Customer(Integer id) {
        this.id = id;
    }

    // Getters y Setters (todos los campos)
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public CustomerSubtype getCustomerSubtype() { return customerSubtype; }
    public void setCustomerSubtype(CustomerSubtype customerSubtype) { this.customerSubtype = customerSubtype; }

    public String getCustomerType() { return customerType; }
    public void setCustomerType(String customerType) { this.customerType = customerType; }

    public String getIdentificationType() { return identificationType; }
    public void setIdentificationType(String identificationType) { this.identificationType = identificationType; }

    public String getIdentification() { return identification; }
    public void setIdentification(String identification) { this.identification = identification; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public LocalDate getBirthDate() { return birthDate; }
    public void setBirthDate(LocalDate birthDate) { this.birthDate = birthDate; }

    public String getLegalName() { return legalName; }
    public void setLegalName(String legalName) { this.legalName = legalName; }

    public LocalDate getConstitutionDate() { return constitutionDate; }
    public void setConstitutionDate(LocalDate constitutionDate) { this.constitutionDate = constitutionDate; }

    public Customer getLegalRepresentative() { return legalRepresentative; }
    public void setLegalRepresentative(Customer legalRepresentative) { this.legalRepresentative = legalRepresentative; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getMobilePhone() { return mobilePhone; }
    public void setMobilePhone(String mobilePhone) { this.mobilePhone = mobilePhone; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public BigDecimal getLatitude() { return latitude; }
    public void setLatitude(BigDecimal latitude) { this.latitude = latitude; }

    public BigDecimal getLongitude() { return longitude; }
    public void setLongitude(BigDecimal longitude) { this.longitude = longitude; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getRegistrationDate() { return registrationDate; }
    public void setRegistrationDate(LocalDateTime registrationDate) { this.registrationDate = registrationDate; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Customer)) return false;
        Customer customer = (Customer) o;
        return Objects.equals(id, customer.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }

    @Override
    public String toString() {
        return "Customer{" +
                "id=" + id +
                ", customerType='" + customerType + '\'' +
                ", identification='" + identification + '\'' +
                ", status='" + status + '\'' +
                '}';
    }
}
