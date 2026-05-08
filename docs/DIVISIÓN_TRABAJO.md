# División de Trabajo - Banco BanQuito

Equipo de 8 personas dividido por módulos y responsabilidades.

## 📌 Asignación General

```
CORE (Personas 1-3)          SWITCH (Personas 4-6)        INTEGRACIÓN (Persona 7)     DEVOPS (Persona 8)
├─ Modelos (P1)              ├─ Modelos (P4)              ├─ Controllers REST          ├─ Docker / Infra
├─ Repositorios (P2)         ├─ Repositorios (P5)         ├─ CoreBankingClient         ├─ CI/CD (GH Actions)
└─ Servicios (P3)            └─ Servicios (P6)            └─ Tests de Integración      └─ DB / Deployments
```

---

## 🧑‍💻 Descripción Detallada

### **PERSONA 1: Modelos y Entidades del Core**

**Módulo:** `backend/banquito-core/src/main/java/ec/edu/espe/banquito/core`

**Responsabilidades:**
- Crear y mantener clases JPA en carpeta `domain/entity/` o similar (según estructura base)
- Entidades a considerar:
  - `Customer.java` (Persona Natural y Jurídica)
  - `Account.java` (Cuentas)
  - `Branch.java` (Sucursales)
  - `AccountTransaction.java` (Movimientos)
  - `TransactionSubtype.java` (Tipos de transacciones)
  - `WebCredential.java` (Credenciales)
  - Otras según estructura original

**Validaciones Básicas:**
- Anotaciones `@NotNull`, `@Column`, `@Entity`
- Relaciones OneToMany, ManyToOne
- Enums para estados (ACTIVA, INACTIVA, BLOQUEADA, SUSPENDIDA)

**Requisitos Funcionales:**
- RF-01: Gestión de entidades
- RF-02: Administración de cuentas

**Commits clave:**
```bash
git log -- backend/banquito-core/src/main/java/.../domain/entity/
```

---

### **PERSONA 2: Repositorios y Persistencia del Core**

**Módulo:** `backend/banquito-core/src/main/java/ec/edu/espe/banquito/core`

**Responsabilidades:**
- Crear interfaces `Repository` en carpeta `repository/`
- Métodos personalizados para búsquedas frecuentes
- Anotaciones `@Query` para queries complejas
- Optimizaciones de BD (índices, eager/lazy loading)

**Interfaces a implementar:**
- `CustomerRepository` → búsqueda por cédula/RUC
- `AccountRepository` → búsqueda por número de cuenta, estado, sucursal
- `BranchRepository`
- `AccountTransactionRepository`
- `TransactionSubtypeRepository`
- `WebCredentialRepository`
- Otras según necesidad

**Requisitos Funcionales:**
- RF-03: Control de estados (queries para validar)
- RF-04: Transacciones (persistencia)
- RF-07: Historial (queries)

---

### **PERSONA 3: Servicios de Negocio del Core**

**Módulo:** `backend/banquito-core/src/main/java/ec/edu/espe/banquito/core`

**Responsabilidades:**
- Lógica de negocio en carpeta `service/`
- Orquestación entre repositorios
- Validaciones complejas (estados, saldos, límites)
- Transaccionalidad (`@Transactional`)

**Servicios principales:**
- `AccountService` → crear, actualizar, cambiar estado
- `TransactionService` → procesar débitos/créditos (ATÓMICO)
- `BalanceService` → consultar saldos (contable vs disponible)
- `CustomerService` → CRUD de clientes
- `AccountStateValidator` → validar transiciones de estado
- Otros según RF

**Requisitos Funcionales:**
- RF-03: Control de estados (lógica)
- RF-04: Motor transaccional (implementación)
- RF-05: Consulta de disponibilidad
- RF-06: Idempotencia (verificar UUID duplicados)

---

### **PERSONA 4: Modelos y Entidades del Switch**

