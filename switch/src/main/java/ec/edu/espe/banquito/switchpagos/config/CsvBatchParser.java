package ec.edu.espe.banquito.switchpagos.config;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import ec.edu.espe.banquito.switchpagos.enums.PaymentDetailStatusEnum;
import ec.edu.espe.banquito.switchpagos.enums.ServiceTypeEnum;
import ec.edu.espe.banquito.switchpagos.model.PaymentBatch;
import ec.edu.espe.banquito.switchpagos.model.PaymentDetail;

public class CsvBatchParser {
    public static CsvParseResult parseCsvFile(InputStream inputStream, String fileName, long fileSize) {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream))) {
            String line;
            int lineNum = 0;
            PaymentBatch batch = new PaymentBatch();
            List<PaymentDetail> details = new ArrayList<>();
            String fileHash = Integer.toHexString(fileName.hashCode() ^ (int) fileSize);
            batch.setFileName(fileName);
            batch.setFileHash(fileHash);

            while ((line = reader.readLine()) != null) {
                lineNum++;
                String[] parts = line.split(",");
                if (lineNum == 1) {
                    // Cabecera
                    batch.setRuc(parts[0]);
                    batch.setServiceType(ServiceTypeEnum.valueOf(parts[1]));
                    batch.setGeneratedAt(LocalDateTime.parse(parts[2]));
                    batch.setSourceAccountNumber(parts[3]);
                    batch.setHeaderTotalRecords(Integer.parseInt(parts[4]));
                    batch.setHeaderTotalAmount(new BigDecimal(parts[5]));
                } else {
                    // Pie de control
                    if (parts.length == 2 && lineNum > 2) {
                        // Pie: hash/código de seguridad, suma de verificación
                        break;
                    }
                    // Detalle
                    if (parts.length >= 7) {
                        PaymentDetail detail = new PaymentDetail();
                        detail.setLineNumber(Integer.parseInt(parts[0]));
                        detail.setBeneficiaryIdentification(parts[1]);
                        detail.setBeneficiaryName(parts[2]);
                        detail.setDestinationAccountNumber(parts[3]);
                        detail.setAmount(new BigDecimal(parts[4]));
                        detail.setReference(parts[5]);
                        detail.setBeneficiaryEmail(parts[6]);
                        detail.setStatus(PaymentDetailStatusEnum.PENDING);
                        detail.setPaymentBatch(batch);
                        details.add(detail);
                    }
                }
            }
            if (batch.getHeaderTotalRecords() == null || batch.getHeaderTotalAmount() == null) {
                throw new IllegalArgumentException("Missing header totals");
            }
            return new CsvParseResult(batch, details);
        } catch (Exception e) {
            throw new RuntimeException("Error parsing CSV file", e);
        }
    }

    public static class CsvParseResult {
        private final PaymentBatch batch;
        private final List<PaymentDetail> details;

        public CsvParseResult(PaymentBatch batch, List<PaymentDetail> details) {
            this.batch = batch;
            this.details = details;
        }

        public PaymentBatch getBatch() {
            return batch;
        }

        public List<PaymentDetail> getDetails() {
            return details;
        }
    }
}
