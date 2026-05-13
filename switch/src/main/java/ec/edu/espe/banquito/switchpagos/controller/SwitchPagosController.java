package ec.edu.espe.banquito.switchpagos.controller;


import java.time.LocalDateTime;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
<<<<<<< HEAD
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:5174"})
=======
>>>>>>> a3271e9 (feat: Refactor core banking integration and add business day validation)
@RequestMapping("/api/switch")
public class SwitchPagosController {



    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
                "service", "switch-pagos",
                "status", "UP",
                "timestamp", LocalDateTime.now().toString()
        ));
    }

}
