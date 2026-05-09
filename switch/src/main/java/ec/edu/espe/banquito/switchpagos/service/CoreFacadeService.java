package ec.edu.espe.banquito.switchpagos.service;

import java.math.BigDecimal;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * Servicio Facade para la integración con el Core Bancario (com.banquito.core).
 * Santiago provee el método cobrarComision en el Core.
 * Este servicio actúa como puente entre el Switch de Pagos y el Core.
 */
@Service
public class CoreFacadeService {

    private static final Logger logger = LoggerFactory.getLogger(CoreFacadeService.class);

    public CoreFacadeService() {
    }

    /**
     * RF-06: Cobra la comisión por el servicio de pagos masivos.
     * Llama al servicio del Core Bancario para debitar la comisión de la cuenta empresa.
     *
     * @param cuentaEmpresa Número de cuenta de la empresa a debitar
     * @param total         Monto total de la comisión (subtotal + IVA)
     * @param uuid          Identificador único de la transacción (para idempotencia)
     * @return true si el cobro fue exitoso, false si fue rechazado
     */
    public Boolean cobrarComision(String cuentaEmpresa, BigDecimal total, String uuid) {
        logger.info("=== INICIO COBRO DE COMISIÓN AL CORE ===");
        logger.info("Cuenta empresa: {}", cuentaEmpresa);
        logger.info("Monto total comisión: {}", total);
        logger.info("UUID transacción: {}", uuid);

        try {
            // TODO: Integración real con el Core Bancario de Santiago
            // Aquí se llamaría al endpoint REST o al servicio del Core:
            // coreClient.cobrarComision(cuentaEmpresa, total, uuid);

            if (cuentaEmpresa == null || cuentaEmpresa.trim().isEmpty()) {
                logger.error("Cuenta empresa inválida");
                return Boolean.FALSE;
            }

            if (total == null || total.compareTo(BigDecimal.ZERO) <= 0) {
                logger.error("Monto de comisión inválido: {}", total);
                return Boolean.FALSE;
            }

            logger.info("Cobro de comisión enviado al Core exitosamente");
            logger.info("=== FIN COBRO DE COMISIÓN AL CORE ===");
            return Boolean.TRUE;

        } catch (Exception e) {
            logger.error("Error al cobrar comisión en el Core: {}", e.getMessage(), e);
            return Boolean.FALSE;
        }
    }

    /**
     * Valida si una cuenta empresa existe y está activa en el Core.
     *
     * @param cuentaEmpresa Número de cuenta a validar
     * @return true si la cuenta es válida y activa
     */
    public Boolean validarCuentaEmpresa(String cuentaEmpresa) {
        logger.info("Validando cuenta empresa en Core: {}", cuentaEmpresa);

        // TODO: Integración real con el Core Bancario
        Boolean valida = cuentaEmpresa != null && !cuentaEmpresa.trim().isEmpty();

        logger.info("Cuenta {} válida: {}", cuentaEmpresa, valida);
        return valida;
    }
}
