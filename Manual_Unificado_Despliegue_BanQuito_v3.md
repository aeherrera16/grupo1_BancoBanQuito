# BANCO BANQUITO
## DIRECCIÓN DE TECNOLOGÍA Y OPERACIONES
### MANUAL MAESTRO DE DESPLIEGUE UNIFICADO

**Contexto Empresarial Completo, Arquitectura de Software y Guía de Infraestructura Cloud en Modo Root (V3)**

| | |
| :--- | :--- |
| **Proyecto:** | Ecosistema de Pagos Masivos y Core de Cuentas |
| **Entorno Cloud:** | Google Cloud Platform (GCP) Compute Engine Instance |
| **Dimensionamiento:** | e2-standard-2 (2 vCPUs, 8 GB RAM, 30 GB SSD Balanced) |
| **Sistema Operativo:** | Ubuntu 24.04 LTS Minimal (x86_64) |
| **Estrategia de Permisos:** | Ejecución Directa mediante Usuario Root (Velocidad de Despliegue) |
| **Versión del Documento:** | 3.0 Final |

*Banco BanQuito S.A. - Manual de Producción (Root V3)* *Página 1 de 8*

---

## 1. Contexto de Negocio y Caso de Uso Corporativo

Durante los últimos dos semestres, el Banco BanQuito ha enfrentado una crisis sistémica de retención en su segmento de Banca Empresarial. La falta de automatización y los constantes retrasos en la liquidación de fondos han provocado la fuga de 15 de nuestros clientes corporativos más grandes hacia la competencia. Esta migración representa una salida de liquidez (fuga de capitales) que supera los $45 millones de dólares mensuales, originando un agujero financiero proyectado en $500,000 dólares anuales por pérdida directa de ingresos por comisiones transaccionales. 

Actualmente, los gerentes financieros (CFOs) experimentan extrema frustración: los pagos a sus empleados no se acreditan a tiempo y los proveedores detienen despachos por falta de liquidez, mientras el banco responde con procesos manuales lentos y opacos. Para detener esta sangría financiera y recuperar el liderazgo en el mercado, Banco BanQuito tiene la urgencia crítica de implementar un Switch de Pagos Masivos altamente confiable, que devuelva la autonomía a las empresas y garantice la liquidación exacta y oportuna de sus obligaciones, reactivando la principal fuente de ingresos por servicios no financieros.

### 1.1. El Valor del Cliente Corporativo vs. Cliente Individual (Retail)

En la banca, la pérdida de un cliente corporativo tiene un efecto destructivo multiplicador en comparación con la pérdida de un cliente individual. Un cliente individual (Retail) maneja saldos bajos y realiza transferencias esporádicas. Por el contrario, un cliente corporativo actúa como un "ancla" del ecosistema: concentra millones de dólares en cuentas a la vista y obliga a sus empleados a abrir cuentas en el banco para recibir su sueldo (captación masiva a costo cero). Perder a una empresa significa perder la liquidez central, perder las comisiones por transacciones masivas y, eventualmente, perder a los miles de empleados que cerrarán sus cuentas al ya no recibir su nómina allí.

### 1.2. Angresos por Comisiones y Separación Obligatoria de Impuestos

El banco invierte recursos en infraestructura de alta disponibilidad y asume riesgos transaccionales, por lo que cobra un "peaje" (comisión o tarifa) por la prestación de este servicio. Dado que es un servicio facturado, las leyes tributarias exigen que se grave el Impuesto al Valor Agregado (IVA) del 15%. Al cobrar, el banco debe separar el dinero rigurosamente:

* **Cuenta Contable de Ingresos (Tarifas):** Aquí ingresa el valor neto de la comisión. Este dinero es ganancia real del banco y entra a su Estado de Resultados (P&L) bajo la cuenta interna de servicios `INGRESOS_SERVICIOS_MASIVOS`.
* **Cuenta Contable de Pasivos (Impuestos por Pagar):** Aquí ingresa el valor del IVA (15%). Este dinero no es del banco, le pertenece al Estado (entidad tributaria). El banco solo lo custodia temporalmente y lo registra como un pasivo (deuda) bajo la cuenta interna `PASIVOS_IVA_RETENIDO`. Mezclar estos fondos constituiría una grave infracción regulatoria.

