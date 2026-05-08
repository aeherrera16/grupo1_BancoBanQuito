# SETUP - Guía de Configuración Inicial

Instrucciones paso a paso para configurar el proyecto localmente.

## 📋 Requisitos Previos

### Software
- **Git** 2.30+
- **Java 21** (verificar con `java -version`)
- **Maven 3.8+** (verificar con `mvn -version`)
- **Docker** + **Docker Compose** (opcional, para BD local)
- **IDE:** IntelliJ IDEA, Eclipse, o VS Code + Extension Pack for Java

### Puertos Necesarios
- `8080` → Core
- `8081` → Switch
- `5432` → PostgreSQL (si usas Docker)
- `6379` → Redis (si lo añades luego)

---

## 🚀 1. Clonar el Repositorio

```bash
# Clonar
git clone https://github.com/aeherrera16/grupo1_BancoBanQuito.git
cd grupo1_BancoBanQuito

# Ver ramas
git branch -a

# (Opcional) Cambiar de rama si trabajas en una feature
git checkout feature/PERSON-X-description
```

---

## 🔧 2. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz (copia de `.env.example`):

```bash
cp .env.example .env
```

**Contenido de `.env` para desarrollo:**

```env
# Database (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=banquito_db
DB_USER=banquito_user
DB_PASSWORD=banquito_password

# Core
CORE_PORT=8080
CORE_LOG_LEVEL=DEBUG

# Switch
SWITCH_PORT=8081
SWITCH_LOG_LEVEL=DEBUG

# General
ENVIRONMENT=development
TIMEZONE=America/Guayaquil
```

---

## 🐳 3. Opción A: Levantar con Docker Compose (Recomendado)

### Paso 1: Preparar Docker Compose

```bash
cd infra/docker
cat docker-compose.yml  # Ver configuración
```

### Paso 2: Levantar Servicios

```bash
docker-compose up -d
```

**Servicios que se crean:**
- `postgres:15` → Base de datos
- `banquito-core:latest` → Aplicación Core (puerto 8080)
- `banquito-switch:latest` → Aplicación Switch (puerto 8081)

### Paso 3: Verificar Status

```bash
docker-compose ps
docker-compose logs -f core  # Ver logs del Core
docker-compose logs -f switch
```

### Paso 4: Detener (cuando termines)

```bash
docker-compose down
docker volume rm banquito_db  # (Opcional) Limpiar BD
```

---

## 🏗 Opción B: Levantar Manualmente (sin Docker)

### Prerequisito: Base de Datos PostgreSQL

Si **no usas Docker**, necesitas una BD PostgreSQL en `localhost:5432`.

```bash
# En macOS (con Homebrew)
brew install postgresql@15
brew services start postgresql@15

# En Linux (Ubuntu/Debian)
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql

# En Windows
# Descargar e instalar desde https://www.postgresql.org/download/windows/
```

### Crear BD y Usuario

```bash
psql -U postgres

-- Dentro de psql
CREATE DATABASE banquito_db;
CREATE USER banquito_user WITH PASSWORD 'banquito_password';
ALTER ROLE banquito_user SET client_encoding TO 'utf8';
ALTER ROLE banquito_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE banquito_user SET default_transaction_deferrable TO on;
GRANT ALL PRIVILEGES ON DATABASE banquito_db TO banquito_user;
\q
```

### Ejecutar Migraciones

```bash
cd backend/banquito-core
mvn flyway:migrate  # Si usas Flyway, o ejecuta scripts en src/main/resources/db/

cd ../../backend/switch-pagos
mvn flyway:migrate
```

### Levantar Core

**Terminal 1:**

```bash
cd backend/banquito-core
mvn clean install
mvn spring-boot:run
```

**Output esperado:**

```
...
2026-05-06 10:30:00.123 INFO  [...] Tomcat started on port(s): 8080 (http) with context path ''
2026-05-06 10:30:00.456 INFO  [...] Started BanquitoCoreApplication in 5.234 seconds
```

### Levantar Switch

**Terminal 2:**

```bash
cd backend/switch-pagos
mvn clean install
mvn spring-boot:run
```

**Output esperado:**

