# Plan de implementación mínima para banca web, credenciales y SFTP

## Objetivo

Definir cómo adaptar el sistema actual para que:

- Un cliente nuevo entre a la banca web con su cédula o RUC como usuario inicial.
- En el primer acceso se le obligue a cambiar la contraseña.
- La banca web identifique si el cliente es persona natural o jurídica usando las relaciones existentes.
- El buzón SFTP quede vinculado a una empresa y no use una credencial compartida para todos.
- El usuario de empresa vea en su banca web el estado de sus archivos de lote y sus reportes.
- La notificación por correo vuelva a funcionar en nube sin cambiar más de lo necesario.

La idea es reutilizar al máximo los endpoints, entidades y relaciones que ya existen.

## Estado actual que ya existe

### Autenticación de clientes

- El login de cliente ya existe en `POST /core/v1/auth/customers/login`.
- La respuesta del login ya devuelve `customerId`, `customerType`, `username`, `customerName`, `identification`, `email` y otros datos.
- La relación entre credencial web y cliente ya existe en `WebCredential -> Customer`.
- El login del personal interno ya existe en `POST /core/v1/auth/core-users/login`.

### Datos de cliente

- Ya existen clientes naturales y jurídicos.
- Ya existe el tipo de cliente con `CustomerTypeEnum`.
- Ya existe búsqueda por identificación en `GET /core/v1/customers/identification/{type}/{number}`.
- Ya existe creación y consulta de clientes sin duplicar relaciones.

### Banca web

- La banca web ya distingue `NATURAL` y `JURIDICO` con `customerType`.
- La interfaz ya oculta o muestra secciones según el tipo de cliente.
- El flujo de login ya guarda la sesión y el tipo de cliente en local storage.

### SFTP / switch-email-service

- El servicio SFTP actual expone:
  - `POST /api/sftp/upload`
  - `POST /api/sftp/status`
  - `GET /api/email-processing/status`
  - `GET /api/email-processing/info`
  - `GET /api/email-processing/health`
  - `POST /api/email-processing/sftp/process`
  - `GET /api/email-processing/sftp/status`
  - `GET /api/email-processing/sftp/health`
- El SFTP embebido hoy usa una sola pareja usuario/contraseña para todos.
- Los archivos cargados se mueven a `processed` o `errors`.

### Correo

- El core ya tiene `EmailService` con `JavaMailSender`.
- La configuración SMTP ya está parametrizada con `spring.mail.*` y `app.mail.*`.

## Reutilización recomendada de endpoints y relaciones

### 1. Login de cliente sin crear un endpoint nuevo

Reutilizar `POST /core/v1/auth/customers/login`.

Cambios mínimos sugeridos:

- Al crear la credencial web inicial, usar como `username` la cédula o el RUC del cliente.
- Como contraseña inicial, usar el mismo valor de identificación o una contraseña temporal definida por negocio.
- Agregar una marca de “primer ingreso” para obligar el cambio de contraseña.

La relación actual `WebCredential -> Customer` ya sirve para esto. No hace falta crear una entidad de cliente distinta.

### 2. Identificación de tipo de cliente

Reutilizar `customerType` que ya devuelve el login.

Con eso la banca web puede saber si el usuario es:

- `NATURAL`
- `JURIDICO`

Y mostrar o esconder secciones sin duplicar pantallas.

### 3. Carga y estado de lotes SFTP

Reutilizar los endpoints de `switch-email-service` para estado general:

- `GET /api/email-processing/sftp/status`
- `GET /api/email-processing/sftp/health`

Cambios mínimos sugeridos:

- Hacer que cada archivo quede registrado con el `customerId` de la empresa dueña.
- Agregar un listado filtrado por cliente en el switch o en la banca web usando el mismo lote ya existente.
- No crear un flujo paralelo si ya existe `payment-batch`; mejor filtrarlo por empresa.

### 4. Correo de notificación

Reutilizar `EmailService` y `AccountService`.

El envío de correo ya se llama desde el servicio de cuentas cuando cambia un estado.
Por lo tanto, el problema en nube parece más de configuración de entorno que de lógica duplicada.

## Cambios mínimos por módulo

### Core

1. Ajustar la creación de credenciales web para que el `username` inicial sea la cédula o el RUC.
2. Agregar un indicador de cambio obligatorio de contraseña en `WebCredential`.
3. Mantener la relación ya existente entre credencial y cliente.
4. Usar el `customerType` para decidir si la sesión es natural o jurídica.
5. Si el cliente es jurídico, permitirle entrar a su banca empresarial sin crear otro tipo de autenticación.

### banca-web-switch

1. Mantener el login contra `POST /api/core/v1/auth/customers/login`.
2. Después del login, si el backend marca `passwordChangeRequired`, redirigir al cambio de contraseña.
3. Mostrar solo los lotes y reportes del cliente autenticado.
4. En el perfil, mostrar si la sesión es natural o jurídica usando `customerType`.

### switch-email-service

