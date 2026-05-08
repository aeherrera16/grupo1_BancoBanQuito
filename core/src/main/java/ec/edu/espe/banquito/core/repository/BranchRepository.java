package ec.edu.espe.banquito.core.repository;

import ec.edu.espe.banquito.core.model.Branch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BranchRepository extends JpaRepository<Branch, Integer> {

    // Método derivado usando convenciones de Spring Data (CamelCase)
    Optional<Branch> findByBranchCode(String branchCode);
}