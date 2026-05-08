# ARQUITECTURA - Visión General del Sistema

Descripción de la arquitectura del monolito Banco BanQuito.

---

## 🏗 Diagrama de Bloques

```
┌─────────────────────────────────────────────────────────────┐
│                    Banco BanQuito - Monolito                │
│                                                             │
│  ┌──────────────────────┐        ┌──────────────────────┐  │
│  │   Core de Cuentas    │        │  Switch de Pagos     │  │
│  │   (banquito-core)    │        │  (switch-pagos)      │  │
│  │                      │        │                      │  │
│  │  • Clientes          │        │  • Procesamiento     │  │
│  │  • Cuentas           │◄────────  de archivos batch   │  │
│  │  • Transacciones     │        │  • Validaciones      │  │
│  │  • Saldos            │        │  • Tarifaje          │  │
│  │  • Estados           │        │  • Reportes          │  │
│  │                      │        │                      │  │
│  └──────────────────────┘        └──────────────────────┘  │
│           ▲                                   ▲               │
│           │ (1) API REST                     │ (1) API REST  │
│           │ (2) CoreBankingClient (síncrona) │               │
│           │                                   │               │
│           └──────────────────────┬────────────┘               │
│                                  │                           │
└──────────────────────────────────┼───────────────────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
            ┌───────▼────────┐          ┌────────▼─────┐
            │  Base de Datos │          │  (Opcional)  │
            │  PostgreSQL    │          │  Redis Cache │
            │                │          │              │
            └────────────────┘          └──────────────┘
```

---

## 🧩 Componentes

### 1. **Core de Cuentas** (`backend/banquito-core`)

**Responsabilidad Principal:** Mantener la integridad de cuentas y saldos.

#### Capas

```
┌──────────────────────────────────────┐
│          Controllers REST             │  ← Expone endpoints públicos
│   GET /api/accounts/{id}/balance     │
│   POST /api/transactions             │
│   GET /api/customers/{id}            │
└──────────────────────┬───────────────┘
                       │
┌──────────────────────▼───────────────┐
│           Services                    │  ← Lógica de negocio
│   AccountService                      │
│   TransactionService                  │
│   BalanceService                      │
│   CustomerService                     │
└──────────────────────┬───────────────┘
                       │
┌──────────────────────▼───────────────┐
│         Repositories                  │  ← Acceso a BD
│   CustomerRepository                  │
│   AccountRepository                   │
│   TransactionRepository               │
│   BranchRepository                    │
└──────────────────────┬───────────────┘
                       │
┌──────────────────────▼───────────────┐
│       Base de Datos (PostgreSQL)      │
│   Tables: customers, accounts,        │
│   transactions, branches, etc.        │
└───────────────────────────────────────┘
```

#### Flujo de Transacción (Ejemplo: RF-04)

```
1. Switch llama → Core.executeTransaction(sourceId, destId, amount, uuid)
                      ↓
2. Core valida:  ¿Existe source? ¿Existe dest? ¿Saldo disponible?
                      ↓
3. Core ejecuta: [ATOMICO]
   - INSERT transaction_log (source debito)
   - INSERT transaction_log (dest credito)
   - UPDATE account SET balance = ... (source)
   - UPDATE account SET balance = ... (dest)
                      ↓
4. Core retorna: TransactionResultDTO { success, transactionId, ... }
                      ↓
5. Switch recibe y continúa con siguiente línea del batch
```

#### Conceptos Clave

- **Atomicidad:** Las transacciones no pueden fallar parcialmente.
- **Saldo Disponible vs Contable:** Core expone ambos (RF-05).
- **Idempotencia:** Si recibe UUID duplicado, rechaza (RF-06).
- **Estados:** Una cuenta solo permite débitos si está ACTIVA.

---

### 2. **Switch de Pagos Masivos** (`backend/switch-pagos`)

**Responsabilidad Principal:** Procesar archivos batch de pagos.

#### Capas

```
┌──────────────────────────────────────┐
│        Controllers REST / SFTP        │  ← Ingesta de archivos
│   POST /api/batches/upload           │
│   GET /api/batches/{id}/status       │
│   GET /api/batches/{id}/report       │
└──────────────────────┬───────────────┘
                       │
┌──────────────────────▼───────────────┐
│     Validation & Processing           │  ← Lógica de batch
│   BatchProcessingService              │
│   FileValidationService               │
│   ResilienceService                   │
│   CommissionCalculatorService         │
└──────────────────────┬───────────────┘
                       │
┌──────────────────────▼───────────────┐
│   CoreBankingClient (Integración)     │  ← Llamadas a Core
│   - queryBalance()                    │
│   - executeTransaction()              │
└──────────────────────┬───────────────┘
                       │
┌──────────────────────▼───────────────┐
│         Repositories                  │  ← Almacenamiento switch
│   PaymentBatchRepository              │
│   PaymentDetailRepository             │
│   ServiceChargeRepository             │
└──────────────────────┬───────────────┘
                       │
┌──────────────────────▼───────────────┐
│       Base de Datos (PostgreSQL)      │
│   Tables: payment_batches,            │
│   payment_details, service_charges    │
└───────────────────────────────────────┘
```

