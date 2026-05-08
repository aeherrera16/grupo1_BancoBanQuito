package ec.edu.espe.banquito.core.service;

import ec.edu.espe.banquito.core.dto.CustomerRequestDTO;
import ec.edu.espe.banquito.core.dto.CustomerResponseDTO;

import java.util.List;

public interface ICustomerService {

    List<CustomerResponseDTO> findAll();

    CustomerResponseDTO findById(Integer id);

    CustomerResponseDTO findByIdentification(String identificationType, String identification);

    CustomerResponseDTO create(CustomerRequestDTO request);
}
