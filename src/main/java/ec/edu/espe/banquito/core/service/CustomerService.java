package ec.edu.espe.banquito.core.service;

import ec.edu.espe.banquito.core.exception.ClienteNoEncontradoException;
import ec.edu.espe.banquito.core.model.Customer;
import ec.edu.espe.banquito.core.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;

    @Transactional(readOnly = true)
    public List<Customer> findAll() {
        return customerRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Customer findById(Integer id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new ClienteNoEncontradoException(String.valueOf(id)));
    }

    @Transactional(readOnly = true)
    public Customer findByIdentification(String identificationType, String identification) {
        return customerRepository.findByIdentificationTypeAndIdentification(identificationType, identification)
                .orElseThrow(() -> new ClienteNoEncontradoException(identification));
    }

    @Transactional
    public Customer create(Customer customer) {
        log.info("Creando cliente con identificación: {}", customer.getIdentification());
        return customerRepository.save(customer);
    }
}
