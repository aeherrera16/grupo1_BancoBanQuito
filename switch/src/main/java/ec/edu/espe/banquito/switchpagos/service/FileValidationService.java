package ec.edu.espe.banquito.switchpagos.service;

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
import ec.edu.espe.banquito.switchpagos.util.EnumUtils;

@Service
public class FileValidationService {

    private static final Logger logger = LoggerFactory.getLogger(FileValidationService.class);

    private final PaymentBatchRepository paymentBatchRepository;
    private final FileValidationRepository fileValidationRepository;
    private final ValidationRulesProperties validationRulesProperties;
    private final CustomerService customerService;

    @Autowired
    public FileValidationService(PaymentBatchRepository paymentBatchRepository,
                                 FileValidationRepository fileValidationRepository,
                                 ValidationRulesProperties validationRulesProperties,
                                 CustomerService customerService) {
        this.paymentBatchRepository = paymentBatchRepository;
        this.fileValidationRepository = fileValidationRepository;
        this.validationRulesProperties = validationRulesProperties;
        this.customerService = customerService;
    }

    @Transactional
    public FileValidation validateBatch(PaymentBatch batch, List<PaymentDetail> details) {
        logger.info("=== INICIO VALIDACIÓN COMPLETA DE LOTE ===");
        logger.info("Procesando lote: {}, Canal: {}", batch.getFileName(), batch.getChannel());
        
        FileValidation v = new FileValidation();
        v.setPaymentBatch(batch);

        // Estructura mínima
        boolean structureValid = batch.getHeaderTotalRecords() != null && batch.getHeaderTotalAmount() != null;
        v.setStructureValid(structureValid);
        logger.info("Estructura válida: {}", structureValid);

        // Suma de montos y conteo
        BigDecimal sum = BigDecimal.ZERO;
        if (details != null) {
            for (PaymentDetail d : details) {
                if (d.getAmount() != null) sum = sum.add(d.getAmount());
            }
        }
        boolean totalsMatch = structureValid && sum.compareTo(batch.getHeaderTotalAmount()) == 0
                && (details == null ? 0 : details.size()) == batch.getHeaderTotalRecords();
        v.setTotalsMatch(totalsMatch);
        logger.info("Totales coinciden: {} (cabecera: {} vs detalle: {})", 
                   totalsMatch, batch.getHeaderTotalAmount(), sum);

        // Detección de duplicados por fileHash y nombre de archivo (30 días)
        boolean duplicate = false;
        if (batch.getFileHash() != null) {
            LocalDateTime threshold = LocalDateTime.now()
                .minusDays(validationRulesProperties.getDuplicateWindowDays());
            // Buscar CUALQUIER archivo con el mismo hash en los últimos 30 días
            Optional<PaymentBatch> existing = paymentBatchRepository.findFirstByFileHashAndReceivedAtAfter(
                batch.getFileHash(),
                threshold
            );
            duplicate = existing
                    .map(existingBatch -> existingBatch.getStatus() == BatchStatusEnum.PROCESSED)
                    .orElse(false);
            logger.info("Duplicado detectado: {} (hash: {})", duplicate, batch.getFileHash());
        }
        v.setDuplicateFileValid(!duplicate);

        // RF-02: Validación del cliente con servicio de pagos masivos activo
        boolean customerActiveValid = customerService.hasActiveMassPaymentService(batch.getRuc());
        v.setCustomerActiveValid(customerActiveValid);
        logger.info("Cliente activo: {} (RUC: {})", customerActiveValid, batch.getRuc());

        boolean isValid = structureValid && totalsMatch && !duplicate && customerActiveValid;
        String result = isValid ? "SUCCESS" : "REJECTED";
        v.setValidationResult(result);
        
        logger.info("Resultado final: {} (estructura: {}, montos: {}, duplicado: {}, cliente: {})", 
                   result, structureValid, totalsMatch, !duplicate, customerActiveValid);
        
        // Update batch status based on validation result
        if (isValid) {
            batch.setStatus(BatchStatusEnum.VALIDATED);
            logger.info("Lote marcado como VALIDADO");
        } else {
            batch.setStatus(BatchStatusEnum.REJECTED);
            logger.info("Lote marcado como RECHAZADO");
        }
        v.setValidatedAt(LocalDateTime.now());

        // Primero guardar el PaymentBatch para que tenga ID
        PaymentBatch savedBatch = paymentBatchRepository.save(batch);
        logger.info("Lote guardado con ID: {}", savedBatch.getId());
        
        // Luego asociar el batch guardado con la validación
        v.setPaymentBatch(savedBatch);
        
        // Persistir validación
        FileValidation savedValidation = fileValidationRepository.save(v);
        logger.info("Validación guardada con ID: {}", savedValidation.getId());
        logger.info("=== ✅ VALIDACIÓN COMPLETA FINALIZADA ===");
        
        return savedValidation;
    }

