package ec.edu.espe.banquito.switchpagos.service;

import java.io.InputStream;
import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import ec.edu.espe.banquito.switchpagos.enums.BatchStatusEnum;
import ec.edu.espe.banquito.switchpagos.enums.ChannelEnum;
import ec.edu.espe.banquito.switchpagos.model.FileValidation;
import ec.edu.espe.banquito.switchpagos.util.CsvBatchParser;
import ec.edu.espe.banquito.switchpagos.util.CsvBatchParser.CsvParseResult;

/**
 * Servicio para procesamiento automático de archivos desde SFTP.
 * (Solo esqueleto, falta integración real con SFTP y parseo CSV reutilizando lógica del controller)
 */
@Service
public class SftpFileProcessorService {

    private final FileValidationService fileValidationService;

    @Autowired
    public SftpFileProcessorService(FileValidationService fileValidationService) {
        this.fileValidationService = fileValidationService;
    }

    /**
     * Procesa un archivo CSV recibido por SFTP
     */
    public FileValidation processSftpCsv(InputStream inputStream, String fileName, long fileSize) {
        ChannelEnum channel = ChannelEnum.SFTP;
        try {
            CsvParseResult parseResult = CsvBatchParser.parseCsvFile(inputStream, fileName, fileSize);
            if (!parseResult.success) {
                throw new RuntimeException(parseResult.errorMessage);
            }
            var batch = parseResult.batch;
            batch.setChannel(channel);
            batch.setReceivedAt(LocalDateTime.now());
            batch.setStatus(BatchStatusEnum.RECEIVED);
            return fileValidationService.validateBatch(batch, parseResult.details);
        } catch (Exception e) {
            // Manejo de error
            throw new RuntimeException("Error procesando archivo SFTP: " + e.getMessage(), e);
        }
    }
}