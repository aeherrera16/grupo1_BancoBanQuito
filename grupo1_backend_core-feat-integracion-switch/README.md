# Plan de Implementación: Frontend Intranet Bancaria Banquito Core

**Documento Base para Implementación en Repositorio Fronend Unificado**

---

## 1. Visión General

Frontend React que actúa como **intranet para personal interno (OPERARIO)** del banco Banquito. Permite gestionar clientes, cuentas, transacciones, sucursales, feriados y notificaciones.

### Stack Tecnológico
- **React 19.2** + **Vite** (bundler)
- **React Router v6** (navegación)
- **Tailwind CSS** (estilos)
- **Context API** (gestión de estado global - solo sesión del operario)
- **axios** (cliente HTTP)
- **ESLint** (calidad de código)

### Backend
- **Base URL:** `http://localhost:8080/core/v1`
- **CORS configurado para:** `localhost:5173`, `localhost:5174` (puertos Vite)
- **35 endpoints REST** en 8 módulos

---

## 2. Arquitectura de Carpetas

```
src/
├── api/                          # Servicios HTTP (axios)
│   ├── axiosInstance.js          # Configuración base de axios
│   ├── authApi.js                # POST /auth/login/staff
│   ├── customerApi.js            # GET/POST /customers
│   ├── accountApi.js             # GET/POST /accounts, PATCH estado
│   ├── transactionApi.js         # POST /transactions/*, GET /transactions/history
│   ├── branchApi.js              # GET/POST /branches
│   ├── holidayApi.js             # GET/POST/DELETE /holidays
│   └── notificationApi.js        # GET/PUT /notifications
│
├── context/
│   └── AuthContext.jsx           # Sesión global del operario
│
├── components/
│   ├── layout/
│   │   ├── Sidebar.jsx           # Navegación lateral fija
│   │   └── Topbar.jsx            # Título + badge notificaciones
│   │
│   └── ui/
│       ├── StatusBadge.jsx       # Badge de estado (ACTIVO/BLOQUEADO/etc)
│       ├── ConfirmModal.jsx      # Modal de confirmación genérica
│       └── LoadingSpinner.jsx    # Loader durante peticiones
│
├── pages/
│   ├── LoginPage.jsx             # /login
│   ├── DashboardPage.jsx         # /dashboard
│   │
│   ├── customers/
│   │   ├── CustomerSearchPage.jsx    # /clientes (búsqueda)
│   │   ├── CustomerDetailPage.jsx    # /clientes/:id
│   │   └── CustomerCreatePage.jsx    # /clientes/nuevo
│   │
│   ├── accounts/
│   │   ├── AccountDetailPage.jsx     # /cuentas/:accountNumber
│   │   └── AccountCreatePage.jsx     # /cuentas/nueva
│   │
│   ├── transactions/
│   │   ├── TransactionFormPage.jsx   # /transacciones/nueva
│   │   └── TransactionHistoryPage.jsx # /transacciones/historial/:accountNumber
│   │
│   ├── BranchesPage.jsx          # /sucursales
│   ├── HolidaysPage.jsx          # /feriados
│   ├── NotificationsPage.jsx     # /notificaciones
│   └── NotFoundPage.jsx          # /404
│
├── router/
│   ├── AppRouter.jsx             # Definición de rutas con React Router v6
│   └── ProtectedRoute.jsx        # HOC para rutas que requieren autenticación
│
├── hooks/
│   ├── useAuth.js                # Hook personalizado para acceder al contexto de auth
│   └── useFetch.js               # Hook para llamadas HTTP reutilizables
│
├── constants/
│   ├── statusColors.js           # Mapeo de colores por estado (ACTIVO → verde, etc)
│   ├── endpointPaths.js          # Constantes de rutas del backend
│   └── errorMessages.js          # Mensajes de error standarizados
│
├── helpers/
│   ├── formatters.js             # formatCurrency(), formatDate(), formatStatus()
│   ├── validators.js             # validateEmail(), validatePhone(), etc
│   └── localStorageHelper.js     # setSession(), getSession(), clearSession()
│
├── App.jsx                       # Componente raíz
├── App.css                       # Estilos globales
├── index.css                     # Estilos base Tailwind
└── main.jsx                      # Entry point

public/
├── index.html
└── favicon.ico

vite.config.js                   # Configuración Vite
tailwind.config.js               # Configuración Tailwind
eslint.config.js                 # Configuración ESLint
package.json
package-lock.json
.gitignore
README.md
```

