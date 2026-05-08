package com.banquito.core.controller;

import com.banquito.core.service.ITransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/core/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final ITransactionService transactionService;

    @PostMapping("/debitar")
    public ResponseEntity<?> debitar(@RequestBody Map<String, Object> req) {
        transactionService.debitar(
                (String) req.get("cuenta"),
                new BigDecimal(req.get("monto").toString()),
                (String) req.get("uuid"),
                (String) req.get("subtipo")
        );
        return ResponseEntity.ok().body(Map.of("message", "Débito procesado"));
    }

    @PostMapping("/acreditar")
    public ResponseEntity<?> acreditar(@RequestBody Map<String, Object> req) {
        transactionService.acreditar(
                (String) req.get("cuenta"),
                new BigDecimal(req.get("monto").toString()),
                (String) req.get("uuid"),
                (String) req.get("subtipo")
        );
        return ResponseEntity.ok().body(Map.of("message", "Crédito procesado"));
    }

    @PostMapping("/transferir")
    public ResponseEntity<?> transferir(@RequestBody Map<String, Object> req) {
        transactionService.transferir(
                (String) req.get("origen"),
                (String) req.get("destino"),
                new BigDecimal(req.get("monto").toString()),
                (String) req.get("uuid")
        );
        return ResponseEntity.ok().body(Map.of("message", "Transferencia procesada"));
    }
}