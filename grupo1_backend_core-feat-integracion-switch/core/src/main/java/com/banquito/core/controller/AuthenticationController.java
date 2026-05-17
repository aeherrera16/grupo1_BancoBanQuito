package com.banquito.core.controller;

import com.banquito.core.dto.CoreUserAuthResponseDTO;
import com.banquito.core.dto.CustomerAuthResponseDTO;
import com.banquito.core.dto.LoginRequestDTO;
import com.banquito.core.dto.ChangePasswordRequestDTO;
import com.banquito.core.service.IAuthenticationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/core/v1/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final IAuthenticationService authenticationService;

    @PostMapping("/customers/login")
    public ResponseEntity<CustomerAuthResponseDTO> loginCustomer(@RequestBody LoginRequestDTO request) {
        return ResponseEntity.ok(authenticationService.authenticateCustomer(request));
    }

    @PostMapping("/sftp/validate")
    public ResponseEntity<Map<String, String>> validateSftpCredentials(@RequestBody LoginRequestDTO request) {
        CustomerAuthResponseDTO auth = authenticationService.authenticateCustomer(request);

        if (auth.getCustomerType() == null || !com.banquito.core.enums.CustomerTypeEnum.JURIDICO.equals(auth.getCustomerType())) {
            return ResponseEntity.status(403).body(Map.of("error", "Solo clientes empresariales pueden acceder al SFTP"));
        }

        Map<String, String> response = new HashMap<>();
        response.put("ruc", auth.getIdentification());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/customers/change-password")
    public ResponseEntity<CustomerAuthResponseDTO> changeCustomerPassword(@RequestBody ChangePasswordRequestDTO request) {
        return ResponseEntity.ok(authenticationService.changePassword(request));
    }

    @PostMapping("/core-users/login")
    public ResponseEntity<CoreUserAuthResponseDTO> loginCoreUser(@RequestBody LoginRequestDTO request) {
        return ResponseEntity.ok(authenticationService.authenticateCoreUser(request));
    }
}
