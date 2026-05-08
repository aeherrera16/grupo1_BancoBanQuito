package ec.edu.espe.banquito.switchpagos.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

@Component
@ConfigurationProperties(prefix = "app.validation")
@Validated
public class ValidationRulesProperties {

    @Min(1)
    @Max(365)
    private int duplicateWindowDays = 30;

    public int getDuplicateWindowDays() {
        return duplicateWindowDays;
    }

    public void setDuplicateWindowDays(int duplicateWindowDays) {
        this.duplicateWindowDays = duplicateWindowDays;
    }
}
