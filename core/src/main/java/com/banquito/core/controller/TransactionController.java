package com.banquito.core.controller;

import com.banquito.core.dto.TransactionRequestDTO;
import com.banquito.core.dto.TransactionResponseDTO;
import com.banquito.core.dto.TransferRequestDTO;
import com.banquito.core.service.ITransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/core/v1/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final ITransactionService transactionService;

    @GetMapping("/history/{accountNumber}")
    public ResponseEntity<List<TransactionResponseDTO>> getHistory(@PathVariable String accountNumber) {
        return ResponseEntity.ok(transactionService.findHistoryByAccountNumber(accountNumber));
    }

    @PostMapping("/debits")
    public ResponseEntity<TransactionResponseDTO> debit(@RequestBody TransactionRequestDTO request) {
        return ResponseEntity.ok(transactionService.debit(
                request.getAccountNumber(),
                request.getAmount(),
                request.getTransactionUuid(),
                request.getSubtypeCode(),
                request.getDescription()
        ));
    }

    @PostMapping("/credits")
    public ResponseEntity<TransactionResponseDTO> credit(@RequestBody TransactionRequestDTO request) {
        return ResponseEntity.ok(transactionService.credit(
                request.getAccountNumber(),
                request.getAmount(),
                request.getTransactionUuid(),
                request.getSubtypeCode(),
                request.getDescription()
        ));
    }

    @PostMapping("/transfers")
    public ResponseEntity<TransactionResponseDTO> transfer(@RequestBody TransferRequestDTO request) {
        return ResponseEntity.ok(transactionService.transfer(
                request.getOriginAccountNumber(),
                request.getDestinationAccountNumber(),
                request.getAmount(),
                request.getTransactionUuid(),
                request.getSubtypeCode(),
                request.getDescription()
        ));
    }
}
