package ec.edu.espe.banquito.switchpagos.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import ec.edu.espe.banquito.switchpagos.enums.BatchStatusEnum;
import ec.edu.espe.banquito.switchpagos.model.PaymentBatch;

@Repository
public interface PaymentBatchRepository extends JpaRepository<PaymentBatch, Integer> {

    // Esencial para validar si el archivo ya fue procesado antes (Prevenir fraude)
    Optional<PaymentBatch> findByFileHash(String fileHash);

    // Duplicidad considerando ventana de tiempo operativa
    Optional<PaymentBatch> findFirstByFileHashAndStatusAndReceivedAtAfter(String fileHash,
                                                                          BatchStatusEnum status,
                                                                          LocalDateTime receivedAt);

    // RF-02: Detección de duplicados por hash en ventana de 30 días (CUALQUIER estado)
    Optional<PaymentBatch> findFirstByFileHashAndReceivedAtAfter(String fileHash,
                                                                 LocalDateTime receivedAt);

    // Para buscar archivos que quedaron encolados por estar fuera de horario
    List<PaymentBatch> findByStatusOrderByReceivedAtAsc(BatchStatusEnum status);
}