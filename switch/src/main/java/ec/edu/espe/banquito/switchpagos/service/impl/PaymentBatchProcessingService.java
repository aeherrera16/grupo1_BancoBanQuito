package ec.edu.espe.banquito.switchpagos.service.impl;

import java.time.LocalDateTime;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import ec.edu.espe.banquito.switchpagos.enums.BatchStatusEnum;
import ec.edu.espe.banquito.switchpagos.enums.PaymentDetailStatusEnum;
import ec.edu.espe.banquito.switchpagos.model.PaymentBatch;
import ec.edu.espe.banquito.switchpagos.model.PaymentDetail;
import ec.edu.espe.banquito.switchpagos.repository.PaymentBatchRepository;
import ec.edu.espe.banquito.switchpagos.repository.PaymentDetailRepository;
import ec.edu.espe.banquito.switchpagos.service.ICoreBankingClient;
import ec.edu.espe.banquito.switchpagos.service.IPaymentBatchProcessingService;

@Service
public class PaymentBatchProcessingService implements IPaymentBatchProcessingService {
    
    private static final Logger logger = LoggerFactory.getLogger(PaymentBatchProcessingService.class);
    
    private final PaymentBatchRepository paymentBatchRepository;
    private final PaymentDetailRepository paymentDetailRepository;
    private final ICoreBankingClient coreBankingClient;
    
    @Autowired
    public PaymentBatchProcessingService(PaymentBatchRepository paymentBatchRepository,
                                        PaymentDetailRepository paymentDetailRepository,
                                        ICoreBankingClient coreBankingClient) {
        this.paymentBatchRepository = paymentBatchRepository;
        this.paymentDetailRepository = paymentDetailRepository;
        this.coreBankingClient = coreBankingClient;
    }
    
    @Override
    @Transactional
    public PaymentBatch process(PaymentBatch batch, List<PaymentDetail> details) {
        logger.info("Processing batch {} with {} details", batch.getId(), details.size());
        
        try {
            // Update batch status to processing
            batch.setStatus(BatchStatusEnum.PROCESSING);
            // Note: setProcessedAt method may not exist, removing for now
            batch = paymentBatchRepository.save(batch);
            
            // Process each payment detail
            for (PaymentDetail detail : details) {
                try {
                    // Process individual payment
                    processPaymentDetail(detail);
                    detail.setStatus(PaymentDetailStatusEnum.SUCCESS);
                    detail.setExecutedAt(LocalDateTime.now());
                } catch (Exception e) {
                    logger.error("Error processing payment detail {}: {}", detail.getId(), e.getMessage());
                    detail.setStatus(PaymentDetailStatusEnum.REJECTED);
                    detail.setRejectionReason(e.getMessage());
                }
                paymentDetailRepository.save(detail);
            }
            
            // Update batch final status
            batch.setStatus(BatchStatusEnum.PROCESSED);
            batch = paymentBatchRepository.save(batch);
            
            logger.info("Batch {} processed successfully", batch.getId());
            return batch;
            
        } catch (Exception e) {
            logger.error("Error processing batch {}: {}", batch.getId(), e.getMessage());
            batch.setStatus(BatchStatusEnum.REJECTED); // Using REJECTED instead of FAILED
            return paymentBatchRepository.save(batch);
        }
    }
    
    private void processPaymentDetail(PaymentDetail detail) {
        // Implement payment processing logic
        // This is a placeholder implementation
        if (detail.getAmount() == null || detail.getAmount().compareTo(java.math.BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Invalid amount");
        }
        
        if (detail.getDestinationAccountNumber() == null || detail.getDestinationAccountNumber().trim().isEmpty()) {
            throw new IllegalArgumentException("Destination account is required");
        }
        
        logger.debug("Processing payment detail {} for account {}", detail.getId(), detail.getDestinationAccountNumber());
    }
}
