package com.banquito.core.controller;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.banquito.core.dto.AccountRequestDTO;
import com.banquito.core.dto.AccountResponseDTO;
import com.banquito.core.dto.TransactionResponseDTO;
import com.banquito.core.service.IAccountService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/core/v1/accounts")
@RequiredArgsConstructor
public class AccountController {

    private final IAccountService accountService;

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<AccountResponseDTO>> findByCustomerId(
            @PathVariable Integer customerId) {
        return ResponseEntity.ok(accountService.findByCustomerId(customerId, null));
    }

    @GetMapping("/{accountNumber}")
    public ResponseEntity<AccountResponseDTO> findByAccountNumber(
            @PathVariable String accountNumber) {
        return ResponseEntity.ok(accountService.findByAccountNumber(accountNumber, null));
    }

    @GetMapping("/{accountNumber}/transactions")
    public ResponseEntity<List<TransactionResponseDTO>> getTransactions(@PathVariable String accountNumber) {
        return ResponseEntity.ok(accountService.getTransactions(accountNumber, 10));
    }

    @PostMapping
    public ResponseEntity<AccountResponseDTO> create(
            @RequestBody AccountRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(accountService.create(request, null));
    }

    @PatchMapping("/{accountNumber}/activate")
    public ResponseEntity<AccountResponseDTO> activate(
            @PathVariable String accountNumber) {
        return ResponseEntity.ok(accountService.activate(accountNumber, null));
    }

    @PatchMapping("/{accountNumber}/inactivate")
    public ResponseEntity<AccountResponseDTO> inactivate(
            @PathVariable String accountNumber) {
        return ResponseEntity.ok(accountService.inactivate(accountNumber, null));
    }

    @PatchMapping("/{accountNumber}/block")
    public ResponseEntity<AccountResponseDTO> block(
            @PathVariable String accountNumber) {
        return ResponseEntity.ok(accountService.block(accountNumber, null));
    }

    @PatchMapping("/{accountNumber}/suspend")
    public ResponseEntity<AccountResponseDTO> suspend(
            @PathVariable String accountNumber) {
        return ResponseEntity.ok(accountService.suspend(accountNumber, null));
    }

    @GetMapping("/default/favorite")
    public ResponseEntity<AccountResponseDTO> getFavoriteAccount() {
        return ResponseEntity.ok(accountService.getFavoriteAccount());
    }

    @PatchMapping("/{accountNumber}/set-favorite")
    public ResponseEntity<AccountResponseDTO> setFavorite(@PathVariable String accountNumber) {
        return ResponseEntity.ok(accountService.setFavorite(accountNumber));
    }
}
