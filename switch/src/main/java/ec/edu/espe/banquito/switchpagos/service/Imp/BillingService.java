package ec.edu.espe.banquito.switchpagos.service.Imp;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import ec.edu.espe.banquito.switchpagos.dto.BatchSummaryDTO;
import ec.edu.espe.banquito.switchpagos.enums.ChargeStatusEnum;
import ec.edu.espe.banquito.switchpagos.enums.PaymentDetailStatusEnum;
import ec.edu.espe.banquito.switchpagos.exception.ResourceNotFoundException;
import ec.edu.espe.banquito.switchpagos.model.PaymentBatch;
import ec.edu.espe.banquito.switchpagos.model.PaymentDetail;
import ec.edu.espe.banquito.switchpagos.model.ServiceCharge;
import ec.edu.espe.banquito.switchpagos.model.ServiceFeeRule;
import ec.edu.espe.banquito.switchpagos.model.SwitchParameter;
import ec.edu.espe.banquito.switchpagos.repository.PaymentBatchRepository;
import ec.edu.espe.banquito.switchpagos.repository.PaymentDetailRepository;
import ec.edu.espe.banquito.switchpagos.repository.ServiceChargeRepository;
import ec.edu.espe.banquito.switchpagos.repository.ServiceFeeRuleRepository;
import ec.edu.espe.banquito.switchpagos.repository.SwitchParameterRepository;

/**
 * RF-06: Servicio de Facturación y Comisiones.
 * Responsable de calcular y cobrar las comisiones por el servicio de pagos masivos.
 * 
 * Kevin - Comisiones y Reportes
 */
@Service
public class BillingService {

    private static final Logger logger = LoggerFactory.getLogger(BillingService.class);

    // Tasa de IVA vigente en Ecuador (15%)
    private static final BigDecimal IVA_RATE = new BigDecimal("0.15");

    private final ServiceFeeRuleRepository serviceFeeRuleRepository;
    private final ServiceChargeRepository serviceChargeRepository;
    private final PaymentBatchRepository paymentBatchRepository;
    private final PaymentDetailRepository paymentDetailRepository;
    private final SwitchParameterRepository switchParameterRepository;
    private final CoreFacadeService coreFacadeService;

    @Autowired
    public BillingService(ServiceFeeRuleRepository serviceFeeRuleRepository,
                          ServiceChargeRepository serviceChargeRepository,
                          PaymentBatchRepository paymentBatchRepository,
                          PaymentDetailRepository paymentDetailRepository,
                          SwitchParameterRepository switchParameterRepository,
                          CoreFacadeService coreFacadeService) {
        this.serviceFeeRuleRepository = serviceFeeRuleRepository;
        this.serviceChargeRepository = serviceChargeRepository;
        this.paymentBatchRepository = paymentBatchRepository;
        this.paymentDetailRepository = paymentDetailRepository;
        this.switchParameterRepository = switchParameterRepository;
        this.coreFacadeService = coreFacadeService;
    }

    /**
     * Cuenta el número de transacciones exitosas en una lista de detalles.
     *
     * @param detalles Lista de PaymentDetail del lote
     * @return Número de transacciones con status SUCCESS
     */
    public Integer countSuccess(List<PaymentDetail> detalles) {
        if (detalles == null || detalles.isEmpty()) {
            return 0;
        }

        Integer exitosos = 0;
        for (PaymentDetail detalle : detalles) {
            if (detalle.getStatus() == PaymentDetailStatusEnum.SUCCESS) {
                exitosos++;
            }
        }

        logger.debug("Transacciones exitosas contadas: {}/{}", exitosos, detalles.size());
        return exitosos;
    }

    /**
     * Obtiene la tarifa unitaria según el número de transacciones exitosas.
     * Consulta la tabla SERVICE_FEE_RULE para encontrar el rango aplicable.
     *
     * @param exitosos Número de transacciones exitosas
     * @return Tarifa unitaria por transacción (BigDecimal)
     * @throws IllegalStateException si no se encuentra una regla tarifaria aplicable
     */
    public BigDecimal obtenerTarifa(Integer exitosos) {
        logger.info("Buscando tarifa para {} transacciones exitosas", exitosos);

        Optional<ServiceFeeRule> reglaOpt = serviceFeeRuleRepository.findRuleByTransactionCount(exitosos);

        if (reglaOpt.isEmpty()) {
            logger.error("No se encontró regla tarifaria para {} transacciones", exitosos);
            throw new IllegalStateException(
                    "No se encontró regla tarifaria aplicable para " + exitosos + " transacciones exitosas");
        }

        ServiceFeeRule regla = reglaOpt.get();
        logger.info("Regla tarifaria encontrada: {} (rango: {}-{}, tarifa: {})",
                regla.getId(),
                regla.getMinSuccessfulTransactions(),
                regla.getMaxSuccessfulTransactions(),
                regla.getUnitFee());

        return regla.getUnitFee();
    }

