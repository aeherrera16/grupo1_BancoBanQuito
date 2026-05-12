package ec.edu.espe.banquito.switchpagos.service;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Stream;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import ec.edu.espe.banquito.switchpagos.enums.BatchStatusEnum;
import ec.edu.espe.banquito.switchpagos.enums.ChannelEnum;
import ec.edu.espe.banquito.switchpagos.model.FileValidation;
import ec.edu.espe.banquito.switchpagos.model.PaymentBatch;
import ec.edu.espe.banquito.switchpagos.util.CsvBatchParser;
import ec.edu.espe.banquito.switchpagos.util.CsvBatchParser.CsvParseResult;
import ec.edu.espe.banquito.switchpagos.util.EnumUtils;

/**
 * Procesador local para pruebas - simula SFTP leyendo desde sistema de archivos
 */
@Service
@EnableScheduling
public class LocalFileProcessor {

    private static final Logger logger = LoggerFactory.getLogger(LocalFileProcessor.class);

    private final FileValidationService fileValidationService;

    @Value("${app.local-processor.enabled:true}")
    private boolean localProcessorEnabled;

    @Value("${app.local-processor.input-dir:sftp-home/pagos}")
    private String inputDirectory;

    @Value("${app.local-processor.processed-dir:sftp-home/procesados}")
    private String processedDirectory;

    @Value("${app.local-processor.error-dir:sftp-home/errores}")
    private String errorDirectory;

    @Autowired
    public LocalFileProcessor(FileValidationService fileValidationService) {
        this.fileValidationService = fileValidationService;
    }

    /**
     * Se ejecuta cada 30 segundos para procesar archivos locales
     */
    @Scheduled(fixedDelay = 30000)
    public void processLocalFiles() {
        if (!localProcessorEnabled) {
            logger.info("Procesamiento local deshabilitado");
            return;
        }

        logger.info("🔄 Iniciando procesamiento local de archivos...");
        
        try {
            // Crear directorios si no existen
            createDirectories();
            
            // Buscar archivos CSV en el directorio de entrada
            Path inputPath = Paths.get(inputDirectory);
            
            if (!Files.exists(inputPath)) {
                logger.warn("⚠️ Directorio de entrada no existe: {}", inputDirectory);
                return;
            }

            try (Stream<Path> paths = Files.list(inputPath)) {
                List<Path> csvFiles = paths
                    .filter(Files::isRegularFile)
                    .filter(path -> path.toString().toLowerCase().endsWith(".csv"))
                    .sorted(Comparator.comparing(Path::getFileName))
                    .toList();

                logger.info("📂 Encontrados {} archivos CSV para procesar", csvFiles.size());

                for (Path file : csvFiles) {
                    processLocalFile(file);
                }
            }

        } catch (Exception e) {
            logger.error("❌ Error en procesamiento local: {}", e.getMessage(), e);
        }
    }

    private void createDirectories() throws Exception {
        Files.createDirectories(Paths.get(inputDirectory));
        Files.createDirectories(Paths.get(processedDirectory));
        Files.createDirectories(Paths.get(errorDirectory));
    }

    private void processLocalFile(Path filePath) {
        String fileName = filePath.getFileName().toString();
        
        try {
            logger.info("=== INICIANDO PROCESAMIENTO LOCAL: {} ===", fileName);
            logger.info("🔍 Encontrado archivo local: {}", fileName);
            
            // Leer archivo
            logger.info("📥 Leyendo archivo local: {}", fileName);
            try (InputStream inputStream = new FileInputStream(filePath.toFile())) {
                byte[] fileBytes = inputStream.readAllBytes();
                logger.info("✅ Archivo leído - Tamaño: {} bytes", fileBytes.length);
                
                // Parsear CSV
                logger.info("🔄 Parseando archivo CSV local...");
                CsvParseResult parseResult = CsvBatchParser.parseCsvFile(
                    new FileInputStream(filePath.toFile()), 
                    fileName, 
                    fileBytes.length
                );
                
                if (!parseResult.success) {
                    logger.error("❌ ERROR PARSEANDO CSV LOCAL: {} - {}", fileName, parseResult.errorMessage);
                    moveToError(filePath);
                    return;
                }
                
                logger.info("✅ CSV local parseado exitosamente - {} detalles", parseResult.details.size());

                // Crear PaymentBatch
                PaymentBatch batch = parseResult.batch;
                batch.setChannel(ChannelEnum.SFTP); // Simula que viene por SFTP
                batch.setReceivedAt(LocalDateTime.now());
                batch.setStatus(BatchStatusEnum.RECEIVED);
                
                logger.info("📋 Lote local creado - RUC: {}, Hash: {}, Total: {}", 
                           batch.getRuc(), batch.getFileHash(), batch.getHeaderTotalAmount());

                // RF-02: Validación temprana
                logger.info("🔍 Iniciando validación temprana RF-02 LOCAL...");
                try {
                    fileValidationService.validateEarlyRejection(batch, parseResult.details);
                    logger.info("✅ Validación temprana local exitosa para {}", fileName);
                } catch (IllegalArgumentException e) {
                    logger.warn("❌ RECHAZO TEMPRANO RF-02 LOCAL: {} - {}", fileName, e.getMessage());
                    moveToError(filePath);
                    return;
                }

                // Validación completa
                logger.info("💾 Iniciando validación completa local...");
                FileValidation validation = fileValidationService.validateBatch(batch, parseResult.details);
                
                if (EnumUtils.isValidationSuccess(validation.getValidationResult())) {
                    logger.info("✅ Archivo {} procesado exitosamente", fileName);
                    moveToProcessed(filePath);
                } else {
                    logger.warn("❌ Archivo {} con errores de validación completa", fileName);
                    moveToError(filePath);
                }
            }
            
        } catch (Exception e) {
            logger.error("❌ Error procesando archivo local {}: {}", fileName, e.getMessage(), e);
            moveToError(filePath);
        }
    }

    private void moveToProcessed(Path filePath) {
        try {
            Path targetPath = Paths.get(processedDirectory, filePath.getFileName().toString());
            Files.move(filePath, targetPath, StandardCopyOption.REPLACE_EXISTING);
            logger.info("📁 Archivo movido a procesados: {}", targetPath);
        } catch (Exception e) {
            logger.error("❌ Error moviendo archivo a procesados: {}", e.getMessage());
        }
    }

    private void moveToError(Path filePath) {
        try {
            Path targetPath = Paths.get(errorDirectory, filePath.getFileName().toString());
            Files.move(filePath, targetPath, StandardCopyOption.REPLACE_EXISTING);
            logger.info("❌ Archivo movido a errores: {}", targetPath);
        } catch (Exception e) {
            logger.error("❌ Error moviendo archivo a errores: {}", e.getMessage());
        }
    }
}
