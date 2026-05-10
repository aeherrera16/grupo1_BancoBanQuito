package ec.edu.espe.banquito.emailservice.client;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

/**
 * Cliente para comunicarse con el API del Switch principal.
 */
@Component
public class SwitchApiClient {

    private static final Logger LOG = LoggerFactory.getLogger(SwitchApiClient.class);

    private final RestTemplate restTemplate;

    @Value("${switch.api.base-url}")
    private String baseUrl;

    @Value("${switch.api.endpoint}")
    private String endpoint;

    @Value("${switch.api.timeout}")
    private int timeout;

    public SwitchApiClient() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * Envía un archivo CSV al switch principal via API REST
     */
    public boolean sendFileToSwitch(File file) {
        try {
            String url = baseUrl + endpoint;
            LOG.info("🔗 Conectando con el Switch principal...");
            LOG.info("📤 Enviando archivo {} al switch: {}", file.getName(), url);

            // Preparar multipart request
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            
            // Convertir archivo a Resource
            Resource fileResource = new ByteArrayResource(Files.readAllBytes(file.toPath())) {
                @Override
                public String getFilename() {
                    return file.getName();
                }
            };
            
            body.add("file", fileResource);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            
            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            
            // Enviar request
            ResponseEntity<String> response = restTemplate.postForEntity(url, requestEntity, String.class);
            
            if (response.getStatusCode().is2xxSuccessful()) {
                LOG.info("✅ Conexión exitosa con el Switch principal");
                LOG.info("📄 Archivo {} enviado exitosamente. Response: {}", file.getName(), response.getBody());
                return true;
            } else {
                LOG.error("❌ Error enviando archivo al Switch. Status: {}", response.getStatusCode());
                return false;
            }
            
        } catch (IOException e) {
            LOG.error("❌ Error leyendo archivo {}: {}", file.getName(), e.getMessage());
            return false;
        } catch (Exception e) {
            LOG.error("❌ Error de conexión con el Switch principal: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Verifica si el switch está disponible
     */
    public boolean isSwitchAvailable() {
        try {
            String url = baseUrl + "/actuator/health";
            LOG.debug("🔍 Verificando disponibilidad del Switch principal: {}", url);
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            if (response.getStatusCode().is2xxSuccessful()) {
                LOG.debug("✅ Switch principal disponible");
            }
            return response.getStatusCode().is2xxSuccessful();
        } catch (Exception e) {
            LOG.warn("❌ Switch principal no disponible: {}", e.getMessage());
            return false;
        }
    }
}
