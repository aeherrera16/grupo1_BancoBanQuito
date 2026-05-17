package com.banquito.core.service;

import com.banquito.core.dto.CoreUserAuthResponseDTO;
import com.banquito.core.dto.CreateCoreUserRequestDTO;
import com.banquito.core.dto.ChangePasswordRequestDTO;
import com.banquito.core.dto.CreateWebCredentialRequestDTO;
import com.banquito.core.dto.CustomerAuthResponseDTO;
import com.banquito.core.dto.LoginRequestDTO;

import com.banquito.core.model.Customer;

public interface IAuthenticationService {

    CustomerAuthResponseDTO authenticateCustomer(LoginRequestDTO request);

    CoreUserAuthResponseDTO authenticateCoreUser(LoginRequestDTO request);

    CustomerAuthResponseDTO createWebCredential(CreateWebCredentialRequestDTO request, Integer coreUserId);

    void createInitialWebCredential(Customer customer);

    CoreUserAuthResponseDTO createCoreUser(CreateCoreUserRequestDTO request, Integer coreUserId);

    void validateActiveCoreUser(Integer coreUserId);

    CustomerAuthResponseDTO changePassword(ChangePasswordRequestDTO request);
}
