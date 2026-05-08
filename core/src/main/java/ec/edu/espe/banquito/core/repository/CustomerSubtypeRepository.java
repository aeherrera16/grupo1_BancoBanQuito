package ec.edu.espe.banquito.core.repository;

import ec.edu.espe.banquito.core.model.CustomerSubtype;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CustomerSubtypeRepository extends JpaRepository<CustomerSubtype, Integer> {
    Optional<CustomerSubtype> findByName(String name);
    Optional<CustomerSubtype> findByStatus(String status);
}
