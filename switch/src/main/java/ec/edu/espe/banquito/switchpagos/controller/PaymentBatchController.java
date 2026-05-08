package ec.edu.espe.banquito.switchpagos.controller;

import java.time.LocalDateTime;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import ec.edu.espe.banquito.switchpagos.enums.BatchStatusEnum;
import ec.edu.espe.banquito.switchpagos.enums.ChannelEnum;
import ec.edu.espe.banquito.switchpagos.model.FileValidation;
import ec.edu.espe.banquito.switchpagos.model.PaymentBatch;
import ec.edu.espe.banquito.switchpagos.service.FileValidationService;
import ec.edu.espe.banquito.switchpagos.service.CutoffTimeService;
import ec.edu.espe.banquito.switchpagos.util.CsvBatchParser;
import ec.edu.espe.banquito.switchpagos.util.CsvBatchParser.CsvParseResult;
import ec.edu.espe.banquito.switchpagos.util.EnumUtils;

@RestController
@RequestMapping("/api/payment-batch")
public class PaymentBatchController {

    private static final Logger logger = LoggerFactory.getLogger(PaymentBatchController.class);

    private final FileValidationService fileValidationService;
    private final CutoffTimeService cutoffTimeService;

    @Autowired
    public PaymentBatchController(FileValidationService fileValidationService,
                                 CutoffTimeService cutoffTimeService) {
        this.fileValidationService = fileValidationService;
        this.cutoffTimeService = cutoffTimeService;
    }

    /**
     * Endpoint para carga manual de archivos CSV
     */
    @PostMapping("/upload-csv")
    public ResponseEntity<?> uploadCsv(@RequestParam("file") MultipartFile file,
                                       @RequestParam("channel") ChannelEnum channel) {
        logger.info("=== NUEVA SOLICITUD DE UPLOAD CSV ===");
        logger.info("Archivo: {}, Tamaño: {} bytes, Canal: {}", 
                   file.getOriginalFilename(), file.getSize(), channel);
        
        try {
            // Verificar horario de corte para ingesta manual
            if (!cutoffTimeService.isWithinIngestionWindow()) {
                logger.warn("❌ FUERA DE HORARIO: Corte a las {}", cutoffTimeService.getCutoffTime());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "error", "Fuera del horario de ingesta. La hora de corte es: " + cutoffTimeService.getCutoffTime()
                ));
            }
            logger.info("✅ Dentro del horario de ingesta");

            // Parsear archivo CSV
            logger.info("🔄 Parseando archivo CSV...");
            CsvParseResult parseResult = CsvBatchParser.parseCsvFile(file.getInputStream(), file.getOriginalFilename(), file.getSize());
            if (!parseResult.success) {
                logger.error("❌ ERROR PARSEANDO CSV: {}", parseResult.errorMessage);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", parseResult.errorMessage));
            }
            logger.info("✅ CSV parseado exitosamente - {} detalles", parseResult.details.size());

            // Crear PaymentBatch y detalles
            PaymentBatch batch = parseResult.batch;
            batch.setChannel(channel);
            batch.setReceivedAt(LocalDateTime.now());
            batch.setStatus(BatchStatusEnum.RECEIVED);
            
            logger.info("Lote creado - RUC: {}, Hash: {}, Total: {}", 
                       batch.getRuc(), batch.getFileHash(), batch.getHeaderTotalAmount());

            // RF-02: Validación temprana antes de guardar en base de datos
            logger.info("🔍 Iniciando validación temprana RF-02...");
            try {
                fileValidationService.validateEarlyRejection(batch, parseResult.details);
                logger.info("✅ Validación temprana exitosa");
            } catch (IllegalArgumentException e) {
                logger.error("❌ RECHAZO TEMPRANO RF-02: {}", e.getMessage());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "error", "RF-02 Validación rechazada: " + e.getMessage(),
                    "rejectedEarly", true
                ));
            }

            // Validar y guardar
            logger.info("💾 Iniciando validación completa y guardado...");
            FileValidation validation = fileValidationService.validateBatch(batch, parseResult.details);
            
            logger.info("✅ PROCESO COMPLETADO - Resultado: {}, Status: {}", 
                       validation.getValidationResult(), batch.getStatus());
            
            return ResponseEntity.ok(Map.of(
                    "validationResult", validation.getValidationResult(),
                    "isSuccess", EnumUtils.isValidationSuccess(validation.getValidationResult()),
                    "batchStatus", batch.getStatus().getDisplayName(),
                    "fileValidation", validation
            ));
        } catch (Exception e) {
            logger.error("❌ ERROR INTERNO DEL SERVIDOR: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

}