package ec.edu.espe.banquito.switchpagos.service;

import java.math.BigDecimal;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class CoreBankingClient {

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
}
