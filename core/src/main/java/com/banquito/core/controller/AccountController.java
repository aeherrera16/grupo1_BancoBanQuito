package com.banquito.core.controller;

import com.banquito.core.dto.AccountRequestDTO;
import com.banquito.core.dto.AccountResponseDTO;
import com.banquito.core.dto.TransactionResponseDTO;
import com.banquito.core.service.IAccountService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@Slf4j
@RestController
@RequestMapping("/core/accounts")
@RequiredArgsConstructor
public class AccountController {

    private final IAccountService accountService;

    @GetMapping("/{accountNumber}")
    public ResponseEntity<AccountResponseDTO> findByAccountNumber(@PathVariable String accountNumber) {
        return ResponseEntity.ok(accountService.findByAccountNumber(accountNumber));
    }

    @PostMapping
    public ResponseEntity<AccountResponseDTO> create(@RequestBody AccountRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(accountService.create(request));
    }

    @PostMapping("/{accountNumber}/debit")
    public ResponseEntity<TransactionResponseDTO> debit(@PathVariable String accountNumber,
                                                        @RequestBody AmountRequest request) {
        return ResponseEntity.ok(accountService.debitar(accountNumber, request.amount()));
    }

    @PostMapping("/{accountNumber}/credit")
    public ResponseEntity<TransactionResponseDTO> credit(@PathVariable String accountNumber,
                                                         @RequestBody AmountRequest request) {
        return ResponseEntity.ok(accountService.acreditar(accountNumber, request.amount()));
    }

    @PostMapping("/transfer")
    public ResponseEntity<TransactionResponseDTO> transfer(@RequestBody TransferRequest request) {
        return ResponseEntity.ok(accountService.transferir(request.origin(), request.destination(), request.amount(), request.uuid()));
    }

    record AmountRequest(BigDecimal amount) {}

    record TransferRequest(String origin, String destination, BigDecimal amount, String uuid) {}
}
