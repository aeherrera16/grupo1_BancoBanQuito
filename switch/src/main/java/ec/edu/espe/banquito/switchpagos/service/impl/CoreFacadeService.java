package ec.edu.espe.banquito.switchpagos.service.impl;

import java.math.BigDecimal;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class CoreFacadeService {

    private static final Logger logger = LoggerFactory.getLogger(CoreFacadeService.class);

    private final RestTemplate restTemplate;

    @Value("${core.api.base-url:http://localhost:8080}")
    private String coreBaseUrl;

    public CoreFacadeService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public Boolean cobrarComision(String cuentaEmpresa, BigDecimal total, String uuid) {
        logger.info("Cobro de comision al Core - Cuenta: {}, Monto: {}, UUID: {}", cuentaEmpresa, total, uuid);
        try {
            Map<String, Object> body = Map.of(
                    "accountNumber", cuentaEmpresa,
                    "amount", total,
                    "transactionUuid", uuid,
                    "subtypeCode", "COMISION",
                    "description", "Cobro de comision por pagos masivos"
            );
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    coreBaseUrl + "/core/integration/commission", body, Map.class);
            boolean success = response.getStatusCode().is2xxSuccessful();
            logger.info("Cobro de comision {}: {}", success ? "exitoso" : "fallido", uuid);
            return success;
        } catch (Exception e) {
            logger.error("Error al cobrar comision en el Core: {}", e.getMessage());
            return Boolean.FALSE;
        }
    }

    public Boolean validarCuentaEmpresa(String cuentaEmpresa) {
        logger.info("Validando cuenta empresa en Core: {}", cuentaEmpresa);
        try {
            ResponseEntity<Boolean> response = restTemplate.getForEntity(
                    coreBaseUrl + "/core/integration/account/{accountNumber}/valid",
                    Boolean.class, cuentaEmpresa);
            Boolean valid = Boolean.TRUE.equals(response.getBody());
            logger.info("Cuenta {} valida: {}", cuentaEmpresa, valid);
            return valid;
        } catch (Exception e) {
            logger.error("Error validando cuenta en el Core: {}", e.getMessage());
            return Boolean.FALSE;
        }
    }

    public Map<String, Object> consultarSaldo(String accountNumber) {
        logger.info("Consultando saldo en Core: {}", accountNumber);
        try {
            ResponseEntity<Map> response = restTemplate.getForEntity(
                    coreBaseUrl + "/core/integration/balance/{accountNumber}",
                    Map.class, accountNumber);
            return response.getBody();
        } catch (Exception e) {
            logger.error("Error consultando saldo en el Core: {}", e.getMessage());
            return Map.of();
        }
    }
}
