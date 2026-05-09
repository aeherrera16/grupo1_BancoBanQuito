package com.banquito.core.controller;

import com.banquito.core.dto.TransactionRequestDTO;
import com.banquito.core.dto.TransactionResponseDTO;
import com.banquito.core.dto.TransferRequestDTO;
import com.banquito.core.service.ITransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/core/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final ITransactionService transactionService;

    @PostMapping("/debits")
    public ResponseEntity<TransactionResponseDTO> debit(@RequestBody TransactionRequestDTO request) {
        return ResponseEntity.ok(transactionService.debitar(
                request.getAccountNumber(),
                request.getAmount(),
                request.getTransactionUuid(),
                request.getSubtypeCode(),
                request.getDescription()
        ));
    }

    @PostMapping("/credits")
    public ResponseEntity<TransactionResponseDTO> credit(@RequestBody TransactionRequestDTO request) {
        return ResponseEntity.ok(transactionService.acreditar(
                request.getAccountNumber(),
                request.getAmount(),
                request.getTransactionUuid(),
                request.getSubtypeCode(),
                request.getDescription()
        ));
    }

    @PostMapping("/transfers")
    public ResponseEntity<TransactionResponseDTO> transfer(@RequestBody TransferRequestDTO request) {
        return ResponseEntity.ok(transactionService.transferir(
                request.getOriginAccountNumber(),
                request.getDestinationAccountNumber(),
                request.getAmount(),
                request.getTransactionUuid(),
                request.getSubtypeCode(),
                request.getDescription()
        ));
    }
}
