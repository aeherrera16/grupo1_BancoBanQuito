package ec.edu.espe.banquito.core.controller;

import ec.edu.espe.banquito.core.model.Account;
import ec.edu.espe.banquito.core.service.AccountService;
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

    private final AccountService accountService;

    @GetMapping("/{accountNumber}")
    public ResponseEntity<Account> findByAccountNumber(@PathVariable String accountNumber) {
        return ResponseEntity.ok(accountService.findByAccountNumber(accountNumber));
    }

    @PostMapping
    public ResponseEntity<Account> create(@RequestBody Account account) {
        return ResponseEntity.status(HttpStatus.CREATED).body(accountService.create(account));
    }

    @PostMapping("/{accountNumber}/debit")
    public ResponseEntity<Void> debit(@PathVariable String accountNumber,
                                      @RequestBody AmountRequest request) {
        accountService.debitar(accountNumber, request.amount());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{accountNumber}/credit")
    public ResponseEntity<Void> credit(@PathVariable String accountNumber,
                                       @RequestBody AmountRequest request) {
        accountService.acreditar(accountNumber, request.amount());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/transfer")
    public ResponseEntity<Void> transfer(@RequestBody TransferRequest request) {
        accountService.transferir(request.origin(), request.destination(), request.amount(), request.uuid());
        return ResponseEntity.ok().build();
    }

    record AmountRequest(BigDecimal amount) {}

    record TransferRequest(String origin, String destination, BigDecimal amount, String uuid) {}
}
