package ec.edu.espe.banquito.core.service;

import ec.edu.espe.banquito.core.dto.CustomerRequestDTO;
import ec.edu.espe.banquito.core.dto.CustomerResponseDTO;
import ec.edu.espe.banquito.core.enums.CustomerStatusEnum;
import ec.edu.espe.banquito.core.exception.ClienteNoEncontradoException;
import ec.edu.espe.banquito.core.model.Customer;
import ec.edu.espe.banquito.core.model.CustomerSubtype;
import ec.edu.espe.banquito.core.repository.CustomerRepository;
import ec.edu.espe.banquito.core.repository.CustomerSubtypeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomerService implements ICustomerService {

    private final CustomerRepository customerRepository;
    private final CustomerSubtypeRepository customerSubtypeRepository;

    @Transactional(readOnly = true)
    @Override
    public List<CustomerResponseDTO> findAll() {
        return customerRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    @Override
    public CustomerResponseDTO findById(Integer id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ClienteNoEncontradoException(String.valueOf(id)));
        return toResponse(customer);
    }

    @Transactional(readOnly = true)
    @Override
    public CustomerResponseDTO findByIdentification(String identificationType, String identification) {
        Customer customer = customerRepository.findByIdentificationTypeAndIdentification(identificationType, identification)
                .orElseThrow(() -> new ClienteNoEncontradoException(identification));
        return toResponse(customer);
    }

    @Transactional
    @Override
    public CustomerResponseDTO create(CustomerRequestDTO request) {
        CustomerSubtype subtype = customerSubtypeRepository.findById(request.getCustomerSubtypeId())
                .orElseThrow(() -> new RuntimeException("Subtipo de cliente no encontrado: " + request.getCustomerSubtypeId()));

        Customer customer = new Customer();
        customer.setCustomerSubtype(subtype);
        customer.setCustomerType(request.getCustomerType());
        customer.setIdentificationType(request.getIdentificationType());
        customer.setIdentification(request.getIdentification());
        customer.setFirstName(request.getFirstName());
        customer.setLastName(request.getLastName());
        customer.setBirthDate(request.getBirthDate());
        customer.setEmail(request.getEmail());
        customer.setMobilePhone(request.getMobilePhone());
        customer.setAddress(request.getAddress());
        customer.setStatus(CustomerStatusEnum.ACTIVO);

        log.info("Creando cliente con identificación: {}", customer.getIdentification());
        return toResponse(customerRepository.save(customer));
    }

    private CustomerResponseDTO toResponse(Customer customer) {
        return new CustomerResponseDTO(
                customer.getId(),
                customer.getCustomerType(),
                customer.getIdentificationType(),
                customer.getIdentification(),
                customer.getFirstName(),
                customer.getLastName(),
                customer.getEmail(),
                customer.getMobilePhone(),
                customer.getAddress(),
                customer.getStatus()
        );
    }
}
