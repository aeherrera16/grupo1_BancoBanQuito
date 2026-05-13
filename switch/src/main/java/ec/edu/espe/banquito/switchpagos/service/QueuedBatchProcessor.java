package ec.edu.espe.banquito.switchpagos.service;

import java.time.LocalDate;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import ec.edu.espe.banquito.switchpagos.enums.BatchStatusEnum;
import ec.edu.espe.banquito.switchpagos.model.FileValidation;
import ec.edu.espe.banquito.switchpagos.model.PaymentBatch;
import ec.edu.espe.banquito.switchpagos.model.PaymentDetail;
import ec.edu.espe.banquito.switchpagos.repository.PaymentBatchRepository;
import ec.edu.espe.banquito.switchpagos.repository.PaymentDetailRepository;
import ec.edu.espe.banquito.switchpagos.util.EnumUtils;

/**
 * Procesa los lotes en estado ENCOLADO al inicio de cada dia habil a las 00:01.
 * Los lotes quedan encolados cuando son recibidos fuera del horario de corte (18:00),
 * en fines de semana o en dias feriados.
 */
@Service
public class QueuedBatchProcessor {

    private static final Logger logger = LoggerFactory.getLogger(QueuedBatchProcessor.class);

    private final PaymentBatchRepository paymentBatchRepository;
    private final PaymentDetailRepository paymentDetailRepository;
    private final FileValidationService fileValidationService;
    private final PaymentBatchProcessingService paymentBatchProcessingService;
    private final CutoffTimeService cutoffTimeService;

    public QueuedBatchProcessor(PaymentBatchRepository paymentBatchRepository,
                                PaymentDetailRepository paymentDetailRepository,
                                FileValidationService fileValidationService,
                                PaymentBatchProcessingService paymentBatchProcessingService,
                                CutoffTimeService cutoffTimeService) {
        this.paymentBatchRepository = paymentBatchRepository;
        this.paymentDetailRepository = paymentDetailRepository;
        this.fileValidationService = fileValidationService;
        this.paymentBatchProcessingService = paymentBatchProcessingService;
        this.cutoffTimeService = cutoffTimeService;
    }

    @Scheduled(cron = "0 1 0 * * *")
    public void processQueuedBatches() {
        LocalDate today = LocalDate.now();
        logger.info("=== INICIO PROCESAMIENTO DE LOTES ENCOLADOS - {} ===", today);

        if (cutoffTimeService.isWeekendOrHoliday(today)) {
            logger.info("El dia {} es fin de semana o feriado. No se procesan lotes encolados.", today);
            return;
        }

        List<PaymentBatch> queued = paymentBatchRepository.findByStatusOrderByReceivedAtAsc(BatchStatusEnum.ENCOLADO);
        logger.info("Lotes encolados a procesar: {}", queued.size());

        if (queued.isEmpty()) {
            logger.info("No hay lotes encolados pendientes.");
            return;
        }

        int exitosos = 0;
        int rechazados = 0;

        for (PaymentBatch batch : queued) {
            try {
                logger.info("Procesando lote encolado ID: {}, RUC: {}, Canal: {}, Recibido: {}",
                        batch.getId(), batch.getRuc(), batch.getChannel(), batch.getReceivedAt());

                List<PaymentDetail> details = paymentDetailRepository
                        .findByPaymentBatchIdOrderByLineNumberAsc(batch.getId());

                if (details.isEmpty()) {
                    logger.warn("Lote {} no tiene detalles registrados, se omite.", batch.getId());
                    continue;
                }

                FileValidation validation = fileValidationService.validateBatch(batch, details);

                if (EnumUtils.isValidationSuccess(validation.getValidationResult())) {
                    paymentBatchProcessingService.process(validation.getPaymentBatch(), details);
                    logger.info("Lote {} procesado exitosamente.", batch.getId());
                    exitosos++;
                } else {
                    logger.warn("Lote {} rechazado en validacion: {}", batch.getId(), validation.getValidationResult());
                    rechazados++;
                }
            } catch (Exception e) {
                logger.error("Error procesando lote encolado {}: {}", batch.getId(), e.getMessage(), e);
                rechazados++;
            }
        }

        logger.info("=== FIN PROCESAMIENTO LOTES ENCOLADOS: exitosos={}, rechazados={} ===", exitosos, rechazados);
    }
}