**Cambio importante:** Reemplazar `/utils/` por `/helpers/` (formateo, validación, storage) + `/constants/` (configuraciones estáticas)

---

## 3. Pantallas Detalladas (13 Total)

### 3.1 LoginPage `/login`

**Responsabilidad:**
- Solicitar solo **username** al operario
- Validar contra tabla `CORE_USER` del backend
- Guardar sesión en `AuthContext` y localStorage

**Flujo:**
1. Usuario ingresa username
2. Clic en "Ingresar"
3. Llamada: `POST /core/v1/auth/login/staff` con `{ username, password: "" }`
   - **NOTA:** Sin seguridad aún, password se envía vacío o no se valida en backend
4. Backend valida si username existe en CORE_USER
5. Si existe → responde `{ coreUserId, username, fullName, role, status }`
6. Frontend guarda en `AuthContext.login()` y localStorage
7. Redirige a `/dashboard`

**Componente:**
```jsx
// pages/LoginPage.jsx
- Form simple: input username + botón "Ingresar"
- Estado: username, loading, error
- useNavigate para redirección
- useAuth() desde AuthContext
```

---

### 3.2 DashboardPage `/dashboard`

**Responsabilidad:**
- Pantalla de bienvenida con accesos rápidos
- Mostrar notificaciones no leídas
- Navegación visual a módulos

**Contenido:**
- Cards con enlaces a:
  - Buscar Clientes
  - Nueva Transacción
  - Ver Cuentas
  - Gestionar Sucursales
  - Feriados
- Badge de notificaciones no leídas (GET `/notifications/{coreUserId}/unread-count`)

---

### 3.3 CustomerSearchPage `/clientes`

**Responsabilidad:**
- Búsqueda de clientes por tipo + número de identificación

**Formulario:**
- Select: tipo de ID (CEDULA, RUC, PASAPORTE)
- Input: número de identificación
- Botón "Buscar"

**Acción:**
- GET `/customers/identification/{type}/{number}`
- Muestra resultado con opciones:
  - "Ver detalle" → CustomerDetailPage
  - "Nueva cuenta" → AccountCreatePage con `?customerId=`
  - "Nuevo cliente" → CustomerCreatePage

---

### 3.4 CustomerDetailPage `/clientes/:id`

**Responsabilidad:**
- Mostrar datos completos del cliente
- Listar todas sus cuentas
- Permitir crear nueva cuenta

**Datos mostrados:**
- Nombre/Razón social
- Tipo (NATURAL/JURIDICO)
- Identificación
- Email, teléfono, dirección
- Estado
- Subtipo de cliente

**Tabla de cuentas:**
- Número de cuenta
- Tipo (Ahorros/Corriente/etc)
- Sucursal
- Saldo disponible
- Estado
- Link a AccountDetailPage

**Botón:** "Nueva cuenta" → AccountCreatePage

---

### 3.5 CustomerCreatePage `/clientes/nuevo`

**Responsabilidad:**
- Formulario condicional para crear cliente NATURAL o JURIDICO

**Campos base (siempre visibles):**
- Tipo de cliente (select: NATURAL / JURIDICO) - trigger del condicional
- Tipo de identificación (CEDULA, RUC, PASAPORTE)
- Número de identificación
- Subtipo de cliente (GET `/customers/subtypes`)
- Sucursal (GET `/branches`)
- Email
- Teléfono
- Dirección

**Campos condicionales NATURAL:**
- Nombre
- Apellido
- Fecha de nacimiento

**Campos condicionales JURIDICO:**
- Razón social
- Fecha de constitución
- Representante legal (FK a Customer - opcional)

**Acción:**
- POST `/customers/` con el payload correspondiente

---

### 3.6 AccountDetailPage `/cuentas/:accountNumber`

**Responsabilidad:**
- Mostrar datos y estado de una cuenta
- Permitir cambios de estado
- Mostrar historial reciente y link a historial completo

**Header:**
- Número de cuenta
- Tipo de cuenta
- Sucursal
- Cliente propietario
- Saldo contable y disponible
- Estado (StatusBadge con color)

**Botones de estado:**
- "Activar" (PATCH `/accounts/{accountNumber}/activate`)
- "Inactivar" (PATCH `/accounts/{accountNumber}/inactivate`)
- "Bloquear" (PATCH `/accounts/{accountNumber}/block`)
- "Suspender" (PATCH `/accounts/{accountNumber}/suspend`)
- Cada uno con modal de confirmación

