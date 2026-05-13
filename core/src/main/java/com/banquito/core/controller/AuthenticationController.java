package com.banquito.core.controller;

import com.banquito.core.dto.CoreUserAuthResponseDTO;
import com.banquito.core.dto.CustomerAuthResponseDTO;
import com.banquito.core.dto.LoginRequestDTO;
import com.banquito.core.service.IAuthenticationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:5174"})
@RestController
@RequestMapping("/core/v1/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final IAuthenticationService authenticationService;

    @PostMapping("/login/staff")
    public ResponseEntity<CoreUserAuthResponseDTO> loginStaff(@RequestBody LoginRequestDTO request) {
        log.info("REST: Login solicitado para personal interno: {}", request.getUsername());
        return ResponseEntity.ok(authenticationService.loginStaff(request));
    }

    @PostMapping("/login/customer")
    public ResponseEntity<CustomerAuthResponseDTO> loginCustomer(@RequestBody LoginRequestDTO request) {
        log.info("REST: Login solicitado para cliente web: {}", request.getUsername());
        return ResponseEntity.ok(authenticationService.loginCustomer(request));
    }
}
