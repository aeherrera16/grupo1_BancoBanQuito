# BancoBanQuito — Arquitectura del Sistema

---

## 1. Diagrama de Arquitectura General

```mermaid
graph TD
    EC(["👤 Empresa Cliente\nCFO / Tesorería"])
    OA(["👤 Operador de Agencia\nCajero / Asesor"])
    BF(["👤 Beneficiario\nEmpleado / Proveedor"])

    subgraph CANALES["Mundo Exterior — Canales de Entrada"]
        PW["🖥 Portal Web\nBanca Empresas\nbanco-banquito.duckdns.org"]
        SFTP["📁 Buzón SFTP Seguro\nPuerto 2222"]
        INT["🏦 Intranet Bancaria\nSistema de Agencia\nbanquito.duckdns.org"]
    end

    subgraph SWITCH["Monolito: Switch de Pagos — Spring Boot · Puerto 8081 · PostgreSQL"]
        SWAPI["API REST\n/switch/v1"]
        PROC["Motor de Pagos\nPaymentBatchService"]
        TAR["Motor de Tarifas\nComisión + IVA"]
        SCHED["Scheduler SFTP\nSftpSchedulerService"]
        REPW["Reportes\nCSV / JSON"]
        INTCORE["Integración Core\nRestTemplate"]
    end

    subgraph CORE["Monolito: Core Bancario — Spring Boot · Puerto 8080 · MariaDB"]
        CAPI["API REST\n/core/v1"]
        CUST["Gestión Clientes\nCustomerController"]
        ACC["Gestión Cuentas\nAccountController"]
        TRX["Transacciones\nTransactionController"]
    end

    BUZON["📦 Servicio Buzón\nApache SSHD · Puerto 2222\nbanquito-buzon · Puerto 8082"]
    SMTP["✉ Servidor SMTP\nNotificaciones por correo"]
    DBSW[("🗄 PostgreSQL\nswitch_pagos")]
    DBCO[("🗄 MariaDB\nbanquito_core")]

    EC -->|"1. Sube archivo CSV"| PW
    EC -->|"1. Deposita archivo CSV"| SFTP
    OA -->|"Gestiona clientes y cuentas"| INT

    PW -->|"POST lote de pago"| SWAPI
    SFTP --> BUZON
    BUZON -->|"Encola lote"| SWAPI
    INT --> CAPI

    SWAPI --> PROC
    SCHED --> SWAPI
    PROC --> TAR
    PROC --> INTCORE
    PROC --> REPW
    INTCORE -->|"3. Valida saldo\n6. Aplica débito/crédito"| CAPI
    PROC -->|"4. Liquida comisión e IVA"| CAPI
    PROC -->|"6. Ordena alerta"| SMTP

    CAPI --> CUST
    CAPI --> ACC
    CAPI --> TRX

    SWAPI --- DBSW
    CAPI --- DBCO

    SMTP -->|"7. Aviso de pago exitoso"| BF
    REPW -->|"5. Comprobante y reporte final"| EC
```

---

## 2. Diagrama de Secuencia — Canal Portal Web

```mermaid
sequenceDiagram
    actor Empresa as Empresa Cliente
    participant PW as Portal Web<br/>(banca-web-switch)
    participant SW as Switch<br/>(PaymentBatchController)
    participant PROC as Motor de Pagos<br/>(PaymentBatchService)
    participant CORE as Core Bancario<br/>(AccountController)
    participant SMTP as Servidor SMTP

    Empresa->>PW: Inicia sesión con RUC y contraseña
    PW->>CORE: POST /core/v1/auth/login
    CORE-->>PW: Token de sesión + datos empresa

    Empresa->>PW: Carga archivo CSV con nómina/pagos
    PW->>SW: POST /switch/v1/payment-batch (multipart CSV)
    SW->>SW: Valida cabecera y registros del CSV
    SW-->>PW: Lote creado · status RECIBIDO · ID lote

    Empresa->>PW: Pulsa "Procesar lote"
    PW->>SW: POST /switch/v1/payment-batch/{id}/process
    SW->>PROC: Inicia procesamiento

    PROC->>CORE: GET /core/v1/accounts/{cuentaFavorita}/balance
    CORE-->>PROC: Saldo disponible

    loop Por cada registro del CSV
        PROC->>CORE: POST /core/v1/transactions/debit (cuenta origen)
        CORE-->>PROC: Transacción aplicada
        PROC->>CORE: POST /core/v1/transactions/credit (cuenta destino)
        CORE-->>PROC: Transacción aplicada
    end

    PROC->>CORE: POST /core/v1/transactions/debit (comisión + IVA)
    CORE-->>PROC: Comisión liquidada

    PROC->>SMTP: Envía notificación de lote procesado
    SMTP-->>Empresa: Email con comprobante de pago

    SW-->>PW: status PROCESADO + totales
    PW-->>Empresa: Reporte y comprobante disponible
```

---

