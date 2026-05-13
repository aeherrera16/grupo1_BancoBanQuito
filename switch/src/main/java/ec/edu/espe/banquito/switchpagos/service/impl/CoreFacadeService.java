package ec.edu.espe.banquito.switchpagos.service.impl;

import java.math.BigDecimal;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import ec.edu.espe.banquito.switchpagos.service.ICoreBankingFacade;

@Service
public class CoreFacadeService implements ICoreBankingFacade {

    private static final Logger logger = LoggerFactory.getLogger(CoreFacadeService.class);

    private final RestTemplate restTemplate;

    @Value("${core.api.base-url:http://localhost:8080}")
    private String coreBaseUrl;

    public CoreFacadeService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public Boolean chargeCommission(String companyAccount, BigDecimal total, String uuid) {
        logger.info("Charging commission to Core - Account: {}, Amount: {}, UUID: {}", companyAccount, total, uuid);
        try {
            Map<String, Object> body = Map.of(
                    "accountNumber", companyAccount,
                    "amount", total,
                    "transactionUuid", uuid,
                    "subtypeCode", "COMISION",
                    "description", "Cobro de comision por pagos masivos"
            );
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    coreBaseUrl + "/core/integration/commission", body, Map.class);
            boolean success = response.getStatusCode().is2xxSuccessful();
            logger.info("Commission charge {}: {}", success ? "successful" : "failed", uuid);
            return success;
        } catch (Exception e) {
            logger.error("Error charging commission in Core: {}", e.getMessage());
            return Boolean.FALSE;
        }
    }

    public Boolean validateCompanyAccount(String companyAccount) {
        logger.info("Validating company account in Core: {}", companyAccount);
        try {
            ResponseEntity<Boolean> response = restTemplate.getForEntity(
                    coreBaseUrl + "/core/integration/account/{accountNumber}/valid",
                    Boolean.class, companyAccount);
            Boolean valid = Boolean.TRUE.equals(response.getBody());
            logger.info("Account {} valid: {}", companyAccount, valid);
            return valid;
        } catch (Exception e) {
            logger.error("Error validating account in Core: {}", e.getMessage());
            return Boolean.FALSE;
        }
    }

    public Map<String, Object> queryBalance(String accountNumber) {
        logger.info("Querying balance in Core: {}", accountNumber);
        try {
            ResponseEntity<Map> response = restTemplate.getForEntity(
                    coreBaseUrl + "/core/integration/balance/{accountNumber}",
                    Map.class, accountNumber);
            return response.getBody();
        } catch (Exception e) {
            logger.error("Error querying balance in Core: {}", e.getMessage());
            return Map.of();
        }
    }
}
