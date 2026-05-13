package ec.edu.espe.banquito.switchpagos.service.impl;

import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import ec.edu.espe.banquito.switchpagos.enums.BatchStatusEnum;
import ec.edu.espe.banquito.switchpagos.enums.ChannelEnum;
import ec.edu.espe.banquito.switchpagos.model.FileValidation;
import ec.edu.espe.banquito.switchpagos.config.CsvBatchParser;
import ec.edu.espe.banquito.switchpagos.config.CsvBatchParser.CsvParseResult;
import ec.edu.espe.banquito.switchpagos.service.IFileValidationService;
import ec.edu.espe.banquito.switchpagos.service.ISftpFileProcessorService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import ec.edu.espe.banquito.switchpagos.model.PaymentBatch;
import ec.edu.espe.banquito.switchpagos.model.PaymentDetail;
import ec.edu.espe.banquito.switchpagos.repository.PaymentBatchRepository;
import ec.edu.espe.banquito.switchpagos.repository.PaymentDetailRepository;
import ec.edu.espe.banquito.switchpagos.util.CsvBatchParser;
import ec.edu.espe.banquito.switchpagos.util.CsvBatchParser.CsvParseResult;
import ec.edu.espe.banquito.switchpagos.util.EnumUtils;

@Service
public class SftpFileProcessorService implements ISftpFileProcessorService {

    private static final Logger logger = LoggerFactory.getLogger(SftpFileProcessorService.class);

    private final IFileValidationService fileValidationService;

    @Autowired
    public SftpFileProcessorService(IFileValidationService fileValidationService) {
    private final FileValidationService fileValidationService;
    private final PaymentBatchProcessingService paymentBatchProcessingService;
    private final PaymentBatchRepository paymentBatchRepository;
    private final PaymentDetailRepository paymentDetailRepository;
    private final CutoffTimeService cutoffTimeService;
    private final CoreBankingClient coreBankingClient;

    @Autowired
    public SftpFileProcessorService(FileValidationService fileValidationService,
                                    PaymentBatchProcessingService paymentBatchProcessingService,
                                    PaymentBatchRepository paymentBatchRepository,
                                    PaymentDetailRepository paymentDetailRepository,
                                    CutoffTimeService cutoffTimeService,
                                    CoreBankingClient coreBankingClient) {
        this.fileValidationService = fileValidationService;
        this.paymentBatchProcessingService = paymentBatchProcessingService;
        this.paymentBatchRepository = paymentBatchRepository;
        this.paymentDetailRepository = paymentDetailRepository;
        this.cutoffTimeService = cutoffTimeService;
        this.coreBankingClient = coreBankingClient;
    }

    @Override
    public FileValidation processSftpCsv(InputStream inputStream, String fileName, long fileSize) {
        ChannelEnum channel = ChannelEnum.SFTP;
        try {
            CsvParseResult parseResult = CsvBatchParser.parseCsvFile(inputStream, fileName, fileSize);
            // CsvParseResult doesn't have success/errorMessage fields
            var batch = parseResult.getBatch();
            batch.setChannel(channel);
            batch.setReceivedAt(LocalDateTime.now());
            batch.setStatus(BatchStatusEnum.RECEIVED);
            
            logger.info("Lote creado - RUC: {}, Hash: {}, Total: {}", 
                       batch.getRuc(), batch.getFileHash(), batch.getHeaderTotalAmount());

            return fileValidationService.validateBatch(batch, parseResult.getDetails());
    public Optional<FileValidation> processSftpCsv(InputStream inputStream, String fileName, long fileSize) {
        try {
            CsvParseResult parseResult = CsvBatchParser.parseCsvFile(inputStream, fileName, fileSize);
            if (!parseResult.success) {
                throw new RuntimeException(parseResult.errorMessage);
            }

            PaymentBatch batch = parseResult.batch;
            batch.setChannel(ChannelEnum.SFTP);
            batch.setReceivedAt(LocalDateTime.now());
            batch.setStatus(BatchStatusEnum.RECEIVED);

            // SFTP: usar siempre la cuenta marcada como favorita
            String favAccount = coreBankingClient.getFavoriteAccountNumber();
            if (favAccount != null) {
                logger.info("Canal SFTP: usando cuenta favorita {} en lugar de {}", favAccount, batch.getSourceAccountNumber());
                batch.setSourceAccountNumber(favAccount);
            } else {
                logger.warn("Canal SFTP: no se encontro cuenta favorita, se usa la del archivo: {}", batch.getSourceAccountNumber());
            }

            // Verificar si debe encolarse (fuera de horario, fin de semana o feriado)
            if (cutoffTimeService.shouldQueue()) {
                logger.info("Archivo SFTP {} recibido fuera de ventana. Guardando con estado ENCOLADO.", fileName);
                batch.setStatus(BatchStatusEnum.ENCOLADO);
                PaymentBatch savedBatch = paymentBatchRepository.save(batch);
                for (PaymentDetail detail : parseResult.details) {
                    detail.setPaymentBatch(savedBatch);
                    paymentDetailRepository.save(detail);
                }
                logger.info("Lote SFTP {} encolado con {} detalles.", savedBatch.getId(), parseResult.details.size());
                return Optional.empty();
            }

            FileValidation validation = fileValidationService.validateBatch(batch, parseResult.details);
            if (EnumUtils.isValidationSuccess(validation.getValidationResult())) {
                paymentBatchProcessingService.process(validation.getPaymentBatch(), parseResult.details);
            }
            return Optional.of(validation);
        } catch (Exception e) {
            throw new RuntimeException("Error procesando archivo SFTP: " + e.getMessage(), e);
        }
    }
}
