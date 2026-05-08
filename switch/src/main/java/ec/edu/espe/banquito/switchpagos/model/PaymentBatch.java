package ec.edu.espe.banquito.switchpagos.model;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "PAYMENT_BATCH")
public class PaymentBatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @Column(name = "file_name", length = 255)
    private String fileName;

    @Column(name = "file_hash", length = 255)
    private String fileHash;

    @Column(name = "ruc", length = 20)
    private String ruc;

    @Column(name = "source_account_number", length = 30)
    private String sourceAccountNumber;

    @Column(name = "channel", length = 50)
    private String channel;

    @Column(name = "service_type", length = 50)
    private String serviceType;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "generated_at")
    private LocalDateTime generatedAt;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "received_at")
    private LocalDateTime receivedAt;

    @Column(name = "status", length = 30)
    private String status;

    @Column(name = "header_total_records")
    private Integer headerTotalRecords;

    // Regla 3: Manejo estricto de dinero
    @Column(name = "header_total_amount", precision = 18, scale = 2)
    private BigDecimal headerTotalAmount;

    @Column(name = "successful_records")
    private Integer successfulRecords;

    @Column(name = "rejected_records")
    private Integer rejectedRecords;

    // Regla 6: Constructor vacío
    public PaymentBatch() {
    }

    // Regla 6: Constructor solo con la PK
    public PaymentBatch(Integer id) {
        this.id = id;
    }

    // --- GETTERS Y SETTERS MANUALES ---

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getFileHash() {
        return fileHash;
    }

    public void setFileHash(String fileHash) {
        this.fileHash = fileHash;
    }

    public String getRuc() {
        return ruc;
    }

    public void setRuc(String ruc) {
        this.ruc = ruc;
    }

    public String getSourceAccountNumber() {
        return sourceAccountNumber;
    }

    public void setSourceAccountNumber(String sourceAccountNumber) {
        this.sourceAccountNumber = sourceAccountNumber;
    }

    public String getChannel() {
        return channel;
    }

    public void setChannel(String channel) {
        this.channel = channel;
    }

    public String getServiceType() {
        return serviceType;
    }

    public void setServiceType(String serviceType) {
        this.serviceType = serviceType;
    }

    public LocalDateTime getGeneratedAt() {
        return generatedAt;
    }

    public void setGeneratedAt(LocalDateTime generatedAt) {
        this.generatedAt = generatedAt;
    }

    public LocalDateTime getReceivedAt() {
        return receivedAt;
    }

    public void setReceivedAt(LocalDateTime receivedAt) {
        this.receivedAt = receivedAt;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getHeaderTotalRecords() {
        return headerTotalRecords;
    }

    public void setHeaderTotalRecords(Integer headerTotalRecords) {
        this.headerTotalRecords = headerTotalRecords;
    }

    public BigDecimal getHeaderTotalAmount() {
        return headerTotalAmount;
    }

    public void setHeaderTotalAmount(BigDecimal headerTotalAmount) {
        this.headerTotalAmount = headerTotalAmount;
    }

    public Integer getSuccessfulRecords() {
        return successfulRecords;
    }

    public void setSuccessfulRecords(Integer successfulRecords) {
        this.successfulRecords = successfulRecords;
    }

    public Integer getRejectedRecords() {
        return rejectedRecords;
    }

    public void setRejectedRecords(Integer rejectedRecords) {
        this.rejectedRecords = rejectedRecords;
    }

    // Regla 5: equals() y hashCode() SOLO de la PK
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        PaymentBatch that = (PaymentBatch) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }

    // Regla 7: Sobreescritura del toString()
    @Override
    public String toString() {
        return "PaymentBatch{" +
                "id=" + id +
                ", fileName='" + fileName + '\'' +
                ", ruc='" + ruc + '\'' +
                ", status='" + status + '\'' +
                ", headerTotalAmount=" + headerTotalAmount +
                '}';
    }
}