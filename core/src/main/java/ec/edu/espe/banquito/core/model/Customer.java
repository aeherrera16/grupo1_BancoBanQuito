package ec.edu.espe.banquito.core.model;

import ec.edu.espe.banquito.core.enums.CustomerStatusEnum;
import ec.edu.espe.banquito.core.enums.CustomerTypeEnum;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Objects;

@Getter
@Setter
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

    @Enumerated(EnumType.STRING)
    @Column(name = "customer_type", nullable = false, length = 15)
    private CustomerTypeEnum customerType;

    @Column(name = "identification_type", nullable = false, length = 15)
    private String identificationType;

    @Column(name = "identification", nullable = false, length = 20)
    private String identification;

    @Column(name = "first_name", length = 100)
    private String firstName;

    @Column(name = "last_name", length = 100)
    private String lastName;

    @Column(name = "birth_date")
    private LocalDate birthDate;

    @Column(name = "legal_name", length = 150)
    private String legalName;

    @Column(name = "constitution_date")
    private LocalDate constitutionDate;

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

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 15)
    private CustomerStatusEnum status;

    @Column(name = "registration_date", insertable = false, updatable = false)
    private LocalDateTime registrationDate;

    public Customer() {}

    public Customer(Integer id) {
        this.id = id;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
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
                ", customerType=" + customerType +
                ", identification='" + identification + '\'' +
                ", status=" + status +
                '}';
    }
}
