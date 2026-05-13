package ec.edu.espe.banquito.switchpagos.service;

import java.util.List;

import ec.edu.espe.banquito.switchpagos.model.FileValidation;
import ec.edu.espe.banquito.switchpagos.model.PaymentBatch;
import ec.edu.espe.banquito.switchpagos.model.PaymentDetail;

public interface IFileValidationService {
    FileValidation validateBatch(PaymentBatch batch, List<PaymentDetail> details);
    void validateEarlyRejection(PaymentBatch batch, List<PaymentDetail> details);
}
