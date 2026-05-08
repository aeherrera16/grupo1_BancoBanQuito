package ec.edu.espe.banquito.switchpagos.model;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "SERVICE_CHARGE")
public class ServiceCharge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    // Relación hacia el Lote (Cabecera)
    @ManyToOne
    @JoinColumn(name = "payment_batch_id", referencedColumnName = "id", nullable = false)
    private PaymentBatch paymentBatch;

    // Relación hacia la Regla Tarifaria aplicada
    @ManyToOne
    @JoinColumn(name = "service_fee_rule_id", referencedColumnName = "id", nullable = false)
    private ServiceFeeRule serviceFeeRule;

    @Column(name = "successful_transactions", nullable = false)
    private Integer successfulTransactions;

    // Regla 3: Valores financieros
    @Column(name = "unit_fee", nullable = false, precision = 18, scale = 2)
    private BigDecimal unitFee;

    @Column(name = "commission_subtotal", nullable = false, precision = 18, scale = 2)
    private BigDecimal commissionSubtotal;

    @Column(name = "vat_amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal vatAmount;

    @Column(name = "total_charge", nullable = false, precision = 18, scale = 2)
    private BigDecimal totalCharge;

    @Column(name = "charge_status", nullable = false, length = 30)
    private String chargeStatus;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "charged_at")
    private LocalDateTime chargedAt;

    public ServiceCharge() {
    }

    public ServiceCharge(Integer id) {
        this.id = id;
    }

    // --- GETTERS Y SETTERS MANUALES ---

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public PaymentBatch getPaymentBatch() {
        return paymentBatch;
    }

    public void setPaymentBatch(PaymentBatch paymentBatch) {
        this.paymentBatch = paymentBatch;
    }

    public ServiceFeeRule getServiceFeeRule() {
        return serviceFeeRule;
    }

    public void setServiceFeeRule(ServiceFeeRule serviceFeeRule) {
        this.serviceFeeRule = serviceFeeRule;
    }

    public Integer getSuccessfulTransactions() {
        return successfulTransactions;
    }

    public void setSuccessfulTransactions(Integer successfulTransactions) {
        this.successfulTransactions = successfulTransactions;
    }

    public BigDecimal getUnitFee() {
        return unitFee;
    }

    public void setUnitFee(BigDecimal unitFee) {
        this.unitFee = unitFee;
    }

    public BigDecimal getCommissionSubtotal() {
        return commissionSubtotal;
    }

    public void setCommissionSubtotal(BigDecimal commissionSubtotal) {
        this.commissionSubtotal = commissionSubtotal;
    }

    public BigDecimal getVatAmount() {
        return vatAmount;
    }

    public void setVatAmount(BigDecimal vatAmount) {
        this.vatAmount = vatAmount;
    }

    public BigDecimal getTotalCharge() {
        return totalCharge;
    }

    public void setTotalCharge(BigDecimal totalCharge) {
        this.totalCharge = totalCharge;
    }

    public String getChargeStatus() {
        return chargeStatus;
    }

    public void setChargeStatus(String chargeStatus) {
        this.chargeStatus = chargeStatus;
    }

    public LocalDateTime getChargedAt() {
        return chargedAt;
    }

    public void setChargedAt(LocalDateTime chargedAt) {
        this.chargedAt = chargedAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ServiceCharge that = (ServiceCharge) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }

    @Override
    public String toString() {
        return "ServiceCharge{" +
                "id=" + id +
                ", successfulTransactions=" + successfulTransactions +
                ", totalCharge=" + totalCharge +
                ", chargeStatus='" + chargeStatus + '\'' +
                '}';
    }
}