#### Flujo de Procesamiento (Ejemplo: RF-03 a RF-08)

```
Usuario carga archivo → Controller (POST /batches/upload)
                             ↓
                      [1. Validación Estructural - RF-02]
                      • ¿Archivo bien formado?
                      • ¿Suma de montos coincide?
                      • ¿RUC cliente activo?
                      • ¿No es duplicado? (hash últimos 30 días)
                             ↓ (Si PASA)
                      [2. Encolado/Procesamiento - RF-01]
                      • ¿Es antes de 18:00?
                      • Si YES → procesar inmediatamente
                      • Si NO → encolar para 00:01 mañana
                             ↓
               [3. Procesamiento Línea por Línea - RF-03, RF-04]
               FOR EACH linea in batch:
                    - [3a] Validar límites de monto
                    - [3b] Validar saldo origen → Core.queryBalance()
                    - [3c] Validar destino → Core.validateAccount()
                    - [3d] Si PASA: ejecutar → Core.executeTransaction()
                    - Si FALLA: marcar línea "Rechazada" + motivo
                             ↓
                      [4. Cálculo de Comisión - RF-06]
                      • Contar transacciones exitosas
                      • Buscar tarifa según volumen
                      • Calcular subtotal comisión
                      • Calcular IVA (15%)
                      • Total = Subtotal + IVA
                             ↓
                   [5. Liquidación Contable - RF-07]
                   Tres movimientos automáticos en Core:
                   • Débito: Cuenta matriz empresa (Total a debitar)
                   • Crédito: INGRESOS_SERVICIOS_MASIVOS (Subtotal)
                   • Crédito: PASIVOS_IVA_RETENIDO (IVA)
                             ↓
                    [6. Notificaciones - RF-05]
                    FOR EACH linea exitosa:
                         • Enviar email a beneficiario
                         • Contenido: monto, concepto, empresa
                             ↓
                      [7. Reportes - RF-08]
                      • Generar comprobante liquidación corporativa
                      • Generar reporte de novedades (Exitosa/Rechazada)
                      • Cambiar estado a "Procesado"
                             ↓
                      (FIN - Archivo totalmente procesado)
```

#### Conceptos Clave

- **Resiliencia:** Una línea fallida NO aborta el archivo completo.
- **Tarifaje Dinámico:** Depende del volumen total exitoso (tabla).
- **Separación de Fondos:** Ingresos y IVA van a cuentas diferentes (normativa).
- **Horarios de Corte:** 18:00 es el límite; después encolado.

---

## 🔗 Integración: Core ↔ Switch

### Comunicación

```
┌─────────────────────────────────────────────────────────────┐
│ Switch (dentro del monolito)                                │
│                                                             │
│  @Service                                                   │
│  public class BatchProcessingService {                      │
│      @Autowired                                             │
│      private CoreBankingClient coreBankingClient;           │
│                                                             │
│      for (PaymentDetail line : batch.getDetails()) {        │
│          // [1] Consultar saldo                            │
│          BalanceDTO balance = coreBankingClient            │
│              .queryBalance(line.getDestinationAccount());  │
│                                                             │
│          // [2] Ejecutar transacción                       │
│          TransactionResultDTO result =                      │
│              coreBankingClient.executeTransaction(          │
│                  batch.getSourceAccount(),                 │
│                  line.getDestinationAccount(),             │
│                  line.getAmount(),                         │
│                  line.getUuid()  // RFC-06: Idempotencia │
│              );                                            │
│          // [3] Guardar resultado                          │
│          if (result.isSuccess()) {                         │
│              line.setStatus(EXITOSA);                      │
│          } else {                                          │
│              line.setStatus(RECHAZADA);                    │
│              line.setReason(result.getErrorMessage());     │
│          }                                                 │
│      }                                                      │
│  }                                                          │
└─────────────────────────────────────────────────────────────┘
```

### Transacciones Distribuidas

Usa `@Transactional` en ServiceBatch si necesitas que un fallo del Core revierta el cambio:

```java
@Service
public class BatchProcessingService {
    
    @Transactional(rollbackFor = Exception.class)
    public void processBatch(PaymentBatch batch) {
        // Si Core.executeTransaction() lanza excepción,
        // toda la BD del Switch en esa transacción se revierte
    }
}
```

---

## 📊 Modelo de Datos (Conceptual)

### Core - Tablas Principales

