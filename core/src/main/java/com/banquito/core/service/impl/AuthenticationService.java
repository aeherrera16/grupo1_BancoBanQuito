package com.banquito.core.service.impl;

import com.banquito.core.service.IAuthenticationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class AuthenticationService implements IAuthenticationService {

    @Override
    public void validateActiveCoreUser(Integer coreUserId) {
        // En esta fase de desarrollo, permitimos nulos pero logueamos la actividad
        // RF-01: Trazabilidad de operaciones por usuario del Core
        if (coreUserId == null) {
            log.warn("Operación realizada por usuario anónimo o sin cabecera X-Core-User-Id");
            return;
        }
        log.info("Operación validada para CoreUser: {}", coreUserId);
    }
}
