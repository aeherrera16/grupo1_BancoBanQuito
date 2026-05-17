# BancoBanQuito — Guía de Base de Datos en Nube
**Servidor GCP:** `136.115.142.160` | **Usuario SSH:** `anahyyherrera@banquito`

---

## 1. CREDENCIALES — Cómo verlas en el servidor

```bash
# ── Core (MariaDB) ────────────────────────────────────────────
echo "=== CORE (MariaDB) ===" && \
sudo cat /etc/systemd/system/banquito-core.service | grep -E "DB_|Environment" && \
sudo cat /etc/systemd/system/banquito-core.service.d/override.conf 2>/dev/null | grep -E "DB_|Environment"

# ── Switch (PostgreSQL) ───────────────────────────────────────
echo "=== SWITCH (PostgreSQL) ===" && \
sudo cat /etc/systemd/system/banquito-switch.service | grep -E "DB_|Environment" && \
sudo cat /etc/systemd/system/banquito-switch.service.d/override.conf 2>/dev/null | grep -E "DB_|Environment"
```

> **Defaults del código si no hay override:**
> | Servicio | Motor | Usuario | Contraseña | Base de datos |
> |----------|-------|---------|------------|---------------|
> | banquito-core | MariaDB | `root` | *(vacía)* | `banquito_core` |
> | banquito-switch | PostgreSQL | `postgres` | `123` | `switch_pagos` |

---

## 2. RESET Y RECARGA — MariaDB (Core)

> **⚠️ Esto borra todos los datos actuales y los recarga desde cero con la nueva volumetría.**

```bash
# ── Paso 1: Detener el servicio Core ─────────────────────────
sudo systemctl stop banquito-core

# ── Paso 2: Entrar a MariaDB ──────────────────────────────────
sudo mysql -u root
# Si tiene contraseña: sudo mysql -u root -p
```

```sql
-- Dentro de MySQL: borrar y recrear la BD
DROP DATABASE IF EXISTS banquito_core;
CREATE DATABASE banquito_core
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;
EXIT;
```

```bash
# ── Paso 3: Actualizar código en el servidor ──────────────────
cd /opt/grupo1_BancoBanQuito && git pull

# ── Paso 4: Recompilar el Core (solo si hubo cambios Java) ────
cd grupo1_backend_core-feat-integracion-switch/core
mvn clean package -DskipTests
sudo cp target/*.jar /var/banquito/apps/banquito-core.jar

# ── Paso 5: Iniciar el servicio ───────────────────────────────
sudo systemctl start banquito-core

# ── Paso 6: Monitorear la carga (esperar ~60 segundos) ────────
sudo journalctl -u banquito-core -f | grep -E "INFO|ERROR|cargados"
```

> Cuando aparezca **`Datos de prueba cargados correctamente`** en el log, la carga terminó.

---

## 3. CONECTARSE A LAS BASES DE DATOS

```bash
# MariaDB (Core) ──────────────────────────────────────────────
sudo mysql -u root banquito_core
# Con contraseña:
sudo mysql -u root -p banquito_core

# PostgreSQL (Switch) ─────────────────────────────────────────
sudo -u postgres psql switch_pagos
# Con contraseña y host:
psql -h localhost -U postgres -d switch_pagos
# Ingresar contraseña cuando lo pida: 123
```

---

## 4. VERIFICACIÓN DE VOLUMETRÍA — MariaDB (Core)

### 4.1 Resumen General

```sql
SELECT
  (SELECT COUNT(*) FROM CUSTOMER WHERE CUSTOMER_TYPE = 'NATURAL')  AS clientes_naturales,
  (SELECT COUNT(*) FROM CUSTOMER WHERE CUSTOMER_TYPE = 'JURIDICO') AS empresas_corporativas,
  (SELECT COUNT(*) FROM CUSTOMER)                                   AS total_clientes,
  (SELECT COUNT(*) FROM ACCOUNT  WHERE STATUS = 'ACTIVO')           AS total_cuentas_activas,
  (SELECT COUNT(*) FROM BRANCH)                                     AS sucursales;
```

**Resultado esperado:**

| clientes_naturales | empresas_corporativas | total_clientes | total_cuentas_activas | sucursales |
|-------------------|-----------------------|----------------|----------------------|------------|
| 500 | 50 | 550 | 1500 | 5 |

---

### 4.2 Distribución de Cuentas por Tipo

