package ec.edu.espe.banquito.switchpagos.model;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.util.Objects;

@Entity
@Table(name = "SERVICE_FEE_RULE")
public class ServiceFeeRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @Column(name = "min_successful_transactions", nullable = false)
    private Integer minSuccessfulTransactions;

    @Column(name = "max_successful_transactions")
    private Integer maxSuccessfulTransactions; // Puede ser null si es "en adelante"

    // Regla 3: Dinero y tarifas en BigDecimal
    @Column(name = "unit_fee", nullable = false, precision = 18, scale = 2)
    private BigDecimal unitFee;

    // Regla 6: Constructor vacío mandatorio para JPA
    public ServiceFeeRule() {
    }

    // Regla 6: Constructor solo con la PK
    public ServiceFeeRule(Integer id) {
        this.id = id;
    }

    // --- GETTERS Y SETTERS MANUALES ---

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getMinSuccessfulTransactions() {
        return minSuccessfulTransactions;
    }

    public void setMinSuccessfulTransactions(Integer minSuccessfulTransactions) {
        this.minSuccessfulTransactions = minSuccessfulTransactions;
    }

    public Integer getMaxSuccessfulTransactions() {
        return maxSuccessfulTransactions;
    }

    public void setMaxSuccessfulTransactions(Integer maxSuccessfulTransactions) {
        this.maxSuccessfulTransactions = maxSuccessfulTransactions;
    }

    public BigDecimal getUnitFee() {
        return unitFee;
    }

    public void setUnitFee(BigDecimal unitFee) {
        this.unitFee = unitFee;
    }

    // Regla 5: equals() y hashCode() SOLO de la PK
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ServiceFeeRule that = (ServiceFeeRule) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }

    // Regla 7: Sobreescribir toString()
    @Override
    public String toString() {
        return "ServiceFeeRule{" +
                "id=" + id +
                ", minSuccessfulTransactions=" + minSuccessfulTransactions +
                ", maxSuccessfulTransactions=" + maxSuccessfulTransactions +
                ", unitFee=" + unitFee +
                '}';
    }
}