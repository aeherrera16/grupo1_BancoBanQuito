package ec.edu.espe.banquito.core.repository;

import ec.edu.espe.banquito.core.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Integer> {
    Optional<Customer> findByIdentification(String identification);
    Optional<Customer> findByIdentificationTypeAndIdentification(String identificationType, String identification);
    List<Customer> findByCustomerType(String customerType);
    List<Customer> findByStatus(String status);
}