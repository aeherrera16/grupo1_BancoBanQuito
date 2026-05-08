package com.banquito.core.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "ACCOUNT_TRANSACTION")
public class AccountTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id; // Wrapper Long para BIGINT

    // Regla 8: Relaciones de hijo a padre
    @ManyToOne
    @JoinColumn(name = "account_id", referencedColumnName = "id", nullable = false)
    private Account account;

    @ManyToOne
    @JoinColumn(name = "transaction_subtype_id", referencedColumnName = "id", nullable = false)
    private TransactionSubtype transactionSubtype;

    @Column(name = "transaction_uuid", nullable = false, length = 36, unique = true)
    private String transactionUuid;

    @Column(name = "movement_type", nullable = false, length = 15)
    private String movementType;

    // Regla 3: SIEMPRE BigDecimal para dinero
    @Column(name = "amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(name = "resulting_balance", nullable = false, precision = 15, scale = 2)
    private BigDecimal resultingBalance;

    @Column(name = "status", nullable = false, length = 15)
    private String status;

    @Column(name = "description", length = 255)
    private String description;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "transaction_date", insertable = false, updatable = false)
    private LocalDateTime transactionDate;

    // Regla 6: Constructor vacío
    public AccountTransaction() {
    }

    // Regla 6: Constructor solo con la PK
    public AccountTransaction(Long id) {
        this.id = id;
    }

    // --- GETTERS Y SETTERS ---

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Account getAccount() {
        return account;
    }

    public void setAccount(Account account) {
        this.account = account;
    }

    public TransactionSubtype getTransactionSubtype() {
        return transactionSubtype;
    }

    public void setTransactionSubtype(TransactionSubtype transactionSubtype) {
        this.transactionSubtype = transactionSubtype;
    }

    public String getTransactionUuid() {
        return transactionUuid;
    }

    public void setTransactionUuid(String transactionUuid) {
        this.transactionUuid = transactionUuid;
    }

    public String getMovementType() {
        return movementType;
    }

    public void setMovementType(String movementType) {
        this.movementType = movementType;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public BigDecimal getResultingBalance() {
        return resultingBalance;
    }

    public void setResultingBalance(BigDecimal resultingBalance) {
        this.resultingBalance = resultingBalance;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getTransactionDate() {
        return transactionDate;
    }

    public void setTransactionDate(LocalDateTime transactionDate) {
        this.transactionDate = transactionDate;
    }

    // Regla 5: equals() y hashCode() SOLO para la PK
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

    // Regla 7: Sobreescribir toString() (Evitando imprimir objetos anidados para no causar StackOverflow)
    @Override
    public String toString() {
        return "AccountTransaction{" +
                "id=" + id +
                ", transactionUuid='" + transactionUuid + '\'' +
                ", movementType='" + movementType + '\'' +
                ", amount=" + amount +
                ", status='" + status + '\'' +
                '}';
    }
}
