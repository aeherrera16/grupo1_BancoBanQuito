package ec.edu.espe.banquito.switchpagos.controller;

import java.time.LocalDateTime;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import ec.edu.espe.banquito.switchpagos.config.CsvBatchParser;
import ec.edu.espe.banquito.switchpagos.config.CsvBatchParser.CsvParseResult;
import ec.edu.espe.banquito.switchpagos.enums.BatchStatusEnum;
import ec.edu.espe.banquito.switchpagos.enums.ChannelEnum;
import ec.edu.espe.banquito.switchpagos.model.FileValidation;
import ec.edu.espe.banquito.switchpagos.model.PaymentBatch;
import ec.edu.espe.banquito.switchpagos.model.PaymentDetail;
import ec.edu.espe.banquito.switchpagos.repository.PaymentBatchRepository;
import ec.edu.espe.banquito.switchpagos.service.impl.CutoffTimeService;
import ec.edu.espe.banquito.switchpagos.service.impl.FileValidationService;
import ec.edu.espe.banquito.switchpagos.service.impl.PaymentBatchProcessingService;
import ec.edu.espe.banquito.switchpagos.repository.PaymentDetailRepository;
import ec.edu.espe.banquito.switchpagos.service.CoreBankingClient;
import ec.edu.espe.banquito.switchpagos.service.CutoffTimeService;
import ec.edu.espe.banquito.switchpagos.service.FileValidationService;
import ec.edu.espe.banquito.switchpagos.service.PaymentBatchProcessingService;
import ec.edu.espe.banquito.switchpagos.util.CsvBatchParser;
import ec.edu.espe.banquito.switchpagos.util.CsvBatchParser.CsvParseResult;
import ec.edu.espe.banquito.switchpagos.util.EnumUtils;

@RestController
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:5174"})
@RequestMapping("/api/payment-batch")
public class PaymentBatchController {

    private static final Logger logger = LoggerFactory.getLogger(PaymentBatchController.class);

    private final FileValidationService fileValidationService;
    private final CutoffTimeService cutoffTimeService;
    private final PaymentBatchRepository paymentBatchRepository;
    private final PaymentDetailRepository paymentDetailRepository;
    private final PaymentBatchProcessingService paymentBatchProcessingService;
    private final CoreBankingClient coreBankingClient;

    @Autowired
    public PaymentBatchController(FileValidationService fileValidationService,
                                  CutoffTimeService cutoffTimeService,
                                  PaymentBatchRepository paymentBatchRepository,
                                  PaymentDetailRepository paymentDetailRepository,
                                  PaymentBatchProcessingService paymentBatchProcessingService,
                                  CoreBankingClient coreBankingClient) {
        this.fileValidationService = fileValidationService;
        this.cutoffTimeService = cutoffTimeService;
        this.paymentBatchRepository = paymentBatchRepository;
        this.paymentDetailRepository = paymentDetailRepository;
        this.paymentBatchProcessingService = paymentBatchProcessingService;
        this.coreBankingClient = coreBankingClient;
    }

    @GetMapping
    public ResponseEntity<?> findAll() {
        return ResponseEntity.ok(paymentBatchRepository.findAll());
    }