```sql
SELECT
  ast.CODE        AS codigo,
  ast.NAME        AS tipo_cuenta,
  COUNT(a.ID)     AS total_cuentas,
  ROUND(COUNT(a.ID) * 100.0 / (SELECT COUNT(*) FROM ACCOUNT WHERE STATUS='ACTIVO'), 1) AS porcentaje
FROM ACCOUNT a
JOIN ACCOUNT_SUBTYPE ast ON a.ACCOUNT_SUBTYPE_ID = ast.ID
WHERE a.STATUS = 'ACTIVO'
GROUP BY ast.CODE, ast.NAME
ORDER BY ast.CODE;
```

**Resultado esperado:**

| codigo | tipo_cuenta | total_cuentas |
|--------|-------------|---------------|
| AHO | Ahorros | ~650 |
| CTE | Corriente | ~600 |
| NOM | Nómina | ~250 |

---

### 4.3 Verificar el 20% de Naturales con 2 Cuentas

```sql
SELECT
  (SELECT COUNT(*) FROM CUSTOMER WHERE CUSTOMER_TYPE='NATURAL') AS total_naturales,
  COUNT(*) AS naturales_con_2_cuentas,
  ROUND(COUNT(*) * 100.0 /
    (SELECT COUNT(*) FROM CUSTOMER WHERE CUSTOMER_TYPE='NATURAL'), 1) AS porcentaje
FROM CUSTOMER c
WHERE c.CUSTOMER_TYPE = 'NATURAL'
  AND (SELECT COUNT(*) FROM ACCOUNT a WHERE a.CUSTOMER_ID = c.ID) = 2;
```

**Resultado esperado:** `naturales_con_2_cuentas = 100` (20% de 500)

---

### 4.4 Cuentas por Empresa (3 por cada una: Operativa, Nómina, Impuestos)

```sql
SELECT
  c.IDENTIFICATION  AS ruc,
  c.LEGAL_NAME      AS empresa,
  ast.CODE          AS tipo_codigo,
  ast.NAME          AS tipo_cuenta,
  a.ACCOUNT_NUMBER  AS numero_cuenta,
  b.NAME            AS sucursal,
  a.AVAILABLE_BALANCE AS saldo
FROM CUSTOMER c
JOIN ACCOUNT a           ON a.CUSTOMER_ID         = c.ID
JOIN ACCOUNT_SUBTYPE ast ON a.ACCOUNT_SUBTYPE_ID   = ast.ID
JOIN BRANCH b            ON a.BRANCH_ID            = b.ID
WHERE c.CUSTOMER_TYPE = 'JURIDICO'
ORDER BY c.LEGAL_NAME, ast.CODE
LIMIT 30;
```

---

### 4.5 Conteo de Cuentas por Empresa (verificar mínimo 3)

```sql
SELECT
  c.LEGAL_NAME AS empresa,
  COUNT(a.ID)  AS total_cuentas,
  GROUP_CONCAT(ast.CODE ORDER BY ast.CODE SEPARATOR ', ') AS tipos
FROM CUSTOMER c
JOIN ACCOUNT a           ON a.CUSTOMER_ID         = c.ID
JOIN ACCOUNT_SUBTYPE ast ON a.ACCOUNT_SUBTYPE_ID   = ast.ID
WHERE c.CUSTOMER_TYPE = 'JURIDICO'
GROUP BY c.ID, c.LEGAL_NAME
ORDER BY c.LEGAL_NAME;
```

---

### 4.6 Sucursales

```sql
SELECT BRANCH_CODE, NAME, CITY FROM BRANCH ORDER BY BRANCH_CODE;
```

**Resultado esperado:**

| BRANCH_CODE | NAME | CITY |
|-------------|------|------|
| 001 | Sucursal Norte | Quito |
| 002 | Sucursal Sur | Quito |
| 003 | Sucursal Centro | Quito |
| 004 | Sucursal Valles | Quito |
| 005 | Sucursal Digital | Digital |

---

### 4.7 Muestra de Clientes Naturales con sus Cuentas

```sql
SELECT
  c.IDENTIFICATION                     AS cedula,
  CONCAT(c.FIRST_NAME,' ',c.LAST_NAME) AS nombre,
  c.EMAIL,
  a.ACCOUNT_NUMBER                     AS numero_cuenta,
  ast.NAME                             AS tipo_cuenta,
  b.NAME                               AS sucursal,
  a.AVAILABLE_BALANCE                  AS saldo
FROM CUSTOMER c
JOIN ACCOUNT a           ON a.CUSTOMER_ID         = c.ID
JOIN ACCOUNT_SUBTYPE ast ON a.ACCOUNT_SUBTYPE_ID   = ast.ID
JOIN BRANCH b            ON a.BRANCH_ID            = b.ID
WHERE c.CUSTOMER_TYPE = 'NATURAL'
ORDER BY c.IDENTIFICATION
LIMIT 20;
```

