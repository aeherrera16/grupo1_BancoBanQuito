package ec.edu.espe.banquito.core.exception;

public class TransaccionDuplicadaException extends RuntimeException {

    public TransaccionDuplicadaException(String uuid) {
        super("Transacción duplicada para el UUID: " + uuid);
    }
}