## 3. Diagrama de Secuencia — Canal SFTP

```mermaid
sequenceDiagram
    actor Empresa as Empresa Cliente
    participant SFTP as Buzón SFTP<br/>(Apache SSHD · 2222)
    participant BUZON as Servicio Buzón<br/>(SftpSchedulerService)
    participant SW as Switch<br/>(PaymentBatchService)
    participant CORE as Core Bancario
    participant SMTP as Servidor SMTP

    Empresa->>SFTP: Conecta con credenciales (RUC + clave)
    Empresa->>SFTP: Deposita archivo CSV en /pagos/ingesta/{ruc}/

    loop Polling cada 1 segundo
        BUZON->>SFTP: Revisa directorio /ingesta/{ruc}/
    end

    BUZON->>BUZON: Detecta archivo nuevo
    BUZON->>SW: POST /switch/v1/payment-batch (canal SFTP)
    SW-->>BUZON: Lote registrado · status ENCOLADO

    alt Sin fecha programada — procesamiento inmediato
        SW->>SW: Procesa lote al recibirlo
    else Con fecha programada
        Empresa->>PW: Selecciona fecha de efectivización en portal
        PW->>SW: POST /switch/v1/payment-batch/schedule
        SW->>SW: Espera hasta fecha programada
        SW->>SW: Ejecuta procesamiento en fecha indicada
    end

    loop Por cada registro del CSV
        SW->>CORE: Débito cuenta favorita empresa
        CORE-->>SW: OK
        SW->>CORE: Crédito cuenta beneficiario
        CORE-->>SW: OK
    end

    SW->>CORE: Liquidación comisión e IVA
    SW->>SMTP: Notificación de procesamiento
    SMTP-->>Empresa: Email con resultado del lote
```

---

## 4. Diagrama de Secuencia — Intranet Bancaria (Core)

```mermaid
sequenceDiagram
    actor Operador as Operador de Agencia
    participant INT as Intranet Bancaria<br/>(frontend-core)
    participant CORE as Core Bancario<br/>(Spring Boot)
    participant DB as MariaDB<br/>(banquito_core)

    Operador->>INT: Inicia sesión (usuario + contraseña)
    INT->>CORE: POST /core/v1/auth/login
    CORE->>DB: Verifica credenciales en core_user
    DB-->>CORE: Usuario válido
    CORE-->>INT: JWT + rol

    Operador->>INT: Busca cliente por cédula o RUC
    INT->>CORE: GET /core/v1/customers?identification=...
    CORE->>DB: SELECT en customer
    DB-->>CORE: Datos del cliente
    CORE-->>INT: Cliente encontrado

    Operador->>INT: Abre nueva cuenta
    INT->>CORE: POST /core/v1/accounts
    CORE->>DB: INSERT en account
    CORE->>DB: INSERT transacción de apertura en account_transaction
    DB-->>CORE: Cuenta creada
    CORE-->>INT: Número de cuenta generado

    Operador->>INT: Registra transacción manual
    INT->>CORE: POST /core/v1/transactions
    CORE->>DB: Valida saldo en account
    CORE->>DB: INSERT en account_transaction
    CORE->>DB: UPDATE balance en account
    DB-->>CORE: Transacción completada
    CORE-->>INT: Confirmación con saldo actualizado
```

---

## 5. Componentes Lógicos

```mermaid
graph TD
    subgraph FC["Frontend Core — React · Vite · Tailwind"]
        FC1["LoginPage"]
        FC2["CustomerSearchPage\nCrear / buscar clientes"]
        FC3["AccountCreatePage\nApertura de cuentas"]
        FC4["TransactionsPage\nHistorial y movimientos"]
        FC5["BranchesPage · HolidaysPage"]
        FC6["DashboardPage"]
    end

    subgraph FS["Frontend Switch — TypeScript · Vite"]
        FS1["LoginPage"]
        FS2["AccountsPage\nCuentas de la empresa"]
        FS3["PaymentsPage\nCarga y procesamiento CSV"]
        FS4["ReportsPage\nReportes de lotes"]
        FS5["SftpPage\nBuzón y programación"]
    end

    subgraph CORE["Core Bancario — Spring Boot · Java"]
        subgraph CC["Controllers"]
            CC1["CustomerController\n/core/v1/customers"]
            CC2["AccountController\n/core/v1/accounts"]
            CC3["TransactionController\n/core/v1/transactions"]
            CC4["BranchController\n/core/v1/branches"]
            CC5["AuthController\n/core/v1/auth"]
            CC6["IntegrationController\n/core/v1/integration"]
        end
        subgraph CS["Services + Repositories"]
            CS1["CustomerService"]
            CS2["AccountService"]
            CS3["TransactionService"]
            CS4["DataInitializer\nCarga datos iniciales"]
        end
        COREDB[("MariaDB\nbanquito_core")]
    end

    subgraph SW["Switch de Pagos — Spring Boot · Java"]
        subgraph SC["Controllers"]
            SC1["PaymentBatchController\n/switch/v1/payment-batch"]
            SC2["PaymentDetailController"]
        end
        subgraph SS["Services"]
            SS1["PaymentBatchService\nMotor de pagos"]
            SS2["TarifaService\nComisión + IVA"]
            SS3["CoreIntegrationService\nLlama al Core"]
            SS4["EmailService\nNotificaciones SMTP"]
            SS5["SftpSchedulerService\nPolling 1s"]
        end
        SWDB[("PostgreSQL\nswitch_pagos")]
    end

    subgraph BZ["Servicio Buzón — Spring Boot · Java"]
        BZ1["SftpServerService\nApache SSHD · 2222"]
        BZ2["FileDetectorService\nDetecta archivos nuevos"]
    end

    FC --> CORE
    FS --> SW
    FS --> CORE
    SW --> CORE
    BZ --> SW
    CORE --- COREDB
    SW --- SWDB
```

