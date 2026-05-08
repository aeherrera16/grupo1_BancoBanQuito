package ec.edu.espe.banquito.core.exception;

public class CuentaInactivaException extends RuntimeException {

    public CuentaInactivaException(String numeroCuenta) {
        super("La cuenta no está activa: " + numeroCuenta);
    }
}