1. Cambiar el SFTP de credencial global a credencial por empresa.
2. Reutilizar `Customer` como entidad base de pertenencia.
3. Para cada empresa, guardar una credencial SFTP asociada a su `customerId`.
4. El usuario inicial puede ser la cédula o el RUC de la empresa.
5. El archivo subido debe quedar asociado a esa empresa para que la banca web pueda mostrar su estado.

## Modelo funcional propuesto

### Credenciales web

- `username` inicial: cédula o RUC.
- `password` inicial: cédula o RUC, o una clave temporal de negocio.
- Primer login: el sistema fuerza cambio de contraseña.
- Después del cambio, ya entra con su nueva clave personal.

### Credenciales SFTP

- Cada empresa tiene su propia credencial SFTP.
- El usuario SFTP puede ser la cédula o RUC de la empresa.
- La contraseña SFTP también debe ser privada por empresa.
- No debe existir un usuario único compartido para todos los clientes.

### Programación del archivo SFTP

- Al subir un archivo, el usuario debe indicar una `fecha efectiva` o `fecha de ejecución`.
- Esa fecha debe guardarse junto al lote, no solo en la pantalla.
- Si la fecha es futura, el lote debe quedar en estado `PROGRAMADO` o `PENDIENTE`.
- El procesamiento real debe ocurrir únicamente cuando llegue la fecha indicada.
- Si el cliente quiere ejecutar de inmediato, puede usar la fecha actual.
- La idea es que el buzón SFTP sirva para programar pagos masivos, no para ejecutar directamente en la web.

### Reutilización del scheduler existente

- El servicio ya tiene un scheduler por intervalo en `switch-email-service`.
- Para tu caso, ese scheduler debe respetar la fecha efectiva del archivo.
- La lógica mínima recomendada es:
  - guardar `scheduledDate` o `effectiveDate` junto al archivo/lote;
  - listar solo los archivos cuya fecha ya venció;
  - procesar únicamente los que cumplen la fecha programada.
- Así no hace falta crear un flujo paralelo si ya existe el lote de pagos masivos.

### Visibilidad de archivos

- Cada archivo de lote debe quedar asociado a una empresa.
- La banca web solo debe listar los archivos del cliente autenticado.
- Si el cliente es jurídico, ve sus archivos, su estado y su informe.
- Si es natural, ve únicamente lo que le corresponde.
- Además, debe verse el estado del archivo según la fecha programada:
  - `PROGRAMADO`
  - `PENDIENTE`
  - `EN_PROCESO`
  - `PROCESADO`
  - `ERROR`

## Ajustes sugeridos para el SMTP en nube

El envío de correos ya existe, pero en nube suele fallar por configuración o conectividad. Para este proyecto, normalmente basta con revisar estas variables y el acceso de red al proveedor SMTP:

1. Variables de entorno reales en despliegue:
  - `MAIL_HOST`
  - `MAIL_PORT`
  - `MAIL_USERNAME`
  - `MAIL_PASSWORD`
  - `MAIL_FROM`
  - `MAIL_FROM_NAME`
2. Propiedades que consume el core:
  - `spring.mail.host` -> `MAIL_HOST`
  - `spring.mail.port` -> `MAIL_PORT`
  - `spring.mail.username` -> `MAIL_USERNAME`
  - `spring.mail.password` -> `MAIL_PASSWORD`
  - `app.mail.from` -> `MAIL_FROM`
  - `app.mail.from-name` -> `MAIL_FROM_NAME`
3. No depender de los valores por defecto de desarrollo en producción.
4. Verificar que la nube permita salida SMTP por el puerto configurado.
5. Confirmar que el proveedor SMTP acepte autenticación y `STARTTLS`.
6. Revisar logs de `EmailService` para diferenciar error de credenciales, red o bloqueo del puerto.

Si la nube ya levanta la app pero no manda correos, lo más probable es uno de estos dos casos:

- el usuario SMTP no tiene permiso para enviar con el `from` configurado;
- el host o puerto SMTP está bloqueado desde el entorno desplegado.

## Qué no conviene duplicar

- No conviene crear otro login de cliente si ya existe `/core/v1/auth/customers/login`.
- No conviene crear otra estructura de cliente si `Customer` y `WebCredential` ya resuelven la relación.
- No conviene crear otra pantalla de estado si la banca web puede reutilizar la sesión y filtrar por `customerType`.
- No conviene dejar un SFTP compartido si la meta es trazabilidad por empresa.

## Resultado esperado

Al terminar estos cambios, el flujo debería ser así:

1. Se crea un cliente natural o jurídico.
2. Se genera su credencial inicial con cédula o RUC.
3. El primer ingreso obliga a cambiar contraseña.
4. El cliente entra a su banca web con su perfil correcto.
5. Si es empresa, su SFTP queda vinculado a esa empresa.
6. Los archivos de lote se pueden ver por cliente dentro de la banca web.
7. Las notificaciones por correo funcionan también en nube.

## Prioridad de implementación

1. Reutilizar login de cliente y forzar cambio de contraseña.
2. Asociar archivos SFTP a una empresa concreta.
3. Filtrar la visibilidad de lotes y reportes por cliente autenticado.
4. Corregir variables SMTP y validarlas en nube.
