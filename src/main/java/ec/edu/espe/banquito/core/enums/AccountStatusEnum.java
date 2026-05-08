package ec.edu.espe.banquito.core.enums;

import lombok.Getter;

@Getter
public enum AccountStatusEnum {

    ACTIVO("ACTIVO"),
    INACTIVO("INACTIVO"),
    BLOQUEADO("BLOQUEADO");

    private final String value;

    AccountStatusEnum(String value) {
        this.value = value;
    }
}
