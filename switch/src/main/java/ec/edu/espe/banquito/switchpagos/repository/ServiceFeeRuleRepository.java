package ec.edu.espe.banquito.switchpagos.repository;

import ec.edu.espe.banquito.switchpagos.model.ServiceFeeRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ServiceFeeRuleRepository extends JpaRepository<ServiceFeeRule, Integer> {

    // Consulta JPQL personalizada:
    // El motor del Switch usará esto para encontrar la tarifa exacta pasándole
    // la cantidad de transacciones exitosas del lote (RF-06).
    @Query("SELECT r FROM ServiceFeeRule r WHERE :txCount >= r.minSuccessfulTransactions " +
            "AND (:txCount <= r.maxSuccessfulTransactions OR r.maxSuccessfulTransactions IS NULL)")
    Optional<ServiceFeeRule> findRuleByTransactionCount(@Param("txCount") Integer txCount);
}