**Módulo:** `backend/switch-pagos/src/main/java/ec/edu/espe/banquito/switchpagos`

**Responsabilidades:**
- Crear y mantener entidades JPA del Switch (carpeta `domain/entity/` o modelo según estructura)
- Entidades a considerar:
  - `PaymentBatch.java` (Archivos batch)
  - `PaymentDetail.java` (Líneas de detalle)
  - `BatchStatusLog.java` (Estados del batch)
  - `DetailStatusLog.java` (Estados por línea)
  - `ServiceCharge.java` (Comisiones cobradas)
  - `ServiceFeeRule.java` (Tabla tarifaria)
  - `FileValidation.java` (Validaciones)
  - `SwitchParameter.java` (Parámetros)

**Validaciones Básicas:**
- Anotaciones JPA (`@Entity`, `@Column`, etc.)
- Estados del batch (ENCOLADO, PROCESANDO, PROCESADO, ERROR)
- Enums para tipos de servicio (NOM, PRV, etc.)

**Requisitos Funcionales:**
- RF-01: Estructura de archivo (cabecera, detalle, pie)
- RF-08: Reportes (entidades para almacenar resultados)

---

### **PERSONA 5: Repositorios y Persistencia del Switch**

**Módulo:** `backend/switch-pagos/src/main/java/ec/edu/espe/banquito/switchpagos`

**Responsabilidades:**
- Crear interfaces `Repository` en carpeta `repository/`
- Queries específicas para batch processing
- Búsquedas por hash (detección de duplicidad)
- Reportes (queries complejas)

**Interfaces a implementar:**
- `PaymentBatchRepository` → búsqueda por estado, RUC, fecha
- `PaymentDetailRepository` → búsqueda por estado, cuenta
- `BatchStatusLogRepository` → historial
- `DetailStatusLogRepository` → detalles de rechazos
- `ServiceChargeRepository` → comisiones por lote
- `ServiceFeeRuleRepository` → tabla tarifaria
- `FileValidationRepository` → histórico de validaciones

**Requisitos Funcionales:**
- RF-02: Prevención de duplicidad (búsqueda por hash)
- RF-04: Resiliencia (almacenar rechazos)
- RF-06: Cálculo de comisiones (queries para totales)
- RF-08: Reportes

---

### **PERSONA 6: Servicios de Negocio del Switch**

**Módulo:** `backend/switch-pagos/src/main/java/ec/edu/espe/banquito/switchpagos`

**Responsabilidades:**
- Lógica de negocio en carpeta `service/`
- Orquestación del procesamiento batch
- Validaciones y cálculos

**Servicios principales:**
- `BatchProcessingService` → orquestador principal (RF-03, RF-04)
- `FileValidationService` → validar estructura y fraude (RF-02)
- `TransactionProcessingService` → procesar línea por línea (RF-03)
- `ResilienceService` → manejar errores sin abortar (RF-04)
- `CommissionCalculatorService` → calcular tarifas (RF-06)
- `NotificationService` → enviar notificaciones (RF-05)
- `ReportGeneratorService` → generar reportes (RF-08)

**Requisitos Funcionales:**
- RF-02: Validación temprana de archivo
- RF-03: Procesamiento secuencial
- RF-04: Resiliencia sin abortar
- RF-05: Notificaciones
- RF-06: Tarifaje
- RF-07: Liquidación contable
- RF-08: Reportes

---

### **PERSONA 7: Integración Core ↔ Switch + APIs REST**

**Módulos:** `backend/banquito-core/` y `backend/switch-pagos/`

**Responsabilidades:**

#### A) Controllers REST
- Crear endpoints públicos (`controller/`)
- Validar requests/responses
- Mapear DTOs

**Core:**
- `GET /api/accounts/{id}` — obtener cuenta
- `GET /api/accounts/{id}/balance` — consultar saldo (RF-05)
- `POST /api/transactions` — crear transacción
- `GET /api/transactions/{id}/history` — historial