**Tabla de últimas 10 transacciones:**
- Fecha
- Tipo (DEBITO/CREDITO)
- Monto
- Saldo resultante
- Estado
- Descripción

**Link:** "Ver historial completo" → TransactionHistoryPage

---

### 3.7 AccountCreatePage `/cuentas/nueva`

**Responsabilidad:**
- Crear nueva cuenta para un cliente

**Formulario:**
- Select cliente (pre-poblado si viene `?customerId=`, si no lista todos)
- Select tipo de cuenta (GET `/customers/subtypes` - usa AccountSubtype)
- Select sucursal (GET `/branches`)
- Input saldo inicial (BigDecimal)
- Checkbox "Marcar como favorita"

**Acción:**
- POST `/accounts/` con payload `AccountRequestDTO`

---

### 3.8 TransactionFormPage `/transacciones/nueva`

**Responsabilidad:**
- Interfaz tabbed para tres tipos de transacciones
- Cada tab tiene su formulario independiente

**Tab 1: Débito**
- Cuenta (input/select con autocomplete)
- Monto
- Descripción
- Botón "Debitar"
- POST `/transactions/debits`

**Tab 2: Crédito**
- Cuenta
- Monto
- Descripción
- Botón "Acreditar"
- POST `/transactions/credits`

**Tab 3: Transferencia**
- Cuenta origen
- Cuenta destino
- Identificación beneficiario
- Monto
- Descripción
- Botón "Transferir"
- POST `/transactions/transfers`

**Respuesta común:**
- UUID de transacción único
- Mensaje de éxito/error
- Datos de resultingBalance

---

### 3.9 TransactionHistoryPage `/transacciones/historial/:accountNumber`

**Responsabilidad:**
- Historial completo de transacciones de una cuenta

**Tabla:**
- Fecha (datetime)
- Tipo (DEBITO/CREDITO)
- Monto
- Saldo resultante
- Estado (COMPLETADA/RECHAZADA)
- Descripción
- UUID

**Filtros:**
- Por tipo de movimiento
- Por estado
- Por rango de fechas (opcional)

**Datos:**
- GET `/transactions/history/{accountNumber}`

---

### 3.10 BranchesPage `/sucursales`

**Responsabilidad:**
- Listar y crear sucursales

**Tabla:**
- Código
- Nombre
- Ciudad
- Fecha de creación

**Modal "Nueva sucursal":**
- Input código
- Input nombre
- Input ciudad
- POST `/branches/`

---

### 3.11 HolidaysPage `/feriados`

**Responsabilidad:**
- Gestionar calendario de feriados
- Verificar si una fecha es día hábil

**Vista principal - Tabla de feriados:**
- Fecha
- Nombre del feriado
- ¿Es fin de semana?
- Botón eliminar (DELETE `/holidays/{date}`)

**Verificador de día hábil:**
- Input de fecha
- Botón "Verificar"
- GET `/holidays/business-day?date=YYYY-MM-DD`
- Muestra resultado: "Es día hábil" / "Es fin de semana" / "Es feriado"

**Modal "Agregar feriado":**
- Input fecha
- Input nombre
- Checkbox "¿Es fin de semana?"
- POST `/holidays/`

---

### 3.12 NotificationsPage `/notificaciones`

**Responsabilidad:**
- Bandeja de notificaciones del operario autenticado

**Lista:**
- Cada notificación muestra:
  - Título
  - Mensaje
  - Fecha/hora
  - Tipo (badge de color)
  - Indicador "no leído"

**Colores por tipo:**
- CREDITO → Verde
- DEBITO → Rojo
- SEGURIDAD → Naranja
- INFO → Azul

**Interacción:**
- Click en notificación no leída → PUT `/notifications/{id}/read`
- Opcional: botón "Marcar todas como leídas"

**Datos:**
- GET `/notifications/{coreUserId}`

---

### 3.13 NotFoundPage `*`

**Responsabilidad:**
- Mostrar página 404

**Contenido:**
- Mensaje "Página no encontrada"
- Botón "Volver al dashboard"

---

## 4. Contexto de Autenticación (AuthContext)

**Estado global:**
```javascript
{
  isAuthenticated: boolean,
  coreUserId: integer,
  username: string,
  fullName: string,
  role: "OPERARIO",
  status: "ACTIVO" | "INACTIVO" | "BLOQUEADO"
}
```

