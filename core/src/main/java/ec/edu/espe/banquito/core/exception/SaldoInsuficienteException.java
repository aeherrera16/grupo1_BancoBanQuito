package ec.edu.espe.banquito.core.exception;

public class SaldoInsuficienteException extends RuntimeException {

    public SaldoInsuficienteException(String numeroCuenta) {
        super("Saldo insuficiente en la cuenta: " + numeroCuenta);
    }
}
