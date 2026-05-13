<<<<<<< HEAD
package ec.edu.espe.banquito.switchpagos.service.impl;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import ec.edu.espe.banquito.switchpagos.service.ICoreBankingClient;

@Service("coreBankingClientImpl")
public class CoreBankingClient implements ICoreBankingClient {

    private static final Logger logger = LoggerFactory.getLogger(CoreBankingClient.class);

    private final RestClient restClient;

    public CoreBankingClient(@Value("${app.core.base-url:http://localhost:8080}") String coreBaseUrl) {
        this.restClient = RestClient.builder()
                .baseUrl(coreBaseUrl)
                .build();
    }

    public void transfer(String origin, String destination, BigDecimal amount, String uuid) {
        restClient.post()
                .uri("/core/accounts/transfer")
                .body(Map.of(
                        "origin", origin,
                        "destination", destination,
                        "amount", amount,
                        "uuid", uuid
                ))
                .retrieve()
                .toBodilessEntity();
    }

    public boolean isHoliday(LocalDate date) {
        try {
            Boolean result = restClient.get()
                    .uri("/core/v1/holidays/{date}", date.toString())
                    .retrieve()
                    .body(Boolean.class);
            return Boolean.TRUE.equals(result);
        } catch (Exception e) {
            logger.warn("No se pudo consultar feriados al core para la fecha {}: {}. Se asume dia habil.", date, e.getMessage());
            return false;
        }
    }

    @SuppressWarnings("unchecked")
    public String getFavoriteAccountNumber() {
        try {
            Map<String, Object> response = restClient.get()
                    .uri("/core/v1/accounts/default/favorite")
                    .retrieve()
                    .body(Map.class);
            if (response != null && response.containsKey("accountNumber")) {
                return (String) response.get("accountNumber");
            }
            logger.warn("La respuesta del core no contiene accountNumber para cuenta favorita");
            return null;
        } catch (Exception e) {
            logger.warn("No se pudo obtener cuenta favorita del core: {}", e.getMessage());
            return null;
        }
    }
}
=======
package ec.edu.espe.banquito.switchpagos.service.impl;

import java.math.BigDecimal;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import ec.edu.espe.banquito.switchpagos.dto.TransferResponseDTO;
import ec.edu.espe.banquito.switchpagos.service.ICoreBankingClient;

@Service("coreBankingClientImpl")
public class CoreBankingClient implements ICoreBankingClient {

    private final RestClient restClient;

    public CoreBankingClient(@Value("${app.core.base-url}") String coreBaseUrl) {
        this.restClient = RestClient.builder()
                .baseUrl(coreBaseUrl)
                .build();
    }

    @Override
    public TransferResponseDTO transfer(String origin, String destination, String beneficiaryIdentification,
                                        BigDecimal amount, String uuid) {
        return restClient.post()
                .uri("/core/v1/integration/transfer")
                .body(Map.of(
                        "originAccountNumber", origin,
                        "destinationAccountNumber", destination,
                        "beneficiaryIdentification", beneficiaryIdentification,
                        "amount", amount,
                        "transactionUuid", uuid))
                .retrieve()
                .body(TransferResponseDTO.class);
    }
}
>>>>>>> a3271e9 (feat: Refactor core banking integration and add business day validation)