---

## 6. Base de Datos — MariaDB (Core Bancario)

```mermaid
erDiagram
    CUSTOMER {
        bigint id PK
        varchar identification
        varchar identification_type
        varchar customer_type
        varchar first_name
        varchar last_name
        varchar legal_name
        varchar email
        varchar mobile_phone
        varchar address
        varchar status
        datetime registration_date
        date birth_date
        date constitution_date
        bigint legal_representative_id FK
        bigint customer_subtype_id FK
    }

    CUSTOMER_SUBTYPE {
        bigint id PK
        varchar customer_type
        varchar name
        varchar description
        varchar status
    }

    ACCOUNT {
        bigint id PK
        varchar account_number
        varchar status
        decimal accounting_balance
        decimal available_balance
        boolean is_favorite
        datetime opening_date
        datetime last_update
        bigint customer_id FK
        bigint branch_id FK
        bigint account_subtype_id FK
    }

    ACCOUNT_SUBTYPE {
        bigint id PK
        varchar super_type
        varchar code
        varchar name
        varchar description
        varchar status
    }

    ACCOUNT_TRANSACTION {
        bigint id PK
        varchar transaction_uuid
        varchar movement_type
        decimal amount
        decimal resulting_balance
        varchar status
        varchar description
        datetime transaction_date
        bigint account_id FK
        bigint transaction_subtype_id FK
    }

    TRANSACTION_SUBTYPE {
        bigint id PK
        varchar code
        varchar name
        varchar description
        varchar status
    }

    BRANCH {
        bigint id PK
        varchar branch_code
        varchar name
        varchar city
        datetime creation_date
    }

    WEB_CREDENTIAL {
        bigint id PK
        varchar username
        varchar password_hash
        varchar status
        datetime creation_date
        bigint customer_id FK
    }

    CORE_USER {
        bigint id PK
        varchar username
        varchar password_hash
        varchar full_name
        varchar role
        varchar status
        datetime creation_date
    }

    INSTITUTIONAL_ACCOUNT {
        bigint id PK
        varchar account_number
        varchar name
        varchar code
        varchar description
        decimal accounting_balance
        decimal balance
        varchar status
        datetime creation_date
    }

    CORE_PARAMETER {
        bigint id PK
        varchar code
        varchar name
        varchar value_string
        varchar data_type
        varchar description
        datetime last_update
    }

    HOLIDAY {
        bigint id PK
        date date
        varchar description
        varchar country
    }

    CUSTOMER      }|--|| CUSTOMER_SUBTYPE    : "tiene subtipo"
    CUSTOMER      ||--o{ ACCOUNT             : "posee"
    CUSTOMER      }o--o| CUSTOMER            : "representante legal"
    ACCOUNT       }|--|| ACCOUNT_SUBTYPE     : "es de tipo"
    ACCOUNT       }|--|| BRANCH              : "pertenece a"
    ACCOUNT       ||--o{ ACCOUNT_TRANSACTION : "registra"
    ACCOUNT_TRANSACTION }|--|| TRANSACTION_SUBTYPE : "es de tipo"
    CUSTOMER      ||--o{ WEB_CREDENTIAL      : "accede con"
```

---

## 7. Base de Datos — PostgreSQL (Switch de Pagos)

```mermaid
erDiagram
    PAYMENT_BATCH {
        bigint id PK
        varchar file_name
        varchar ruc
        varchar channel
        varchar status
        integer header_total_records
        decimal header_total_amount
        datetime received_at
        datetime scheduled_date
        datetime processed_at
    }

    PAYMENT_DETAIL {
        bigint id PK
        integer sequence_number
        varchar beneficiary_id
        varchar beneficiary_name
        varchar account_number
        decimal amount
        varchar concept
        varchar email
        varchar status
        datetime processed_at
        varchar error_message
        bigint batch_id FK
    }

    PAYMENT_BATCH ||--o{ PAYMENT_DETAIL : "contiene"
```

---

*BancoBanQuito — Grupo 1 | Arquitectura de Software | 2026*