*Banco BanQuito S.A. Manual de Producción (Root V3)* *Página 2 de 8*

---

### 1.3. Esquema Tarifario Comercial Escalado

| Volumen de Transacciones Exitosas | Tarifa Unitaria (Por cada transacción exitosa) |
| :--- | :--- |
| De 1 a 10 | $0.50 |
| De 11 a 100 | $0.40 |
| De 101 a 500 | $0.30 |
| De 501 a 1,000 | $0.20 |
| De 1,001 a 10,000 | $0.10 |
| 10,001 en adelante | $0.05 |

*Banco BanQuito S.A. Manual de Producción (Root V3)* *Página 3 de 8*

---

## 2. Arquitectura del Ecosistema y Reglas del Sistema

La Fase 1 contempla la construcción de una infraestructura monolítica modular unificada distribuida de forma nativa sobre el sistema operativo (sin Docker). Consta de 6 componentes principales:

* **Frontend 1 (Banca Web Empresas):** Interfaz React que permite a los clientes corporativos autenticarse, visualizar cuentas/saldos y cargar archivos de lotes hacia el Switch.
* **Frontend 2 (Dashboard Admin Switch):** Interfaz React para la administración, monitoreo de cuadres y visualización del histórico de lotes procesados.
* **Backend 1 (Core de Cuentas API):** Aplicación Spring Boot que administra el ciclo de vida de los productos de depósito, mantiene la integridad de saldos y procesa débitos/créditos de forma atómica. Corre internamente en el puerto 8080.
* **Backend 2 (Switch de Pagos Masivos Motor):** Aplicación Spring Boot que actúa como orquestador central: recibe el archivo plano, aplica las reglas de negocio, se comunica sincrónicamente con el Core y despacha alertas SMTP. Corre internamente en el puerto 8081.
* **Base de Datos 1 (MariaDB):** Motor relacional exclusivo para el Core de Cuentas (Puerto 3306).
* **Base de Datos 2 (PostgreSQL):** Motor relacional exclusivo para el Switch de Pagos (Puerto 5432).

### 2.1. Reglas de Negocio Estrictas para el Desarrollo

1. **RF-01: Ingesta y Horarios de Corte:** Los archivos recibidos antes de las 18:00 se procesan de inmediato. Los recibidos después de las 18:00 o en fines de semana quedarán en estado "Encolado" y se procesarán automáticamente a las 00:01 del siguiente día hábil.
2. **RF-02: Validación Estructural y Prevención de Fraude:** El switch debe rechazar el archivo completo tempranamente si las sumatorias no coinciden, si el RUC no está activo o si el mismo nombre de archivo y Hash criptográfico de seguridad ya fue procesado con éxito en los últimos 30 días.
3. **RF-04: Resiliencia Transaccional del Lote:** La falla de una instrucción individual (ej. cuenta destino bloqueada o falta de saldo para una línea específica) bajo ninguna circunstancia debe abortar el archivo completo. El sistema registrará el error, marcará la línea como "Rechazada" indicando la causal, y continuará con el resto del lote.
4. **RF-07: Liquidación Contable de Servicios (Sobregiro Forzado):** Al finalizar las líneas, se realiza un único débito global a la Cuenta Matriz de la empresa por el total de comisiones + IVA. Si la empresa no tiene saldo remanente para cubrir la comisión, el débito contable debe ejecutarse forzadamente de todas formas, permitiendo que la cuenta ingrese en sobregiro técnico.
5. **Core RF-03: Control de Estados de Cuenta:** El motor transaccional del Core debe rechazar cualquier solicitud de débito saliente si la cuenta no está en estado estrictamente "Activa" (Bloqueada, Inactiva o Suspendida provocan rechazo automático).
6. **Core Core RF-06: Idempotencia por UUID:** El Core registrará un Identificador Único de Transacción (UUID) enviado por el Switch para prevenir duplicidades accidentales en el mismo día.

*Banco BanQuito S.A. Manual de Producción (Root V3)* *Página 4 de 8*

---

## 3. Manual de Infraestructura y Despliegue en Modo Root

Para maximizar la velocidad de integración y erradicar cualquier fricción asociada a permisos de lectura/escritura de Linux, se ha determinado estructurar y ejecutar todos los componentes del sistema bajo el perfil de superusuario root.