```
...
2026-05-06 10:30:10.123 INFO  [...] Tomcat started on port(s): 8081 (http) with context path ''
2026-05-06 10:30:10.456 INFO  [...] Started SwitchPagosApplication in 5.234 seconds
```

---

## ✅ 4. Verificar que Todo Funciona

### Health Checks

```bash
# Core
curl -s http://localhost:8080/actuator/health | jq .

# Switch
curl -s http://localhost:8081/actuator/health | jq .
```

**Response esperada:**

```json
{
  "status": "UP",
  "components": {
    "db": { "status": "UP" }
  }
}
```

### Tests Unitarios

```bash
# Core
cd backend/banquito-core
mvn test

# Switch
cd backend/switch-pagos
mvn test
```

---

## 🧪 5. Ejecutar Tests de Integración

```bash
# Desde raíz
mvn clean test -Dgroups=integration

# O directamente
cd backend/banquito-core
mvn verify
```

---

## 🔍 6. Configurar IDE

### IntelliJ IDEA

1. **Open** → Selecciona la carpeta `grupo1_BancoBanQuito`
2. **Trust Project** (si aparece)
3. **File → Project Structure → Project**
   - **SDK:** OpenJDK 21
   - **Language level:** 21
4. **Maven:**
   - Right-click en `pom.xml` → **Run Maven → maven clean install**

### Eclipse

1. **File → Import... → Existing Maven Projects**
2. **Browse** → selecciona `grupo1_BancoBanQuito`
3. **Next → Finish**
4. Espera a que indexe

### VS Code

1. Instala:
   - [Extension Pack for Java](https://marketplace.visualstudio.com/items?itemName=vscjava.vscode-java-pack)
   - [Maven for Java](https://marketplace.visualstudio.com/items?itemName=vscjava.vscode-maven)
2. **Open Folder** → `grupo1_BancoBanQuito`
3. VS Code reconocerá los `pom.xml` automáticamente

---

## 📱 7. Ejemplo: Crear una Cuenta (Testing Manual)

Una vez que Core esté funcionando:

```bash
# Crear cliente
curl -X POST http://localhost:8080/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "cedula": "1234567890",
    "firstName": "Juan",
    "lastName": "Pérez",
    "birthDate": "1990-01-01"
  }'

# Response esperada (si la Persona 7 implementó el endpoint):
# { "customerId": 1, "cedula": "1234567890", ... }

# Crear cuenta
curl -X POST http://localhost:8080/api/accounts \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": 1,
    "branchId": 1,
    "type": "SAVINGS"
  }'

# Consultar saldo
curl -X GET http://localhost:8080/api/accounts/ACC-001/balance
# { "accountNumber": "ACC-001", "availableBalance": 0, "balanceOnHold": 0 }
```

---

## 🚨 Troubleshooting

### Error: "Port 8080 is already in use"

```bash
# Matar proceso en puerto 8080
lsof -ti:8080 | xargs kill -9

# O cambiar puerto en application.yml
server.port=8082
```

### Error: "Connection refused" en la BD

```bash
# Verificar que PostgreSQL está corriendo
pg_isready -h localhost -p 5432

# Si no:
# macOS: brew services start postgresql@15
# Linux: sudo systemctl start postgresql
```

### Maven: "OutOfMemoryError"

```bash
# Aumentar memoria de Maven
export MAVEN_OPTS="-Xmx512m -XX:MaxPermSize=256m"
mvn clean install
```

### Git Subtree: Actualizar Switch desde el repo original

```bash
# Traer cambios más recientes del Switch
git fetch switch
git subtree pull --prefix=backend/switch-pagos switch main
```

---

## 📚 Siguientes Pasos

- [ ] Clonar repo
- [ ] Configurar BD (Docker o manual)
- [ ] Ejecutar `mvn clean install` en ambos módulos
- [ ] Levantar Core y Switch
- [ ] Ejecutar tests
- [ ] Configurar IDE preferido
- [ ] Leer [DIVISIÓN_TRABAJO.md](DIVISIÓN_TRABAJO.md) para saber qué desarrollar

---

**Última actualización:** 6 de mayo de 2026

¿Necesitas ayuda adicional? Crea un issue en GitHub o contacta a Persona 8 (DevOps).