```sql
customers
  ├─ customer_id (PK)
  ├─ cedula / ruc (UNIQUE)
  ├─ first_name / last_name
  ├─ birth_date / constitution_date
  └─ customer_type (NATURAL / JURIDICA)

accounts
  ├─ account_id (PK)
  ├─ account_number (UNIQUE)
  ├─ customer_id (FK → customers)
  ├─ branch_id (FK → branches)
  ├─ account_type (SAVINGS / CHECKING / PAYROLL)
  ├─ status (ACTIVE / INACTIVE / BLOCKED / SUSPENDED)
  ├─ balance (Saldo contable)
  ├─ available_balance (Saldo disponible)
  └─ created_at / updated_at

account_transactions
  ├─ transaction_id (PK)
  ├─ account_id (FK)
  ├─ transaction_type (DEBIT / CREDIT)
  ├─ transaction_subtype (PAYROLL / ATM_WITHDRAWAL / etc.)
  ├─ amount
  ├─ post_balance
  ├─ uuid (UNIQUE - RF-06: Idempotencia)
  ├─ reference_number
  └─ created_at (TIMESTAMP)

branches
  ├─ branch_id (PK)
  ├─ code
  ├─ name
  └─ location
```

### Switch - Tablas Principales

```sql
payment_batches
  ├─ batch_id (PK)
  ├─ customer_ruc (FK → customers)
  ├─ batch_file_name
  ├─ batch_hash (RF-02: Detectar duplicidad)
  ├─ service_type (NOM / PRV)
  ├─ source_account_id (FK → accounts)
  ├─ total_records
  ├─ total_amount
  ├─ status (QUEUED / PROCESSING / PROCESSED / ERROR)
  ├─ received_at
  └─ processed_at

payment_details
  ├─ detail_id (PK)
  ├─ batch_id (FK)
  ├─ sequence_number
  ├─ beneficiary_id / beneficiary_name
  ├─ destination_account_id (FK → accounts)
  ├─ amount
  ├─ reference / concept
  ├─ status (SUCCESSFUL / REJECTED)
  ├─ rejection_reason (si aplica)
  ├─ uuid (UNIQUE - RF-06)
  └─ created_at

service_charges
  ├─ charge_id (PK)
  ├─ batch_id (FK)
  ├─ successful_transaction_count
  ├─ unit_fee
  ├─ subtotal_commission
  ├─ iva_amount
  ├─ total_charge
  └─ debit_transaction_id (FK → account_transactions en Core)

service_fee_rules
  ├─ rule_id (PK)
  ├─ min_transactions
  ├─ max_transactions
  ├─ unit_fee
  └─ effective_from
```

---

## 📊 Flujo de Datos (End-to-End)

```
[1] Empresa carga archivo → Switch Controller (SFTP o Web)
                              ↓
[2] FileValidationService valida estructura → Core BD (BD verificar cliente)
                              ↓
[3] BatchProcessingService itera líneas → Para c/ línea:
    - CoreBankingClient.queryBalance()
    - CoreBankingClient.executeTransaction()
    - PaymentDetailRepository.save(con status EXITOSA o RECHAZADA)
                              ↓
[4] CommissionCalculatorService calcula tarifa
    - ServiceChargeRepository.save()
    - CoreBankingClient.executeTransaction() [3 movimientos contables]
                              ↓
[5] NotificationService envía emails a beneficiarios
    - Usa direcciones de email en PaymentDetail
                              ↓
[6] ReportGeneratorService genera reportes
    - Comprobante liquidación corporativa
    - Reporte de novedades (línea por línea)
    - Ambos guardados en PaymentBatchRepository
                              ↓
[7] Status batch = "PROCESADO" → Disponible para descarga por empresa
```

---

## 🚀 Deployment (Alto Nivel)

```
Local Development
├─ Docker Compose (Core + Switch + PostgreSQL + Redis)
└─ Puertos: 8080 (Core), 8081 (Switch), 5432 (BD)

Staging / Production
├─ AWS ECS / Kubernetes
├─ RDS PostgreSQL (managed)
├─ ALB o API Gateway
└─ CloudWatch / Datadog (monitoring)
```

---

## 📈 Escalabilidad Futura

### Opción 1: Separar en Microservicios

Si el Switch explota en carga, sacarlo a su propio servicio:

```
Hoy (Monolito):
Core ←→ Switch (mismo proceso, BD compartida)

Mañana (Microservicios):
Core (servicio 1) ←→ [API Gateway] ←→ Switch (servicio 2)
(Ambos conectan a BD compartida o replicada)
```

### Opción 2: Cache

Añadir Redis para cachear saldos frecuentes (opcional):

```
Switch → Redis.get("account:ACC-001:balance")
      → Si no existe → Core.queryBalance() + Redis.set()
```

---

## 📚 Referencias

- [DIVISIÓN_TRABAJO.md](DIVISIÓN_TRABAJO.md) — Asignación de personas
- [SETUP.md](SETUP.md) — Cómo levantar localmente
- [REQUISITOS_RF.md](REQUISITOS_RF.md) — Mapeo RF-01 a RF-08

---

**Última actualización:** 6 de mayo de 2026
