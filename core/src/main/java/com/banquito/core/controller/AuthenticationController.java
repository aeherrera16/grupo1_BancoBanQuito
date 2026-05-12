package com.banquito.core.controller;

import com.banquito.core.dto.CoreUserAuthResponseDTO;
import com.banquito.core.dto.CreateCoreUserRequestDTO;
import com.banquito.core.dto.CreateWebCredentialRequestDTO;
import com.banquito.core.dto.CustomerAuthResponseDTO;
import com.banquito.core.dto.LoginRequestDTO;
import com.banquito.core.service.IAuthenticationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/core/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private static final String CORE_USER_HEADER = "X-Core-User-Id";

    private final IAuthenticationService authenticationService;

    @PostMapping("/customers/login")
    public ResponseEntity<CustomerAuthResponseDTO> loginCustomer(@RequestBody LoginRequestDTO request) {
        return ResponseEntity.ok(authenticationService.authenticateCustomer(request));
    }

    @PostMapping("/core-users/login")
    public ResponseEntity<CoreUserAuthResponseDTO> loginCoreUser(@RequestBody LoginRequestDTO request) {
        return ResponseEntity.ok(authenticationService.authenticateCoreUser(request));
    }

    @PostMapping("/customers/credentials")
    public ResponseEntity<CustomerAuthResponseDTO> createWebCredential(
            @RequestBody CreateWebCredentialRequestDTO request,
            @RequestHeader(CORE_USER_HEADER) Integer coreUserId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(authenticationService.createWebCredential(request, coreUserId));
    }

    @PostMapping("/core-users")
    public ResponseEntity<CoreUserAuthResponseDTO> createCoreUser(
            @RequestBody CreateCoreUserRequestDTO request,
            @RequestHeader(CORE_USER_HEADER) Integer coreUserId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(authenticationService.createCoreUser(request, coreUserId));
    }
}
