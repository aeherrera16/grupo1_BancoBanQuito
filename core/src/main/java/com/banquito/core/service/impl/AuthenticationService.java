package com.banquito.core.service.impl;

import com.banquito.core.dto.CoreUserAuthResponseDTO;
import com.banquito.core.dto.CustomerAuthResponseDTO;
import com.banquito.core.dto.LoginRequestDTO;
import com.banquito.core.enums.CommonStatusEnum;
import com.banquito.core.model.CoreUser;
import com.banquito.core.model.WebCredential;
import com.banquito.core.repository.CoreUserRepository;
import com.banquito.core.repository.WebCredentialRepository;
import com.banquito.core.service.IAuthenticationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthenticationService implements IAuthenticationService {

    private final CoreUserRepository coreUserRepository;
    private final WebCredentialRepository webCredentialRepository;

    @Override
    public void validateActiveCoreUser(Integer coreUserId) {
        if (coreUserId == null) {
            log.warn("Operación realizada por usuario anónimo");
            return;
        }
        CoreUser user = coreUserRepository.findById(coreUserId).orElse(null);
        if (user == null || user.getStatus() != CommonStatusEnum.ACTIVO) {
            log.error("Intento de operación con CoreUserId inválido o inactivo: {}", coreUserId);
        } else {
            log.info("Operación validada para CoreUser: {} ({})", user.getFullName(), user.getRole());
        }
    }

    @Override
    @Transactional
    public CoreUserAuthResponseDTO loginStaff(LoginRequestDTO request) {
        log.info("Intento de login interno: {}", request.getUsername());
        CoreUser user = coreUserRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuario o contraseña incorrectos (Personal)"));

        if (!user.getPasswordHash().equals(request.getPassword())) {
            throw new RuntimeException("Usuario o contraseña incorrectos (Personal)");
        }

        if (user.getStatus() != CommonStatusEnum.ACTIVO) {
            throw new RuntimeException("El usuario se encuentra inactivo. Contacte al administrador.");
        }

        user.setLastLogin(LocalDateTime.now());
        coreUserRepository.save(user);

        return new CoreUserAuthResponseDTO(
                user.getId(),
                user.getUsername(),
                user.getFullName(),
                user.getRole(),
                user.getStatus(),
                user.getLastLogin()
        );
    }

    @Override
    @Transactional
    public CustomerAuthResponseDTO loginCustomer(LoginRequestDTO request) {
        log.info("Intento de login cliente: {}", request.getUsername());
        WebCredential credential = webCredentialRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuario o contraseña incorrectos (Web)"));

        if (!credential.getPasswordHash().equals(request.getPassword())) {
            throw new RuntimeException("Usuario o contraseña incorrectos (Web)");
        }

        if (credential.getStatus() != CommonStatusEnum.ACTIVO) {
            throw new RuntimeException("Su acceso web está inactivo. Por favor, acérquese a una agencia.");
        }

        credential.setLastLogin(LocalDateTime.now());
        webCredentialRepository.save(credential);

        return new CustomerAuthResponseDTO(
                credential.getId(),
                credential.getCustomer().getId(),
                credential.getUsername(),
                credential.getCustomer().getFirstName() + " " + credential.getCustomer().getLastName(),
                credential.getStatus(),
                credential.getLastLogin()
        );
    }
}
