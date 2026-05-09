package ec.edu.espe.banquito.switchpagos.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import ec.edu.espe.banquito.switchpagos.model.PaymentDetail;

@Repository
public interface PaymentDetailRepository extends JpaRepository<PaymentDetail, Integer> {

    // Para procesar el lote iterando "línea por línea" ordenado por el número de línea
    List<PaymentDetail> findByPaymentBatchIdOrderByLineNumberAsc(Integer paymentBatchId);

    // Para obtener todos los detalles de un lote
    List<PaymentDetail> findByPaymentBatchId(Integer paymentBatchId);
}