    /**
     * RF-06: Genera el cobro de comisión para un lote procesado.
     * Este método es llamado por Johan (PaymentProcessor) al finalizar el procesamiento.
     *
     * Pasos:
     * 1. Contar transacciones exitosas
     * 2. Obtener tarifa aplicable
     * 3. Calcular: subtotal = tarifa * exitosos, iva = subtotal * 0.15, total = subtotal + iva
     * 4. Crear y guardar ServiceCharge
     * 5. Llamar a coreFacade.cobrarComision(...)
     * 6. Actualizar successful_records y rejected_records del batch
     *
     * @param batch    El lote de pagos procesado
     * @param detalles Lista de detalles del lote con sus estados finales
     */
    @Transactional
    public void generarCobro(PaymentBatch batch, List<PaymentDetail> detalles) {
        logger.info("=== INICIO GENERACIÓN DE COBRO RF-06 ===");
        logger.info("Lote ID: {}, Archivo: {}", batch.getId(), batch.getFileName());

        // 1. Contar transacciones exitosas y rechazadas
        Integer exitosos = countSuccess(detalles);
        Integer rechazados = detalles != null ? detalles.size() - exitosos : 0;
        
        logger.info("Resultado del lote - Exitosos: {}, Rechazados: {}", exitosos, rechazados);

        // 2. Obtener la regla tarifaria aplicable
        Optional<ServiceFeeRule> reglaOpt = serviceFeeRuleRepository.findRuleByTransactionCount(exitosos);
        
        if (reglaOpt.isEmpty()) {
            logger.error("No se encontró regla tarifaria para {} transacciones", exitosos);
            throw new IllegalStateException(
                    "No se encontró regla tarifaria aplicable para " + exitosos + " transacciones exitosas");
        }
        
        ServiceFeeRule regla = reglaOpt.get();
        BigDecimal tarifa = regla.getUnitFee();
        logger.info("Tarifa aplicada: {} por transacción (Regla ID: {})", tarifa, regla.getId());

        // 3. Calcular montos de comisión
        BigDecimal subtotal = tarifa.multiply(BigDecimal.valueOf(exitosos))
                .setScale(2, RoundingMode.HALF_UP);
        BigDecimal iva = subtotal.multiply(IVA_RATE)
                .setScale(2, RoundingMode.HALF_UP);
        BigDecimal total = subtotal.add(iva)
                .setScale(2, RoundingMode.HALF_UP);

        logger.info("Cálculo de comisión:");
        logger.info("  Subtotal (tarifa x exitosos): {} x {} = {}", tarifa, exitosos, subtotal);
        logger.info("  IVA (15%): {}", iva);
        logger.info("  Total: {}", total);

        // 4. Crear y guardar el registro de cargo (ServiceCharge)
        ServiceCharge cargo = new ServiceCharge();
        cargo.setPaymentBatch(batch);
        cargo.setServiceFeeRule(regla);
        cargo.setSuccessfulTransactions(exitosos);
        cargo.setUnitFee(tarifa);
        cargo.setCommissionSubtotal(subtotal);
        cargo.setVatAmount(iva);
        cargo.setTotalCharge(total);
        cargo.setChargeStatus(ChargeStatusEnum.PENDING);

        ServiceCharge cargoGuardado = serviceChargeRepository.save(cargo);
        logger.info("ServiceCharge creado con ID: {}", cargoGuardado.getId());

        // 5. Llamar al Core para cobrar la comisión
        String uuid = UUID.randomUUID().toString();
        String cuentaEmpresa = obtenerCuentaEmpresaDefault();

        logger.info("Enviando cobro al Core - Cuenta: {}, Total: {}, UUID: {}",
                   cuentaEmpresa, total, uuid);

        boolean cobroExitoso = coreFacadeService.cobrarComision(cuentaEmpresa, total, uuid);

        if (cobroExitoso) {
            cargoGuardado.setChargeStatus(ChargeStatusEnum.CHARGED);
            cargoGuardado.setChargedAt(LocalDateTime.now());
            logger.info("Cobro exitoso - Status actualizado a CHARGED");
        } else {
            cargoGuardado.setChargeStatus(ChargeStatusEnum.REJECTED);
            logger.warn("Cobro rechazado - Status actualizado a REJECTED");
        }

        serviceChargeRepository.save(cargoGuardado);

        // 6. Actualizar contadores del lote
        batch.setSuccessfulRecords(exitosos);
        batch.setRejectedRecords(rechazados);
        paymentBatchRepository.save(batch);

        logger.info("Lote actualizado - successful_records: {}, rejected_records: {}", 
                   exitosos, rechazados);
        logger.info("=== FIN GENERACIÓN DE COBRO RF-06 ===");
    }

