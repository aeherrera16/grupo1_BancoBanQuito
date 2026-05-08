package ec.edu.espe.banquito.core.repository;

import ec.edu.espe.banquito.core.model.InstitutionalAccount;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface InstitutionalAccountRepository extends JpaRepository<InstitutionalAccount, Integer> {
    Optional<InstitutionalAccount> findByCode(String code);
}
