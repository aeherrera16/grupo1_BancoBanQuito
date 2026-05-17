# Estado Actual del Despliegue en Google Cloud (GCP) - Proyecto BanQuito

Este documento contiene el estado global y absoluto del servidor en GCP. Cubre configuración de red, credenciales, bases de datos de todos los microservicios, estructura de carpetas, proxy inverso (Nginx), demonios de sistema (systemd), servidor SFTP incrustado y servidor de correos (SMTP).

---

## 1. Información General de la Infraestructura
- **Plataforma:** Google Cloud Platform (GCP)
- **Instancia:** `banquito` (e2-standard-2)
- **Zona:** `us-central1-a`
- **Proyecto:** `project-47695a8e-7cb2-4352-af2`
- **IP Pública:** `136.115.142.160`
- **Sistema Operativo:** Ubuntu Linux
- **Java:** OpenJDK 21 (`apt-get install -y openjdk-21-jdk`)
- **Maven Global:** Instalado para compilar sub-módulos (`apt-get install -y maven`)

### Mapa de Puertos Abiertos (Firewall GCP y Local)
| Puerto | Protocolo | Servicio / Uso | Expuesto en Firewall GCP |
|---|---|---|---|
| `22` | TCP | Conexión SSH (Acceso remoto) | Sí |
| `80` | TCP | Redirección HTTP a HTTPS vía Nginx | Sí |
| `81` | TCP | (Ya no se usa) | No |
| `443` | TCP | Ambos Frontends (Seguros vía DuckDNS + Certbot) | Sí (`allow-https-banquito`)|
| `2222` | TCP | Servidor SFTP incrustado para carga masiva | Sí (`allow-sftp-banquito`)|
| `3306` | TCP | Base de Datos MariaDB | Sólo Localhost |
| `5432` | TCP | Base de Datos PostgreSQL | Sólo Localhost |
| `8080` | TCP | Backend Core (Java Spring Boot) | Sólo Localhost (Vía Nginx) |
| `8081` | TCP | Backend Switch (Java Spring Boot) | Sólo Localhost (Vía Nginx) |

---

## 2. Bases de Datos (Motores locales)

### A. MariaDB (Motor del Core Bancario)
- **Base de Datos:** `banquito_core`
- **Usuario:** `root`
- **Contraseña:** `root`
- **Acceso Administrativo:** `sudo mariadb -u root -proot`

### B. PostgreSQL (Motor del Switch de Pagos)
- **Base de Datos:** `switch_pagos`
- **Usuario:** `postgres`
- **Contraseña predeterminada:** `123` (según configuración de propiedades)
- **Acceso Administrativo:** `sudo -u postgres psql -d switch_pagos`

---

## 3. Configuración de Microservicios (Backend - Systemd)

Todos los compilados Java (`.jar`) se encuentran ejecutándose en la carpeta de producción: `/var/banquito/apps/`.

### A. Core Bancario (`banquito-core.service`)
- **Archivo:** `/var/banquito/apps/banquito-core.jar`
- **Ruta Demonio:** `/etc/systemd/system/banquito-core.service`
- **Estado de Correo:** Configurado con TLS habilitado para Gmail usando Contraseña de Aplicación.
- **Configuración exacta actual:**
```ini
[Unit]
Description=Banco BanQuito Core API
After=network.target mariadb.service

[Service]
User=root
WorkingDirectory=/var/banquito/apps
Environment=SPRING_PROFILES_ACTIVE=prod
Environment="DB_URL=jdbc:mariadb://127.0.0.1:3306/banquito_core?serverTimezone=America/Guayaquil"
Environment="DB_USERNAME=root"
Environment="DB_PASSWORD=root"

# Configuración de Correo SMTP (Gmail + STARTTLS)
Environment="SPRING_MAIL_HOST=smtp.gmail.com"
Environment="SPRING_MAIL_PORT=587"
Environment="SPRING_MAIL_USERNAME=anahyyherrera@gmail.com"
Environment="SPRING_MAIL_PASSWORD=lutezbjmwsluvgsj"
Environment="SPRING_MAIL_PROPERTIES_MAIL_SMTP_AUTH=true"
Environment="SPRING_MAIL_PROPERTIES_MAIL_SMTP_STARTTLS_ENABLE=true"
Environment="APP_MAIL_FROM=anahyyherrera@gmail.com"
Environment="APP_MAIL_FROM_NAME=Banco BanQuito"

ExecStart=/usr/bin/java -jar /var/banquito/apps/banquito-core.jar
SuccessExitStatus=143
Restart=on-failure
RestartSec=10
SyslogIdentifier=banquito-core
```

