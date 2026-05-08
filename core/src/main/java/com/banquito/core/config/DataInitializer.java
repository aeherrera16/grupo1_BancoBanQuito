package com.banquito.core.config;

import com.banquito.core.enums.AccountStatusEnum;
import com.banquito.core.enums.CustomerStatusEnum;
import com.banquito.core.enums.CustomerSubtypeStatusEnum;
import com.banquito.core.enums.CustomerTypeEnum;
import com.banquito.core.model.*;
import com.banquito.core.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final CustomerSubtypeRepository customerSubtypeRepository;
    private final BranchRepository branchRepository;
    private final AccountSubtypeRepository accountSubtypeRepository;
    private final TransactionSubtypeRepository transactionSubtypeRepository;
    private final CustomerRepository customerRepository;
    private final AccountRepository accountRepository;

    @Override
    public void run(String... args) {
        if (customerSubtypeRepository.count() == 0) initCustomerSubtypes();
        if (branchRepository.count() == 0) initBranches();
        if (accountSubtypeRepository.count() == 0) initAccountSubtypes();
        if (transactionSubtypeRepository.count() == 0) initTransactionSubtypes();
        if (customerRepository.count() == 0) initCustomers();
        if (accountRepository.count() == 0) initAccounts();
        log.info("Datos de prueba cargados correctamente");
    }

    private void initCustomerSubtypes() {
        CustomerSubtype personal = new CustomerSubtype();
        personal.setCustomerType("NATURAL");
        personal.setName("PERSONAL");
        personal.setDescription("Clientes personas naturales");
        personal.setStatus(CustomerSubtypeStatusEnum.ACTIVO);
        customerSubtypeRepository.save(personal);

        CustomerSubtype empresarial = new CustomerSubtype();
        empresarial.setCustomerType("JURIDICO");
        empresarial.setName("EMPRESARIAL");
        empresarial.setDescription("Clientes personas juridicas");
        empresarial.setStatus(CustomerSubtypeStatusEnum.ACTIVO);
        customerSubtypeRepository.save(empresarial);
        log.info("CustomerSubtypes creados");
    }

    private void initBranches() {
        Branch quito = new Branch();
        quito.setBranchCode("SUC001");
        quito.setName("Sucursal Quito Centro");
        quito.setCity("Quito");
        branchRepository.save(quito);

        Branch guayaquil = new Branch();
        guayaquil.setBranchCode("SUC002");
        guayaquil.setName("Sucursal Guayaquil Norte");
        guayaquil.setCity("Guayaquil");
        branchRepository.save(guayaquil);
        log.info("Branches creadas");
    }

    private void initAccountSubtypes() {
        AccountSubtype ahorros = new AccountSubtype();
        ahorros.setSuperType("PASIVO");
        ahorros.setCode("AHO");
        ahorros.setName("Ahorros");
        ahorros.setDescription("Cuenta de Ahorros");
        ahorros.setStatus("ACTIVO");
        accountSubtypeRepository.save(ahorros);

        AccountSubtype corriente = new AccountSubtype();
        corriente.setSuperType("PASIVO");
        corriente.setCode("CTE");
        corriente.setName("Corriente");
        corriente.setDescription("Cuenta Corriente");
        corriente.setStatus("ACTIVO");
        accountSubtypeRepository.save(corriente);
        log.info("AccountSubtypes creados");
    }

    private void initTransactionSubtypes() {
        TransactionSubtype general = new TransactionSubtype();
        general.setCode("TRN-GEN");
        general.setDescription("Transaccion General");
        transactionSubtypeRepository.save(general);

        TransactionSubtype transfer = new TransactionSubtype();
        transfer.setCode("TRANSFER");
        transfer.setDescription("Transferencia entre cuentas");
        transactionSubtypeRepository.save(transfer);
        log.info("TransactionSubtypes creados");
    }

    private void initCustomers() {
        CustomerSubtype personal = customerSubtypeRepository.findAll().get(0);

        Customer bryan = new Customer();
        bryan.setCustomerSubtype(personal);
        bryan.setCustomerType(CustomerTypeEnum.NATURAL);
        bryan.setIdentificationType("CEDULA");
        bryan.setIdentification("1234567890");
        bryan.setFirstName("Bryan");
        bryan.setLastName("Ortiz");
        bryan.setBirthDate(LocalDate.of(2000, 1, 15));
        bryan.setEmail("bryan@banquito.com");
        bryan.setMobilePhone("0991234567");
        bryan.setAddress("Quito, Ecuador");
        bryan.setStatus(CustomerStatusEnum.ACTIVO);
        customerRepository.save(bryan);

        Customer ana = new Customer();
        ana.setCustomerSubtype(personal);
        ana.setCustomerType(CustomerTypeEnum.NATURAL);
        ana.setIdentificationType("CEDULA");
        ana.setIdentification("0987654321");
        ana.setFirstName("Ana");
        ana.setLastName("Garcia");
        ana.setBirthDate(LocalDate.of(1998, 5, 20));
        ana.setEmail("ana@banquito.com");
        ana.setMobilePhone("0987654321");
        ana.setAddress("Guayaquil, Ecuador");
        ana.setStatus(CustomerStatusEnum.ACTIVO);
        customerRepository.save(ana);
        log.info("Customers creados");
    }

    private void initAccounts() {
        Customer bryan = customerRepository.findAll().get(0);
        Customer ana = customerRepository.findAll().get(1);
        Branch sucursal = branchRepository.findAll().get(0);
        AccountSubtype ahorros = accountSubtypeRepository.findAll().get(0);

        Account cuenta1 = new Account();
        cuenta1.setAccountNumber("001-00001234");
        cuenta1.setCustomer(bryan);
        cuenta1.setBranch(sucursal);
        cuenta1.setAccountSubtype(ahorros);
        cuenta1.setStatus(AccountStatusEnum.ACTIVO);
        cuenta1.setAccountingBalance(new BigDecimal("5000.00"));
        cuenta1.setAvailableBalance(new BigDecimal("5000.00"));
        cuenta1.setIsFavorite(false);
        cuenta1.setOpeningDate(LocalDateTime.now());
        accountRepository.save(cuenta1);

        Account cuenta2 = new Account();
        cuenta2.setAccountNumber("001-00005678");
        cuenta2.setCustomer(ana);
        cuenta2.setBranch(sucursal);
        cuenta2.setAccountSubtype(ahorros);
        cuenta2.setStatus(AccountStatusEnum.ACTIVO);
        cuenta2.setAccountingBalance(new BigDecimal("2500.00"));
        cuenta2.setAvailableBalance(new BigDecimal("2500.00"));
        cuenta2.setIsFavorite(false);
        cuenta2.setOpeningDate(LocalDateTime.now());
        accountRepository.save(cuenta2);
        log.info("Accounts creadas");
    }
}
