package ec.edu.espe.banquito.switchpagos.service.impl;

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
import ec.edu.espe.banquito.switchpagos.service.IBillingService;
import ec.edu.espe.banquito.switchpagos.service.ICoreBankingFacade;

/**
 * RF-06: Servicio de Facturación y Comisiones.
 * Responsable de calcular y cobrar las comisiones por el servicio de pagos masivos.
 * 
 * Kevin - Comisiones y Reportes
 */
@Service
public class BillingService implements IBillingService {

    private static final Logger logger = LoggerFactory.getLogger(BillingService.class);

    // Tasa de IVA vigente en Ecuador (15%)
    private static final BigDecimal IVA_RATE = new BigDecimal("0.15");

    private final ServiceFeeRuleRepository serviceFeeRuleRepository;
    private final ServiceChargeRepository serviceChargeRepository;
    private final PaymentBatchRepository paymentBatchRepository;
    private final PaymentDetailRepository paymentDetailRepository;
    private final SwitchParameterRepository switchParameterRepository;
    private final ICoreBankingFacade coreFacadeService;

    @Autowired
    public BillingService(ServiceFeeRuleRepository serviceFeeRuleRepository,
                          ServiceChargeRepository serviceChargeRepository,
                          PaymentBatchRepository paymentBatchRepository,
                          PaymentDetailRepository paymentDetailRepository,
                          SwitchParameterRepository switchParameterRepository,
                          ICoreBankingFacade coreFacadeService) {
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
     * Gets the unit fee based on the number of successful transactions.
     * Queries the SERVICE_FEE_RULE table to find the applicable range.
     *
     * @param successful Number of successful transactions
     * @return Unit fee per transaction (BigDecimal)
     * @throws IllegalStateException if no applicable fee rule is found
     */
    public BigDecimal getFee(Integer successful) {
        logger.info("Looking for fee for {} successful transactions", successful);

        Optional<ServiceFeeRule> ruleOpt = serviceFeeRuleRepository.findRuleByTransactionCount(successful);

        if (ruleOpt.isEmpty()) {
            logger.error("No fee rule found for {} transactions", successful);
            throw new IllegalStateException(
                    "No applicable fee rule found for " + successful + " successful transactions");
        }

        ServiceFeeRule rule = ruleOpt.get();
        logger.info("Fee rule found: {} (range: {}-{}, fee: {})",
                rule.getId(),
                rule.getMinSuccessfulTransactions(),
                rule.getMaxSuccessfulTransactions(),
                rule.getUnitFee());

        return rule.getUnitFee();
    }

    /**
     * RF-06: Generates commission charge for a processed batch.
     * This method is called by Johan (PaymentProcessor) after processing completion.
     *
     * Steps:
     * 1. Count successful transactions
     * 2. Get applicable fee
     * 3. Calculate: subtotal = fee * successful, vat = subtotal * 0.15, total = subtotal + vat
     * 4. Create and save ServiceCharge
     * 5. Call coreFacade.chargeCommission(...)
     * 6. Update successful_records and rejected_records of batch
     *
     * @param batch    The processed payment batch
     * @param details  List of batch details with their final states
     */
    @Transactional
    public void generateCharge(PaymentBatch batch, List<PaymentDetail> details) {
        logger.info("=== START CHARGE GENERATION RF-06 ===");
        logger.info("Batch ID: {}, File: {}", batch.getId(), batch.getFileName());

        // 1. Count successful and rejected transactions
        Integer successful = countSuccess(details);
        Integer rejected = details != null ? details.size() - successful : 0;
        
        logger.info("Batch result - Successful: {}, Rejected: {}", successful, rejected);

        // 2. Get the applicable fee rule
        Optional<ServiceFeeRule> ruleOpt = serviceFeeRuleRepository.findRuleByTransactionCount(successful);
        
        if (ruleOpt.isEmpty()) {
            logger.error("No fee rule found for {} transactions", successful);
            throw new IllegalStateException(
                    "No applicable fee rule found for " + successful + " successful transactions");
        }
        
        ServiceFeeRule rule = ruleOpt.get();
        BigDecimal fee = rule.getUnitFee();
        logger.info("Applied fee: {} per transaction (Rule ID: {})", fee, rule.getId());

        // 3. Calculate commission amounts
        BigDecimal subtotal = fee.multiply(BigDecimal.valueOf(successful))
                .setScale(2, RoundingMode.HALF_UP);
        BigDecimal vat = subtotal.multiply(IVA_RATE)
                .setScale(2, RoundingMode.HALF_UP);
        BigDecimal total = subtotal.add(vat)
                .setScale(2, RoundingMode.HALF_UP);

        logger.info("Commission calculation:");
        logger.info("  Subtotal (fee x successful): {} x {} = {}", fee, successful, subtotal);
        logger.info("  VAT (15%): {}", vat);
        logger.info("  Total: {}", total);

        // 4. Create and save charge record (ServiceCharge)
        ServiceCharge charge = new ServiceCharge();
        charge.setPaymentBatch(batch);
        charge.setServiceFeeRule(rule);
        charge.setSuccessfulTransactions(successful);
        charge.setUnitFee(fee);
        charge.setCommissionSubtotal(subtotal);
        charge.setVatAmount(vat);
        charge.setTotalCharge(total);
        charge.setChargeStatus(ChargeStatusEnum.PENDING);

        ServiceCharge savedCharge = serviceChargeRepository.save(charge);
        logger.info("ServiceCharge created with ID: {}", savedCharge.getId());

        // 5. Call Core to charge commission
        String uuid = UUID.randomUUID().toString();
        String companyAccount = getDefaultCompanyAccount();

        logger.info("Sending charge to Core - Account: {}, Total: {}, UUID: {}",
                   companyAccount, total, uuid);

        boolean chargeSuccessful = coreFacadeService.chargeCommission(companyAccount, total, uuid);

        if (chargeSuccessful) {
            savedCharge.setChargeStatus(ChargeStatusEnum.CHARGED);
            savedCharge.setChargedAt(LocalDateTime.now());
            logger.info("Charge successful - Status updated to CHARGED");
        } else {
            savedCharge.setChargeStatus(ChargeStatusEnum.REJECTED);
            logger.warn("Charge rejected - Status updated to REJECTED");
        }

        serviceChargeRepository.save(savedCharge);

        // 6. Update batch counters
        batch.setSuccessfulRecords(successful);
        batch.setRejectedRecords(rejected);
        paymentBatchRepository.save(batch);

        logger.info("Batch updated - successful_records: {}, rejected_records: {}", 
                   successful, rejected);
        logger.info("=== END CHARGE GENERATION RF-06 ===");
    }

    // ==================== REPORT METHODS ====================

    /**
     * Gets the summary of a processed batch as DTO.
     *
     * @param batchId Batch ID
     * @return BatchSummaryDTO with consolidated batch and commission information
     * @throws ResourceNotFoundException if the batch does not exist
     */
    public BatchSummaryDTO getBatchSummary(Integer batchId) {
        logger.info("Generating summary for batch ID: {}", batchId);

        PaymentBatch batch = paymentBatchRepository.findById(batchId)
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found: " + batchId));

        Optional<ServiceCharge> chargeOpt = serviceChargeRepository.findByPaymentBatchId(batchId);

        BatchSummaryDTO summary = new BatchSummaryDTO();
        summary.setBatchId(batch.getId());
        summary.setFileName(batch.getFileName());
        summary.setRuc(batch.getRuc());
        summary.setStatus(batch.getStatus() != null ? batch.getStatus().name() : null);
        summary.setTotalRecords(batch.getHeaderTotalRecords());
        summary.setTotalAmount(batch.getHeaderTotalAmount());
        summary.setSuccessfulRecords(batch.getSuccessfulRecords());
        summary.setRejectedRecords(batch.getRejectedRecords());
        summary.setReceivedAt(batch.getReceivedAt());

        if (chargeOpt.isPresent()) {
            ServiceCharge charge = chargeOpt.get();
            summary.setCommissionSubtotal(charge.getCommissionSubtotal());
            summary.setVatAmount(charge.getVatAmount());
            summary.setTotalCharge(charge.getTotalCharge());
            summary.setChargeStatus(charge.getChargeStatus() != null ? charge.getChargeStatus().name() : null);
            summary.setChargedAt(charge.getChargedAt());
        }

        logger.info("Summary generated for batch: {}", summary);
        return summary;
    }

    /**
     * Gets all payment details of a batch.
     *
     * @param batchId Batch ID
     * @return List of PaymentDetail from the batch
     * @throws ResourceNotFoundException if the batch does not exist
     */
    public List<PaymentDetail> getBatchDetails(Integer batchId) {
        logger.info("Querying details for batch ID: {}", batchId);

        // Verify that the batch exists
        PaymentBatch batch = paymentBatchRepository.findById(batchId)
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found: " + batchId));

        List<PaymentDetail> details = paymentDetailRepository.findByPaymentBatchId(batchId);
        logger.info("Found {} details for the batch", details.size());

        return details;
    }

    /**
     * Gets the service charge for a batch.
     *
     * @param batchId Batch ID
     * @return Optional with ServiceCharge if it exists, empty if not
     * @throws ResourceNotFoundException if the batch does not exist
     */
    public Optional<ServiceCharge> getServiceCharge(Integer batchId) {
        logger.info("Querying service charge for batch ID: {}", batchId);

        // Verify that the batch exists
        paymentBatchRepository.findById(batchId)
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found: " + batchId));

        return serviceChargeRepository.findByPaymentBatchId(batchId);
    }

    /**
     * Gets all registered service charges.
     *
     * @return List of all ServiceCharge
     */
    public List<ServiceCharge> getAllCharges() {
        logger.info("Querying all service charges");
        return serviceChargeRepository.findAll();
    }

    /**
     * Gets the company account from SwitchParameter.
     * Looks for the parameter with code "EMPRESA_ACCOUNT" by default.
     *
     * @param paramCode Parameter code (e.g: "EMPRESA_ACCOUNT")
     * @return Company account number
     * @throws ResourceNotFoundException if the parameter does not exist
     */
    public String getCompanyAccount(String paramCode) {
        logger.info("Getting company account from parameter: {}", paramCode);

        SwitchParameter param = switchParameterRepository.findById(paramCode)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Parameter not found: " + paramCode));

        String companyAccount = param.getValueString();
        logger.info("Company account obtained: {}", companyAccount);

        return companyAccount;
    }

    /**
     * Gets the company account with default code "EMPRESA_ACCOUNT".
     *
     * @return Company account number
     */
    public String getDefaultCompanyAccount() {
        return getCompanyAccount("EMPRESA_ACCOUNT");
    }
}
