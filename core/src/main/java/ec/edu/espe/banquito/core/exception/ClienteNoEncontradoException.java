package ec.edu.espe.banquito.core.exception;

public class ClienteNoEncontradoException extends RuntimeException {

    public ClienteNoEncontradoException(String identificacion) {
        super("Cliente no encontrado: " + identificacion);
    }
}