---

### 4.8 Verificar Clientes Demo (Anahy Herrera + Empresas Demo)

```sql
-- Cliente demo: Anahy Herrera
SELECT
  c.IDENTIFICATION,
  CONCAT(c.FIRST_NAME,' ',c.LAST_NAME) AS nombre,
  c.EMAIL,
  a.ACCOUNT_NUMBER,
  ast.NAME AS tipo_cuenta,
  a.AVAILABLE_BALANCE AS saldo
FROM CUSTOMER c
JOIN ACCOUNT a           ON a.CUSTOMER_ID         = c.ID
JOIN ACCOUNT_SUBTYPE ast ON a.ACCOUNT_SUBTYPE_ID   = ast.ID
WHERE c.IDENTIFICATION = '1750285577';

-- Empresa demo: TechSolutions
SELECT
  c.IDENTIFICATION AS ruc,
  c.LEGAL_NAME,
  a.ACCOUNT_NUMBER,
  ast.NAME AS tipo_cuenta,
  a.AVAILABLE_BALANCE AS saldo
FROM CUSTOMER c
JOIN ACCOUNT a           ON a.CUSTOMER_ID         = c.ID
JOIN ACCOUNT_SUBTYPE ast ON a.ACCOUNT_SUBTYPE_ID   = ast.ID
WHERE c.IDENTIFICATION = '1757158215001';
```

---

## 5. VERIFICACIÓN — PostgreSQL (Switch)

```sql
-- ① Estado de lotes de pago por canal
SELECT
  channel              AS canal,
  status               AS estado,
  COUNT(*)             AS total_lotes,
  SUM(header_total_amount) AS monto_total_usd
FROM payment_batch
GROUP BY channel, status
ORDER BY channel, status;

-- ② Totales generales del Switch
SELECT
  (SELECT COUNT(*) FROM payment_batch)  AS total_lotes,
  (SELECT COUNT(*) FROM payment_detail) AS total_registros_pago;

-- ③ Últimos 10 lotes procesados
SELECT
  id, file_name, ruc, channel, status,
  header_total_records, header_total_amount, received_at
FROM payment_batch
ORDER BY received_at DESC
LIMIT 10;
```

---

## 6. COMANDOS ÚTILES DE MONITOREO

```bash
# Ver estado de los 3 servicios
sudo systemctl status banquito-core banquito-switch banquito-buzon

# Ver logs en tiempo real
sudo journalctl -u banquito-core   -f --no-pager
sudo journalctl -u banquito-switch -f --no-pager
sudo journalctl -u banquito-buzon  -f --no-pager

# Ver las últimas 50 líneas de log
sudo journalctl -u banquito-core -n 50 --no-pager

# Reiniciar todos los servicios
sudo systemctl restart banquito-core banquito-switch banquito-buzon
```

---

## 7. RESUMEN DE VOLUMETRÍA ESPERADA

| Requisito | Valor esperado | Verificación |
|-----------|---------------|--------------|
| Clientes naturales | 500 | `SELECT COUNT(*) FROM CUSTOMER WHERE CUSTOMER_TYPE='NATURAL'` |
| Empresas corporativas | 50 | `SELECT COUNT(*) FROM CUSTOMER WHERE CUSTOMER_TYPE='JURIDICO'` |
| Cuentas activas totales | 1,500 | `SELECT COUNT(*) FROM ACCOUNT WHERE STATUS='ACTIVO'` |
| Naturales con 2 cuentas | 100 (20%) | SELECT 4.3 |
| Cuentas por empresa | ≥ 3 | SELECT 4.5 |
| Sucursales | 5 | `SELECT COUNT(*) FROM BRANCH` |
| Tipo cuenta Operativa | CTE | Todas las empresas |
| Tipo cuenta Nómina | NOM | Todas las empresas |
| Tipo cuenta Impuestos | AHO | Todas las empresas |
| Saldo inicial por cuenta | $1,000.00 USD | `SELECT AVG(AVAILABLE_BALANCE) FROM ACCOUNT` |

---

*Generado para BancoBanQuito — Grupo 1 | 2026*
