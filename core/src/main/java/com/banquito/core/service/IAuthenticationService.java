package com.banquito.core.service;

import com.banquito.core.dto.CoreUserAuthResponseDTO;
import com.banquito.core.dto.CustomerAuthResponseDTO;
import com.banquito.core.dto.LoginRequestDTO;

public interface IAuthenticationService {
    void validateActiveCoreUser(Integer coreUserId);
    
    CoreUserAuthResponseDTO loginStaff(LoginRequestDTO request);
    
    CustomerAuthResponseDTO loginCustomer(LoginRequestDTO request);
}
