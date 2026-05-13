package com.banquito.core.controller;

import com.banquito.core.dto.CustomerRequestDTO;
import com.banquito.core.dto.CustomerResponseDTO;
import com.banquito.core.service.ICustomerService;
import com.banquito.core.model.CustomerSubtype;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:5174"})
@RestController
@RequestMapping("/core/v1/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final ICustomerService customerService;

    @GetMapping("/identification/{type}/{number}")
    public ResponseEntity<CustomerResponseDTO> findByIdentification(
            @PathVariable("type") String type,
            @PathVariable("number") String number) {
        log.info("REST: Buscando cliente por {} : {}", type, number);
        return ResponseEntity.ok(customerService.findByIdentification(type, number));
    }

    @PostMapping
    public ResponseEntity<CustomerResponseDTO> create(@RequestBody CustomerRequestDTO request) {
        log.info("REST: Creando nuevo cliente: {} {}", request.getFirstName(), request.getLastName());
        return ResponseEntity.status(HttpStatus.CREATED).body(customerService.create(request));
    }

    @GetMapping("/subtypes")
    public ResponseEntity<List<CustomerSubtype>> getSubtypes() {
        log.info("REST: Consultando catálogo de subtipos de clientes");
        return ResponseEntity.ok(customerService.findAllSubtypes());
    }
}
