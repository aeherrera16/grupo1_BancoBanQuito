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
        logger.info("=== INICIO VALIDACION COMPLETA DE LOTE ===");
        logger.info("Procesando lote: {}, Canal: {}", batch.getFileName(), batch.getChannel());

        FileValidation v = new FileValidation();
        v.setPaymentBatch(batch);

        boolean structureValid = batch.getHeaderTotalRecords() != null && batch.getHeaderTotalAmount() != null;
        v.setStructureValid(structureValid);
        logger.info("Estructura valida: {}", structureValid);

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

        boolean duplicate = false;
        if (batch.getFileHash() != null) {
            LocalDateTime threshold = LocalDateTime.now()
                    .minusDays(validationRulesProperties.getDuplicateWindowDays());
            Optional<PaymentBatch> existing = paymentBatchRepository.findFirstByFileHashAndReceivedAtAfter(
                    batch.getFileHash(), threshold);
            duplicate = existing
                    .map(existingBatch -> existingBatch.getStatus() == BatchStatusEnum.PROCESSED)
                    .orElse(false);
            logger.info("Duplicado detectado: {} (hash: {})", duplicate, batch.getFileHash());
        }
        v.setDuplicateFileValid(!duplicate);

        boolean customerActiveValid = customerService.hasActiveMassPaymentService(batch.getRuc());
        v.setCustomerActiveValid(customerActiveValid);
        logger.info("Cliente activo: {} (RUC: {})", customerActiveValid, batch.getRuc());

        boolean isValid = structureValid && totalsMatch && !duplicate && customerActiveValid;
        String result = isValid ? "SUCCESS" : "REJECTED";
        v.setValidationResult(result);

        logger.info("Resultado final: {} (estructura: {}, montos: {}, duplicado: {}, cliente: {})",
                result, structureValid, totalsMatch, !duplicate, customerActiveValid);

        if (isValid) {
            batch.setStatus(BatchStatusEnum.VALIDATED);
            logger.info("Lote marcado como VALIDADO");
        } else {
            batch.setStatus(BatchStatusEnum.REJECTED);
            logger.info("Lote marcado como RECHAZADO");
        }
        v.setValidatedAt(LocalDateTime.now());

        PaymentBatch savedBatch = paymentBatchRepository.save(batch);
        logger.info("Lote guardado con ID: {}", savedBatch.getId());

        v.setPaymentBatch(savedBatch);

        FileValidation savedValidation = fileValidationRepository.save(v);
        logger.info("Validacion guardada con ID: {}", savedValidation.getId());
        logger.info("=== VALIDACION COMPLETA FINALIZADA ===");

        return savedValidation;
    }

    public void validateEarlyRejection(PaymentBatch batch, List<PaymentDetail> details) {
        logger.info("=== INICIO VALIDACION TEMPRANA RF-02 ===");
        logger.info("Archivo: {}, Hash: {}, RUC: {}",
                batch.getFileName(), batch.getFileHash(), batch.getRuc());
        logger.info("Totales cabecera - Registros: {}, Monto: {}",
                batch.getHeaderTotalRecords(), batch.getHeaderTotalAmount());

        if (batch.getHeaderTotalRecords() == null || batch.getHeaderTotalAmount() == null) {
            logger.error("ESTRUCTURA INVALIDA: Faltan totales en cabecera");
            throw new IllegalArgumentException("Estructura de cabecera invalida: faltan totales");
        }
        logger.info("Estructura basica valida");

        BigDecimal sum = BigDecimal.ZERO;
        if (details != null) {
            for (PaymentDetail d : details) {
                if (d.getAmount() != null) sum = sum.add(d.getAmount());
            }
        }

        logger.info("Totales calculados - Registros: {}, Monto: {}",
                details != null ? details.size() : 0, sum);

        if (sum.compareTo(batch.getHeaderTotalAmount()) != 0) {
            logger.error("MONTOS NO COINCIDEN: cabecera={} vs detalle={}", batch.getHeaderTotalAmount(), sum);
            throw new IllegalArgumentException(String.format(
                    "Suma de montos no coincide: cabecera=%.2f, detalle=%.2f",
                    batch.getHeaderTotalAmount(), sum));
        }

        if ((details == null ? 0 : details.size()) != batch.getHeaderTotalRecords()) {
            logger.error("CONTEO NO COINCIDE: cabecera={} vs detalle={}",
                    batch.getHeaderTotalRecords(), details != null ? details.size() : 0);
            throw new IllegalArgumentException(String.format(
                    "Conteo de registros no coincide: cabecera=%d, detalle=%d",
                    batch.getHeaderTotalRecords(), details != null ? details.size() : 0));
        }
        logger.info("Validacion de montos y conteo exitosa");

        if (batch.getFileHash() != null) {
            logger.info("Verificando duplicados para hash: {}", batch.getFileHash());
            LocalDateTime threshold = LocalDateTime.now()
                    .minusDays(validationRulesProperties.getDuplicateWindowDays());
            logger.info("Ventana de busqueda: {} dias hasta {}",
                    validationRulesProperties.getDuplicateWindowDays(), threshold);

            Optional<PaymentBatch> existing = paymentBatchRepository.findFirstByFileHashAndReceivedAtAfter(
                    batch.getFileHash(), threshold);

            if (existing.isPresent()) {
                PaymentBatch existingBatch = existing.get();
                BatchStatusEnum existingStatus = existingBatch.getStatus();
                logger.info("Archivo anterior encontrado - Status: {}, Fecha: {}",
                        existingStatus, existingBatch.getReceivedAt());

                if (existingStatus == BatchStatusEnum.PROCESSED) {
                    logger.error("DUPLICADO DETECTADO: Hash {} ya fue procesado con exito el {} (status: {})",
                            batch.getFileHash(), existingBatch.getReceivedAt(), existingStatus);
                    throw new IllegalArgumentException(String.format(
                            "Archivo duplicado detectado. Hash %s ya fue procesado con exito el %s (status: %s)",
                            batch.getFileHash(), existingBatch.getReceivedAt(), existingStatus));
                } else {
                    logger.info("Archivo anterior fue rechazado (status: {}), se permite reprocesar", existingStatus);
                }
            } else {
                logger.info("No se encontraron duplicados en la ventana de 30 dias");
            }
        } else {
            logger.warn("Hash del archivo es nulo, no se puede verificar duplicados");
        }

        logger.info("Verificando cliente activo para RUC: {}", batch.getRuc());
        CustomerService.CustomerInfo customerInfo = customerService.getCustomerInfo(batch.getRuc());
        logger.info("Info cliente: {}", customerInfo);

        if (!customerService.hasActiveMassPaymentService(batch.getRuc())) {
            logger.error("CLIENTE INACTIVO: RUC {} no tiene servicio de pagos masivos activo", batch.getRuc());
            throw new IllegalArgumentException(String.format(
                    "RUC %s no tiene servicio de pagos masivos activo", batch.getRuc()));
        }
        logger.info("Cliente valido con servicio activo");

        logger.info("=== VALIDACION TEMPRANA RF-02 COMPLETADA EXITOSAMENTE ===");
    }
}