    @PostMapping("/upload-csv")
    public ResponseEntity<?> uploadCsv(@RequestParam("file") MultipartFile file,
                                       @RequestParam("channel") ChannelEnum channel) {
        logger.info("=== NUEVA SOLICITUD DE UPLOAD CSV ===");
        logger.info("Archivo: {}, Tamano: {} bytes, Canal: {}",
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
            logger.info("✅ CSV parseado exitosamente - {} detalles", parseResult.getDetails().size());

            // Crear PaymentBatch y detalles
            PaymentBatch batch = parseResult.getBatch();
            batch.setChannel(channel);
            batch.setReceivedAt(LocalDateTime.now());
            batch.setStatus(BatchStatusEnum.RECEIVED);

            logger.info("Lote creado - RUC: {}, Hash: {}, Total: {}", 
                       batch.getRuc(), batch.getFileHash(), batch.getHeaderTotalAmount());
            CsvParseResult parseResult = CsvBatchParser.parseCsvFile(
                    file.getInputStream(), file.getOriginalFilename(), file.getSize());
            if (!parseResult.success) {
                logger.error("ERROR PARSEANDO CSV: {}", parseResult.errorMessage);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", parseResult.errorMessage));
            }
            logger.info("CSV parseado exitosamente - {} detalles", parseResult.details.size());

            PaymentBatch batch = parseResult.batch;
            batch.setChannel(channel);
            batch.setReceivedAt(LocalDateTime.now());
            batch.setStatus(BatchStatusEnum.RECEIVED);

            // Para SFTP, usar siempre la cuenta marcada como favorita
            if (channel == ChannelEnum.SFTP) {
                String favAccount = coreBankingClient.getFavoriteAccountNumber();
                if (favAccount != null) {
                    logger.info("Canal SFTP: usando cuenta favorita {} en lugar de {}", favAccount, batch.getSourceAccountNumber());
                    batch.setSourceAccountNumber(favAccount);
                } else {
                    logger.warn("Canal SFTP: no se encontro cuenta favorita, se usa la del archivo: {}", batch.getSourceAccountNumber());
                }
            }

            logger.info("Lote creado - RUC: {}, Hash: {}, Total: {}",
                    batch.getRuc(), batch.getFileHash(), batch.getHeaderTotalAmount());

            // RF-02: Validacion temprana antes de guardar en base de datos
            try {
                fileValidationService.validateEarlyRejection(batch, parseResult.getDetails());
                logger.info("✅ Validación temprana exitosa");
                fileValidationService.validateEarlyRejection(batch, parseResult.details);
                logger.info("Validacion temprana RF-02 exitosa");
            } catch (IllegalArgumentException e) {
                logger.error("RECHAZO TEMPRANO RF-02: {}", e.getMessage());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                        "error", "RF-02 Validacion rechazada: " + e.getMessage(),
                        "rejectedEarly", true
                ));
            }

            var existingBatch = paymentBatchRepository.findByFileHash(batch.getFileHash());
            if (existingBatch.isPresent() && existingBatch.get().getStatus() != BatchStatusEnum.PROCESSED) {
                batch.setFileHash(batch.getFileHash() + "-" + System.currentTimeMillis());
            }

            // Validar y guardar
            logger.info("💾 Iniciando validación completa y guardado...");
            FileValidation validation = fileValidationService.validateBatch(batch, parseResult.getDetails());
            if ("SUCCESS".equals(validation.getValidationResult())) {
                batch = paymentBatchProcessingService.process(validation.getPaymentBatch(), parseResult.getDetails());
            // Verificar si debe encolarse (fuera de horario, fin de semana o feriado)
            if (cutoffTimeService.shouldQueue()) {
                logger.info("Lote recibido fuera de ventana de procesamiento. Guardando con estado ENCOLADO.");
                batch.setStatus(BatchStatusEnum.ENCOLADO);
                PaymentBatch savedBatch = paymentBatchRepository.save(batch);
                for (PaymentDetail detail : parseResult.details) {
                    detail.setPaymentBatch(savedBatch);
                    paymentDetailRepository.save(detail);
                }
                logger.info("Lote {} encolado exitosamente con {} detalles", savedBatch.getId(), parseResult.details.size());
                return ResponseEntity.ok(Map.of(
                        "batchStatus", BatchStatusEnum.ENCOLADO.getDisplayName(),
                        "batchId", savedBatch.getId(),
                        "message", "Archivo recibido fuera del horario de procesamiento. Sera procesado el proximo dia habil a las 00:01."
                ));
            }

            // Dentro de horario: validar y procesar
            logger.info("Iniciando validacion completa y guardado...");
            FileValidation validation = fileValidationService.validateBatch(batch, parseResult.details);
            if (EnumUtils.isValidationSuccess(validation.getValidationResult())) {
                batch = paymentBatchProcessingService.process(validation.getPaymentBatch(), parseResult.details);
            }

            logger.info("PROCESO COMPLETADO - Resultado: {}, Status: {}",
                    validation.getValidationResult(), batch.getStatus());

            return ResponseEntity.ok(Map.of(
                    "validationResult", validation.getValidationResult(),
                    "isSuccess", "SUCCESS".equals(validation.getValidationResult()),
                    "batchStatus", batch.getStatus().getDisplayName(),
                    "fileValidation", validation
            ));
        } catch (Exception e) {
            logger.error("ERROR INTERNO DEL SERVIDOR: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}