**Métodos:**
- `login(username)` → valida contra BD, guarda estado
- `logout()` → limpia estado y localStorage
- `isLoading()` → estado de petición

**Persistencia:**
- localStorage con key `banquito_session`
- Se recupera en mount de App.jsx

---

## 5. Servicios HTTP (api/)

### 5.1 axiosInstance.js
```javascript
// Configuración base
const instance = axios.create({
  baseURL: 'http://localhost:8080/core/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para 401 → logout automático
instance.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // dispatch logout al AuthContext
    }
    return Promise.reject(error);
  }
);

export default instance;
```

### 5.2 authApi.js
```javascript
// POST /auth/login/staff
export const loginStaff = (username) => 
  axiosInstance.post('/auth/login/staff', { 
    username, 
    password: "" // Sin seguridad aún
  });
```

### 5.3 customerApi.js
```javascript
export const searchCustomer = (type, identification) 
export const getCustomer = (id)
export const createCustomer = (data)
export const getCustomerSubtypes = ()
```

### 5.4 accountApi.js
```javascript
export const getAccountsByCustomer = (customerId)
export const getAccount = (accountNumber)
export const createAccount = (data)
export const activateAccount = (accountNumber)
export const inactivateAccount = (accountNumber)
export const blockAccount = (accountNumber)
export const suspendAccount = (accountNumber)
export const getAccountTransactions = (accountNumber, limit = 10)
```

### 5.5 transactionApi.js
```javascript
export const debit = (data)
export const credit = (data)
export const transfer = (data)
export const getTransactionHistory = (accountNumber)
```

### 5.6 branchApi.js
```javascript
export const getAllBranches = ()
export const createBranch = (data)
```

### 5.7 holidayApi.js
```javascript
export const getAllHolidays = ()
export const createHoliday = (data)
export const deleteHoliday = (date)
export const checkBusinessDay = (date)
```

### 5.8 notificationApi.js
```javascript
export const getNotifications = (userId)
export const getUnreadCount = (userId)
export const markAsRead = (notificationId)
```

---

## 6. Componentes Compartidos (components/)

### 6.1 Layout/Sidebar.jsx
- Navegación vertical con links a cada módulo
- Logo/marca del banco
- User info (nombre + botón logout)
- Collapse/expand en mobile

### 6.2 Layout/Topbar.jsx
- Título de la página actual
- Badge con conteo de notificaciones no leídas
- Link a NotificationsPage

### 6.3 ui/StatusBadge.jsx
```jsx
<StatusBadge status="ACTIVO" /> // Verde
<StatusBadge status="BLOQUEADO" /> // Rojo
<StatusBadge status="INACTIVO" /> // Gris
<StatusBadge status="SUSPENDIDO" /> // Naranja
```

### 6.4 ui/ConfirmModal.jsx
- Modal genérica de confirmación
- Props: title, message, onConfirm, onCancel

### 6.5 ui/LoadingSpinner.jsx
- Spinner durante peticiones HTTP

---

## 7. Helpers y Constants

### 7.1 helpers/formatters.js
```javascript
export const formatCurrency = (amount) // $1,234.56
export const formatDate = (date) // 12/01/2025
export const formatDateTime = (datetime) // 12/01/2025 14:30
export const formatStatus = (status) // ACTIVO → "Activo"
export const formatIdentification = (type, number) // RUC 1790012345001 → "1790012345001"
```

### 7.2 helpers/validators.js
```javascript
export const validateEmail = (email)
export const validatePhone = (phone)
export const validateCurrency = (amount)
export const validateUsername = (username)
```

### 7.3 helpers/localStorageHelper.js
```javascript
export const setSession = (user)
export const getSession = ()
export const clearSession = ()
```

### 7.4 constants/statusColors.js
```javascript
const STATUS_COLORS = {
  ACTIVO: 'bg-green-100 text-green-800',
  INACTIVO: 'bg-gray-100 text-gray-800',
  BLOQUEADO: 'bg-red-100 text-red-800',
  SUSPENDIDO: 'bg-yellow-100 text-yellow-800'
};
```

### 7.5 constants/endpointPaths.js
```javascript
export const ENDPOINTS = {
  AUTH: '/auth/login/staff',
  CUSTOMERS: '/customers',
  ACCOUNTS: '/accounts',
  // ... todos los endpoints
};
```

### 7.6 constants/errorMessages.js
```javascript
export const ERRORS = {
  INVALID_CREDENTIALS: 'Usuario o contraseña incorrectos',
  ACCOUNT_NOT_FOUND: 'Cuenta no encontrada',
  // ... todos los mensajes
};
```