### 3.1. Estado de Instalaciones Actuales en la VM

Los siguientes pasos de software e infraestructura ya se encuentran completados e instalados en el servidor cloud:
* **Sistema Operativo actualizado:** Ubuntu 24.04 LTS Minimal.
* **Motores de BD listos:** MariaDB (Puerto 3306) y PostgreSQL (Puerto 5432) se encuentran instalados y activos en el backend nativo. Las bases de datos relacionales específicas se crearán al recibir los archivos estructurales.sql.
* **Runtimes listos:** Java OpenJDK 17 y Node.js 20 LTS se encuentran correctamente enlazados globales.
* **Servidor Perimetral listo:** Nginx instalado y corriendo de forma nativa.

### 3.2. Estructura de Directorios Creada

El sistema de archivos ha sido desplegado bajo las siguientes rutas absolutas del sistema:

```text
# Rutas para binarios ejecutables e intercambio de lotes del Switch
/var/banquito/apps/           # Directorio de los artefactos jar compilados
/var/banquito/logs/           # Trazas de logs del ecosistema
/var/banquito/pagos/ingesta/  # Ruta de ingesta para archivos planos (RF-01)
/var/banquito/pagos/reportes/ # Ruta de salida para reportes corporativos (RF-08)

# Rutas para el hosting de las interfaces Web
/var/www/banca-empresas/      # Build compilado estático de React (Clientes)
/var/www/switch-admin/        # Build compilado estático de React (Dashboard)
```

### 3.3. Configuración de Servicios del Sistema (Systemd)

El Agente de IA del IDE debe generar los archivos de servicio utilizando el parámetro `User=root`. Esto evitará bloqueos de permisos al interactuar con las carpetas de ingesta de archivos masivos.

*Banco BanQuito S.A. - Manual de Producción (Root V3)* *Página 5 de 8*

---

#### Fichero del Servicio: /etc/systemd/system/banquito-core.service

```ini
[Unit]
Description=Banco BanQuito
# Core de Cuentas API (Root)
After=network.target mariadb.service

[Service]
User=root
WorkingDirectory=/var/banquito/apps
Environment=SPRING_PROFILES_ACTIVE=prod
ExecStart=/usr/bin/java -jar /var/banquito/apps/banquito-core.jar
SuccessExitStatus=143
Restart=on-failure
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=banquito-core

[Install]
WantedBy=multi-user.target
```

*Banco BanQuito S.A. Manual de Producción (Root V3)* *Página 6 de 8*

---

#### Fichero del Servicio: /etc/systemd/system/banquito-switch.service

```ini
[Unit]
Description=Banco BanQuito
# Switch de Pagos Masivos Motor (Root)
After=network.target postgresql.service banquito-core.service

[Service]
User=root
WorkingDirectory=/var/banquito/apps
Environment=SPRING_PROFILES_ACTIVE=prod
ExecStart=/usr/bin/java -jar /var/banquito/apps/banquito-switch.jar
SuccessExitStatus=143
Restart=on-failure
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=banquito-switch

[Install]
WantedBy=multi-user.target
```

### 3.4. Configuración del Servidor Nginx (Proxy Inverso de Dominios)

Mapeo perimetral de los dos dominios asignados en el puerto 80 para segmentar la Banca Web del Dashboard Administrativo del Switch:

#### Fichero /etc/nginx/sites-available/bancaempresas.conf

```nginx
server {
    listen 80;
    server_name bancaempresas.tu-dominio.com;

    location / {
        root /var/www/banca-empresas;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8080/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

*Banco BanQuito S.A. Manual de Producción (Root V3)* *Página 7 de 8*

---

#### Fichero /etc/nginx/sites-available/switchadmin.conf

```nginx
server {
    listen 80;
    server_name switchadmin.tu-dominio.com;

    location / {
        root /var/www/switch-admin;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8081/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Siguiente Acción de Despliegue para el Agente:

Una vez subido el código adaptado a GitHub, el Agente clonará los proyectos, ejecutará `npm run build` para colocar los estáticos en sus respectivas rutas de `/var/www/`, moverá los `.jar` a `/var/banquito/apps/` y ejecutará un limpio `sudo systemctl daemon-reload && sudo systemctl restart nginx`.

*Banco BanQuito S.A. Manual de Producción (Root V3)* *Página 8 de 8*