**Switch:**
- `POST /api/batches/upload` — cargar archivo (RF-01)
- `GET /api/batches/{id}/status` — estado del lote
- `GET /api/batches/{id}/report` — descargar reporte (RF-08)

#### B) Integración Interna (CoreBankingClient)
- Llamadas síncronas Core ← Switch
- Métodos:
  - `queryBalance(accountId)` → RF-05 Core
  - `executeTransaction(source, dest, amount, uuid)` → RF-04 Core
  - `validateAccount(accountId)` → validaciones

#### C) Tests de Integración
- Verificar que Switch puede llamar al Core
- Escenarios: saldo insuficiente, cuenta bloqueada, etc.

**Requisitos Funcionales:**
- RF-05: Exposición de saldos
- RF-01, RF-03, RF-04: Endpoints Switch
- RF-06: Idempotencia (uso de UUID)

---

### **PERSONA 8: DevOps, Infra, Testing y Documentación**

**Responsabilidades:**

#### A) Infraestructura y Docker
- `infra/docker/docker-compose.yml` → entorno local
- `infra/docker/Dockerfile` → imagen de la app
- Configurar servicios: PostgreSQL, Redis (opcional)
- Variables de entorno (`.env`)

#### B) Scripts de Deployment
- `infra/scripts/build.sh` → compilar ambos módulos
- `infra/scripts/init-db.sh` → crear schema, seedear datos
- `infra/scripts/deploy.sh` → desplegar a servidor

#### C) CI/CD (GitHub Actions)
- `.github/workflows/ci-core.yml` → build+test Core
- `.github/workflows/ci-switch.yml` → build+test Switch
- `.github/workflows/integration-tests.yml` → tests de integración
- `.github/workflows/deploy.yml` → deploy automático

#### D) Testing
- Tests unitarios en cada módulo (supervisar)
- Tests de integración Core ↔ Switch
- Tests end-to-end (lote completo)

#### E) Documentación (Colaboración)
- Mantener actualizado `docs/` con cambios arquitectónicos
- Documentar decisiones de infra
- README por módulo

---

## 📋 Checklist de Tareas Iniciales

### Todos (Setup Común)
- [ ] Clonar repo unificado
- [ ] Instalar Maven, Java 21
- [ ] Configurar IDE (Eclipse/IntelliJ)

### Personas 1-3 (Core)
- [ ] Revisar entidades existentes en `banquito-core`
- [ ] Completar faltantes según RF-01 a RF-07
- [ ] Crear tests unitarios

### Personas 4-6 (Switch)
- [ ] Revisar entidades existentes en `switch-pagos`
- [ ] Implementar servicios según RF-01 a RF-08
- [ ] Crear tests unitarios

### Persona 7 (Integración)
- [ ] Crear `CoreBankingClient` (puente Core ↔ Switch)
- [ ] Implementar Controllers REST
- [ ] Escribir tests de integración

### Persona 8 (DevOps)
- [ ] Crear `docker-compose.yml`
- [ ] Automatizar tests en GitHub Actions
- [ ] Documentar deployment

---

## 🤝 Convenciones

### Commits
```
git commit -m "[MÓDULO] Brief description

Longer description if needed.
Closes #issue_number
"
```

Ejemplos:
```
[CORE] Implement AccountService.getBalance()
[SWITCH] Add CommissionCalculatorService
[INFRA] Setup docker-compose for local dev
```

### Ramas
```
feature/PERSON-X-description
bugfix/PERSON-X-description
```

Ejemplos:
```
feature/PERSON-1-customer-entity
bugfix/PERSON-3-transaction-atomicity
```

### Pull Requests
- Mínimo 1 revisor (puede ser Persona 7 o Persona 8)
- CI debe pasar (tests + build)

---

**Última actualización:** 6 de mayo de 2026
