package ec.edu.espe.banquito.switchpagos.service.impl;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import ec.edu.espe.banquito.switchpagos.config.ValidationRulesProperties;
import ec.edu.espe.banquito.switchpagos.enums.BatchStatusEnum;
import ec.edu.espe.banquito.switchpagos.model.FileValidation;
import ec.edu.espe.banquito.switchpagos.model.PaymentBatch;
import ec.edu.espe.banquito.switchpagos.model.PaymentDetail;
import ec.edu.espe.banquito.switchpagos.repository.FileValidationRepository;
import ec.edu.espe.banquito.switchpagos.repository.PaymentBatchRepository;
import ec.edu.espe.banquito.switchpagos.service.IFileValidationService;

@Service
public class FileValidationService implements IFileValidationService {
    
    private static final Logger logger = LoggerFactory.getLogger(FileValidationService.class);
    
    private final ValidationRulesProperties validationRules;
    private final FileValidationRepository fileValidationRepository;
    private final PaymentBatchRepository paymentBatchRepository;
    
    @Autowired
    public FileValidationService(ValidationRulesProperties validationRules,
                                FileValidationRepository fileValidationRepository,
                                PaymentBatchRepository paymentBatchRepository) {
        this.validationRules = validationRules;
        this.fileValidationRepository = fileValidationRepository;
        this.paymentBatchRepository = paymentBatchRepository;
    }
    
    @Override
    @Transactional
    public FileValidation validateBatch(PaymentBatch batch, List<PaymentDetail> details) {
        logger.info("Validating batch {} with {} details", batch.getId(), details.size());
        
        FileValidation validation = new FileValidation();
        validation.setPaymentBatch(batch);
        validation.setValidatedAt(LocalDateTime.now());
        
        // Implement validation logic here
        // This is a placeholder implementation
        validation.setValidationResult("SUCCESS");
        // Note: setValidationMessage method may not exist, removing for now
        
        return fileValidationRepository.save(validation);
    }
    
    @Override
    public void validateEarlyRejection(PaymentBatch batch, List<PaymentDetail> details) {
        logger.info("Performing early rejection validation for batch {}", batch.getId());
        
        // Implement early rejection logic here
        // This is a placeholder implementation
        if (batch.getRuc() == null || batch.getRuc().trim().isEmpty()) {
            throw new IllegalArgumentException("RUC is required for batch validation");
        }
        
        if (details == null || details.isEmpty()) {
            throw new IllegalArgumentException("Payment details cannot be empty");
        }
        
        logger.info("Early rejection validation passed for batch {}", batch.getId());
    }
}