    /**
     * RF-02: Validación temprana antes de operaciones de base de datos.
     * Rechaza el archivo si no cumple validaciones estructurales críticas.
     */
    public void validateEarlyRejection(PaymentBatch batch, List<PaymentDetail> details) {
        logger.info("=== INICIO VALIDACIÓN TEMPRANA RF-02 ===");
        logger.info("Archivo: {}, Hash: {}, RUC: {}", 
                   batch.getFileName(), batch.getFileHash(), batch.getRuc());
        logger.info("Totales cabecera - Registros: {}, Monto: {}", 
                   batch.getHeaderTotalRecords(), batch.getHeaderTotalAmount());
        
        // Validación estructural básica
        if (batch.getHeaderTotalRecords() == null || batch.getHeaderTotalAmount() == null) {
            logger.error("❌ ESTRUCTURA INVÁLIDA: Faltan totales en cabecera");
            throw new IllegalArgumentException("Estructura de cabecera inválida: faltan totales");
        }
        logger.info("✅ Estructura básica válida");
        
        // Validación de montos y conteo
        BigDecimal sum = BigDecimal.ZERO;
        if (details != null) {
            for (PaymentDetail d : details) {
                if (d.getAmount() != null) sum = sum.add(d.getAmount());
            }
        }
        
        logger.info("Totales calculados - Registros: {}, Monto: {}", 
                   details != null ? details.size() : 0, sum);
        
        if (sum.compareTo(batch.getHeaderTotalAmount()) != 0) {
            logger.error("❌ MONTOS NO COINCIDEN: cabecera={} vs detalle={}", 
                        batch.getHeaderTotalAmount(), sum);
            throw new IllegalArgumentException(String.format(
                "Suma de montos no coincide: cabecera=%.2f, detalle=%.2f", 
                batch.getHeaderTotalAmount(), sum));
        }
        
        if ((details == null ? 0 : details.size()) != batch.getHeaderTotalRecords()) {
            logger.error("❌ CONTEO NO COINCIDE: cabecera={} vs detalle={}", 
                        batch.getHeaderTotalRecords(), details != null ? details.size() : 0);
            throw new IllegalArgumentException(String.format(
                "Conteo de registros no coincide: cabecera=%d, detalle=%d", 
                batch.getHeaderTotalRecords(), details != null ? details.size() : 0));
        }
        logger.info("✅ Validación de montos y conteo exitosa");
        
        // Validación de duplicados por hash (30 días) - SOLO si fue procesado con éxito
        if (batch.getFileHash() != null) {
            logger.info("🔍 Verificando duplicados para hash: {}", batch.getFileHash());
            LocalDateTime threshold = LocalDateTime.now()
                .minusDays(validationRulesProperties.getDuplicateWindowDays());
            logger.info("Ventana de búsqueda: {} días hasta {}", 
                       validationRulesProperties.getDuplicateWindowDays(), threshold);
            
            Optional<PaymentBatch> existing = paymentBatchRepository.findFirstByFileHashAndReceivedAtAfter(
                batch.getFileHash(), threshold);
            
            if (existing.isPresent()) {
                PaymentBatch existingBatch = existing.get();
                BatchStatusEnum existingStatus = existingBatch.getStatus();
                logger.info("Archivo anterior encontrado - Status: {}, Fecha: {}", 
                           existingStatus, existingBatch.getReceivedAt());
                
                // RF-02: Solo rechazar si el archivo anterior fue procesado CON ÉXITO
                if (existingStatus == BatchStatusEnum.PROCESSED) {
                    logger.error("❌ DUPLICADO DETECTADO: Hash {} ya fue procesado con éxito el {} (status: {})", 
                               batch.getFileHash(), existingBatch.getReceivedAt(), existingStatus);
                    throw new IllegalArgumentException(String.format(
                        "Archivo duplicado detectado. Hash %s ya fue procesado con éxito el %s (status: %s)", 
                        batch.getFileHash(), existingBatch.getReceivedAt(), existingStatus));
                } else {
                    logger.info("✅ Archivo anterior fue rechazado (status: {}), se permite reprocesar", existingStatus);
                }
            } else {
                logger.info("✅ No se encontraron duplicados en la ventana de 30 días");
            }
        } else {
            logger.warn("⚠️ Hash del archivo es nulo, no se puede verificar duplicados");
        }
        
        // Validación de cliente activo
        logger.info("🔍 Verificando cliente activo para RUC: {}", batch.getRuc());
        CustomerService.CustomerInfo customerInfo = customerService.getCustomerInfo(batch.getRuc());
        logger.info("Info cliente: {}", customerInfo);
        
        if (!customerService.hasActiveMassPaymentService(batch.getRuc())) {
            logger.error("❌ CLIENTE INACTIVO: RUC {} no tiene servicio de pagos masivos activo", batch.getRuc());
            throw new IllegalArgumentException(String.format(
                "RUC %s no tiene servicio de pagos masivos activo", batch.getRuc()));
        }
        logger.info("✅ Cliente válido con servicio activo");
        
        logger.info("=== ✅ VALIDACIÓN TEMPRANA RF-02 COMPLETADA EXITOSAMENTE ===");
    }
}
