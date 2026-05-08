package ec.edu.espe.banquito.core.controller;

import ec.edu.espe.banquito.core.model.Branch;
import ec.edu.espe.banquito.core.service.BranchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/core/branches")
@RequiredArgsConstructor
public class BranchController {

    private final BranchService branchService;

    @GetMapping
    public ResponseEntity<List<Branch>> findAll() {
        return ResponseEntity.ok(branchService.findAll());
    }

    @GetMapping("/{code}")
    public ResponseEntity<Branch> findByCode(@PathVariable String code) {
        return ResponseEntity.ok(branchService.findByCode(code));
    }

    @PostMapping
    public ResponseEntity<Branch> create(@RequestBody Branch branch) {
        return ResponseEntity.status(HttpStatus.CREATED).body(branchService.create(branch));
    }
}
