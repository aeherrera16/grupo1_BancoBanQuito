package ec.edu.espe.banquito.switchpagos.service;

import java.time.LocalDateTime;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import ec.edu.espe.banquito.switchpagos.enums.BatchStatusEnum;
import ec.edu.espe.banquito.switchpagos.enums.PaymentDetailStatusEnum;
import ec.edu.espe.banquito.switchpagos.model.PaymentBatch;
import ec.edu.espe.banquito.switchpagos.model.PaymentDetail;
import ec.edu.espe.banquito.switchpagos.repository.PaymentBatchRepository;
import ec.edu.espe.banquito.switchpagos.repository.PaymentDetailRepository;

@Service
public class PaymentBatchProcessingService {

    private static final Logger logger = LoggerFactory.getLogger(PaymentBatchProcessingService.class);

    private final CoreBankingClient coreBankingClient;
    private final PaymentBatchRepository paymentBatchRepository;
    private final PaymentDetailRepository paymentDetailRepository;

    public PaymentBatchProcessingService(CoreBankingClient coreBankingClient,
                                         PaymentBatchRepository paymentBatchRepository,
                                         PaymentDetailRepository paymentDetailRepository) {
        this.coreBankingClient = coreBankingClient;
        this.paymentBatchRepository = paymentBatchRepository;
        this.paymentDetailRepository = paymentDetailRepository;
    }

    @Transactional
    public PaymentBatch process(PaymentBatch batch, List<PaymentDetail> details) {
        logger.info("=== INICIO PROCESAMIENTO RF-03/RF-04 LOTE {} ===", batch.getId());

        batch.setStatus(BatchStatusEnum.PROCESSING);
        paymentBatchRepository.save(batch);

        int successful = 0;
        int rejected = 0;

        for (PaymentDetail detail : details) {
            detail.setPaymentBatch(batch);
            String uuid = String.format("BATCH-%s-LINE-%s", batch.getId(), detail.getLineNumber());
            try {
                coreBankingClient.transfer(
                        batch.getSourceAccountNumber(),
                        detail.getDestinationAccountNumber(),
                        detail.getAmount(),
                        uuid
                );
                detail.setStatus(PaymentDetailStatusEnum.SUCCESS);
                detail.setExecutedAt(LocalDateTime.now());
                detail.setRejectionReason(null);
                successful++;
                logger.info("Linea {} procesada: {} -> {} por {}",
                        detail.getLineNumber(),
                        batch.getSourceAccountNumber(),
                        detail.getDestinationAccountNumber(),
                        detail.getAmount());
            } catch (Exception ex) {
                detail.setStatus(PaymentDetailStatusEnum.REJECTED);
                detail.setExecutedAt(LocalDateTime.now());
                detail.setRejectionReason(ex.getMessage());
                rejected++;
                logger.warn("Linea {} rechazada: {}", detail.getLineNumber(), ex.getMessage());
            }
            paymentDetailRepository.save(detail);
        }

        batch.setSuccessfulRecords(successful);
        batch.setRejectedRecords(rejected);
        batch.setStatus(successful > 0 ? BatchStatusEnum.PROCESSED : BatchStatusEnum.REJECTED);

        PaymentBatch processed = paymentBatchRepository.save(batch);
        logger.info("=== FIN PROCESAMIENTO LOTE {}: exitosos={}, rechazados={} ===",
                batch.getId(), successful, rejected);
        return processed;
    }
}
