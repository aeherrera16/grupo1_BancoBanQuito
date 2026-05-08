package ec.edu.espe.banquito.switchpagos.config;

import java.util.Arrays;

import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;

@Component
public class RequiredEnvironmentValidator {

    private static final String[] REQUIRED_ENV_VARS = {
            "DB_HOST",
            "DB_PORT",
            "DB_NAME"
    };

    private final Environment environment;

    public RequiredEnvironmentValidator(Environment environment) {
        this.environment = environment;
    }

    @PostConstruct
    public void validateRequiredEnvironmentVariables() {
        boolean isLocalProfile = Arrays.asList(environment.getActiveProfiles()).contains("local")
                || Arrays.asList(environment.getDefaultProfiles()).contains("local");
        if (isLocalProfile) {
            return;
        }

        for (String key : REQUIRED_ENV_VARS) {
            String value = environment.getProperty(key);
            if (value == null || value.isBlank()) {
                throw new IllegalStateException("Missing required environment variable: " + key);
            }
        }
    }
}
