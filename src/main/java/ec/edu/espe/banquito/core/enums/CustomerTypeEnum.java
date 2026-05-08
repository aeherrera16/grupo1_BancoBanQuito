package ec.edu.espe.banquito.core.enums;

import lombok.Getter;

@Getter
public enum CustomerTypeEnum {

    NATURAL("NATURAL"),
    JURIDICO("JURIDICO");

    private final String value;

    CustomerTypeEnum(String value) {
        this.value = value;
    }
}