### B. Switch de Pagos (`banquito-switch.service`)
- **Archivo:** `/var/banquito/apps/banquito-switch.jar`
- **Ruta Demonio:** `/etc/systemd/system/banquito-switch.service`
- **Función:** Procesa los cobros, validación de reglas de comisiones (ServiceFeeRule) y enruta transacciones hacia el host emisor y marca el SwitchParameters.
- Conectado a la base de datos `switch_pagos` mediante inyección del jdbc local.

### C. Buzón Carga Masiva y SFTP (`banquito-buzon.service`)
- **Archivo:** `/var/banquito/apps/banquito-buzon.jar`
- **Ruta Demonio:** `/etc/systemd/system/banquito-buzon.service`
- **Directorios Claves para Archivos Batch (.csv):** 
  - Subidas (Ingesta): `/var/banquito/pagos/ingesta`
  - Descargas (Respuestas): `/var/banquito/pagos/reportes`
- **Credenciales del Cliente FTP:**
  - Host: `136.115.142.160` (Pto `2222`)
  - Usuario: `sftpuser`
  - Contraseña: `password`
- **Configuración exacta actual:**
```ini
[Unit]
Description=Banco BanQuito SFTP y Buzon de Archivos Masivos
After=network.target banquito-switch.service

[Service]
User=root
WorkingDirectory=/var/banquito/apps

# Servidor Interno SFTP
Environment=SFTP_SERVER_ENABLED=true
Environment=SFTP_SERVER_PORT=2222
Environment=SFTP_SERVER_USERNAME=sftpuser
Environment=SFTP_SERVER_PASSWORD=password
Environment=SFTP_SERVER_UPLOAD_DIRECTORY=/var/banquito/pagos/ingesta

# Procesador programado (Cron interno)
Environment=EMAIL_PROCESSOR_ENABLED=true
Environment=EMAIL_PROCESSOR_INPUT_DIR=/var/banquito/pagos/ingesta
Environment=EMAIL_PROCESSOR_PROCESSED_DIR=/var/banquito/pagos/reportes
Environment=EMAIL_PROCESSOR_ERROR_DIR=/var/banquito/pagos/reportes
Environment=EMAIL_PROCESSOR_SCAN_INTERVAL=10s

# Envía el lote CSV internamente al Switch de pagos
Environment=SWITCH_API_BASE_URL=http://127.0.0.1:8081

ExecStart=/usr/bin/java -jar /var/banquito/apps/banquito-buzon.jar
SuccessExitStatus=143
Restart=on-failure
RestartSec=10
```

---

## 4. Frontend, Dominios y Servidor Web Proxy (Nginx + DuckDNS)

Nginx expone las vistas web de React y realiza "enrutamiento" (proxy pass) para que el frontend pueda llamar a las APIs de Backend sin errores de CORS. Ambos sistemas utilizan dominios gratuitos de DuckDNS y tráfico encriptado HTTPS provisto por Let's Encrypt (Certbot).

### A. Frontend Core Bancario (Banca Empresas)
- **Directorio de compilado:** `/var/www/banca-empresas`
- **Configuración Nginx:** `/etc/nginx/sites-available/bancaempresas.conf`
- **Puerto:** `443` (Redirección automática desde el `80`)
- **Dominio Público:** `https://banquito.duckdns.org`

### B. Frontend Switch Admin
- **Directorio de compilado:** `/var/www/switch-admin`
- **Configuración Nginx:** `/etc/nginx/sites-available/switchadmin.conf`
- **Puerto:** `443` (Redirección automática desde el `80`)
- **Dominio Público:** `https://banco-banquito.duckdns.org`
- **Configuración exacta actual Nginx (Con SSL y Proxy pass al Backend):**
```nginx
server {
    server_name banco-banquito.duckdns.org;
    
    root /var/www/switch-admin;
    index index.html;

    # Carga la interfaz gráfica (React Router)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Redirecciona los endpoints de validacion/login al puerto 8080 del Core
    location /core/ {
        proxy_pass http://127.0.0.1:8080/core/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Redirecciona los endpoints de facturacion/pagos al puerto 8081 del Switch
    location /api/switch/ {
        proxy_pass http://127.0.0.1:8081/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/banco-banquito.duckdns.org/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/banco-banquito.duckdns.org/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}

server {
    if ($host = banco-banquito.duckdns.org) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    listen 80;
    server_name banco-banquito.duckdns.org;
    return 404; # managed by Certbot
}
```

---

## 5. Accesos Rápidos y Credenciales Creadas (Data Initializer)
El backend inserta de manera automática los siguientes usuarios en la DB para iniciar sesión en la Web:

1. **Cliente Común (Persona o Empresa para hacer lotes):**
   - Usuario: `cliente.001` (hasta .010)
   - Contraseña: `Password123`
2. **Administrador:**
   - Usuario: `admin.core`
   - Contraseña: `admin`