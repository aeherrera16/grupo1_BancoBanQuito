package ec.edu.espe.banquito.switchpagos.repository;

import ec.edu.espe.banquito.switchpagos.model.PaymentDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentDetailRepository extends JpaRepository<PaymentDetail, Integer> {

    // Para procesar el lote iterando "línea por línea" ordenado por el número de línea
    List<PaymentDetail> findByPaymentBatchIdOrderByLineNumberAsc(Long paymentBatchId);
}