package com.banquito.core.controller;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
            @PathVariable Integer customerId,
            @RequestHeader(value = "X-Core-User-Id", required = false) Integer coreUserId) {
        return ResponseEntity.ok(accountService.findByCustomerId(customerId, coreUserId));
    }

    @GetMapping("/{accountNumber}")
    public ResponseEntity<AccountResponseDTO> findByAccountNumber(
            @PathVariable String accountNumber,
            @RequestHeader(value = "X-Core-User-Id", required = false) Integer coreUserId) {
        return ResponseEntity.ok(accountService.findByAccountNumber(accountNumber, coreUserId));
    }

    @GetMapping("/customer/{customerId}/transactions")
    public ResponseEntity<List<TransactionResponseDTO>> findTransactionsByCustomerId(
            @PathVariable Integer customerId,
            @RequestHeader(value = "X-Core-User-Id", required = false) Integer coreUserId) {
        return ResponseEntity.ok(accountService.findTransactionsByCustomerId(customerId, coreUserId));
    }

    @GetMapping("/customer/{customerId}/transactions/paged")
    public ResponseEntity<com.banquito.core.dto.TransactionPageResponseDTO> findTransactionsByCustomerIdPaged(
            @PathVariable Integer customerId,
            @RequestHeader(value = "X-Core-User-Id", required = false) Integer coreUserId,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        return ResponseEntity.ok(accountService.findTransactionsByCustomerId(customerId, coreUserId, page, size));
    }

    @PostMapping
    public ResponseEntity<AccountResponseDTO> create(
            @RequestBody AccountRequestDTO request,
            @RequestHeader(value = "X-Core-User-Id", required = false) Integer coreUserId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(accountService.create(request, coreUserId));
    }

    @PatchMapping("/{accountNumber}/inactivate")
    public ResponseEntity<AccountResponseDTO> inactivate(
            @PathVariable String accountNumber,
            @RequestHeader(value = "X-Core-User-Id", required = false) Integer coreUserId) {
        return ResponseEntity.ok(accountService.inactivate(accountNumber, coreUserId));
    }

    @PatchMapping("/{accountNumber}/block")
    public ResponseEntity<AccountResponseDTO> block(
            @PathVariable String accountNumber,
            @RequestHeader(value = "X-Core-User-Id", required = false) Integer coreUserId) {
        return ResponseEntity.ok(accountService.block(accountNumber, coreUserId));
    }

    @PatchMapping("/{accountNumber}/suspend")
    public ResponseEntity<AccountResponseDTO> suspend(
            @PathVariable String accountNumber,
            @RequestHeader(value = "X-Core-User-Id", required = false) Integer coreUserId) {
        return ResponseEntity.ok(accountService.suspend(accountNumber, coreUserId));
    }

    @PatchMapping("/{accountNumber}/activate")
    public ResponseEntity<AccountResponseDTO> activate(
            @PathVariable String accountNumber,
            @RequestHeader(value = "X-Core-User-Id", required = false) Integer coreUserId) {
        return ResponseEntity.ok(accountService.activate(accountNumber, coreUserId));
    }

    @PostMapping("/{accountNumber}/credit")
    public ResponseEntity<TransactionResponseDTO> credit(@PathVariable String accountNumber,
                                                         @RequestBody AmountRequest request) {
        return ResponseEntity.ok(accountService.credit(accountNumber, request.amount()));
    }

    @PostMapping("/transfer")
    public ResponseEntity<TransactionResponseDTO> transfer(@RequestBody TransferRequest request) {
        return ResponseEntity.ok(accountService.transfer(request.origin(), request.destination(), request.amount(), request.uuid()));
    }

    @GetMapping("/favorite/customer/{customerId}")
    public ResponseEntity<AccountResponseDTO> getFavorite(@PathVariable Integer customerId) {
        return ResponseEntity.ok(accountService.getFavoriteAccount(customerId));
    }

    @PutMapping("/{accountNumber}/favorite/customer/{customerId}")
    public ResponseEntity<AccountResponseDTO> updateFavorite(
            @PathVariable String accountNumber,
            @PathVariable Integer customerId) {
        return ResponseEntity.ok(accountService.updateFavoriteAccount(accountNumber, customerId));
    }

    record AmountRequest(BigDecimal amount) {}

    record TransferRequest(String origin, String destination, BigDecimal amount, String uuid) {}
}
