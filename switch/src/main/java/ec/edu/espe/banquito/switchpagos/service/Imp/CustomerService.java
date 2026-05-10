package ec.edu.espe.banquito.switchpagos.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

/**
 * Servicio para validación de clientes y servicios activos.
 * En producción, esto se integraría con el sistema core de clientes.
 */
@Service
public class CustomerService {

    @Value("${app.validation.customer-service.enabled:true}")
    private boolean customerValidationEnabled;

    // Base de datos simulada de clientes con servicio de pagos masivos activo
    // En producción, esto sería una llamada al servicio de clientes del core bancario
    private static final Map<String, CustomerInfo> ACTIVE_CUSTOMERS = new HashMap<>();
    
    static {
        // Clientes de ejemplo con servicio de pagos masivos activo
        ACTIVE_CUSTOMERS.put("1712345678001", new CustomerInfo("1712345678001", "Empresa ABC S.A.", true));
        ACTIVE_CUSTOMERS.put("1798765432001", new CustomerInfo("1798765432001", "Corporación XYZ", true));
        ACTIVE_CUSTOMERS.put("2011122334001", new CustomerInfo("2011122334001", "Negocios QWERTY", true));
        ACTIVE_CUSTOMERS.put("1755566677001", new CustomerInfo("1755566677001", "Industrias ASDF", false)); // Inactivo
    }

    /**
     * Verifica si un cliente tiene el servicio de pagos masivos activo.
     * 
     * @param ruc RUC del cliente a validar
     * @return true si el cliente existe y tiene el servicio activo, false otherwise
     */
    public boolean hasActiveMassPaymentService(String ruc) {
        if (!customerValidationEnabled) {
            // En desarrollo/desactivado, asumimos que todos los clientes son válidos
            return true;
        }
        
        if (ruc == null || ruc.trim().isEmpty()) {
            return false;
        }
        
        CustomerInfo customer = ACTIVE_CUSTOMERS.get(ruc.trim());
        return customer != null && customer.hasActiveMassPaymentService();
    }

    /**
     * Obtiene información del cliente (para logging y debugging).
     */
    public CustomerInfo getCustomerInfo(String ruc) {
        if (ruc == null) return null;
        return ACTIVE_CUSTOMERS.get(ruc.trim());
    }

    /**
     * Clase interna para representar información del cliente.
     */
    public static class CustomerInfo {
        private final String ruc;
        private final String businessName;
        private final boolean massPaymentServiceActive;

        public CustomerInfo(String ruc, String businessName, boolean massPaymentServiceActive) {
            this.ruc = ruc;
            this.businessName = businessName;
            this.massPaymentServiceActive = massPaymentServiceActive;
        }

        public String getRuc() {
            return ruc;
        }

        public String getBusinessName() {
            return businessName;
        }

        public boolean hasActiveMassPaymentService() {
            return massPaymentServiceActive;
        }

        @Override
        public String toString() {
            return String.format("Customer{ruc='%s', name='%s', active=%s}", 
                               ruc, businessName, massPaymentServiceActive);
        }
    }
}
