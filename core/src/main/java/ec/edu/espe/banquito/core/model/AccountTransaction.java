package ec.edu.espe.banquito.core.model;

import ec.edu.espe.banquito.core.enums.MovementTypeEnum;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Objects;

@Getter
@Setter
@Entity
@Table(name = "ACCOUNT_TRANSACTION")
public class AccountTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @ManyToOne
    @JoinColumn(name = "transaction_subtype_id", nullable = false)
    private TransactionSubtype transactionSubtype;

    @Column(name = "transaction_uuid", nullable = false, length = 36, unique = true)
    private String transactionUuid;

    @Enumerated(EnumType.STRING)
    @Column(name = "movement_type", nullable = false, length = 15)
    private MovementTypeEnum movementType;

    @Column(name = "amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(name = "resulting_balance", nullable = false, precision = 15, scale = 2)
    private BigDecimal resultingBalance;

    @Column(name = "status", nullable = false, length = 15)
    private String status;

    @Column(name = "description", length = 255)
    private String description;

    @Column(name = "transaction_date", insertable = false, updatable = false)
    private LocalDateTime transactionDate;

    public AccountTransaction() {}

    public AccountTransaction(Long id) {
        this.id = id;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        AccountTransaction that = (AccountTransaction) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }

    @Override
    public String toString() {
        return "AccountTransaction{" +
                "id=" + id +
                ", transactionUuid='" + transactionUuid + '\'' +
                ", movementType=" + movementType +
                ", amount=" + amount +
                ", status='" + status + '\'' +
                '}';
    }
}
