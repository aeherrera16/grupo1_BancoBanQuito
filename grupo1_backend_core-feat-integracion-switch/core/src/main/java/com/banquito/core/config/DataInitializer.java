package com.banquito.core.config;

import com.banquito.core.enums.MovementTypeEnum;
import com.banquito.core.enums.TransactionStatusEnum;
import com.banquito.core.enums.AccountStatusEnum;
import com.banquito.core.enums.CommonStatusEnum;
import com.banquito.core.enums.CustomerStatusEnum;
import com.banquito.core.enums.CustomerSubtypeStatusEnum;
import com.banquito.core.enums.CustomerTypeEnum;
import com.banquito.core.model.*;
import com.banquito.core.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import com.banquito.core.service.IAuthenticationService;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private static final String[] COMPANY_NAMES = {
        "Inversiones Andinas del Ecuador S.A.",
        "Comercializadora Pichincha Cía. Ltda.",
        "Grupo Empresarial Pacífico S.A.",
        "Importadora Continental Cía. Ltda.",
        "Distribuciones Sierra Verde S.A.",
        "Tecnologías Innovación Ecuador S.A.",
        "Construcciones Metropolitanas S.A.",
        "Agroindustrial Cóndor Cía. Ltda.",
        "Transportes Nacionales Unidos S.A.",
        "Soluciones Corporativas Andes S.A.",
        "Industrias Alimenticias del Norte Cía. Ltda.",
        "Grupo Logístico Manabí S.A.",
        "Servicios Financieros Austral Cía. Ltda.",
        "Exportadora Amazónica S.A.",
        "Consultora Empresarial Cuenca Cía. Ltda.",
        "Manufactura Especializada Guayas S.A.",
        "Telecomunicaciones Nacionales S.A.",
        "Inmobiliaria Capital Norte Cía. Ltda.",
        "Seguridad Integral Ecuatoriana S.A.",
        "Farmacéutica Andina Cía. Ltda.",
        "Energía Renovable del Ecuador S.A.",
        "Textiles del Oriente Cía. Ltda.",
        "Automotriz Nacional S.A.",
        "Hotelería y Turismo Galápagos Cía. Ltda.",
        "Alimentos Procesados del Sur S.A.",
        "Ingeniería Civil y Arquitectura Cía. Ltda.",
        "Servicios de Salud Integral S.A.",
        "Tecnología Agropecuaria Nacional Cía. Ltda.",
        "Retail y Comercio Especializado S.A.",
        "Grupo Empresarial Tungurahua Cía. Ltda.",
        "Distribuciones Comerciales Loja S.A.",
        "Petroquímica Ecuatoriana Cía. Ltda.",
        "Ganadería y Producción Agropecuaria S.A.",
        "Centro Comercial Metropolitano Cía. Ltda.",
        "Producción Audiovisual Nacional S.A.",
        "Gestión Ambiental Sostenible Cía. Ltda.",
        "Industria Plástica Especializada S.A.",
        "Operaciones Mineras del Norte Cía. Ltda.",
        "Desarrollo Inmobiliario Moderno S.A.",
        "Servicios Informáticos Avanzados Cía. Ltda.",
        "Exportaciones Marítimas Ecuatorianas S.A.",
        "Procesadora de Alimentos Nativos Cía. Ltda.",
        "Construcciones Viales Nacionales S.A.",
        "Servicios Educativos Superiores Cía. Ltda.",
        "Distribución Eléctrica Nacional S.A.",
        "Laboratorios del Austro Cía. Ltda.",
        "Corporación Manufacturera del Pacífico S.A.",
        "Recursos Naturales Amazónicos Cía. Ltda.",
        "Innovación Biotecnológica Ecuador S.A.",
        "Servicios Portuarios Nacionales Cía. Ltda.",
    };

    private final CustomerSubtypeRepository customerSubtypeRepository;
    private final BranchRepository branchRepository;
    private final AccountSubtypeRepository accountSubtypeRepository;
    private final TransactionSubtypeRepository transactionSubtypeRepository;
    private final CoreParameterRepository coreParameterRepository;
    private final CustomerRepository customerRepository;
    private final AccountRepository accountRepository;
    private final AccountTransactionRepository transactionRepository;
    private final InstitutionalAccountRepository institutionalAccountRepository;
    private final CoreUserRepository coreUserRepository;
    private final IAuthenticationService authenticationService;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        initCustomerSubtypes();
        initBranches();
        initAccountSubtypes();
        initTransactionSubtypes();
        initCoreParameters();
        initInstitutionalAccounts();

        if (coreUserRepository.count() == 0) {
            initCoreUsers();
        }

        initMassiveCustomers();
        initMassiveAccounts();
        initDemoData();

        log.info("Datos de prueba cargados correctamente");
    }

    private void initDemoData() {
        CustomerSubtype personal = customerSubtypeRepository.findAll().stream()
                .filter(s -> "PERSONAL".equals(s.getName()))
                .findFirst().orElseThrow();

        CustomerSubtype empresaSubtype = customerSubtypeRepository.findAll().stream()
                .filter(s -> "EMPRESA_PAGOS_MASIVOS".equals(s.getName()))
                .findFirst().orElseThrow();

        Object[][] personas = {
            {"1750285577", "Anahy",     "Herrera Morales",  LocalDate.of(2002, 9, 8),  "anahyherrera09082002@gmail.com",      "0992832595", "Av. Simon Bolivar"},
            {"1724356789", "Carlos",    "Mendoza Rios",     LocalDate.of(1990, 3,15),  "carlos.mendoza@banquito.fin.ec",     "0987123456", "Av. 10 de Agosto N22-54"},
            {"1712034567", "Maria",     "Salazar Vega",     LocalDate.of(1985, 7,22),  "maria.salazar@banquito.fin.ec",      "0998234567", "Calle Sucre 103"},
            {"1738901234", "Luis",      "Ortega Caicedo",   LocalDate.of(1995, 1, 5),  "luis.ortega@banquito.fin.ec",        "0976345678", "Av. Amazonas 4532"},
            {"1745678901", "Gabriela",  "Torres Espinoza",  LocalDate.of(1998,11,30),  "gabriela.torres@banquito.fin.ec",   "0969456789", "Juan Leon Mera 1200"},
            {"1752345678", "Diego",     "Castro Paredes",   LocalDate.of(1988, 6,12),  "diego.castro@banquito.fin.ec",       "0995567890", "Av. Shyris N36-188"},
            {"1761234567", "Valeria",   "Guerrero Acosta",  LocalDate.of(2000, 4,18),  "valeria.guerrero@banquito.fin.ec",  "0982678901", "Veintimilla E4-130"},
            {"1768901234", "Sebastian", "Navarrete Ruiz",   LocalDate.of(1993, 8,25),  "sebastian.navarrete@banquito.fin.ec","0991789012","Av. Occidental km 2"},
        };

        for (Object[] p : personas) {
            String cedula = (String) p[0];
            if (customerRepository.findByIdentificationTypeAndIdentification("CEDULA", cedula).isEmpty()) {
                Customer c = new Customer();
                c.setCustomerSubtype(personal);
                c.setCustomerType(CustomerTypeEnum.NATURAL);
                c.setIdentificationType("CEDULA");
                c.setIdentification(cedula);
                c.setFirstName((String) p[1]);
                c.setLastName((String) p[2]);
                c.setBirthDate((LocalDate) p[3]);
                c.setEmail((String) p[4]);
                c.setMobilePhone((String) p[5]);
                c.setAddress((String) p[6]);
                c.setRegistrationDate(LocalDateTime.now());
                c.setStatus(CustomerStatusEnum.ACTIVO);
                Customer saved = customerRepository.save(c);
                authenticationService.createInitialWebCredential(saved);
                log.info("Demo cliente natural creado: {} {}", p[1], p[2]);
            }
        }

        Object[][] empresas = {
            {"1757158215001", "TechSolutions Ecuador S.A.",       "2015-03-12", "info@techsolutions.ec",       "022345678", "Av. Republica del Salvador N34-183"},
            {"1791234567001", "Importadora Andina Cía. Ltda.",    "2010-07-08", "contacto@importandina.ec",    "024567890", "Av. De la Prensa N47-321"},
            {"1791765432001", "Distribuidora El Comercio S.A.",   "2008-11-20", "gerencia@distcomercio.ec",   "022876543", "Panamericana Norte km 5"},
        };

        Customer repLegal = customerRepository
                .findByIdentificationTypeAndIdentification("CEDULA", "1750285577")
                .orElse(null);

        for (Object[] e : empresas) {
            String ruc = (String) e[0];
            if (customerRepository.findByIdentificationTypeAndIdentification("RUC", ruc).isEmpty()) {
                Customer empresa = new Customer();
                empresa.setCustomerSubtype(empresaSubtype);
                empresa.setCustomerType(CustomerTypeEnum.JURIDICO);
                empresa.setIdentificationType("RUC");
                empresa.setIdentification(ruc);
                empresa.setLegalName((String) e[1]);
                empresa.setConstitutionDate(LocalDate.parse((String) e[2]));
                empresa.setLegalRepresentative(repLegal);
                empresa.setEmail((String) e[3]);
                empresa.setMobilePhone((String) e[4]);
                empresa.setAddress((String) e[5]);
                empresa.setRegistrationDate(LocalDateTime.now());
                empresa.setStatus(CustomerStatusEnum.ACTIVO);
                Customer saved = customerRepository.save(empresa);
                authenticationService.createInitialWebCredential(saved);
                log.info("Demo empresa creada: {}", e[1]);
            }
        }

        log.info("Datos de demostración inicializados correctamente");
    }

    private void initCustomerSubtypes() {
        if (customerSubtypeRepository.findAll().stream()
                .noneMatch(s -> "PERSONAL".equals(s.getName()))) {
            CustomerSubtype personal = new CustomerSubtype();
            personal.setCustomerType("NATURAL");
            personal.setName("PERSONAL");
            personal.setDescription("Clientes personas naturales");
            personal.setStatus(CustomerSubtypeStatusEnum.ACTIVO);
            customerSubtypeRepository.save(personal);
        }

        if (customerSubtypeRepository.findAll().stream()
                .noneMatch(s -> "EMPRESA".equals(s.getName()))) {
            CustomerSubtype empresa = new CustomerSubtype();
            empresa.setCustomerType("JURIDICO");
            empresa.setName("EMPRESA");
            empresa.setDescription("Empresa sin servicio de pagos masivos");
            empresa.setStatus(CustomerSubtypeStatusEnum.ACTIVO);
            customerSubtypeRepository.save(empresa);
        }

        if (customerSubtypeRepository.findAll().stream()
                .noneMatch(s -> "EMPRESA_PAGOS_MASIVOS".equals(s.getName()))) {
            CustomerSubtype empresaPagosMasivos = new CustomerSubtype();
            empresaPagosMasivos.setCustomerType("JURIDICO");
            empresaPagosMasivos.setName("EMPRESA_PAGOS_MASIVOS");
            empresaPagosMasivos.setDescription("Empresa con servicio Pagos Masivos Switch activo");
            empresaPagosMasivos.setStatus(CustomerSubtypeStatusEnum.ACTIVO);
            customerSubtypeRepository.save(empresaPagosMasivos);
        }

        log.info("CustomerSubtypes creados o verificados");
    }

    private void initBranches() {
        if (branchRepository.findByBranchCode("001").isEmpty()) {
            Branch norte = new Branch();
            norte.setBranchCode("001");
            norte.setName("Sucursal Norte");
            norte.setCity("Quito");
            norte.setCreationDate(LocalDateTime.now());
            branchRepository.save(norte);
        }

        if (branchRepository.findByBranchCode("002").isEmpty()) {
            Branch sur = new Branch();
            sur.setBranchCode("002");
            sur.setName("Sucursal Sur");
            sur.setCity("Quito");
            sur.setCreationDate(LocalDateTime.now());
            branchRepository.save(sur);
        }

        if (branchRepository.findByBranchCode("003").isEmpty()) {
            Branch centro = new Branch();
            centro.setBranchCode("003");
            centro.setName("Sucursal Centro");
            centro.setCity("Quito");
            centro.setCreationDate(LocalDateTime.now());
            branchRepository.save(centro);
        }

        if (branchRepository.findByBranchCode("004").isEmpty()) {
            Branch valles = new Branch();
            valles.setBranchCode("004");
            valles.setName("Sucursal Valles");
            valles.setCity("Quito");
            valles.setCreationDate(LocalDateTime.now());
            branchRepository.save(valles);
        }

        if (branchRepository.findByBranchCode("005").isEmpty()) {
            Branch digital = new Branch();
            digital.setBranchCode("005");
            digital.setName("Sucursal Digital");
            digital.setCity("Digital");
            digital.setCreationDate(LocalDateTime.now());
            branchRepository.save(digital);
        }

        log.info("Branches creadas o verificadas");
    }

    private void initAccountSubtypes() {
        if (accountSubtypeRepository.findAll().stream()
                .noneMatch(s -> "AHO".equals(s.getCode()))) {
            AccountSubtype ahorros = new AccountSubtype();
            ahorros.setSuperType("PASIVO");
            ahorros.setCode("AHO");
            ahorros.setName("Ahorros");
            ahorros.setDescription("Cuenta de Ahorros");
            ahorros.setStatus(CommonStatusEnum.ACTIVO);
            accountSubtypeRepository.save(ahorros);
        }

        if (accountSubtypeRepository.findAll().stream()
                .noneMatch(s -> "CTE".equals(s.getCode()))) {
            AccountSubtype corriente = new AccountSubtype();
            corriente.setSuperType("PASIVO");
            corriente.setCode("CTE");
            corriente.setName("Corriente");
            corriente.setDescription("Cuenta Corriente");
            corriente.setStatus(CommonStatusEnum.ACTIVO);
            accountSubtypeRepository.save(corriente);
        }

        if (accountSubtypeRepository.findAll().stream()
                .noneMatch(s -> "NOM".equals(s.getCode()))) {
            AccountSubtype nomina = new AccountSubtype();
            nomina.setSuperType("PASIVO");
            nomina.setCode("NOM");
            nomina.setName("Nómina");
            nomina.setDescription("Cuenta de Nómina");
            nomina.setStatus(CommonStatusEnum.ACTIVO);
            accountSubtypeRepository.save(nomina);
        }
        log.info("AccountSubtypes creados o verificados");
    }

    private void initTransactionSubtypes() {
        if (transactionSubtypeRepository.findByCode("TRN-GEN").isEmpty()) {
            TransactionSubtype general = new TransactionSubtype();
            general.setCode("TRN-GEN");
            general.setName("Transaccion General");
            general.setDescription("Movimiento general de cuenta");
            general.setStatus(CommonStatusEnum.ACTIVO);
            transactionSubtypeRepository.save(general);
        }

        if (transactionSubtypeRepository.findByCode("TRANSFER").isEmpty()) {
            TransactionSubtype transfer = new TransactionSubtype();
            transfer.setCode("TRANSFER");
            transfer.setName("Transferencia entre cuentas");
            transfer.setDescription("Transferencia entre cuentas bancarias");
            transfer.setStatus(CommonStatusEnum.ACTIVO);
            transactionSubtypeRepository.save(transfer);
        }

        if (transactionSubtypeRepository.findByCode("MASS_PAYMENT").isEmpty()) {
            TransactionSubtype massPayment = new TransactionSubtype();
            massPayment.setCode("MASS_PAYMENT");
            massPayment.setName("Pago masivo");
            massPayment.setDescription("Debito por procesamiento de pago masivo");
            massPayment.setStatus(CommonStatusEnum.ACTIVO);
            transactionSubtypeRepository.save(massPayment);
        }

        if (transactionSubtypeRepository.findByCode("ATM_WITHDRAW").isEmpty()) {
            TransactionSubtype atmWithdraw = new TransactionSubtype();
            atmWithdraw.setCode("ATM_WITHDRAW");
            atmWithdraw.setName("Retiro por cajero");
            atmWithdraw.setDescription("Retiro de efectivo por cajero automatico");
            atmWithdraw.setStatus(CommonStatusEnum.ACTIVO);
            transactionSubtypeRepository.save(atmWithdraw);
        }

        if (transactionSubtypeRepository.findByCode("PURCHASE").isEmpty()) {
            TransactionSubtype purchase = new TransactionSubtype();
            purchase.setCode("PURCHASE");
            purchase.setName("Compra en comercio");
            purchase.setDescription("Debito por compra en comercio");
            purchase.setStatus(CommonStatusEnum.ACTIVO);
            transactionSubtypeRepository.save(purchase);
        }

        if (transactionSubtypeRepository.findByCode("COMISION").isEmpty()) {
            TransactionSubtype commission = new TransactionSubtype();
            commission.setCode("COMISION");
            commission.setName("Cobro de comision");
            commission.setDescription("Debito por cobro de comision bancaria");
            commission.setStatus(CommonStatusEnum.ACTIVO);
            transactionSubtypeRepository.save(commission);
        }

        if (transactionSubtypeRepository.findByCode("TAX_PAYMENT").isEmpty()) {
            TransactionSubtype taxPayment = new TransactionSubtype();
            taxPayment.setCode("TAX_PAYMENT");
            taxPayment.setName("Pago de impuestos");
            taxPayment.setDescription("Debito por pago de impuestos");
            taxPayment.setStatus(CommonStatusEnum.ACTIVO);
            transactionSubtypeRepository.save(taxPayment);
        }

        if (transactionSubtypeRepository.findByCode("PAYROLL").isEmpty()) {
            TransactionSubtype payroll = new TransactionSubtype();
            payroll.setCode("PAYROLL");
            payroll.setName("Abono de nomina");
            payroll.setDescription("Credito por abono de nomina");
            payroll.setStatus(CommonStatusEnum.ACTIVO);
            transactionSubtypeRepository.save(payroll);
        }

        if (transactionSubtypeRepository.findByCode("DEPOSIT").isEmpty()) {
            TransactionSubtype deposit = new TransactionSubtype();
            deposit.setCode("DEPOSIT");
            deposit.setName("Deposito por ventanilla");
            deposit.setDescription("Credito por deposito realizado en ventanilla");
            deposit.setStatus(CommonStatusEnum.ACTIVO);
            transactionSubtypeRepository.save(deposit);
        }

        if (transactionSubtypeRepository.findByCode("TRANSFER_IN").isEmpty()) {
            TransactionSubtype transferIn = new TransactionSubtype();
            transferIn.setCode("TRANSFER_IN");
            transferIn.setName("Transferencia recibida");
            transferIn.setDescription("Credito por transferencia recibida");
            transferIn.setStatus(CommonStatusEnum.ACTIVO);
            transactionSubtypeRepository.save(transferIn);
        }

        log.info("TransactionSubtypes creados o verificados");
    }

    private void initCoreParameters() {
        if (coreParameterRepository.findByCode("MAX_TRANSFER_AMOUNT").isEmpty()) {
            CoreParameter maxTransferAmount = new CoreParameter();
            maxTransferAmount.setCode("MAX_TRANSFER_AMOUNT");
            maxTransferAmount.setName("Monto maximo permitido para transferencias");
            maxTransferAmount.setValueString("99999999.99");
            maxTransferAmount.setDataType("DECIMAL");
            maxTransferAmount.setDescription("Límite máximo permitido por el banco para transferencias");
            maxTransferAmount.setLastUpdate(LocalDateTime.now());
            coreParameterRepository.save(maxTransferAmount);
        }

        if (coreParameterRepository.findByCode("MAX_TRANSFER_NOM").isEmpty()) {
            CoreParameter maxTransferNom = new CoreParameter();
            maxTransferNom.setCode("MAX_TRANSFER_NOM");
            maxTransferNom.setName("Monto maximo permitido para nómina");
            maxTransferNom.setValueString("99999999.99");
            maxTransferNom.setDataType("DECIMAL");
            maxTransferNom.setDescription("Límite máximo permitido para transferencias de nómina");
            maxTransferNom.setLastUpdate(LocalDateTime.now());
            coreParameterRepository.save(maxTransferNom);
        }

        log.info("CoreParameters creados o verificados");
    }

    private void initInstitutionalAccounts() {
        if (institutionalAccountRepository.findByAccountNumber("9000000001").isEmpty()) {
            InstitutionalAccount ingresos = new InstitutionalAccount();
            ingresos.setAccountNumber("9000000001");
            ingresos.setName("INGRESOS_SERVICIOS_MASIVOS");
            ingresos.setCode("MASS_SERVICE_INCOME");
            ingresos.setDescription("Cuenta institucional para registrar ingresos por servicios masivos");
            ingresos.setAccountingBalance(BigDecimal.ZERO);
            ingresos.setBalance(BigDecimal.ZERO);
            ingresos.setStatus(CommonStatusEnum.ACTIVO);
            ingresos.setCreationDate(LocalDateTime.now());
            institutionalAccountRepository.save(ingresos);
        }

        if (institutionalAccountRepository.findByAccountNumber("9000000002").isEmpty()) {
            InstitutionalAccount iva = new InstitutionalAccount();
            iva.setAccountNumber("9000000002");
            iva.setName("PASIVOS_IVA_RETENIDO");
            iva.setCode("VAT_PAYABLE");
            iva.setDescription("Cuenta institucional para registrar IVA retenido");
            iva.setAccountingBalance(BigDecimal.ZERO);
            iva.setBalance(BigDecimal.ZERO);
            iva.setStatus(CommonStatusEnum.ACTIVO);
            iva.setCreationDate(LocalDateTime.now());
            institutionalAccountRepository.save(iva);
        }

        log.info("InstitutionalAccounts creadas o verificadas");
    }

    private void initCoreUsers() {
        CoreUser admin = new CoreUser();
        admin.setUsername("admin.core");
        admin.setPasswordHash(passwordEncoder.encode("admin"));
        admin.setFullName("Administrador Core");
        admin.setRole("ADMIN");
        admin.setStatus(CommonStatusEnum.ACTIVO);
        admin.setCreationDate(LocalDateTime.now());

        CoreUser saved = coreUserRepository.save(admin);
        log.info("CoreUsers creados con ID: {}", saved.getId());
    }

    private void initMassiveCustomers() {
        CustomerSubtype personal = customerSubtypeRepository.findAll().stream()
                .filter(s -> "PERSONAL".equals(s.getName()))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Subtype PERSONAL no encontrado"));

        CustomerSubtype empresaPagosMasivosSubtype = customerSubtypeRepository.findAll().stream()
                .filter(s -> "EMPRESA_PAGOS_MASIVOS".equals(s.getName()))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Subtype EMPRESA_PAGOS_MASIVOS no encontrado"));

        String[] nombres = {
                "Juan", "Maria", "Carlos", "Ana", "Luis", "Gabriela", "Pedro", "Daniela",
                "Jorge", "Paola", "Andres", "Camila", "Diego", "Valeria", "Fernando",
                "Sofia", "Mateo", "Carolina", "Ricardo", "Isabel", "Sebastian", "Diana",
                "Esteban", "Fernanda", "Cristian", "Andrea", "Mauricio", "Karla"
        };

        String[] apellidos = {
                "Perez", "Garcia", "Morales", "Vera", "Cevallos", "Mendoza", "Castro",
                "Zambrano", "Rojas", "Sanchez", "Ortiz", "Torres", "Salazar", "Guerrero",
                "Navarrete", "Paredes", "Espinoza", "Romero", "Alvarez", "Delgado",
                "Molina", "Quintero", "Benitez", "Cabrera", "Vargas", "Acosta"
        };

        long naturalCount = customerRepository.findAll().stream()
                .filter(c -> CustomerTypeEnum.NATURAL.equals(c.getCustomerType()))
                .count();

        int naturalIndex = 1;
        while (naturalCount < 500) {
            String cedula = generateEcuadorianCedula(naturalIndex);

            if (customerRepository.findByIdentificationTypeAndIdentification("CEDULA", cedula).isEmpty()) {
                String nombre = nombres[naturalIndex % nombres.length];
                String apellidoPaterno = apellidos[naturalIndex % apellidos.length];
                String apellidoMaterno = apellidos[(naturalIndex + 9) % apellidos.length];
                String apellidosCompletos = apellidoPaterno + " " + apellidoMaterno;

                Customer customer = new Customer();
                customer.setCustomerSubtype(personal);
                customer.setCustomerType(CustomerTypeEnum.NATURAL);
                customer.setIdentificationType("CEDULA");
                customer.setIdentification(cedula);
                customer.setFirstName(nombre);
                customer.setLastName(apellidosCompletos);
                customer.setBirthDate(generateAdultBirthDate(naturalIndex));
                customer.setEmail(
                        nombre.toLowerCase() + "."
                                + apellidoPaterno.toLowerCase() + "."
                                + apellidoMaterno.toLowerCase()
                                + naturalIndex + "@banquito.com"
                );
                customer.setMobilePhone("09" + String.format("%08d", naturalIndex));
                customer.setAddress("Quito, sector " + ((naturalIndex % 5) + 1));
                customer.setLatitude(generateLatitude(naturalIndex));
                customer.setLongitude(generateLongitude(naturalIndex));
                customer.setRegistrationDate(LocalDateTime.now());
                customer.setStatus(CustomerStatusEnum.ACTIVO);

                customerRepository.save(customer);
                naturalCount++;
            }

            naturalIndex++;
        }

        List<Customer> naturalRepresentatives = customerRepository.findAll().stream()
                .filter(c -> CustomerTypeEnum.NATURAL.equals(c.getCustomerType()))
                .toList();

        if (naturalRepresentatives.isEmpty()) {
            throw new IllegalStateException("No existen clientes naturales para asignar representantes legales");
        }

        long corporateCount = customerRepository.findAll().stream()
                .filter(c -> CustomerTypeEnum.JURIDICO.equals(c.getCustomerType()))
                .count();

        int corporateIndex = 1;
        while (corporateCount < 50) {
            String ruc = generateCompanyRuc(corporateIndex);

            if (customerRepository.findByIdentificationTypeAndIdentification("RUC", ruc).isEmpty()) {
                String legalName = COMPANY_NAMES[(corporateIndex - 1) % COMPANY_NAMES.length];

                Customer company = new Customer();
                company.setCustomerSubtype(empresaPagosMasivosSubtype);
                company.setCustomerType(CustomerTypeEnum.JURIDICO);
                company.setIdentificationType("RUC");
                company.setIdentification(ruc);
                company.setLegalName(legalName);
                company.setConstitutionDate(LocalDate.of(2000, 1, 1).plusDays(corporateIndex * 93L));
                company.setLegalRepresentative(
                        naturalRepresentatives.get(corporateIndex % naturalRepresentatives.size())
                );
                company.setEmail("contacto.empresa" + corporateIndex + "@banquito.com");
                company.setMobilePhone("02" + String.format("%07d", corporateIndex));
                company.setAddress("Quito, oficina corporativa " + corporateIndex);
                company.setLatitude(generateLatitude(corporateIndex + 500));
                company.setLongitude(generateLongitude(corporateIndex + 500));
                company.setRegistrationDate(LocalDateTime.now());
                company.setStatus(CustomerStatusEnum.ACTIVO);

                customerRepository.save(company);
                corporateCount++;
            }

            corporateIndex++;
        }

        log.info("Clientes masivos creados o verificados");
    }

    private void initMassiveAccounts() {
        if (accountRepository.count() >= 1500) {
            log.info("Cuentas masivas ya existen");
            return;
        }

        List<Branch> branches = branchRepository.findAll();
        if (branches.isEmpty()) {
            throw new IllegalStateException("No existen sucursales para crear cuentas");
        }

        AccountSubtype ahorros = accountSubtypeRepository.findAll().stream()
                .filter(s -> "AHO".equals(s.getCode()))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Subtipo AHO no encontrado"));

        AccountSubtype corriente = accountSubtypeRepository.findAll().stream()
                .filter(s -> "CTE".equals(s.getCode()))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Subtipo CTE no encontrado"));

        List<Customer> naturalCustomers = customerRepository.findAll().stream()
                .filter(c -> CustomerTypeEnum.NATURAL.equals(c.getCustomerType()))
                .sorted(java.util.Comparator.comparing(Customer::getIdentification))
                .toList();

        List<Customer> corporateCustomers = customerRepository.findAll().stream()
                .filter(c -> CustomerTypeEnum.JURIDICO.equals(c.getCustomerType()))
                .sorted(java.util.Comparator.comparing(Customer::getIdentification))
                .toList();

        AccountSubtype nomina = accountSubtypeRepository.findAll().stream()
                .filter(s -> "NOM".equals(s.getCode()))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Subtipo NOM no encontrado"));

        int accountSequence = 1;

        for (int i = 0; i < naturalCustomers.size(); i++) {
            Customer customer = naturalCustomers.get(i);
            List<Account> customerAccounts = accountRepository.findByCustomer_Id(customer.getId());

            if (customerAccounts.isEmpty()) {
                Branch branch = branches.get(i % branches.size());
                createSeedAccount(customer, branch, ahorros, accountSequence++);
            }
        }

        int customersWithTwoAccounts = Math.min(100, naturalCustomers.size());

        for (int i = 0; i < customersWithTwoAccounts; i++) {
            Customer customer = naturalCustomers.get(i);
            List<Account> customerAccounts = accountRepository.findByCustomer_Id(customer.getId());

            if (customerAccounts.size() < 2) {
                Branch branch = branches.get(i % branches.size());
                createSeedAccount(customer, branch, corriente, accountSequence++);
            }
        }

        for (int i = 0; i < corporateCustomers.size(); i++) {
            Customer company = corporateCustomers.get(i);
            Branch branch = branches.get(i % branches.size());

            while (accountRepository.findByCustomer_Id(company.getId()).size() < 3) {
                int currentCount = accountRepository.findByCustomer_Id(company.getId()).size();
                AccountSubtype subtype;
                if (currentCount == 0) subtype = corriente;   // Cuenta Operativa
                else if (currentCount == 1) subtype = nomina; // Cuenta Nómina
                else subtype = ahorros;                       // Cuenta Impuestos/Reservas

                createSeedAccount(company, branch, subtype, accountSequence++);
            }
        }

        int corporateIndex = 0;

        while (accountRepository.count() < 1500) {
            Customer company = corporateCustomers.get(corporateIndex % corporateCustomers.size());
            Branch branch = branches.get(corporateIndex % branches.size());
            AccountSubtype subtype = corporateIndex % 2 == 0 ? ahorros : corriente;

            createSeedAccount(company, branch, subtype, accountSequence++);
            corporateIndex++;
        }

        log.info("Cuentas masivas creadas o verificadas");
    }

    private void createSeedAccount(Customer customer, Branch branch, AccountSubtype subtype, int sequence) {
        String accountNumber = generateSeedAccountNumber(branch, sequence);

        while (accountRepository.findByAccountNumber(accountNumber).isPresent()) {
            sequence++;
            accountNumber = generateSeedAccountNumber(branch, sequence);
        }

        BigDecimal initialBalance = new BigDecimal("1000.00");
        LocalDateTime now = LocalDateTime.now();

        Account account = new Account();
        account.setAccountNumber(accountNumber);
        account.setCustomer(customer);
        account.setBranch(branch);
        account.setAccountSubtype(subtype);
        account.setStatus(AccountStatusEnum.ACTIVO);
        account.setAccountingBalance(initialBalance);
        account.setAvailableBalance(initialBalance);
        account.setIsFavorite(false);
        account.setOpeningDate(now);
        account.setLastUpdate(now);

        Account savedAccount = accountRepository.save(account);
        registerOpeningTransaction(savedAccount, initialBalance);
    }
    private void registerOpeningTransaction(Account account, BigDecimal amount) {
        TransactionSubtype subtype = transactionSubtypeRepository.findByCode("DEPOSIT")
                .orElseThrow(() -> new IllegalStateException("Subtipo DEPOSIT no encontrado"));

        AccountTransaction transaction = new AccountTransaction();
        transaction.setAccount(account);
        transaction.setTransactionSubtype(subtype);
        transaction.setTransactionUuid("OPEN" + account.getAccountNumber());
        transaction.setMovementType(MovementTypeEnum.CREDITO);
        transaction.setAmount(amount);
        transaction.setResultingBalance(account.getAccountingBalance());
        transaction.setStatus(TransactionStatusEnum.COMPLETADA);
        transaction.setDescription("Apertura de cuenta con saldo inicial");
        transaction.setTransactionDate(LocalDateTime.now());

        transactionRepository.save(transaction);
    }
    private String generateSeedAccountNumber(Branch branch, int sequence) {
        return branch.getBranchCode() + String.format("%07d", sequence);
    }

    private String generateEcuadorianCedula(int index) {
        int province = (index % 24) + 1;
        String provinceCode = String.format("%02d", province);

        int sequence = 100000 + index;
        String base = provinceCode + String.format("%06d", sequence).substring(0, 6) + "0";

        int[] coefficients = {2, 1, 2, 1, 2, 1, 2, 1, 2};
        int total = 0;

        for (int i = 0; i < coefficients.length; i++) {
            int value = Character.getNumericValue(base.charAt(i)) * coefficients[i];
            if (value >= 10) {
                value -= 9;
            }
            total += value;
        }

        int verifier = total % 10 == 0 ? 0 : 10 - (total % 10);
        return base + verifier;
    }

    private LocalDate generateAdultBirthDate(int index) {
        int year = 1970 + (index % 35);
        int month = (index % 12) + 1;
        int day = (index % 28) + 1;

        return LocalDate.of(year, month, day);
    }

    private String generateCompanyRuc(int index) {
        return "179" + String.format("%07d", index) + "001";
    }

    private BigDecimal generateLatitude(int index) {
        BigDecimal baseLatitude = new BigDecimal("-0.180653");
        BigDecimal variation = new BigDecimal(index % 100).divide(new BigDecimal("10000"));
        return baseLatitude.add(variation);
    }

    private BigDecimal generateLongitude(int index) {
        BigDecimal baseLongitude = new BigDecimal("-78.467834");
        BigDecimal variation = new BigDecimal(index % 100).divide(new BigDecimal("10000"));
        return baseLongitude.subtract(variation);
    }
}
