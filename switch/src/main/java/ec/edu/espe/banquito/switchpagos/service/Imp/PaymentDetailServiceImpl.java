package ec.edu.espe.banquito.switchpagos.service.Imp;

import ec.edu.espe.banquito.switchpagos.model.PaymentDetail;
import ec.edu.espe.banquito.switchpagos.repository.PaymentDetailRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class PaymentDetailService {
    private final PaymentDetailRepository paymentDetailRepository;
    public PaymentDetailService(PaymentDetailRepository paymentDetailRepository) {
        this.paymentDetailRepository = paymentDetailRepository;
    }
    @Transactional
    public void processBatch(Integer paymentBatchId) {
        System.out.println(
                "=== INICIANDO PROCESAMIENTO BATCH "
                        + paymentBatchId
        );
        List<PaymentDetail> details =
                paymentDetailRepository
                        .findByPaymentBatch_IdOrderByLineNumberAsc(paymentBatchId);

        for (PaymentDetail detail : details) {

            try {

                // =========================
                // SIMULACIÓN CORE BANCARIO
                // =========================

                executeTransfer(
                        detail.getDestinationAccountNumber(),
                        detail.getAmount()
                );

                // =========================
                // SUCCESS
                // =========================

                detail.setStatus("SUCCESS");
                detail.setRejectionReason(null);
                detail.setExecutedAt(LocalDateTime.now());

            } catch (Exception e) {

                // =========================
                // ERROR POR LÍNEA
                // =========================

                detail.setStatus("REJECTED");
                detail.setRejectionReason(e.getMessage());

            }

            // IMPORTANTE:
            // guardar SIEMPRE cada línea

            paymentDetailRepository.save(detail);
        }
    }

    // ==========================================
    // MÉTODO QUE SIMULA LLAMADA AL CORE
    // ==========================================

    private void executeTransfer(String account, java.math.BigDecimal amount) {

        // Simulación de errores

        if (amount.doubleValue() > 1000) {
            throw new RuntimeException("Monto excede el límite permitido");
        }

        if (account == null || account.isEmpty()) {
            throw new RuntimeException("Cuenta destino inválida");
        }

        // Simulación de UUID transaccional

        UUID transactionId = UUID.randomUUID();

        System.out.println("Transferencia ejecutada: " + transactionId);
    }
}
