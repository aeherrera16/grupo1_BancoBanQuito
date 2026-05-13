package com.banquito.core.config;

import com.banquito.core.model.Notification;
import com.banquito.core.repository.NotificationRepository;
import com.banquito.core.enums.AccountStatusEnum;
import com.banquito.core.enums.CommonStatusEnum;
import com.banquito.core.enums.CustomerStatusEnum;
import com.banquito.core.enums.CustomerSubtypeStatusEnum;
import com.banquito.core.enums.CustomerTypeEnum;
import com.banquito.core.enums.MovementTypeEnum;
import com.banquito.core.enums.TransactionStatusEnum;
import com.banquito.core.model.*;
import com.banquito.core.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
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
    private final InstitutionalAccountRepository institutionalAccountRepository;
    private final CoreUserRepository coreUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final WebCredentialRepository webCredentialRepository;
    private final AccountTransactionRepository accountTransactionRepository;
    private final NotificationRepository notificationRepository;

    public void run(String... args) {
        initCustomerSubtypes();
        initBranches();
        initAccountSubtypes();
        initTransactionSubtypes();
        initInstitutionalAccounts();
        initCoreUsers();
        initCustomers();
        initAccounts();
        initInitialTransactions();
        initCredentials();
        initMassUsers();
        initNotifications();
        log.info("Datos de prueba cargados correctamente");
    }

    private void initCustomerSubtypes() {
        if (customerSubtypeRepository.findAll().stream().noneMatch(s -> "PERSONAL".equals(s.getName()))) {
            CustomerSubtype personal = new CustomerSubtype();
            personal.setCustomerType("NATURAL");
            personal.setName("PERSONAL");
            personal.setDescription("Clientes personas naturales");
            personal.setStatus(CustomerSubtypeStatusEnum.ACTIVO);
            customerSubtypeRepository.save(personal);
        }

        if (customerSubtypeRepository.findAll().stream().noneMatch(s -> "EMPRESA_PAGOS_MASIVOS".equals(s.getName()))) {
            CustomerSubtype empresaPagosMasivos = new CustomerSubtype();
            empresaPagosMasivos.setCustomerType("JURIDICO");
            empresaPagosMasivos.setName("EMPRESA_PAGOS_MASIVOS");
            empresaPagosMasivos.setDescription("Empresa con servicio Pagos Masivos Switch activo");
            empresaPagosMasivos.setStatus(CustomerSubtypeStatusEnum.ACTIVO);
            customerSubtypeRepository.save(empresaPagosMasivos);
        }
        log.info("CustomerSubtypes inicializados");
    }

    private void initBranches() {
        if (branchRepository.findAll().stream().noneMatch(b -> "UIO".equals(b.getBranchCode()))) {
            Branch quito = new Branch();
            quito.setBranchCode("UIO");
            quito.setName("Sucursal Quito Centro");
            quito.setCity("Quito");
            branchRepository.save(quito);
        }

        if (branchRepository.findAll().stream().noneMatch(b -> "GYE".equals(b.getBranchCode()))) {
            Branch guayaquil = new Branch();
            guayaquil.setBranchCode("GYE");
            guayaquil.setName("Sucursal Guayaquil Norte");
            guayaquil.setCity("Guayaquil");
            branchRepository.save(guayaquil);
        }

        if (branchRepository.findAll().stream().noneMatch(b -> "SGL".equals(b.getBranchCode()))) {
            Branch sangolqui = new Branch();
            sangolqui.setBranchCode("SGL");
            sangolqui.setName("Sucursal Sangolquí");
            sangolqui.setCity("Sangolquí");
            branchRepository.save(sangolqui);
        }
        log.info("Branches procesadas: UIO, GYE, SGL");
    }

    private void initAccountSubtypes() {
        if (accountSubtypeRepository.findAll().stream().noneMatch(a -> "AHO".equals(a.getCode()))) {
            AccountSubtype ahorros = new AccountSubtype();
            ahorros.setSuperType("PASIVO");
            ahorros.setCode("AHO");
            ahorros.setName("Ahorros");
            ahorros.setDescription("Cuenta de Ahorros");
            ahorros.setStatus(CommonStatusEnum.ACTIVO);
            accountSubtypeRepository.save(ahorros);
        }

        if (accountSubtypeRepository.findAll().stream().noneMatch(a -> "CTE".equals(a.getCode()))) {
            AccountSubtype corriente = new AccountSubtype();
            corriente.setSuperType("PASIVO");
            corriente.setCode("CTE");
            corriente.setName("Corriente");
            corriente.setDescription("Cuenta Corriente");
            corriente.setStatus(CommonStatusEnum.ACTIVO);
            accountSubtypeRepository.save(corriente);
        }
        log.info("AccountSubtypes procesados");
    }

    private void initTransactionSubtypes() {
        if (transactionSubtypeRepository.findByCode("TRN-GEN").isEmpty()) {
            TransactionSubtype general = new TransactionSubtype();
            general.setCode("TRN-GEN");
            general.setName("Transaccion General");
            general.setStatus(CommonStatusEnum.ACTIVO);
            transactionSubtypeRepository.save(general);
        }

        if (transactionSubtypeRepository.findByCode("TRANSFER").isEmpty()) {
            TransactionSubtype transfer = new TransactionSubtype();
            transfer.setCode("TRANSFER");
            transfer.setName("Transferencia entre cuentas");
            transfer.setStatus(CommonStatusEnum.ACTIVO);
            transactionSubtypeRepository.save(transfer);
        }

        if (transactionSubtypeRepository.findByCode("COMISION").isEmpty()) {
            TransactionSubtype commission = new TransactionSubtype();
            commission.setCode("COMISION");
            commission.setName("Cobro servicio pagos masivos");
            commission.setStatus(CommonStatusEnum.ACTIVO);
            transactionSubtypeRepository.save(commission);
        }
        log.info("TransactionSubtypes creados");
    }

    private void initInstitutionalAccounts() {
        if (institutionalAccountRepository.findByAccountNumber("9000000001").isEmpty()) {
            InstitutionalAccount ingresos = new InstitutionalAccount();
            ingresos.setAccountNumber("9000000001");
            ingresos.setName("INGRESOS_SERVICIOS_MASIVOS");
            ingresos.setAccountingBalance(BigDecimal.ZERO);
            ingresos.setStatus(CommonStatusEnum.ACTIVO);
            ingresos.setCreationDate(LocalDateTime.now());
            institutionalAccountRepository.save(ingresos);
        }

        if (institutionalAccountRepository.findByAccountNumber("9000000002").isEmpty()) {
            InstitutionalAccount iva = new InstitutionalAccount();
            iva.setAccountNumber("9000000002");
            iva.setName("PASIVOS_IVA_RETENIDO");
            iva.setAccountingBalance(BigDecimal.ZERO);
            iva.setStatus(CommonStatusEnum.ACTIVO);
            iva.setCreationDate(LocalDateTime.now());
            institutionalAccountRepository.save(iva);
        }

        log.info("InstitutionalAccounts creadas");
    }

    private void initCoreUsers() {
        if (coreUserRepository.findAll().stream().noneMatch(u -> "admin.core".equals(u.getUsername()))) {
            CoreUser admin = new CoreUser();
            admin.setUsername("admin.core");
            admin.setPasswordHash(passwordEncoder.encode("admin"));
            admin.setFullName("Administrador Core");
            admin.setRole("ADMIN");
            admin.setStatus(CommonStatusEnum.ACTIVO);
            admin.setCreationDate(LocalDateTime.now());
            coreUserRepository.save(admin);
        }

        if (coreUserRepository.findAll().stream().noneMatch(u -> "operador".equals(u.getUsername()))) {
            CoreUser op = new CoreUser();
            op.setUsername("operador");
            op.setPasswordHash(passwordEncoder.encode("1234"));
            op.setFullName("Operador Principal");
            op.setRole("OPERADOR");
            op.setStatus(CommonStatusEnum.ACTIVO);
            op.setCreationDate(LocalDateTime.now());
            coreUserRepository.save(op);
        }

        if (coreUserRepository.findAll().stream().noneMatch(u -> "cajero".equals(u.getUsername()))) {
            CoreUser ca = new CoreUser();
            ca.setUsername("cajero");
            ca.setPasswordHash(passwordEncoder.encode("1234"));
            ca.setFullName("Asesor Ventanilla");
            ca.setRole("CAJERO");
            ca.setStatus(CommonStatusEnum.ACTIVO);
            ca.setCreationDate(LocalDateTime.now());
            coreUserRepository.save(ca);
        }
        log.info("CoreUsers procesados");
    }

    private void initCustomers() {
        // Limpieza de datos basura (registros con campos obligatorios nulos)
        long deleted = customerRepository.findAll().stream()
                .filter(c -> c.getBranch() == null || c.getCustomerCode() == null || c.getFirstName() == null && c.getLegalName() == null)
                .peek(customerRepository::delete)
                .count();
        if (deleted > 0) log.info("Limpieza: Se eliminaron {} registros incompletos de la tabla CUSTOMER", deleted);

        CustomerSubtype personal = customerSubtypeRepository.findAll().stream()
                .filter(s -> "PERSONAL".equals(s.getName()))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Subtype PERSONAL no encontrado en seed"));

        CustomerSubtype empresaPagosMasivosSubtype = customerSubtypeRepository.findAll().stream()
                .filter(s -> "EMPRESA_PAGOS_MASIVOS".equals(s.getName()))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Subtype EMPRESA_PAGOS_MASIVOS no encontrado en seed"));

        Branch quito = branchRepository.findByBranchCode("UIO").orElseThrow();
        Branch guayaquil = branchRepository.findByBranchCode("GYE").orElseThrow();

        if (customerRepository.findByIdentificationTypeAndIdentification("CEDULA", "1712345678").isEmpty()) {
            Customer bryan = new Customer();
            bryan.setCustomerSubtype(personal);
            bryan.setBranch(quito);
            bryan.setCustomerCode("UIO-CLI-00001");
            bryan.setCustomerType(CustomerTypeEnum.NATURAL);
            bryan.setIdentificationType("CEDULA");
            bryan.setIdentification("1712345678");
            bryan.setFirstName("Bryan");
            bryan.setLastName("Ortiz");
            bryan.setBirthDate(LocalDate.of(2000, 1, 15));
            bryan.setEmail("bryan@banquito.com");
            bryan.setMobilePhone("0991234567");
            bryan.setAddress("Quito, Ecuador");
            bryan.setStatus(CustomerStatusEnum.ACTIVO);
            customerRepository.save(bryan);
        }

        if (customerRepository.findByIdentificationTypeAndIdentification("CEDULA", "0987654321").isEmpty()) {
            Customer ana = new Customer();
            ana.setCustomerSubtype(personal);
            ana.setBranch(guayaquil);
            ana.setCustomerCode("GYE-CLI-00001");
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
        }

        Customer empresaPm = customerRepository.findByIdentificationTypeAndIdentification("RUC", "1790012345001")
                .orElseGet(Customer::new);
        empresaPm.setCustomerSubtype(empresaPagosMasivosSubtype);
        empresaPm.setBranch(quito);
        empresaPm.setCustomerCode("UIO-CLI-00002");
        empresaPm.setCustomerType(CustomerTypeEnum.JURIDICO);
        empresaPm.setIdentificationType("RUC");
        empresaPm.setIdentification("1790012345001");
        empresaPm.setLegalName("Pagos Masivos Demo S.A.");
        empresaPm.setConstitutionDate(LocalDate.of(2015, 3, 21));
        empresaPm.setEmail("tesoreria@pagosmasivosdemo.ec");
        empresaPm.setMobilePhone("022345678");
        empresaPm.setAddress("Av. Amazonas, Quito");
        empresaPm.setStatus(CustomerStatusEnum.ACTIVO);
        customerRepository.save(empresaPm);
        log.info("Customers inicializados con sucursal y código automático");
    }

    private void initAccounts() {
        Customer bryan = customerRepository.findByIdentificationTypeAndIdentification("CEDULA", "1234567890")
                .orElseThrow(() -> new IllegalStateException("Cliente Bryan no existe en seed"));
        Customer ana = customerRepository.findByIdentificationTypeAndIdentification("CEDULA", "0987654321")
                .orElseThrow(() -> new IllegalStateException("Cliente Ana no existe en seed"));
        Customer empresaPm = customerRepository.findByIdentificationTypeAndIdentification("RUC", "1790012345001")
                .orElseThrow(() -> new IllegalStateException("Cliente empresa PM no existe en seed"));

        // RF-02: Cada cuenta debe estar vinculada a una sucursal con su código
        Branch sucursalUIO = branchRepository.findAll().stream()
                .filter(b -> "UIO".equals(b.getBranchCode()))
                .findFirst()
                .orElse(branchRepository.findAll().get(0));
        Branch sucursalGYE = branchRepository.findAll().stream()
                .filter(b -> "GYE".equals(b.getBranchCode()))
                .findFirst()
                .orElse(branchRepository.findAll().get(0));

        // Personas naturales → Cuenta de Ahorros; Empresas → Cuenta Corriente
        AccountSubtype ahorros = accountSubtypeRepository.findAll().stream()
                .filter(a -> "AHO".equals(a.getCode()))
                .findFirst()
                .orElse(accountSubtypeRepository.findAll().get(0));

        AccountSubtype corriente = accountSubtypeRepository.findAll().stream()
                .filter(a -> "CTE".equals(a.getCode()))
                .findFirst()
                .orElse(ahorros);

        // RF-02: Número de cuenta = [COD_SUCURSAL]-[NUMERO_SECUENCIAL]
        if (accountRepository.findByAccountNumber("UIO-100001").isEmpty()) {
            Account cuenta1 = new Account();
            cuenta1.setAccountNumber("UIO-100001");
            cuenta1.setCustomer(bryan);
            cuenta1.setBranch(sucursalUIO);
            cuenta1.setAccountSubtype(ahorros);
            cuenta1.setStatus(AccountStatusEnum.ACTIVO);
            cuenta1.setAccountingBalance(new BigDecimal("5000.00"));
            cuenta1.setAvailableBalance(new BigDecimal("5000.00"));
            cuenta1.setIsFavorite(false);
            cuenta1.setOpeningDate(LocalDateTime.now());
            cuenta1.setLastUpdate(LocalDateTime.now());
            accountRepository.save(cuenta1);
        }

        if (accountRepository.findByAccountNumber("GYE-200001").isEmpty()) {
            Account cuenta2 = new Account();
            cuenta2.setAccountNumber("GYE-200001");
            cuenta2.setCustomer(ana);
            cuenta2.setBranch(sucursalGYE);
            cuenta2.setAccountSubtype(ahorros);
            cuenta2.setStatus(AccountStatusEnum.ACTIVO);
            cuenta2.setAccountingBalance(new BigDecimal("2500.00"));
            cuenta2.setAvailableBalance(new BigDecimal("2500.00"));
            cuenta2.setIsFavorite(false);
            cuenta2.setOpeningDate(LocalDateTime.now());
            cuenta2.setLastUpdate(LocalDateTime.now());
            accountRepository.save(cuenta2);
        }

        if (accountRepository.findByAccountNumber("UIO-300001").isEmpty()) {
            Account cuentaEmpresa = new Account();
            cuentaEmpresa.setAccountNumber("UIO-300001");
            cuentaEmpresa.setCustomer(empresaPm);
            cuentaEmpresa.setBranch(sucursalUIO);
            cuentaEmpresa.setAccountSubtype(corriente);
            cuentaEmpresa.setStatus(AccountStatusEnum.ACTIVO);
            cuentaEmpresa.setAccountingBalance(new BigDecimal("50000.00"));
            cuentaEmpresa.setAvailableBalance(new BigDecimal("50000.00"));
            cuentaEmpresa.setIsFavorite(true); // Favorita para pagos masivos
            cuentaEmpresa.setOpeningDate(LocalDateTime.now());
            cuentaEmpresa.setLastUpdate(LocalDateTime.now());
            accountRepository.save(cuentaEmpresa);
        }
        log.info("Accounts inicializadas con prefijo de sucursal");

        // Actualizar subtipo de cuenta de empresa existente a Corriente (si fue creada con Ahorros)
        accountRepository.findByAccountNumber("0050000202").ifPresent(acc -> {
            if (!"CTE".equals(acc.getAccountSubtype().getCode())) {
                acc.setAccountSubtype(corriente);
                accountRepository.save(acc);
                log.info("Cuenta empresa 0050000202 actualizada a Cuenta Corriente (CTE)");
            }
        });

        log.info("Accounts creadas con códigos de sucursal RF-02: UIO-00001234, GYE-00005678, UIO-00020001");
    }

    private void initCredentials() {
        Customer bryan = customerRepository.findByIdentificationTypeAndIdentification("CEDULA", "1234567890")
                .orElseThrow(() -> new IllegalStateException("Cliente Bryan no existe en seed"));
        
        if (webCredentialRepository.findByUsername("user123").isEmpty()) {
            WebCredential cred = new WebCredential();
            cred.setCustomer(bryan);
            cred.setUsername("user123");
            cred.setPasswordHash(passwordEncoder.encode("1234"));
            cred.setStatus(CommonStatusEnum.ACTIVO);
            cred.setCreationDate(LocalDateTime.now());
            webCredentialRepository.save(cred);
        }

        Customer empresaPm = customerRepository.findByIdentificationTypeAndIdentification("RUC", "1790012345001")
                .orElseThrow(() -> new IllegalStateException("Cliente empresa PM no existe en seed"));

        if (webCredentialRepository.findByUsername("empresa123").isEmpty()) {
            WebCredential credEmp = new WebCredential();
            credEmp.setCustomer(empresaPm);
            credEmp.setUsername("empresa123");
            credEmp.setPasswordHash(passwordEncoder.encode("1234"));
            credEmp.setStatus(CommonStatusEnum.ACTIVO);
            credEmp.setCreationDate(LocalDateTime.now());
            webCredentialRepository.save(credEmp);
        }

        Customer ana = customerRepository.findByIdentificationTypeAndIdentification("CEDULA", "0987654321")
                .orElseThrow(() -> new IllegalStateException("Cliente Ana no existe en seed"));

        if (webCredentialRepository.findByUsername("ana123").isEmpty()) {
            WebCredential credAna = new WebCredential();
            credAna.setCustomer(ana);
            credAna.setUsername("ana123");
            credAna.setPasswordHash(passwordEncoder.encode("1234"));
            credAna.setStatus(CommonStatusEnum.ACTIVO);
            credAna.setCreationDate(LocalDateTime.now());
            webCredentialRepository.save(credAna);
        }
        
        log.info("Credenciales web creadas para 'user123' (Bryan), 'ana123' (Ana) y 'empresa123' (Juridica)");
    }

    private void initInitialTransactions() {
        TransactionSubtype general = transactionSubtypeRepository.findByCode("TRN-GEN")
                .orElseThrow(() -> new IllegalStateException("TRN-GEN no existe"));

        accountRepository.findAll().forEach(account -> {
            if (accountTransactionRepository.findTop10ByAccount_IdOrderByTransactionDateDesc(account.getId()).isEmpty()) {
                AccountTransaction tx = new AccountTransaction();
                tx.setAccount(account);
                tx.setTransactionSubtype(general);
                tx.setTransactionUuid(java.util.UUID.randomUUID().toString());
                tx.setMovementType(MovementTypeEnum.CREDITO);
                tx.setAmount(account.getAccountingBalance());
                tx.setResultingBalance(account.getAccountingBalance());
                tx.setTransactionDate(LocalDateTime.now());
                tx.setStatus(TransactionStatusEnum.COMPLETADA);
                tx.setDescription("Depósito Inicial (Apertura)");
                accountTransactionRepository.save(tx);
            }
        });
        log.info("Transacciones iniciales (Apertura) creadas para las cuentas base");
    }

    private void initMassUsers() {
        CustomerSubtype personal = customerSubtypeRepository.findAll().stream()
                .filter(s -> "PERSONAL".equals(s.getName()))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Subtype PERSONAL no encontrado"));

        Branch sucursal = branchRepository.findAll().get(0);
        AccountSubtype ahorros = accountSubtypeRepository.findAll().get(0);
        TransactionSubtype general = transactionSubtypeRepository.findByCode("TRN-GEN").get();

        long currentMassUsers = customerRepository.findAll().stream()
                .filter(c -> c.getIdentification().startsWith("10000"))
                .count();

        if (currentMassUsers < 100) {
            for (int i = 1; i <= 100; i++) {
                String cedula = String.format("10000%05d", i);
                if (customerRepository.findByIdentificationTypeAndIdentification("CEDULA", cedula).isEmpty()) {
                    Customer c = new Customer();
                    c.setCustomerSubtype(personal);
                    c.setCustomerType(CustomerTypeEnum.NATURAL);
                    c.setIdentificationType("CEDULA");
                    c.setIdentification(cedula);
                    c.setFirstName("Usuario");
                    c.setLastName("Masivo " + i);
                    c.setBirthDate(LocalDate.of(1990, 1, 1));
                    c.setEmail("usuario" + i + "@demo.com");
                    c.setMobilePhone("0990000000");
                    c.setAddress("Ecuador");
                    c.setStatus(CustomerStatusEnum.ACTIVO);
                    Customer savedC = customerRepository.save(c);

                    String accountNum = String.format("100-000%05d", i);
                    Account a = new Account();
                    a.setAccountNumber(accountNum);
                    a.setCustomer(savedC);
                    a.setBranch(sucursal);
                    a.setAccountSubtype(ahorros);
                    a.setStatus(AccountStatusEnum.ACTIVO);
                    a.setAccountingBalance(new BigDecimal("1000.00"));
                    a.setAvailableBalance(new BigDecimal("1000.00"));
                    a.setIsFavorite(false);
                    a.setOpeningDate(LocalDateTime.now());
                    Account savedA = accountRepository.save(a);

                    AccountTransaction tx = new AccountTransaction();
                    tx.setAccount(savedA);
                    tx.setTransactionSubtype(general);
                    tx.setTransactionUuid(java.util.UUID.randomUUID().toString());
                    tx.setMovementType(MovementTypeEnum.CREDITO);
                    tx.setAmount(new BigDecimal("1000.00"));
                    tx.setResultingBalance(new BigDecimal("1000.00"));
                    tx.setTransactionDate(LocalDateTime.now());
                    tx.setStatus(TransactionStatusEnum.COMPLETADA);
                    tx.setDescription("Apertura cuenta masiva");
                    accountTransactionRepository.save(tx);
                }
            }
            log.info("100 Usuarios y cuentas masivas creadas con éxito, cada uno con 1 transacción inicial.");
        }
    }
    private void initNotifications() {
        if (notificationRepository.count() == 0) {
            // Notificaciones para Bryan (user123) - ID: 1
            createNotif("1", "Seguridad", "Nuevo inicio de sesión detectado.", "Se detectó un acceso desde un dispositivo nuevo en la ciudad de Quito.", "SEGURIDAD");
            createNotif("1", "Transferencia Enviada", "Transferencia de $250.00 a Ana García procesada.", "Se ha debitado el monto de tu cuenta UIO-100001. Concepto: Pago de servicios.", "DEBITO");

            // Notificaciones para Ana (ana123) - ID: 2
            createNotif("2", "Transferencia Recibida", "Has recibido $250.00 de Bryan Ortiz.", "La transferencia se realizó de manera exitosa desde la cuenta UIO-100001. Referencia: TRN-9823.", "CREDITO");
            createNotif("2", "Estado de Cuenta", "Tu cuenta ha sido activada correctamente.", "El proceso de validación de identidad ha concluido y tu cuenta GYE-200001 está 100% operativa.", "INFO");

            // Notificaciones para Empresa - ID: 3
            createNotif("3", "Buzón SFTP", "Archivo lote validado correctamente.", "El archivo NOMINA_MAYO.csv ha pasado todas las validaciones de estructura.", "INFO");

            log.info("Notificaciones iniciales creadas");
        }
    }

    private void createNotif(String userId, String title, String msg, String detail, String type) {
        Notification n = new Notification();
        n.setUserId(userId);
        n.setTitle(title);
        n.setMessage(msg);
        n.setDetail(detail);
        n.setType(type);
        n.setIsUnread(true);
        n.setCreatedAt(LocalDateTime.now());
        notificationRepository.save(n);
    }
}
