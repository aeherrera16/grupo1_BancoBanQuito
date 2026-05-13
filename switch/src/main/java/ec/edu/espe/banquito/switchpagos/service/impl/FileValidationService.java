<<<<<<< HEAD
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
=======
package ec.edu.espe.banquito.switchpagos.service.impl;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClientException;

import ec.edu.espe.banquito.switchpagos.config.CsvBatchParser.CsvParseResult;
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
    private final CoreFacadeService coreFacadeService;

    @Autowired
    public FileValidationService(
            ValidationRulesProperties validationRules,
            FileValidationRepository fileValidationRepository,
            PaymentBatchRepository paymentBatchRepository,
            CoreFacadeService coreFacadeService) {
        this.validationRules = validationRules;
        this.fileValidationRepository = fileValidationRepository;
        this.paymentBatchRepository = paymentBatchRepository;
        this.coreFacadeService = coreFacadeService;
    }

    @Override
    @Transactional
    public FileValidation validateBatch(PaymentBatch batch, List<PaymentDetail> details) {
        logger.info("Validating batch {} with {} details", batch.getId(), details.size());

        FileValidation validation = new FileValidation();
        validation.setPaymentBatch(batch);
        validation.setValidatedAt(LocalDateTime.now());
        validation.setStructureValid(true);
        validation.setTotalsMatch(true);
        validation.setDuplicateFileValid(true);
        validation.setCustomerActiveValid(true);
        validation.setValidationResult("SUCCESS");

        return fileValidationRepository.save(validation);
    }

    @Override
    public void validateEarlyRejection(CsvParseResult parseResult) {
        PaymentBatch batch = parseResult.getBatch();
        List<PaymentDetail> details = parseResult.getDetails();

        if (batch.getFileName() == null || batch.getFileName().isBlank()) {
            throw new IllegalArgumentException("El nombre del archivo es obligatorio para auditoría y control de duplicidad");
        }
        if (batch.getFileHash() == null || batch.getFileHash().isBlank()) {
            throw new IllegalArgumentException("No se pudo calcular el hash de integridad del archivo");
        }
        if (batch.getRuc() == null || batch.getRuc().trim().isEmpty()) {
            throw new IllegalArgumentException("El RUC en cabecera es obligatorio");
        }
        if (details.isEmpty()) {
            throw new IllegalArgumentException("El archivo no tiene líneas de detalle");
        }
        if (parseResult.getFooterSecurityCode() == null || parseResult.getFooterSecurityCode().isBlank()) {
            throw new IllegalArgumentException("El código de seguridad del pie es obligatorio");
        }

        int counted = details.size();
        BigDecimal summed = details.stream()
                .map(PaymentDetail::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (!batch.getHeaderTotalRecords().equals(counted)) {
            throw new IllegalArgumentException(String.format(
                    "Cantidad de registros en cabecera (%d) no coincide con detalle procesado (%d)",
                    batch.getHeaderTotalRecords(), counted));
        }
        if (parseResult.getFooterDeclaredRecords() != counted) {
            throw new IllegalArgumentException(String.format(
                    "Registros declarados en pie (%d) no coinciden con detalle procesado (%d)",
                    parseResult.getFooterDeclaredRecords(), counted));
        }

        if (parseResult.getFooterDeclaredAmount().compareTo(batch.getHeaderTotalAmount()) != 0) {
            throw new IllegalArgumentException(String.format(
                    "Monto en pie (%s) no coincide con monto declarado en cabecera (%s)",
                    parseResult.getFooterDeclaredAmount().toPlainString(),
                    batch.getHeaderTotalAmount().toPlainString()));
        }
        if (batch.getHeaderTotalAmount().compareTo(summed) != 0) {
            throw new IllegalArgumentException(String.format(
                    "Monto total en cabecera (%s) no coincide con suma del detalle (%s)",
                    batch.getHeaderTotalAmount().toPlainString(), summed.toPlainString()));
        }
        if (parseResult.getFooterDeclaredAmount().compareTo(summed) != 0) {
            throw new IllegalArgumentException(String.format(
                    "Monto declarado en pie (%s) no coincide con suma del detalle (%s)",
                    parseResult.getFooterDeclaredAmount().toPlainString(), summed.toPlainString()));
        }

        validateNoDuplicateNominaProcessed(batch);

        validateRucClientePagosMasivos(batch.getRuc().trim());

        logger.info("Validación RF-02 temprana aprobada para archivo {}", batch.getFileName());
    }

    private void validateNoDuplicateNominaProcessed(PaymentBatch batch) {
        LocalDateTime since = LocalDateTime.now().minusDays(validationRules.getDuplicateWindowDays());
        paymentBatchRepository
                .findFirstByFileNameAndFileHashAndStatusAndReceivedAtAfter(
                        batch.getFileName(), batch.getFileHash(), BatchStatusEnum.PROCESSED, since)
                .ifPresent(existing -> {
                    throw new IllegalArgumentException(String.format(
                            "Duplicidad: el archivo '%s' con el mismo contenido ya fue procesado exitosamente el %s dentro de una ventana de %d día(s)",
                            batch.getFileName(), existing.getReceivedAt(), validationRules.getDuplicateWindowDays()));
                });
    }

    private void validateRucClientePagosMasivos(String ruc) {
        try {
            Boolean active = coreFacadeService.isMassPaymentsActiveForRuc(ruc);
            if (!Boolean.TRUE.equals(active)) {
                throw new IllegalArgumentException(
                        "El RUC no pertenece a un cliente jurídico con el servicio de pagos masivos activo");
            }
        } catch (RestClientException e) {
            logger.error("Error consultando pagos masivos en Core para RUC {}: {}", ruc, e.getMessage());
            throw new IllegalArgumentException(
                    "No se pudo validar contra el Core bancario el servicio de pagos masivos del RUC. Intente más tarde.", e);
        }
    }
}
>>>>>>> a3271e9 (feat: Refactor core banking integration and add business day validation)
