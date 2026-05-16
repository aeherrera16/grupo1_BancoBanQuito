# Documentación de Despliegue en GCP - Proyecto BanQuito

Este documento resume todas las configuraciones, instalaciones y resoluciones de problemas realizados para desplegar el entorno del proyecto BanQuito en Google Cloud Platform (GCP).

## 1. Entorno de Infraestructura
- **Proveedor:** Google Cloud Platform (GCP)
- **Instancia:** e2-standard-2
- **Sistema Operativo:** Ubuntu (Acceso vía SSH como `root`)
- **IP Pública:** `136.115.142.160`

### Reglas de Firewall (GCP) configuradas
- Puertos HTTP/HTTPS (80, 81)
- Puerto SFTP para carga masiva (2222): `allow-sftp-banquito` (TCP:2222)

## 2. Bases de Datos
Se configuraron e inicializaron dos motores de bases de datos para soportar los distintos microservicios:
- **MariaDB:**
  - Base de datos: `banquito_core`
  - Uso: Backend Core.
- **PostgreSQL:**
  - Base de datos: `switch_pagos`
  - Uso: Backend Switch de Pagos.
  - *Troubleshooting:* Se debieron crear los esquemas, roles y contraseñas manualmente vía línea de comandos ya que la conexión tiraba `FATAL` por falta de credenciales/esquemas.

## 3. Backend (Microservicios Spring Boot - Java 21)
Se instaló `openjdk-21-jdk` tras resolver problemas de compatibilidad (`release version 21 not supported`). Los JARs se alojan en la ruta estándar `/var/banquito/apps/`.

### A. Core Backend (`banquito-core`)
- **Puerto local:** `8080`
- **Gestión:** Archivo systemd (`/etc/systemd/system/banquito-core.service`)
- **Variables inyectadas:** Credenciales de MariaDB.

### B. Switch de Pagos (`banquito-switch`)
- **Puerto local:** `8081`
- **Gestión:** Archivo systemd (`/etc/systemd/system/banquito-switch.service`)
- **Variables inyectadas:** Credenciales de PostgreSQL.

### C. Buzón SFTP y Carga Masiva (`switch-email-service` / `banquito-buzon`)
- **Puerto HTTP:** `8082`
- **Puerto SFTP (Embebido):** `2222`
- **Carpetas asignadas:** `/var/banquito/pagos/ingesta` y `/var/banquito/pagos/reportes`.
- **Gestión:** Archivo systemd (`/etc/systemd/system/banquito-buzon.service`)
- **Variables inyectadas:** Credenciales de FTP (`sftpuser`/`password`), rutas de directorios, URL base del Switch (`http://127.0.0.1:8081`) para el procesamiento en lote.
- **Troubleshooting:** Se instaló Maven global (`apt-get install -y maven`) ya que el ejecutable local `mvnw` no estaba presente en este sub-repositorio.

## 4. Servidor Web y Frontend (Vite/React + Nginx)
Se configuró **Nginx** como proxy inverso y servidor de archivos estáticos. 

### Directorios y Configuración
- **Banca Empresas (Frontend Core):**
  - Directorio base: `/var/www/banca-empresas`
  - Configuración Nginx: `/etc/nginx/sites-available/bancaempresas.conf` (Escucha en puerto `80`)
- **Switch Admin (Frontend Switch):**
  - Directorio base: `/var/www/switch-admin`
  - Configuración Nginx: `/etc/nginx/sites-available/switchadmin.conf` (Escucha en puerto `81`)
- *Troubleshooting:* Se debieron ajustar los comandos de empaquetado (build) tras cambios en la estructura de carpetas de los repositorios y actualizar peticiones CORS / hardcoding de `localhost`. Ambos se compilaron con Node.js en el sistema.

## 5. Resumen de Flujo de Carga Masiva
1. El usuario se conecta al SFTP (`136.115.142.160:2222`) vía FileZilla/WinSCP usando `sftpuser`/`password`.
2. Sube un archivo CSV a `/var/banquito/pagos/ingesta`.
3. El demonio de Java incrustado detecta el archivo (10s de espera).
4. HTTP POST hacia `127.0.0.1:8081` para procesar los pagos.
5. Los resultados se guardan en `/var/banquito/pagos/reportes`.

---
*Documento autogenerado en base a progreso de sesiones (16 de Mayo, 2026).*