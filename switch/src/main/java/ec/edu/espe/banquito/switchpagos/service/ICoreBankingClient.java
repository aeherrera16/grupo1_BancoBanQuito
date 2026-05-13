<<<<<<< HEAD
package ec.edu.espe.banquito.switchpagos.service;

import java.math.BigDecimal;

/**
 * Interfaz para el cliente del Core Banking.
 * Proporciona métodos para interactuar con el sistema bancario central.
 */
public interface ICoreBankingClient {
    
    /**
     * Realiza una transferencia entre cuentas.
     * 
     * @param origin Cuenta de origen
     * @param destination Cuenta de destino
     * @param amount Monto a transferir
     * @param uuid UUID único de la transacción
     */
    void transfer(String origin, String destination, BigDecimal amount, String uuid);
}
=======
package ec.edu.espe.banquito.switchpagos.service;

import java.math.BigDecimal;

import ec.edu.espe.banquito.switchpagos.dto.TransferResponseDTO;

/**
 * Interfaz para el cliente del Core Banking.
 * Proporciona métodos para interactuar con el sistema bancario central.
 */
public interface ICoreBankingClient {
    
    /**
     * Realiza una transferencia entre cuentas.
     * 
     * @param origin Cuenta de origen
     * @param destination Cuenta de destino
     * @param amount Monto a transferir
     * @param uuid UUID único de la transacción
     */
    TransferResponseDTO transfer(String origin, String destination, String beneficiaryIdentification,
                                 BigDecimal amount, String uuid);
}
>>>>>>> a3271e9 (feat: Refactor core banking integration and add business day validation)
