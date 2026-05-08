package ec.edu.espe.banquito.switchpagos.repository;

import ec.edu.espe.banquito.switchpagos.model.PaymentBatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentBatchRepository extends JpaRepository<PaymentBatch, Long> {

    // Esencial para validar si el archivo ya fue procesado antes (Prevenir fraude)
    Optional<PaymentBatch> findByFileHash(String fileHash);

    // Para buscar archivos que quedaron encolados por estar fuera de horario
    List<PaymentBatch> findByStatusOrderByReceivedAtAsc(String status);
}