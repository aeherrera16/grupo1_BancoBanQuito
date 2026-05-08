package ec.edu.espe.banquito.core.repository;

import ec.edu.espe.banquito.core.model.WebCredential;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface WebCredentialRepository extends JpaRepository<WebCredential, Integer> {
    Optional<WebCredential> findByUsername(String username);
    Optional<WebCredential> findByCustomer_Id(Integer customerId);
}