---

## 8. Hooks Personalizados (hooks/)

### 8.1 useAuth.js
```javascript
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
};
```

### 8.2 useFetch.js
```javascript
export const useFetch = (apiFunction, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    apiFunction()
      .then(response => setData(response.data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, dependencies);

  return { data, loading, error };
};
```

---

## 9. Enrutador (router/)

### 9.1 ProtectedRoute.jsx
```jsx
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};
```

### 9.2 AppRouter.jsx
```jsx
const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: <ProtectedRoute><Layout><Outlet /></ProtectedRoute>,
    children: [
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'clientes', element: <CustomerSearchPage /> },
      { path: 'clientes/:id', element: <CustomerDetailPage /> },
      { path: 'clientes/nuevo', element: <CustomerCreatePage /> },
      { path: 'cuentas/:accountNumber', element: <AccountDetailPage /> },
      { path: 'cuentas/nueva', element: <AccountCreatePage /> },
      { path: 'transacciones/nueva', element: <TransactionFormPage /> },
      { path: 'transacciones/historial/:accountNumber', element: <TransactionHistoryPage /> },
      { path: 'sucursales', element: <BranchesPage /> },
      { path: 'feriados', element: <HolidaysPage /> },
      { path: 'notificaciones', element: <NotificationsPage /> },
      { path: '*', element: <NotFoundPage /> }
    ]
  }
]);
```

---

## 10. Fases de Implementación

### Fase 1: Base e Infraestructura (2 días)
**Objetivo:** Proyecto funcional con autenticación y layout base

**Tareas:**
1. [ ] Crear proyecto Vite: `npm create vite@latest grupo1-frontend -- --template react`
2. [ ] Instalar dependencias: `react-router-dom`, `axios`, `tailwindcss`
3. [ ] Configurar Tailwind CSS en `tailwind.config.js`
4. [ ] Crear `AuthContext` con `login()`, `logout()`, persistencia en localStorage
5. [ ] Crear `ProtectedRoute.jsx` para rutas protegidas
6. [ ] Crear `axiosInstance.js` con interceptor para 401
7. [ ] Crear `AppRouter.jsx` con rutas básicas (/login, /dashboard, etc)
8. [ ] Crear layout: `Sidebar.jsx`, `Topbar.jsx`, `Layout.jsx`
9. [ ] Implementar `LoginPage.jsx` (solo username)
10. [ ] Crear `DashboardPage.jsx` básica
11. [ ] Crear `NotFoundPage.jsx`

**Resultado esperado:** Login funcional redirige a dashboard, logout funciona, rutas protegidas redirigen a login

---

### Fase 2: Módulo Clientes (2 días)

**Tareas:**
1. [ ] Crear `customerApi.js` con todas las funciones
2. [ ] Implementar `CustomerSearchPage.jsx` (búsqueda por tipo + número)
3. [ ] Implementar `CustomerDetailPage.jsx` (datos + lista de cuentas)
4. [ ] Implementar `CustomerCreatePage.jsx` (form condicional NATURAL/JURIDICO)
5. [ ] Crear helper `formatters.js` con `formatCurrency()`, `formatDate()`
6. [ ] Crear `StatusBadge.jsx` para mostrar estados
7. [ ] Crear componente `ConfirmModal.jsx`

**Resultado esperado:** Búsqueda, creación y visualización de clientes funcionales

---

### Fase 3: Módulo Cuentas (2 días)

**Tareas:**
1. [ ] Crear `accountApi.js`
2. [ ] Implementar `AccountDetailPage.jsx` (datos + botones de estado)
3. [ ] Implementar `AccountCreatePage.jsx` (formulario)
4. [ ] Crear componentes para PATCH de estado (activate, inactivate, block, suspend)
5. [ ] Mostrar últimas 10 transacciones en AccountDetailPage
6. [ ] Link a `TransactionHistoryPage`

**Resultado esperado:** Crear cuentas, cambiar estado, ver historial funcional

---

### Fase 4: Módulo Transacciones (2 días)

**Tareas:**
1. [ ] Crear `transactionApi.js`
2. [ ] Implementar `TransactionFormPage.jsx` con tabs (Débito | Crédito | Transferencia)
3. [ ] Cada tab con su formulario y validación
4. [ ] Mostrar UUID y resultado de cada transacción
5. [ ] Implementar `TransactionHistoryPage.jsx` (tabla completa + filtros)
6. [ ] Crear helper `validators.js` para validación de montos

