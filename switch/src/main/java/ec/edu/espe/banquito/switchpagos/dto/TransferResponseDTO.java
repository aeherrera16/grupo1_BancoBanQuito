package ec.edu.espe.banquito.switchpagos.dto;

import java.math.BigDecimal;

public class TransferResponseDTO {
    private String transferId;
    private String status;
    private String message;
    private BigDecimal amount;

    public String getTransferId() {
        return transferId;
    }
    public void setTransferId(String transferId) {
        this.transferId = transferId;
    }
    public String getStatus() {
        return status;
    }
    public void setStatus(String status) {
        this.status = status;
    }
    public String getMessage() {
        return message;
    }
    public void setMessage(String message) {
        this.message = message;
    }
    public BigDecimal getAmount() {
        return amount;
    }
    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
    @Override
    public String toString() {
        return "TransferResponseDTO{" +
                "transferId='" + transferId + '\'' +
                ", status='" + status + '\'' +
                ", message='" + message + '\'' +
                ", amount=" + amount +
                '}';
    }
}