    // ==================== MÉTODOS DE REPORTES ====================

    /**
     * Obtiene el resumen de un lote procesado como DTO.
     *
     * @param batchId ID del lote
     * @return BatchSummaryDTO con información consolidada del lote y su comisión
     * @throws ResourceNotFoundException si el lote no existe
     */
    public BatchSummaryDTO obtenerResumenBatch(Integer batchId) {
        logger.info("Generando resumen para lote ID: {}", batchId);

        PaymentBatch batch = paymentBatchRepository.findById(batchId)
                .orElseThrow(() -> new ResourceNotFoundException("Lote no encontrado: " + batchId));

        Optional<ServiceCharge> chargeOpt = serviceChargeRepository.findByPaymentBatchId(batchId);

        BatchSummaryDTO resumen = new BatchSummaryDTO();
        resumen.setBatchId(batch.getId());
        resumen.setFileName(batch.getFileName());
        resumen.setRuc(batch.getRuc());
        resumen.setStatus(batch.getStatus() != null ? batch.getStatus().name() : null);
        resumen.setTotalRecords(batch.getHeaderTotalRecords());
        resumen.setTotalAmount(batch.getHeaderTotalAmount());
        resumen.setSuccessfulRecords(batch.getSuccessfulRecords());
        resumen.setRejectedRecords(batch.getRejectedRecords());
        resumen.setReceivedAt(batch.getReceivedAt());

        if (chargeOpt.isPresent()) {
            ServiceCharge charge = chargeOpt.get();
            resumen.setCommissionSubtotal(charge.getCommissionSubtotal());
            resumen.setVatAmount(charge.getVatAmount());
            resumen.setTotalCharge(charge.getTotalCharge());
            resumen.setChargeStatus(charge.getChargeStatus() != null ? charge.getChargeStatus().name() : null);
            resumen.setChargedAt(charge.getChargedAt());
        }

        logger.info("Resumen generado para lote: {}", resumen);
        return resumen;
    }

    /**
     * Obtiene todos los detalles de pago de un lote.
     *
     * @param batchId ID del lote
     * @return Lista de PaymentDetail del lote
     * @throws ResourceNotFoundException si el lote no existe
     */
    public List<PaymentDetail> obtenerDetallesBatch(Integer batchId) {
        logger.info("Consultando detalles para lote ID: {}", batchId);

        // Verificar que el lote existe
        PaymentBatch batch = paymentBatchRepository.findById(batchId)
                .orElseThrow(() -> new ResourceNotFoundException("Lote no encontrado: " + batchId));

        List<PaymentDetail> detalles = paymentDetailRepository.findByPaymentBatchId(batchId);
        logger.info("Se encontraron {} detalles para el lote", detalles.size());

        return detalles;
    }

    /**
     * Obtiene el cargo de servicio para un lote.
     *
     * @param batchId ID del lote
     * @return Optional con ServiceCharge si existe, vacío si no
     * @throws ResourceNotFoundException si el lote no existe
     */
    public Optional<ServiceCharge> obtenerCargoServicio(Integer batchId) {
        logger.info("Consultando cargo de servicio para lote ID: {}", batchId);

        // Verificar que el lote existe
        paymentBatchRepository.findById(batchId)
                .orElseThrow(() -> new ResourceNotFoundException("Lote no encontrado: " + batchId));

        return serviceChargeRepository.findByPaymentBatchId(batchId);
    }

    /**
     * Obtiene todos los cargos de servicio registrados.
     *
     * @return Lista de todos los ServiceCharge
     */
    public List<ServiceCharge> obtenerTodosCargos() {
        logger.info("Consultando todos los cargos de servicio");
        return serviceChargeRepository.findAll();
    }

    /**
     * Obtiene la cuenta empresa desde SwitchParameter.
     * Busca el parámetro con código "EMPRESA_ACCOUNT" por defecto.
     *
     * @param paramCode Código del parámetro (ej: "EMPRESA_ACCOUNT")
     * @return Número de cuenta de la empresa
     * @throws ResourceNotFoundException si el parámetro no existe
     */
    public String obtenerCuentaEmpresa(String paramCode) {
        logger.info("Obteniendo cuenta empresa desde parámetro: {}", paramCode);

        SwitchParameter param = switchParameterRepository.findById(paramCode)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Parámetro no encontrado: " + paramCode));

        String cuentaEmpresa = param.getValueString();
        logger.info("Cuenta empresa obtenida: {}", cuentaEmpresa);

        return cuentaEmpresa;
    }

    /**
     * Obtiene la cuenta empresa con código por defecto "EMPRESA_ACCOUNT".
     *
     * @return Número de cuenta de la empresa
     */
    public String obtenerCuentaEmpresaDefault() {
        return obtenerCuentaEmpresa("EMPRESA_ACCOUNT");
    }
}