**Resultado esperado:** Débitos, créditos y transferencias funcionales

---

### Fase 5: Módulos Secundarios (2 días)

**Tareas:**
1. [ ] Crear `branchApi.js` + `BranchesPage.jsx` (lista + crear con modal)
2. [ ] Crear `holidayApi.js` + `HolidaysPage.jsx` (tabla + verificador de día hábil + crear/eliminar)
3. [ ] Crear `notificationApi.js` + `NotificationsPage.jsx` (bandeja + marcar leída)
4. [ ] Colorear notificaciones por tipo (CREDITO, DEBITO, SEGURIDAD, INFO)

**Resultado esperado:** Gestión de sucursales, feriados y notificaciones funcional

---

### Fase 6: Dashboard y Pulido (1 día)

**Tareas:**
1. [ ] Implementar `DashboardPage.jsx` completa (cards + badge notificaciones no leídas)
2. [ ] Crear `constants/statusColors.js`, `constants/errorMessages.js`, `constants/endpointPaths.js`
3. [ ] Crear `hooks/useAuth.js`, `hooks/useFetch.js`
4. [ ] Manejo global de errores HTTP (toast o modal)
5. [ ] Estados de carga en todas las tablas
6. [ ] Testing básico de rutas protegidas
7. [ ] Ajustes finales de UX

**Resultado esperado:** Frontend completamente funcional listo para integración con backend

---

## 11. Requisitos Backend para el Frontend

El backend **DEBE** proporcionar:

1. **POST `/auth/login/staff`**
   - Request: `{ username, password }`
   - Response: `{ coreUserId, username, fullName, role, status, lastLogin }`
   - Sin validación de password (aún sin seguridad)

2. **Tabla `CORE_USER`**
   - Campos: id, username, passwordHash, fullName, role, status, creationDate, lastLogin
   - Constraint: username UNIQUE

3. **Todos los 35 endpoints funcionando** (ver sección 2 del plan anterior)

4. **CORS configurado** para `localhost:5173` y `localhost:5174`

5. **Validaciones básicas** en backend (ej: no permitir estados inválidos, montos negativos)

---

## 12. Notas de Implementación

### Seguridad Futura
- El login actual **NO valida password**
- Cuando se implemente seguridad, solo cambiar `authApi.js`:
  ```javascript
  export const loginStaff = (username, password) => 
    axiosInstance.post('/auth/login/staff', { username, password });
  ```
- Frontend no necesita cambios adicionales

### UUID de Transacciones
- Generar con `crypto.randomUUID()` (nativo del navegador)
- No require dependencias adicionales

### Gestión de Errores
- HTTP 401 → logout automático (interceptor de axios)
- HTTP 404 → mostrar toast "No encontrado"
- HTTP 500 → mostrar toast "Error del servidor"
- Validar antes de enviar (email, montos, fechas)

### Performance
- Lazy loading de páginas con `React.lazy()` en Router
- Caching de resultados en estado local (Customer, Account, etc)
- Debounce en búsquedas

---

## 13. Integración con Repositorio Unificado

Este frontend está diseñado para:
- Funcionar **independientemente** en repositorio propio (desarrollo)
- Fusionarse en **repositorio unificado** cuando esté listo
- Usar mismo backend (`http://localhost:8080/core/v1`)
- Mantener estructura limpia para facilitar merge

**Pasos para unificación:**
1. Git merge de rama frontend al repositorio unificado
2. Ajustar `.gitignore` si es necesario
3. Crear workflows CI/CD que compilar tanto backend como frontend
4. Docker Compose con servicios backend + frontend

---

## 14. Checklist Final

- [ ] Login funciona solo con username
- [ ] CRUD Clientes completo
- [ ] CRUD Cuentas completo con cambios de estado
- [ ] Transacciones (débito, crédito, transferencia) funcionales
- [ ] Historial de transacciones con filtros
- [ ] Sucursales CRUD
- [ ] Feriados CRUD + verificador de día hábil
- [ ] Notificaciones con bandeja + marcar leída
- [ ] Dashboard con cards y badge de notificaciones
- [ ] Logout limpia sesión
- [ ] Manejo de errores HTTP completo
- [ ] Responsive en mobile (Tailwind)
- [ ] ESLint sin errores
- [ ] Documentación de desarrollo en README
- [ ] Prueba integral de todos los flujos
