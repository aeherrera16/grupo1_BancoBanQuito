import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Banknote,
  Bell,
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  CloudUpload,
  CreditCard,
  DatabaseZap,
  Download,
  FileCheck2,
  FileClock,
  FileText,
  Landmark,
  LayoutDashboard,
  Loader2,
  LockKeyhole,
  LogOut,
  Menu,
  ReceiptText,
  Search,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  UserRound,
  Users,
  WalletCards,
  X,
  XCircle,
} from 'lucide-react';
import { coreApi } from './api/coreApi';
import { switchApi } from './api/switchApi';
import type { Account, BatchUploadResult, Customer, Session, Transaction } from './types';

type Role = 'EMPRESA' | 'CLIENTE_NATURAL' | 'ASESOR' | 'CAJERO' | 'SWITCH' | 'ADMIN';
type PageKey =
  | 'dashboard'
  | 'csv'
  | 'lotes'
  | 'cuentas'
  | 'movimientos'
  | 'transferencias'
  | 'clientes'
  | 'crear-natural'
  | 'crear-empresa'
  | 'abrir-cuenta'
  | 'buscar-cuenta'
  | 'depositos'
  | 'retiros'
  | 'validaciones'
  | 'pagos'
  | 'comisiones';

type UploadResult = {
  isSuccess?: boolean;
  validationResult?: string;
  batchStatus?: string;
  fileValidation?: {
    structureValid?: boolean;
    totalsMatch?: boolean;
    customerActiveValid?: boolean;
    duplicateFileValid?: boolean;
    validationResult?: string;
    validatedAt?: string;
    paymentBatch?: {
      id?: number;
      channel?: string;
      fileHash?: string;
      fileName?: string;
      generatedAt?: string;
      headerTotalAmount?: number;
      headerTotalRecords?: number;
      receivedAt?: string;
      ruc?: string;
      serviceType?: string;
      sourceAccountNumber?: string;
      status?: string;
      successfulRecords?: number | null;
    };
  };
  message?: string;
  error?: string;
};

type NotificationTone = 'success' | 'warning' | 'danger' | 'info';

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  time?: string;
  tone: NotificationTone;
  icon: React.ElementType;
  order: number;
};

const CORE_URL = import.meta.env.VITE_CORE_API_URL || 'http://localhost:8080';
const SWITCH_URL = import.meta.env.VITE_SWITCH_API_URL || 'http://localhost:8081';

const roles: { id: Role; label: string; subtitle: string; icon: React.ElementType }[] = [
  { id: 'EMPRESA', label: 'Empresa / Persona Jurídica', subtitle: 'Banca Web Empresas', icon: BriefcaseBusiness },
  { id: 'CLIENTE_NATURAL', label: 'Cliente Natural', subtitle: 'Banca personal', icon: UserRound },
  { id: 'ASESOR', label: 'Asesor', subtitle: 'Apertura y actualización', icon: Users },
  { id: 'CAJERO', label: 'Cajero', subtitle: 'Operación en ventanilla', icon: CircleDollarSign },
  { id: 'SWITCH', label: 'Operador Switch', subtitle: 'Pagos masivos', icon: DatabaseZap },
  { id: 'ADMIN', label: 'Administrador', subtitle: 'Control general', icon: ShieldCheck },
];

const menuByRole: Record<Role, { section: string; items: { key: PageKey; label: string; icon: React.ElementType }[] }[]> = {
  EMPRESA: [
    { section: 'Principal', items: [{ key: 'dashboard', label: 'Dashboard empresa', icon: LayoutDashboard }] },
    {
      section: 'Pagos masivos',
      items: [
        { key: 'csv', label: 'Carga CSV', icon: UploadCloud },
        { key: 'lotes', label: 'Lotes y reportes', icon: FileCheck2 },
        { key: 'cuentas', label: 'Cuentas empresariales', icon: WalletCards },
      ],
    },
  ],
  CLIENTE_NATURAL: [
    {
      section: 'Banca personal',
      items: [
        { key: 'dashboard', label: 'Resumen personal', icon: LayoutDashboard },
        { key: 'cuentas', label: 'Mis cuentas', icon: WalletCards },
        { key: 'movimientos', label: 'Movimientos', icon: ReceiptText },
      ],
    },
  ],
  ASESOR: [
    {
      section: 'Gestión comercial',
      items: [
        { key: 'dashboard', label: 'Panel asesor', icon: LayoutDashboard },
        { key: 'clientes', label: 'Clientes', icon: Users },
        { key: 'crear-natural', label: 'Crear persona natural', icon: UserRound },
        { key: 'crear-empresa', label: 'Crear empresa', icon: Building2 },
        { key: 'abrir-cuenta', label: 'Apertura de cuentas', icon: CreditCard },
      ],
    },
  ],
  CAJERO: [
    {
      section: 'Ventanilla',
      items: [
        { key: 'dashboard', label: 'Panel cajero', icon: LayoutDashboard },
        { key: 'buscar-cuenta', label: 'Buscar cuenta', icon: Search },
        { key: 'depositos', label: 'Depósitos', icon: CircleDollarSign },
        { key: 'retiros', label: 'Retiros', icon: CreditCard },
        { key: 'movimientos', label: 'Movimientos', icon: ReceiptText },
      ],
    },
  ],
  SWITCH: [
    {
      section: 'Operación Switch',
      items: [
        { key: 'dashboard', label: 'Resumen Switch', icon: LayoutDashboard },
        { key: 'lotes', label: 'Lotes recibidos', icon: FileClock },
        { key: 'validaciones', label: 'Validaciones', icon: ShieldCheck },
        { key: 'pagos', label: 'Pagos', icon: CircleDollarSign },
        { key: 'comisiones', label: 'Comisiones', icon: ReceiptText },
      ],
    },
  ],
  ADMIN: [
    {
      section: 'Administración',
      items: [
        { key: 'dashboard', label: 'Resumen general', icon: LayoutDashboard },
        { key: 'clientes', label: 'Clientes', icon: Users },
        { key: 'cuentas', label: 'Cuentas', icon: WalletCards },
        { key: 'lotes', label: 'Switch', icon: DatabaseZap },
      ],
    },
  ],
};

const accounts = [
  { number: '0010000001', type: 'Ahorros', branch: 'Sucursal Norte', balance: 2450, available: 2450, status: 'ACTIVA' },
  { number: '0050000201', type: 'Corriente', branch: 'Digital', balance: 42500, available: 42500, status: 'ACTIVA' },
  { number: '0050000202', type: 'Nómina', branch: 'Digital', balance: 18500, available: 18000, status: 'ACTIVA' },
];

const mockBatches = [
  { id: 3, fileName: 'lote_prueba_front_002.csv', channel: 'PORTAL', ruc: '1712345678001', status: 'VALIDADO', amount: 1500, records: 2, receivedAt: '2026-05-09 02:51' },
  { id: 2, fileName: 'test_sftp.csv', channel: 'SFTP', ruc: '1712345678001', status: 'VALIDADO', amount: 1500, records: 2, receivedAt: '2026-05-09 02:01' },
  { id: 1, fileName: 'test_portal_duplicate.csv', channel: 'SFTP', ruc: '1712345678001', status: 'VALIDADO', amount: 1500, records: 2, receivedAt: '2026-05-09 02:01' },
];

function money(value: number | undefined | null) {
  return new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(Number(value || 0));
}

function statusClass(status?: string) {
  const normalized = (status || '').toUpperCase();
  if (['UP', 'SUCCESS', 'VALIDADO', 'ACTIVA', 'PROCESADO', 'EXITOSA'].includes(normalized)) return 'status good';
  if (['EN_PROCESO', 'PENDIENTE', 'ENCOLADO', 'SUSPENDIDO', 'SUSPENDIDA'].includes(normalized)) return 'status warn';
  if (['RECHAZADO', 'ERROR', 'BLOQUEADA', 'INACTIVA', 'INACTIVO'].includes(normalized)) return 'status bad';
  return 'status neutral';
}

function dt(value?: string) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('es-EC', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

function customerName(customer?: Customer | null) {
  if (!customer) return 'Cliente Natural';
  return [customer.firstName, customer.lastName].filter(Boolean).join(' ') || customer.legalName || 'Cliente Natural';
}

function customerDisplayName(customer?: Customer | null) {
  if (!customer) return 'Cliente BanQuito';
  return customer.legalName || customerName(customer);
}

function normalizeLoginValue(value?: string | null) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function customerLoginKeys(customer: Customer) {
  return [
    customer.identification,
    customer.email,
    customer.mobilePhone,
    customer.legalName,
    [customer.firstName, customer.lastName].filter(Boolean).join(' '),
    customer.firstName,
  ]
    .map(normalizeLoginValue)
    .filter(Boolean);
}

function findCustomerForLogin(customers: Customer[], username: string, customerType: Customer['customerType']) {
  const normalized = normalizeLoginValue(username);
  return customers
    .filter((customer) => customer.customerType === customerType)
    .find((customer) => customerLoginKeys(customer).includes(normalized)) || null;
}

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'CN';
}

function maskAccountNumber(accountNumber?: string) {
  if (!accountNumber) return 'Cuenta no disponible';
  return `**** ${accountNumber.slice(-4)}`;
}

function isDebitMovement(movementType?: string) {
  return String(movementType || '').toUpperCase().includes('DEBIT');
}

function serviceLabel(service?: string) {
  const normalized = String(service || '').toUpperCase();
  if (normalized === 'NOM') return 'Nomina';
  if (normalized === 'PRV') return 'Proveedores';
  return service || 'Pagos masivos';
}

function batchAmount(batch: any) {
  return Number(batch?.headerTotalAmount ?? batch?.amount ?? 0);
}

function accountNumberFromTransaction(transaction: any) {
  return transaction?.accountNumber || transaction?.account?.accountNumber || '';
}

function transactionOrder(transaction: any) {
  const rawDate = transaction?.transactionDate || transaction?.createdAt;
  const dateOrder = rawDate ? new Date(rawDate).getTime() : 0;
  return Number.isFinite(dateOrder) && dateOrder > 0 ? dateOrder : Number(transaction?.id || 0);
}

function batchOrder(batch: any) {
  const rawDate = batch?.processedAt || batch?.receivedAt || batch?.createdAt || batch?.fileValidation?.validatedAt;
  const dateOrder = rawDate ? new Date(rawDate).getTime() : 0;
  return Number.isFinite(dateOrder) && dateOrder > 0 ? dateOrder : Number(batch?.id || 0);
}

function findCustomerById(customers: Customer[], id?: number) {
  if (!id) return null;
  return customers.find((customer) => customer.id === id) || null;
}

function accountsForSession(session: Session, customers: Customer[], accountsData: any[]) {
  if (session.role === 'CLIENTE_NATURAL') {
    return accountsData.filter((account) => session.customerId && Number(account.customerId) === Number(session.customerId));
  }

  if (session.role === 'EMPRESA') {
    const sessionCustomer = findCustomerById(customers, session.customerId);
    const normalizedCompanyName = normalizeLoginValue(session.displayName);
    return accountsData.filter((account) => {
      const accountCustomer = findCustomerById(customers, Number(account.customerId));
      if (accountCustomer?.customerType !== 'JURIDICO') return false;

      const sameCompanyRuc = session.companyRuc && accountCustomer.identification === session.companyRuc;
      const sameLegalCustomer = sessionCustomer?.customerType === 'JURIDICO' && sessionCustomer.identification === accountCustomer.identification;
      const sameCompanyName = normalizedCompanyName && normalizeLoginValue(accountCustomer.legalName) === normalizedCompanyName;

      return Boolean(sameCompanyRuc || sameLegalCustomer || sameCompanyName);
    });
  }

  return [];
}

function buildTransactionNotification(transaction: any, account?: any, role?: Role): NotificationItem {
  const accountNumber = accountNumberFromTransaction(transaction) || account?.accountNumber;
  const amount = money(Number(transaction?.amount || 0));
  const isDebit = isDebitMovement(transaction?.movementType);
  const uuid = String(transaction?.transactionUuid || '');
  const isBatchMovement = uuid.startsWith('BATCH-');
  const owner = accountOwner(account) !== '-' ? accountOwner(account) : 'cuenta BanQuito';
  const title = isDebit
    ? (isBatchMovement && role === 'EMPRESA' ? 'Pago masivo debitado' : 'Debito realizado')
    : (isBatchMovement ? 'Pago masivo recibido' : 'Deposito recibido');
  const body = isDebit
    ? `Se debito ${amount} de ${maskAccountNumber(accountNumber)} (${owner}).`
    : `Se acredito ${amount} en ${maskAccountNumber(accountNumber)} (${owner}).`;

  return {
    id: `tx-${transaction?.id || uuid || accountNumber}-${transactionOrder(transaction)}`,
    title,
    body,
    time: dt(transaction?.transactionDate),
    tone: isDebit ? 'warning' : 'success',
    icon: isDebit ? CreditCard : CircleDollarSign,
    order: transactionOrder(transaction),
  };
}

function buildBatchNotification(batch: any, title = 'Lote procesado'): NotificationItem {
  const status = String(batch?.status || batch?.batchStatus || '').toUpperCase();
  const rejected = rejectedRecords(batch);
  const tone: NotificationTone = status.includes('RECHAZ') || rejected > 0 ? 'danger' : status.includes('PROCES') ? 'success' : 'info';
  return {
    id: `batch-${batch?.id || batch?.fileName || batchOrder(batch)}`,
    title,
    body: `${batch?.fileName || 'Archivo CSV'} por ${money(batchAmount(batch))}. Exitosos: ${successfulRecords(batch)}, rechazados: ${rejected}.`,
    time: dt(batch?.processedAt || batch?.receivedAt || batch?.fileValidation?.validatedAt),
    tone,
    icon: tone === 'danger' ? XCircle : FileCheck2,
    order: batchOrder(batch),
  };
}

function buildNotificationsForSession(
  session: Session,
  customers: Customer[],
  accountsData: any[],
  transactionsData: any[],
  batchesData: any[],
) {
  const accountByNumber = new Map(accountsData.map((account) => [account.accountNumber, account]));
  const items: NotificationItem[] = [];

  if (session.role === 'CLIENTE_NATURAL' || session.role === 'EMPRESA') {
    const ownedAccounts = accountsForSession(session, customers, accountsData);
    const ownedNumbers = new Set(ownedAccounts.map((account) => account.accountNumber));
    transactionsData
      .filter((transaction) => ownedNumbers.has(accountNumberFromTransaction(transaction)))
      .forEach((transaction) => items.push(buildTransactionNotification(transaction, accountByNumber.get(accountNumberFromTransaction(transaction)), session.role as Role)));

    if (session.role === 'EMPRESA') {
      const company = findCustomerById(customers, session.customerId);
      const ruc = session.companyRuc || company?.identification;
      batchesData
        .filter((batch) => !ruc || String(batch?.ruc || '') === String(ruc))
        .forEach((batch) => items.push(buildBatchNotification(batch, 'Lote de pagos registrado')));
    }
  }

  if (session.role === 'ASESOR') {
    customers
      .slice()
      .sort((a, b) => Number(b.id || 0) - Number(a.id || 0))
      .slice(0, 5)
      .forEach((customer) => items.push({
        id: `customer-${customer.id}`,
        title: 'Cliente registrado',
        body: `${customerTypeLabel(customer)}: ${customerDisplayName(customer)} (${customer.identification}).`,
        time: 'Reciente',
        tone: 'info',
        icon: Users,
        order: Number(customer.id || 0),
      }));

    accountsData
      .slice()
      .sort((a, b) => Number(b.id || 0) - Number(a.id || 0))
      .slice(0, 5)
      .forEach((account) => items.push({
        id: `account-${account.id || account.accountNumber}`,
        title: 'Cuenta abierta',
        body: `${maskAccountNumber(account.accountNumber)} para ${accountOwner(account)} con saldo ${money(Number(account.availableBalance ?? account.balance ?? 0))}.`,
        time: account.creationDate ? dt(account.creationDate) : 'Reciente',
        tone: 'success',
        icon: WalletCards,
        order: Number(account.id || 0),
      }));
  }

  if (session.role === 'CAJERO') {
    transactionsData
      .slice()
      .sort((a, b) => transactionOrder(b) - transactionOrder(a))
      .slice(0, 8)
      .forEach((transaction) => items.push(buildTransactionNotification(transaction, accountByNumber.get(accountNumberFromTransaction(transaction)), session.role as Role)));
  }

  if (session.role === 'SWITCH' || session.role === 'ADMIN') {
    batchesData
      .slice()
      .sort((a, b) => batchOrder(b) - batchOrder(a))
      .slice(0, 8)
      .forEach((batch) => items.push(buildBatchNotification(batch, session.role === 'SWITCH' ? 'Evento Switch' : 'Lote auditado')));
  }

  if (session.role === 'ADMIN') {
    transactionsData
      .slice()
      .sort((a, b) => transactionOrder(b) - transactionOrder(a))
      .slice(0, 5)
      .forEach((transaction) => items.push(buildTransactionNotification(transaction, accountByNumber.get(accountNumberFromTransaction(transaction)), session.role as Role)));
  }

  const deduped = new Map<string, NotificationItem>();
  items.forEach((item) => deduped.set(item.id, item));
  return [...deduped.values()].sort((a, b) => b.order - a.order).slice(0, 10);
}

function notificationDismissKey(session: Session) {
  const ownerKey = session.customerId || session.companyRuc || normalizeLoginValue(session.username) || 'operativo';
  return `banquito-notifications-read-${session.role}-${ownerKey}`;
}

function readDismissedNotifications(session: Session) {
  try {
    const raw = localStorage.getItem(notificationDismissKey(session));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter(Boolean) as string[] : [];
  } catch {
    return [];
  }
}

function batchRecords(batch: any) {
  return Number(batch?.headerTotalRecords ?? batch?.records ?? 0);
}

function successfulRecords(batch: any) {
  return Number(batch?.successfulRecords ?? batch?.successful_records ?? 0);
}

function rejectedRecords(batch: any) {
  return Number(batch?.rejectedRecords ?? batch?.rejected_records ?? 0);
}

function feePreview(records: number) {
  const unitFee = records >= 100 ? 0.08 : records >= 25 ? 0.1 : 0.12;
  const subtotal = records * unitFee;
  const iva = subtotal * 0.15;
  return { unitFee, subtotal, iva, total: subtotal + iva };
}

function isQueuedBatch(batch: any) {
  const normalized = String(batch?.status || batch?.batchStatus || '').toUpperCase();
  return normalized.includes('ENCOL') || normalized.includes('PENDING') || normalized.includes('QUEUE');
}

type LoginChannel = 'PERSONAL' | 'WEB' | 'INTRANET';

const loginChannels: {
  id: LoginChannel;
  title: string;
  subtitle: string;
  role?: Role;
  icon: React.ElementType;
}[] = [
  { id: 'PERSONAL', title: 'Banca Personal', subtitle: 'Acceso para clientes naturales', role: 'CLIENTE_NATURAL', icon: UserRound },
  { id: 'WEB', title: 'Banca Web', subtitle: 'Portal para empresas y pagos masivos', role: 'EMPRESA', icon: BriefcaseBusiness },
  { id: 'INTRANET', title: 'Intranet (Operativos)', subtitle: 'Perfiles internos de agencia y switch', icon: ShieldCheck },
];

const intranetRoles: Role[] = ['ASESOR', 'CAJERO', 'SWITCH', 'ADMIN'];
const SESSION_STORAGE_KEY = 'banquito-session';
const customerStatuses = ['ACTIVO', 'INACTIVO', 'SUSPENDIDO'];

function savedSession() {
  const rawSession = localStorage.getItem(SESSION_STORAGE_KEY);
  if (rawSession) {
    try {
      const session = JSON.parse(rawSession) as Session;
      if (session?.role) return session;
    } catch {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }
  const savedRole = localStorage.getItem('banquito-role') as Role | null;
  if (savedRole && ['ASESOR', 'CAJERO', 'SWITCH', 'ADMIN'].includes(savedRole)) {
    return { username: 'user', role: savedRole, displayName: roles.find((role) => role.id === savedRole)?.label || 'Usuario BanQuito' };
  }
  localStorage.removeItem('banquito-role');
  return null;
}

function Login({ onLogin }: { onLogin: (session: Session) => void }) {
  const [channel, setChannel] = useState<LoginChannel | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [intranetRole, setIntranetRole] = useState<Role>('ASESOR');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const selectedChannel = loginChannels.find((item) => item.id === channel);
  const selectedRole = channel === 'INTRANET' ? intranetRole : selectedChannel?.role;
  const selected = roles.find((r) => r.id === selectedRole) || roles[0];
  const Icon = selectedChannel?.icon || Landmark;

  function chooseChannel(nextChannel: LoginChannel) {
    setChannel(nextChannel);
    setUsername('');
    setPassword('');
    setError('');
  }

  function goBack() {
    setChannel(null);
    setUsername('');
    setPassword('');
    setError('');
  }

  async function submitLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanUsername = username.trim();
    if (!cleanUsername || password !== '123') {
      setError('Ingresa tu identificacion, correo o nombre registrado y la contrasena 123.');
      return;
    }
    if (!selectedRole) return;

    if (channel === 'INTRANET') {
      onLogin({
        username: cleanUsername,
        role: selectedRole,
        displayName: roles.find((role) => role.id === selectedRole)?.label || 'Operativo BanQuito',
      });
      return;
    }

    setLoading(true);
    setError('');
    try {
      const customers = await coreApi.customers();
      const customerType = channel === 'WEB' ? 'JURIDICO' : 'NATURAL';
      const customer = findCustomerForLogin(customers, cleanUsername, customerType);
      if (!customer?.id) {
        setError(channel === 'WEB'
          ? 'No encontramos una empresa con ese RUC, correo o razon social.'
          : 'No encontramos una persona natural con esa identificacion, correo o nombre.');
        return;
      }
      if (String(customer.status || '').toUpperCase() !== 'ACTIVO') {
        setError(`El cliente ${customerDisplayName(customer)} esta ${customer.status}. Solicita reactivacion con un asesor.`);
        return;
      }
      onLogin({
        username: cleanUsername,
        role: selectedRole,
        displayName: customerDisplayName(customer),
        customerId: customer.id,
        companyRuc: customer.customerType === 'JURIDICO' ? customer.identification : undefined,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo validar el usuario contra el Core.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-shell">
      <div className="login-card">
        <section className="login-hero">
          <div className="hero-slide">
            <img src="/assets/banquito-lobby.jpg" alt="Lobby moderno de Banco BanQuito" />
            <div className="hero-slide-shade" />
            <div className="hero-slide-copy">
              <p className="eyebrow">Portal financiero digital</p>
              <h1>Tu banca conectada, segura y simple.</h1>
            </div>
          </div>
          <div className="hero-brand">
            <div>
              <Landmark size={26} />
              <span>Banco BanQuito</span>
            </div>
            <p>Core bancario, pagos masivos y operaciones internas en un solo portal.</p>
            <div className="slider-dots" aria-hidden="true">
              <span className="active" />
              <span />
              <span />
            </div>
          </div>
          <div className="hero-copy legacy-hero-copy">
            <p className="eyebrow">Banca corporativa premium</p>
            <h1>Portal transaccional para empresas, agencias y pagos masivos.</h1>
            <p>Control de cuentas, procesamiento de lotes, trazabilidad operativa y validación financiera en tiempo real.</p>
          </div>
        </section>

        <section className="login-form">
          <div className="login-form-head">
            <div className="icon-orb"><Icon size={24} /></div>
            <div>
              <h2>{selectedChannel ? selectedChannel.title : 'Acceso BanQuito'}</h2>
              <p>{selectedChannel ? selectedChannel.subtitle : 'Selecciona primero el canal de ingreso.'}</p>
            </div>
          </div>

          {!selectedChannel ? (
            <div className="channel-grid">
              {loginChannels.map((item) => {
                const ChannelIcon = item.icon;
                return (
                  <button key={item.id} className="channel-card" onClick={() => chooseChannel(item.id)}>
                    <span className="channel-icon"><ChannelIcon size={22} /></span>
                    <span>
                      <strong>{item.title}</strong>
                      <small>{item.subtitle}</small>
                    </span>
                    <ChevronRight size={18} />
                  </button>
                );
              })}
            </div>
          ) : (
            <form className="login-credentials" onSubmit={submitLogin}>
              <button type="button" className="back-action" onClick={goBack}>
                <ArrowLeft size={17} />
                <span>Volver a canales</span>
              </button>

              {channel === 'INTRANET' && (
                <label className="field">
                  <span>Perfil operativo</span>
                  <select value={intranetRole} onChange={(e) => setIntranetRole(e.target.value as Role)}>
                    {intranetRoles.map((role) => {
                      const roleInfo = roles.find((r) => r.id === role)!;
                      return <option key={role} value={role}>{roleInfo.label}</option>;
                    })}
                  </select>
                </label>
              )}

              <label className="field">
                <span>Usuario</span>
                <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder={channel === 'WEB' ? 'RUC, correo o razon social' : channel === 'PERSONAL' ? 'Cedula, correo o nombre' : 'user'} autoComplete="username" />
              </label>
              <label className="field">
                <span>Contrasena</span>
                <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="123" autoComplete="current-password" />
              </label>

              {error && <div className="login-error"><AlertCircle size={18} /> {error}</div>}

              <div className="selected-profile">
                <LockKeyhole size={18} />
                <span>Ingresar como <strong>{selected.label}</strong></span>
              </div>

              <button type="submit" className="primary-action" disabled={loading}>
                {loading ? <Loader2 className="spin" size={18} /> : <ArrowRight size={18} />}
                {loading ? 'Validando usuario...' : 'Ingresar al portal'}
              </button>
            </form>
          )}
          <p className="login-note">Clave demo: 123. Usa cedula, RUC, correo o nombre registrado en el Core.</p>
        </section>
      </div>
    </div>
  );
}

function Sidebar({ role, page, setPage, onLogout }: { role: Role; page: PageKey; setPage: (p: PageKey) => void; onLogout: () => void }) {
  const selected = roles.find((r) => r.id === role)!;
  return (
    <aside className="sidebar">
      <div className="logo-box">
        <div className="logo-icon"><Landmark size={24} /></div>
        <div>
          <strong>Banco BanQuito</strong>
        </div>
      </div>

      <div className="profile-box">
        <p>Perfil activo</p>
        <strong>{selected.label}</strong>
        <span>{selected.subtitle}</span>
      </div>

      <nav className="nav-sections">
        {menuByRole[role].map((section) => (
          <div key={section.section} className="nav-section">
            <p>{section.section}</p>
            {section.items.map((item) => {
              const Icon = item.icon;
              const active = page === item.key;
              return (
                <button key={item.key} className={active ? 'nav-item active' : 'nav-item'} onClick={() => setPage(item.key)}>
                  <Icon size={18} />
                  <span>{item.label}</span>
                  {active && <ChevronRight size={16} className="nav-chevron" />}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      <button className="logout" onClick={onLogout}><LogOut size={18} /> Cerrar sesión</button>
    </aside>
  );
}

function Topbar({ session, page }: { session: Session; page: PageKey }) {
  const role = session.role as Role;
  const title = roles.find((r) => r.id === role)?.label;
  const pageLabel = menuByRole[role].flatMap((s) => s.items).find((i) => i.key === page)?.label || 'Dashboard';
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [dismissedNotifications, setDismissedNotifications] = useState<string[]>(() => readDismissedNotifications(session));
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);

  const loadNotifications = async () => {
    setNotificationsLoading(true);
    try {
      const [customers, accountsData, transactionsData, batchesData] = await Promise.all([
        coreApi.customers(),
        coreApi.accounts(),
        coreApi.transactions(),
        switchApi.batches(),
      ]);
      const hiddenNotifications = readDismissedNotifications(session);
      const nextNotifications = buildNotificationsForSession(session, customers, accountsData, transactionsData, batchesData)
        .filter((notification) => !hiddenNotifications.includes(notification.id));
      setNotifications(nextNotifications);
    } catch {
      setNotifications([]);
    } finally {
      setNotificationsLoading(false);
    }
  };

  useEffect(() => {
    setDismissedNotifications(readDismissedNotifications(session));
    loadNotifications();
    const timer = window.setInterval(loadNotifications, 15000);
    return () => window.clearInterval(timer);
  }, [session.username, session.role, session.customerId, session.companyRuc]);

  const toggleNotifications = () => {
    const nextOpen = !notificationsOpen;
    setNotificationsOpen(nextOpen);
    if (nextOpen) loadNotifications();
  };

  const dismissSelectedNotification = () => {
    if (!selectedNotification) return;
    const nextDismissed = [...new Set([...dismissedNotifications, selectedNotification.id])];
    setDismissedNotifications(nextDismissed);
    localStorage.setItem(notificationDismissKey(session), JSON.stringify(nextDismissed));
    setNotifications((current) => current.filter((notification) => notification.id !== selectedNotification.id));
    setSelectedNotification(null);
  };

  return (
    <header className="topbar">
      <div>
        <div className="breadcrumb">Inicio / {title} / <strong>{pageLabel}</strong></div>
        <h1>{pageLabel}</h1>
      </div>
      <div className="top-actions">
        <div className="search-pill"><Search size={17} /><span>Buscar operación...</span></div>
        <div className="notification-wrap">
          <button className="icon-button notification-button" onClick={toggleNotifications} aria-label="Ver notificaciones">
            <Bell size={20} />
            {notifications.length > 0 && <span className="notification-dot">{notifications.length}</span>}
          </button>
          {notificationsOpen && (
            <div className="notification-panel">
              <div className="notification-head">
                <div>
                  <strong>Notificaciones</strong>
                  <span>{session.displayName}</span>
                </div>
                <button onClick={() => setNotificationsOpen(false)}><X size={16} /></button>
              </div>
              <div className="notification-list">
                {notificationsLoading && <div className="notification-empty">Cargando movimientos recientes...</div>}
                {!notificationsLoading && notifications.length === 0 && (
                  <div className="notification-empty">No hay notificaciones para este perfil.</div>
                )}
                {!notificationsLoading && notifications.map((notification) => {
                  const Icon = notification.icon;
                  return (
                    <article
                      key={notification.id}
                      className={`notification-item ${notification.tone}`}
                      onClick={() => {
                        setSelectedNotification(notification);
                        setNotificationsOpen(false);
                      }}
                    >
                      <div className="notification-icon"><Icon size={18} /></div>
                      <div>
                        <strong>{notification.title}</strong>
                        <p>{notification.body}</p>
                        <span>{notification.time || 'Reciente'}</span>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        <div className="env-badge">V1</div>
      </div>
      {selectedNotification && createPortal(
        <div className="notification-modal-backdrop">
          <section className={`notification-modal ${selectedNotification.tone}`}>
            <button className="notification-modal-close" onClick={dismissSelectedNotification} aria-label="Cerrar notificacion">
              <X size={18} />
            </button>
            <div className="notification-modal-icon">
              {React.createElement(selectedNotification.icon, { size: 30 })}
            </div>
            <span className="notification-modal-kicker">Detalle de notificacion</span>
            <h2>{selectedNotification.title}</h2>
            <p>{selectedNotification.body}</p>
            <div className="notification-modal-meta">
              <span>Perfil</span>
              <strong>{title}</strong>
            </div>
            <div className="notification-modal-meta">
              <span>Fecha</span>
              <strong>{selectedNotification.time || 'Reciente'}</strong>
            </div>
          </section>
        </div>,
        document.body,
      )}
    </header>
  );
}

function StatCard({ label, value, detail, icon: Icon, accent = 'blue' }: { label: string; value: string; detail: string; icon: React.ElementType; accent?: string }) {
  return (
    <article className={`stat-card ${accent}`}>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        <span>{detail}</span>
      </div>
      <div className="stat-icon"><Icon size={22} /></div>
    </article>
  );
}

function SectionCard({ title, subtitle, children, action }: { title: string; subtitle?: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="section-card">
      <div className="section-head">
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="section-body">{children}</div>
    </section>
  );
}

function ValidationSummary({ result }: { result: UploadResult }) {
  const batch = result.fileValidation?.paymentBatch;
  const success = result.isSuccess || result.validationResult === 'SUCCESS';
  const validations = [
    { label: 'Estructura válida', value: result.fileValidation?.structureValid },
    { label: 'Totales coinciden', value: result.fileValidation?.totalsMatch },
    { label: 'Cliente activo', value: result.fileValidation?.customerActiveValid },
    { label: 'Archivo no duplicado', value: result.fileValidation?.duplicateFileValid },
  ];

  return (
    <div className={success ? 'validation-result success' : 'validation-result danger'}>
      <div className="validation-main">
        <div className="validation-icon">{success ? <CheckCircle2 size={28} /> : <XCircle size={28} />}</div>
        <div>
          <h3>{success ? 'Archivo validado correctamente' : 'Archivo rechazado'}</h3>
          <p>{success ? 'El lote fue recibido por el Switch y registrado para procesamiento.' : result.message || result.error || 'El Switch rechazó el archivo enviado.'}</p>
        </div>
        <span className={statusClass(result.batchStatus || result.validationResult)}>{result.batchStatus || result.validationResult || 'RESULTADO'}</span>
      </div>

      {batch && (
        <div className="batch-summary-grid">
          <Info label="Lote" value={`#${batch.id ?? '-'}`} />
          <Info label="Archivo" value={batch.fileName || '-'} />
          <Info label="RUC" value={batch.ruc || '-'} />
          <Info label="Canal" value={batch.channel || '-'} />
          <Info label="Servicio" value={batch.serviceType === 'NOM' ? 'Nómina' : batch.serviceType || '-'} />
          <Info label="Registros" value={String(batch.headerTotalRecords ?? '-')} />
          <Info label="Monto total" value={money(batch.headerTotalAmount)} />
          <Info label="Recibido" value={batch.receivedAt ? new Date(batch.receivedAt).toLocaleString('es-EC') : '-'} />
        </div>
      )}

      <div className="validation-checks">
        {validations.map((item) => (
          <div key={item.label} className={item.value ? 'check ok' : 'check fail'}>
            {item.value ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="info-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function UploadCsvPage() {
  const [file, setFile] = useState<File | null>(null);
  const [channel, setChannel] = useState('Portal Web');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState('');

  async function upload() {
    if (!file) {
      setError('Selecciona un archivo CSV antes de enviarlo.');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('channel', channel);

    try {
      const response = await fetch(`${SWITCH_URL}/api/payment-batch/upload-csv`, {
        method: 'POST',
        body: formData,
      });
      const text = await response.text();
      let data: UploadResult;
      try {
        data = JSON.parse(text);
      } catch {
        data = { isSuccess: response.ok, validationResult: response.ok ? 'SUCCESS' : 'ERROR', message: text };
      }
      if (!response.ok) {
        setError(data.message || data.error || 'El Switch rechazó la solicitud.');
      }
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo conectar con el Switch.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-grid two-col">
      <SectionCard title="Carga de archivo CSV" subtitle="Endpoint real: POST /api/payment-batch/upload-csv">
        <div className="dropzone">
          <div className="drop-icon"><CloudUpload size={34} /></div>
          <h3>Selecciona el archivo de pagos</h3>
          <p>Acepta .csv o .txt con cabecera, detalle y pie de control.</p>
          <label className="file-picker">
            <input type="file" accept=".csv,.txt" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            <span>Seleccionar archivo</span>
            <strong>{file ? file.name : 'Ningún archivo seleccionado'}</strong>
          </label>
          {file && <div className="file-chip"><FileText size={16} /> {file.name} · {(file.size / 1024).toFixed(1)} KB</div>}
        </div>

        <label className="field clean">
          <span>Canal</span>
          <select value={channel} onChange={(e) => setChannel(e.target.value)}>
            <option>Portal Web</option>
            <option>SFTP Seguro</option>
          </select>
        </label>

        <button className="primary-action wide" onClick={upload} disabled={loading}>
          {loading ? <Loader2 className="spin" size={18} /> : <UploadCloud size={18} />}
          {loading ? 'Enviando y validando...' : 'Validar y enviar al Switch'}
        </button>

        {error && <div className="alert error"><AlertCircle size={18} /> {error}</div>}
        {result && <ValidationSummary result={result} />}
      </SectionCard>

      <AccountsPanel />
    </div>
  );
}

function AccountsPanel() {
  return (
    <SectionCard title="Cuentas de la empresa" subtitle="Saldos para cuenta matriz y nómina" action={<span className="mini-badge">Core</span>}>
      <div className="table-wrap">
        <table className="pro-table">
          <thead>
            <tr>
              <th>Cuenta</th>
              <th>Tipo</th>
              <th>Sucursal</th>
              <th className="amount">Saldo</th>
              <th className="amount">Disponible</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((a) => (
              <tr key={a.number}>
                <td><strong>{a.number}</strong></td>
                <td>{a.type}</td>
                <td>{a.branch}</td>
                <td className="amount"><strong>{money(a.balance)}</strong></td>
                <td className="amount"><strong>{money(a.available)}</strong></td>
                <td><span className={statusClass(a.status)}>{a.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}

function DashboardPage({ role }: { role: Role }) {
  return (
    <div className="space-y">
      <div className="hero-panel">
        <div>
          <p className="eyebrow dark">Banco BanQuito · Plataforma V1</p>
          <h2>{role === 'EMPRESA' ? 'Banca Web Empresas' : 'Panel operativo BanQuito'}</h2>
          <p>Control financiero, validación de pagos masivos y trazabilidad de operaciones entre Core y Switch.</p>
        </div>
        <div className="hero-status">
          <span><BadgeCheck size={18} /> Core UP</span>
          <span><BadgeCheck size={18} /> Switch UP</span>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard label="Cuentas empresariales" value="03" detail="Operativa, nómina e impuestos" icon={WalletCards} />
        <StatCard label="Disponible total" value={money(62950)} detail="Saldo consultado al Core" icon={Landmark} accent="gold" />
        <StatCard label="Lotes registrados" value="03" detail="Archivos recibidos por Switch" icon={FileCheck2} />
        <StatCard label="Monto validado" value={money(4500)} detail="Últimos lotes aprobados" icon={Activity} accent="green" />
      </div>

      <div className="page-grid two-col">
        <UploadCsvPage />
      </div>
    </div>
  );
}

function BatchesPage() {
  return (
    <SectionCard
      title="Lotes y reportes"
      subtitle="Vista ejecutiva de archivos recibidos por el Switch"
      action={<button className="secondary-action"><Download size={16} /> Exportar</button>}
    >
      <div className="filters-row">
        <div className="filter"><Search size={16} /> Buscar archivo, RUC o hash...</div>
        <span className="mini-badge">Todos</span>
        <span className="mini-badge">Validados</span>
        <span className="mini-badge">Rechazados</span>
      </div>
      <div className="table-wrap">
        <table className="pro-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Archivo</th>
              <th>Canal</th>
              <th>RUC</th>
              <th className="amount">Monto</th>
              <th>Registros</th>
              <th>Estado</th>
              <th>Recibido</th>
            </tr>
          </thead>
          <tbody>
            {mockBatches.map((b) => (
              <tr key={b.id}>
                <td><strong>#{b.id}</strong></td>
                <td>{b.fileName}</td>
                <td>{b.channel}</td>
                <td>{b.ruc}</td>
                <td className="amount"><strong>{money(b.amount)}</strong></td>
                <td>{b.records}</td>
                <td><span className={statusClass(b.status)}>{b.status}</span></td>
                <td>{b.receivedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}

function CompanyBankingPage({ page, session }: { page: PageKey; session: Session }) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [accountsData, setAccountsData] = useState<Account[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadResult, setUploadResult] = useState<BatchUploadResult | null>(null);

  async function loadCompanyData() {
    try {
      const [nextCustomers, nextAccounts, nextBatches] = await Promise.all([
        coreApi.customers(),
        coreApi.accounts(),
        switchApi.batches(),
      ]);
      setCustomers(nextCustomers);
      setAccountsData(nextAccounts);
      setBatches(nextBatches);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo cargar la banca empresas.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCompanyData();
  }, []);

  const company =
    customers.find((customer) => customer.id === session.customerId && customer.customerType === 'JURIDICO') ||
    customers.find((customer) => customer.customerType === 'JURIDICO' && customer.identification === session.companyRuc) ||
    null;
  const companyAccounts = company?.id
    ? accountsData.filter((account) => account.customerId === company.id)
    : accountsData.filter((account) => account.accountSubtype?.code !== 'AHO');
  const matrixAccount =
    companyAccounts.find((account) => account.accountSubtype?.code === 'CTE') ||
    companyAccounts[0] ||
    null;
  const payrollAccount =
    companyAccounts.find((account) => account.accountSubtype?.code === 'NOM') ||
    null;
  const totalAvailable = companyAccounts.reduce((sum, account) => sum + Number(account.availableBalance ?? account.balance ?? 0), 0);
  const companyRuc = company?.identification || session.companyRuc;
  const companyBatches = companyRuc
    ? batches.filter((batch) => {
        const batchRuc = batch.ruc || batch.customerRuc || batch.companyRuc || batch.headerRuc;
        return !batchRuc || String(batchRuc) === String(companyRuc);
      })
    : [];
  const processedBatches = companyBatches.filter((batch) => ['PROCESSED', 'PROCESADO', 'VALIDADO', 'SUCCESS'].includes(String(batch.status || '').toUpperCase()));
  const queuedBatches = companyBatches.filter(isQueuedBatch);
  const totalDispersed = processedBatches.reduce((sum, batch) => sum + batchAmount(batch), 0);
  const totalSuccessfulRecords = companyBatches.reduce((sum, batch) => sum + successfulRecords(batch), 0);
  const fees = feePreview(totalSuccessfulRecords || companyBatches.reduce((sum, batch) => sum + batchRecords(batch), 0));
  const companyName = company?.legalName || session.displayName || 'Empresa BanQuito';

  async function handleCompanyUpload(file: File, channel: 'PORTAL' | 'SFTP') {
    setUploadResult(null);
    setError('');
    try {
      const result = await switchApi.uploadCsv(file, channel);
      setUploadResult(result);
      await loadCompanyData();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'El Switch rechazo la solicitud.');
    }
  }

  if (loading) {
    return (
      <SectionCard title="Banca Web Empresas" subtitle="Cargando pagos masivos">
        <div className="empty-state">
          <div className="empty-icon"><Loader2 className="spin" size={34} /></div>
          <h3>Preparando consola empresarial</h3>
          <p>Consultando cuentas matriz, lotes y reportes del Switch.</p>
        </div>
      </SectionCard>
    );
  }

  const hero = (
    <section className="company-hero">
      <div>
        <p className="eyebrow dark">Banca Web Empresas · Pagos masivos</p>
        <h2>{companyName}</h2>
        <p>Remite archivos por Portal Web o SFTP, valida estructura y fraude operativo, procesa linea por linea y consulta el cuadre corporativo del lote.</p>
      </div>
      <div className="company-hero-rail">
        <span><UploadCloud size={16} /> RF-01 Ingesta</span>
        <span><ShieldCheck size={16} /> RF-02 Validacion</span>
        <span><ReceiptText size={16} /> RF-08 Reporte</span>
      </div>
    </section>
  );

  const stats = (
    <div className="stats-grid company-stats">
      <StatCard label="Cuenta matriz" value={matrixAccount ? money(Number(matrixAccount.availableBalance ?? matrixAccount.balance ?? 0)) : '$0,00'} detail={matrixAccount ? maskAccountNumber(matrixAccount.accountNumber) : 'Sin cuenta de cargo'} icon={Landmark} accent="gold" />
      <StatCard label="Lotes recibidos" value={String(batches.length)} detail={`${queuedBatches.length} encolados por corte`} icon={FileCheck2} />
      <StatCard label="Monto dispersado" value={money(totalDispersed)} detail="Lotes procesados o validados" icon={Activity} accent="green" />
      <StatCard label="Comision estimada" value={money(fees.total)} detail={`IVA incluido ${money(fees.iva)}`} icon={ReceiptText} />
    </div>
  );

  const rfStrip = (
    <div className="company-rf-strip">
      <article>
        <span>RF-01</span>
        <strong>Horario de corte</strong>
        <p>Antes de 18:00 se procesa; despues, fines de semana o feriados queda encolado al siguiente dia habil.</p>
      </article>
      <article>
        <span>RF-02</span>
        <strong>Rechazo temprano</strong>
        <p>Controla totales, cliente activo y duplicidad por archivo/hash antes de tocar el Core.</p>
      </article>
      <article>
        <span>RF-03/RF-04</span>
        <strong>Linea por linea</strong>
        <p>Valida origen, destino y saldo por instruccion; una linea fallida no aborta todo el lote.</p>
      </article>
      <article>
        <span>RF-06/RF-08</span>
        <strong>Cuadre final</strong>
        <p>Calcula comision, IVA y genera el resumen para la empresa emisora.</p>
      </article>
    </div>
  );

  const upload = (
    <CompanyUploadPanel
      result={uploadResult}
      onUpload={handleCompanyUpload}
      matrixAccount={matrixAccount}
      company={company}
    />
  );

  const accountsSection = (
    <CompanyAccountsPanel
      companyAccounts={companyAccounts}
      matrixAccount={matrixAccount}
      payrollAccount={payrollAccount}
      totalAvailable={totalAvailable}
    />
  );

  const report = (
    <CompanyBatchesPanel batches={companyBatches} fee={fees} />
  );

  if (error) {
    return (
      <div className="space-y">
        {hero}
        <div className="alert error"><AlertCircle size={18} /> {error}</div>
        {stats}
      </div>
    );
  }

  if (page === 'csv') {
    return <div className="space-y">{hero}{rfStrip}{upload}</div>;
  }
  if (page === 'lotes') {
    return <div className="space-y">{hero}{report}</div>;
  }
  if (page === 'cuentas') {
    return <div className="space-y">{hero}{accountsSection}</div>;
  }

  return (
    <div className="space-y">
      {hero}
      {stats}
      {rfStrip}
      <div className="page-grid two-col company-dashboard-grid">
        {upload}
        <div className="space-y">
          {accountsSection}
          {report}
        </div>
      </div>
    </div>
  );
}

function CompanyUploadPanel({ result, onUpload, matrixAccount, company }: { result: BatchUploadResult | null; onUpload: (file: File, channel: 'PORTAL' | 'SFTP') => Promise<void>; matrixAccount: Account | null; company: Customer | null }) {
  const [file, setFile] = useState<File | null>(null);
  const [channel, setChannel] = useState<'PORTAL' | 'SFTP'>('PORTAL');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit() {
    if (!file) {
      setError('Selecciona un archivo CSV o TXT antes de enviarlo.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await onUpload(file, channel);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo cargar el archivo.');
    } finally {
      setLoading(false);
    }
  }

  const batch = result?.fileValidation?.paymentBatch;
  const success = Boolean(result?.isSuccess || result?.validationResult === 'SUCCESS');

  return (
    <SectionCard title="Carga de lote" subtitle="Portal Web de Banca Empresas para nomina y proveedores">
      <div className="company-upload-grid">
        <div className="company-dropzone">
          <div className="drop-icon"><CloudUpload size={34} /></div>
          <h3>Archivo estructurado</h3>
          <p>Cabecera, detalle y pie de control con RUC, cuenta matriz, totales y hash de seguridad.</p>
          <label className="file-picker">
            <input type="file" accept=".csv,.txt" onChange={(event) => setFile(event.target.files?.[0] || null)} />
            <span>Seleccionar archivo</span>
            <strong>{file ? file.name : 'Ningun archivo seleccionado'}</strong>
          </label>
          {file && <div className="file-chip"><FileText size={16} /> {file.name} · {(file.size / 1024).toFixed(1)} KB</div>}
        </div>

        <div className="company-upload-side">
          <label className="field">
            <span>Canal de recepcion</span>
            <select value={channel} onChange={(event) => setChannel(event.target.value as 'PORTAL' | 'SFTP')}>
              <option value="PORTAL">Portal Web</option>
              <option value="SFTP">SFTP Seguro</option>
            </select>
          </label>
          <div className="company-control-card">
            <span>Cuenta matriz</span>
            <strong>{matrixAccount ? maskAccountNumber(matrixAccount.accountNumber) : 'No disponible'}</strong>
            <small>{company?.identification || 'RUC no disponible'} · {channel === 'SFTP' ? 'usa cuenta favorita' : 'carga manual'}</small>
          </div>
          <button className="primary-action wide" onClick={submit} disabled={loading}>
            {loading ? <Loader2 className="spin" size={18} /> : <UploadCloud size={18} />}
            {loading ? 'Validando lote...' : 'Validar y enviar al Switch'}
          </button>
          {error && <div className="alert error"><AlertCircle size={18} /> {error}</div>}
        </div>
      </div>

      {result && (
        <div className={success ? 'company-result success' : 'company-result danger'}>
          <div>
            <strong>{success ? 'Lote recibido por el Switch' : 'Lote rechazado por validacion temprana'}</strong>
            <p>{success ? 'Se ejecutaron controles de estructura, totales, cliente activo y duplicidad.' : result.error || 'Revisa cabecera, pie de control, RUC y hash del archivo.'}</p>
          </div>
          <span className={statusClass(result.batchStatus || result.validationResult)}>{result.batchStatus || result.validationResult || 'RESULTADO'}</span>
          {batch && (
            <div className="batch-summary-grid">
              <Info label="Archivo" value={batch.fileName || '-'} />
              <Info label="Servicio" value={serviceLabel(batch.serviceType)} />
              <Info label="Registros" value={String(batch.headerTotalRecords ?? '-')} />
              <Info label="Monto" value={money(Number(batch.headerTotalAmount ?? 0))} />
            </div>
          )}
        </div>
      )}
    </SectionCard>
  );
}

function CompanyAccountsPanel({ companyAccounts, matrixAccount, payrollAccount, totalAvailable }: { companyAccounts: Account[]; matrixAccount: Account | null; payrollAccount: Account | null; totalAvailable: number }) {
  return (
    <SectionCard title="Cuentas empresariales" subtitle="Cuenta matriz de cargo y productos operativos">
      <div className="company-account-summary">
        <div>
          <span>Disponible total</span>
          <strong>{money(totalAvailable)}</strong>
        </div>
        <div>
          <span>Cuenta matriz</span>
          <strong>{matrixAccount ? maskAccountNumber(matrixAccount.accountNumber) : 'No definida'}</strong>
        </div>
        <div>
          <span>Cuenta nomina</span>
          <strong>{payrollAccount ? maskAccountNumber(payrollAccount.accountNumber) : 'No definida'}</strong>
        </div>
      </div>
      <div className="table-wrap">
        <table className="pro-table">
          <thead>
            <tr>
              <th>Cuenta</th>
              <th>Uso</th>
              <th>Sucursal</th>
              <th className="amount">Disponible</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {companyAccounts.map((account) => (
              <tr key={account.id || account.accountNumber}>
                <td><strong>{account.accountNumber}</strong></td>
                <td>{account.accountSubtype?.name || account.accountSubtype?.code || 'Operativa'}</td>
                <td>{account.branch?.name || 'Digital'}</td>
                <td className="amount"><strong>{money(Number(account.availableBalance ?? account.balance ?? 0))}</strong></td>
                <td><span className={statusClass(account.status)}>{account.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}

function CompanyBatchesPanel({ batches, fee }: { batches: any[]; fee: { unitFee: number; subtotal: number; iva: number; total: number } }) {
  return (
    <SectionCard title="Lotes y cuadre" subtitle="Reporte corporativo de cierre y trazabilidad">
      <div className="company-fee-summary">
        <Info label="Tarifa unitaria" value={money(fee.unitFee)} />
        <Info label="Subtotal comision" value={money(fee.subtotal)} />
        <Info label="IVA 15%" value={money(fee.iva)} />
        <Info label="Total servicio" value={money(fee.total)} />
      </div>
      <div className="table-wrap">
        <table className="pro-table">
          <thead>
            <tr>
              <th>Archivo</th>
              <th>Servicio</th>
              <th>Canal</th>
              <th>Registros</th>
              <th className="amount">Monto</th>
              <th>Resultado</th>
              <th>Recibido</th>
            </tr>
          </thead>
          <tbody>
            {batches.map((batch) => (
              <tr key={batch.id || batch.fileName}>
                <td><strong>{batch.fileName || `Lote #${batch.id}`}</strong></td>
                <td>{serviceLabel(batch.serviceType)}</td>
                <td>{batch.channel || '-'}</td>
                <td>{batchRecords(batch)} total · {successfulRecords(batch)} ok · {rejectedRecords(batch)} rech.</td>
                <td className="amount"><strong>{money(batchAmount(batch))}</strong></td>
                <td><span className={statusClass(batch.status)}>{batch.status || '-'}</span></td>
                <td>{batch.receivedAt ? dt(batch.receivedAt) : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}

function SwitchOperationsPage({ page }: { page: PageKey }) {
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'TODOS' | 'PROCESADOS' | 'ENCOLADOS' | 'RECHAZADOS'>('TODOS');
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');

  async function loadSwitchData() {
    setLoading(true);
    try {
      const nextBatches = await switchApi.batches();
      setBatches(nextBatches);
      setSelectedBatchId((current) => current || String(nextBatches[0]?.id || nextBatches[0]?.fileName || ''));
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo consultar el Switch.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadSwitchData(); }, []);

  const processed = batches.filter((batch) => String(batch.status || '').toUpperCase().includes('PROCES'));
  const queued = batches.filter(isQueuedBatch);
  const rejected = batches.filter((batch) => String(batch.status || '').toUpperCase().includes('RECHAZ') || rejectedRecords(batch) > 0);
  const totalProcessedAmount = processed.reduce((sum, batch) => sum + batchAmount(batch), 0);
  const totalRecords = batches.reduce((sum, batch) => sum + batchRecords(batch), 0);
  const totalSuccessful = batches.reduce((sum, batch) => sum + successfulRecords(batch), 0);
  const totalRejected = batches.reduce((sum, batch) => sum + rejectedRecords(batch), 0);
  const fees = feePreview(totalSuccessful || totalRecords);

  const filteredBatches = batches.filter((batch) => {
    const status = String(batch.status || '').toUpperCase();
    const matchesStatus =
      statusFilter === 'TODOS' ||
      (statusFilter === 'PROCESADOS' && status.includes('PROCES')) ||
      (statusFilter === 'ENCOLADOS' && isQueuedBatch(batch)) ||
      (statusFilter === 'RECHAZADOS' && (status.includes('RECHAZ') || rejectedRecords(batch) > 0));
    const query = search.trim().toLowerCase();
    const matchesQuery = !query || [batch.fileName, batch.ruc, batch.sourceAccountNumber, batch.channel, batch.serviceType, batch.status].some((value) => String(value || '').toLowerCase().includes(query));
    return matchesStatus && matchesQuery;
  });
  const selectedBatch = batches.find((batch) => String(batch.id || batch.fileName) === selectedBatchId) || filteredBatches[0] || null;

  function exportSwitchReport() {
    const header = ['id', 'archivo', 'ruc', 'cuenta_origen', 'canal', 'servicio', 'estado', 'registros', 'exitosos', 'rechazados', 'monto', 'recibido'];
    const rows = filteredBatches.map((batch) => [
      batch.id || '',
      batch.fileName || '',
      batch.ruc || '',
      batch.sourceAccountNumber || '',
      batch.channel || '',
      serviceLabel(batch.serviceType),
      batch.status || '',
      batchRecords(batch),
      successfulRecords(batch),
      rejectedRecords(batch),
      batchAmount(batch).toFixed(2),
      batch.receivedAt || '',
    ]);
    const csv = [header, ...rows].map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte_switch_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const hero = (
    <section className="switch-hero">
      <div>
        <p className="eyebrow dark">Operacion Switch · Pagos masivos</p>
        <h2>Consola Operador Switch</h2>
        <p>Monitorea ingesta, rechazo temprano, validacion de lotes, procesamiento linea por linea, cuadre y comisiones operativas.</p>
      </div>
      <div className="switch-hero-rail">
        <span><UploadCloud size={16} /> RF-01 Ingesta</span>
        <span><ShieldCheck size={16} /> RF-02 Validacion</span>
        <span><CircleDollarSign size={16} /> RF-03/RF-04 Pagos</span>
        <span><ReceiptText size={16} /> RF-06/RF-08 Cuadre</span>
      </div>
    </section>
  );

  const stats = (
    <div className="stats-grid company-stats">
      <StatCard label="Lotes recibidos" value={String(batches.length)} detail={`${queued.length} encolados`} icon={FileClock} />
      <StatCard label="Procesados" value={String(processed.length)} detail={`${totalSuccessful} lineas exitosas`} icon={FileCheck2} accent="green" />
      <StatCard label="Rechazados" value={String(rejected.length)} detail={`${totalRejected} lineas rechazadas`} icon={XCircle} />
      <StatCard label="Monto procesado" value={money(totalProcessedAmount)} detail="Debitado y acreditado en Core" icon={Activity} accent="gold" />
    </div>
  );

  const toolbar = (
    <div className="filters-row">
      <div className="filter"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar archivo, RUC, cuenta, canal o estado..." /></div>
      <div className="cash-target-tabs">
        {(['TODOS', 'PROCESADOS', 'ENCOLADOS', 'RECHAZADOS'] as const).map((filter) => (
          <button key={filter} className={statusFilter === filter ? 'active' : ''} onClick={() => setStatusFilter(filter)}>{filter}</button>
        ))}
      </div>
      <button className="secondary-action" onClick={loadSwitchData}><Loader2 size={16} className={loading ? 'spin' : ''} /> Actualizar</button>
      <button className="secondary-action" onClick={exportSwitchReport}><Download size={16} /> Exportar</button>
    </div>
  );

  const detail = selectedBatch && (
    <SectionCard title="Detalle operativo" subtitle="Trazabilidad del lote seleccionado">
      <div className="switch-detail-grid">
        <Info label="Archivo" value={selectedBatch.fileName || `Lote #${selectedBatch.id}`} />
        <Info label="RUC empresa" value={selectedBatch.ruc || '-'} />
        <Info label="Cuenta origen" value={selectedBatch.sourceAccountNumber || '-'} />
        <Info label="Canal" value={selectedBatch.channel || '-'} />
        <Info label="Servicio" value={serviceLabel(selectedBatch.serviceType)} />
        <Info label="Estado" value={selectedBatch.status || '-'} />
        <Info label="Monto" value={money(batchAmount(selectedBatch))} />
        <Info label="Recibido" value={selectedBatch.receivedAt ? dt(selectedBatch.receivedAt) : '-'} />
      </div>
      <div className="validation-checks">
        <div className="check ok"><CheckCircle2 size={16} /> Estructura leida</div>
        <div className={batchAmount(selectedBatch) > 0 && batchRecords(selectedBatch) > 0 ? 'check ok' : 'check fail'}><CheckCircle2 size={16} /> Totales de control</div>
        <div className={String(selectedBatch.status || '').toUpperCase().includes('RECHAZ') ? 'check fail' : 'check ok'}><CheckCircle2 size={16} /> Cliente activo</div>
        <div className={String(selectedBatch.status || '').toUpperCase().includes('DUP') ? 'check fail' : 'check ok'}><CheckCircle2 size={16} /> Duplicidad/hash</div>
      </div>
    </SectionCard>
  );

  const batchesTable = (
    <SectionCard title="Lotes recibidos" subtitle="RF-01: recepcion por Portal Web o SFTP" action={<button className="secondary-action" onClick={exportSwitchReport}><Download size={16} /> Exportar</button>}>
      {toolbar}
      <div className="table-wrap">
        <table className="pro-table">
          <thead><tr><th>ID</th><th>Archivo</th><th>Canal</th><th>RUC</th><th>Cuenta origen</th><th>Registros</th><th className="amount">Monto</th><th>Estado</th><th>Recibido</th></tr></thead>
          <tbody>{filteredBatches.map((batch) => (
            <tr key={batch.id || batch.fileName} onClick={() => setSelectedBatchId(String(batch.id || batch.fileName))} className={selectedBatch && String(batch.id || batch.fileName) === String(selectedBatch.id || selectedBatch.fileName) ? 'selected-row' : ''}>
              <td><strong>#{batch.id || '-'}</strong></td>
              <td>{batch.fileName || '-'}</td>
              <td>{batch.channel || '-'}</td>
              <td>{batch.ruc || '-'}</td>
              <td>{batch.sourceAccountNumber || '-'}</td>
              <td>{batchRecords(batch)} total · {successfulRecords(batch)} ok · {rejectedRecords(batch)} rech.</td>
              <td className="amount"><strong>{money(batchAmount(batch))}</strong></td>
              <td><span className={statusClass(batch.status)}>{batch.status || '-'}</span></td>
              <td>{batch.receivedAt ? dt(batch.receivedAt) : '-'}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </SectionCard>
  );

  const validations = (
    <SectionCard title="Validaciones RF-02" subtitle="Estructura, duplicidad, cliente activo y totales antes de afectar el Core">
      {toolbar}
      <div className="switch-validation-grid">
        {filteredBatches.map((batch) => {
          const failed = String(batch.status || '').toUpperCase().includes('RECHAZ') || rejectedRecords(batch) > 0;
          return (
            <article key={batch.id || batch.fileName} className={`switch-validation-card ${failed ? 'danger' : 'success'}`}>
              <div><strong>{batch.fileName || `Lote #${batch.id}`}</strong><span>{batch.ruc || 'RUC no disponible'} · {serviceLabel(batch.serviceType)}</span></div>
              <span className={statusClass(batch.status)}>{batch.status || 'SIN ESTADO'}</span>
              <div className="validation-checks">
                <div className="check ok"><CheckCircle2 size={16} /> Estructura</div>
                <div className={batchAmount(batch) > 0 ? 'check ok' : 'check fail'}><CheckCircle2 size={16} /> Totales</div>
                <div className={failed ? 'check fail' : 'check ok'}><CheckCircle2 size={16} /> Cliente</div>
                <div className={String(batch.status || '').toUpperCase().includes('DUP') ? 'check fail' : 'check ok'}><CheckCircle2 size={16} /> Hash</div>
              </div>
              <button className="secondary-action" onClick={() => setSelectedBatchId(String(batch.id || batch.fileName))}><Search size={16} /> Ver evidencia</button>
            </article>
          );
        })}
      </div>
    </SectionCard>
  );

  const payments = (
    <SectionCard title="Pagos RF-03/RF-04" subtitle="Procesamiento linea por linea, sin abortar todo el lote por una linea fallida">
      {toolbar}
      <div className="switch-payment-list">
        {filteredBatches.map((batch) => {
          const total = batchRecords(batch);
          const ok = successfulRecords(batch);
          const rejectedLines = rejectedRecords(batch);
          const progress = total ? Math.round((ok / total) * 100) : 0;
          return (
            <article key={batch.id || batch.fileName} className="switch-payment-row">
              <div>
                <strong>{batch.fileName || `Lote #${batch.id}`}</strong>
                <span>{ok} acreditadas · {rejectedLines} rechazadas · {money(batchAmount(batch))}</span>
              </div>
              <div className="switch-progress"><span style={{ width: `${progress}%` }} /></div>
              <button className="secondary-action" onClick={() => setSelectedBatchId(String(batch.id || batch.fileName))}><FileCheck2 size={16} /> Auditar</button>
            </article>
          );
        })}
      </div>
    </SectionCard>
  );

  const commissions = (
    <>
    <SectionCard title="Comisiones RF-06/RF-08" subtitle="Tarifaje, IVA y liquidacion contable del servicio">
      <div className="company-fee-summary">
        <Info label="Lineas cobrables" value={String(totalSuccessful || totalRecords)} />
        <Info label="Tarifa unitaria" value={money(fees.unitFee)} />
        <Info label="Subtotal" value={money(fees.subtotal)} />
        <Info label="IVA 15%" value={money(fees.iva)} />
      </div>
    </SectionCard>
    {batchesTable}
    </>
  );

  if (loading) return <SectionCard title="Switch" subtitle="Consultando lotes"><div className="empty-state"><div className="empty-icon"><Loader2 className="spin" size={34} /></div><h3>Cargando operacion Switch</h3><p>Consultando archivos recibidos, estados y cuadre de pagos masivos.</p></div></SectionCard>;
  if (error) return <div className="space-y">{hero}<div className="alert error"><AlertCircle size={18} /> {error}</div></div>;

  if (page === 'lotes') return <div className="space-y">{hero}{batchesTable}{detail}</div>;
  if (page === 'validaciones') return <div className="space-y">{hero}{validations}{detail}</div>;
  if (page === 'pagos') return <div className="space-y">{hero}{payments}{detail}</div>;
  if (page === 'comisiones') return <div className="space-y">{hero}{commissions}</div>;

  return <div className="space-y">{hero}{stats}<div className="company-rf-strip"><article><span>RF-01</span><strong>Ingesta controlada</strong><p>Recepcion por Portal/SFTP con identificacion de RUC, cuenta origen y archivo.</p></article><article><span>RF-02</span><strong>Validacion temprana</strong><p>Controla estructura, totales, cliente activo y duplicidad antes del Core.</p></article><article><span>RF-03/RF-04</span><strong>Procesamiento</strong><p>Ejecuta debito y creditos linea por linea con trazabilidad por lote.</p></article><article><span>RF-06/RF-08</span><strong>Cuadre</strong><p>Consolida comision, IVA, exitosos, rechazados y reporte final.</p></article></div><div className="page-grid two-col">{batchesTable}{detail}</div></div>;
}

function accountOwner(account: any) {
  return account.customerFullName || account.customer?.legalName || [account.customer?.firstName, account.customer?.lastName].filter(Boolean).join(' ') || '-';
}

function accountType(account: any) {
  return account.accountSubtypeDescription || account.accountSubtype?.name || account.accountSubtype?.code || 'Cuenta bancaria';
}

function accountBranch(account: any) {
  return account.branchName || account.branch?.name || 'Sucursal';
}

function customerTypeLabel(customer?: Customer | null) {
  return customer?.customerType === 'JURIDICO' ? 'Empresa / Persona juridica' : 'Persona natural';
}

function companyFundingAccountNumber(customer: Customer) {
  const idPart = String(customer.id || 0).padStart(4, '0');
  const timePart = String(Date.now()).slice(-6);
  return `005-${idPart}${timePart}`;
}

function StaffOperationsPage({ role, page }: { role: Role; page: PageKey }) {
  const isAdvisor = role === 'ASESOR';
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [accountsData, setAccountsData] = useState<any[]>([]);
  const [transactionsData, setTransactionsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [customerForm, setCustomerForm] = useState({ customerType: 'NATURAL', identificationType: 'CEDULA', identification: '', firstName: '', lastName: '', birthDate: '', legalName: '', constitutionDate: '', email: '', mobilePhone: '', address: '' });
  const [accountForm, setAccountForm] = useState({ accountNumber: '', customerId: '', branchId: '1', accountSubtypeId: '1', initialBalance: '0', isFavorite: false });
  const [cashForm, setCashForm] = useState({ accountNumber: '', amount: '', subtype: 'TRN-GEN' });
  const [cashTarget, setCashTarget] = useState<'TODAS' | 'EMPRESAS' | 'NATURALES'>('TODAS');

  async function loadStaffData() {
    try {
      const [nextCustomers, nextAccounts, nextTransactions] = await Promise.all([coreApi.customers(), coreApi.accounts(), coreApi.transactions()]);
      setCustomers(nextCustomers);
      setAccountsData(nextAccounts as any[]);
      setTransactionsData(nextTransactions as any[]);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo consultar el Core.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadStaffData(); }, []);
  useEffect(() => {
    setCustomerForm((current) => ({ ...current, customerType: page === 'crear-empresa' ? 'JURIDICO' : 'NATURAL', identificationType: page === 'crear-empresa' ? 'RUC' : 'CEDULA' }));
  }, [page]);

  const customerById = new Map(customers.map((customer) => [customer.id, customer]));
  const companies = customers.filter((customer) => customer.customerType === 'JURIDICO');
  const companyAccounts = accountsData.filter((account) => customerById.get(account.customerId)?.customerType === 'JURIDICO');
  const naturalAccounts = accountsData.filter((account) => customerById.get(account.customerId)?.customerType === 'NATURAL');
  const companyIdsWithAccounts = new Set(companyAccounts.map((account) => account.customerId));
  const companiesWithoutAccounts = companies.filter((customer) => !companyIdsWithAccounts.has(customer.id));
  const filteredAccounts = accountsData.filter((account) => {
    const query = search.trim().toLowerCase();
    const owner = customerById.get(account.customerId);
    if (page === 'depositos' && cashTarget === 'EMPRESAS' && owner?.customerType !== 'JURIDICO') return false;
    if (page === 'depositos' && cashTarget === 'NATURALES' && owner?.customerType !== 'NATURAL') return false;
    if (!query) return true;
    return [account.accountNumber, accountOwner(account), customerDisplayName(owner), owner?.identification, customerTypeLabel(owner), accountType(account), accountBranch(account), account.status].some((value) => String(value || '').toLowerCase().includes(query));
  });
  const filteredCustomers = customers.filter((customer) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return [customerDisplayName(customer), customer.identification, customer.email, customer.mobilePhone, customerTypeLabel(customer), customer.status].some((value) => String(value || '').toLowerCase().includes(query));
  });
  const accountsForCustomer = (customerId?: number) => accountsData.filter((account) => account.customerId === customerId);
  const selectedCashAccount = accountsData.find((account) => account.accountNumber === cashForm.accountNumber) || null;
  const selectedCashCustomer = selectedCashAccount ? customerById.get(selectedCashAccount.customerId) : null;
  const lastTransactions = [...transactionsData].slice(0, 8);

  async function saveCustomer() {
    setMessage('');
    setError('');
    try {
      const isCompany = customerForm.customerType === 'JURIDICO';
      await coreApi.createCustomer({
        customerSubtypeId: isCompany ? 2 : 1,
        customerType: customerForm.customerType,
        identificationType: customerForm.identificationType,
        identification: customerForm.identification,
        firstName: isCompany ? undefined : customerForm.firstName,
        lastName: isCompany ? undefined : customerForm.lastName,
        birthDate: isCompany ? undefined : customerForm.birthDate,
        legalName: isCompany ? customerForm.legalName : undefined,
        constitutionDate: isCompany ? customerForm.constitutionDate : undefined,
        email: customerForm.email,
        mobilePhone: customerForm.mobilePhone,
        address: customerForm.address,
        status: 'ACTIVO',
      } as any);
      setMessage(isCompany ? 'Empresa creada correctamente en el Core.' : 'Cliente natural creado correctamente en el Core.');
      setCustomerForm((current) => ({ ...current, identification: '', firstName: '', lastName: '', birthDate: '', legalName: '', constitutionDate: '', email: '', mobilePhone: '', address: '' }));
      await loadStaffData();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo crear el cliente.');
    }
  }

  async function updateCustomerStatus(customer: Customer, status: string) {
    if (!customer.id || customer.status === status) return;
    setMessage('');
    setError('');
    try {
      await coreApi.updateCustomerStatus(customer.id, status);
      setMessage(`Estado de ${customerDisplayName(customer)} actualizado a ${status}.`);
      await loadStaffData();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo actualizar el estado del cliente.');
    }
  }

  async function saveAccount() {
    setMessage('');
    setError('');
    try {
      await coreApi.createAccount({ accountNumber: accountForm.accountNumber, customerId: Number(accountForm.customerId), branchId: Number(accountForm.branchId), accountSubtypeId: Number(accountForm.accountSubtypeId), isFavorite: accountForm.isFavorite, initialBalance: Number(accountForm.initialBalance || 0) });
      setMessage('Cuenta abierta correctamente en el Core.');
      setAccountForm((current) => ({ ...current, accountNumber: '', customerId: '', initialBalance: '0', isFavorite: false }));
      await loadStaffData();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo abrir la cuenta.');
    }
  }

  async function sendCashMovement(type: 'credit' | 'debit') {
    setMessage('');
    setError('');
    try {
      const payload = { cuenta: cashForm.accountNumber, monto: Number(cashForm.amount), uuid: crypto.randomUUID(), subtipo: cashForm.subtype };
      await (type === 'credit' ? coreApi.credit(payload) : coreApi.debit(payload));
      setMessage(type === 'credit' ? 'Deposito procesado y saldo actualizado.' : 'Retiro procesado y saldo actualizado.');
      setCashForm((current) => ({ ...current, amount: '' }));
      await loadStaffData();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo procesar la operacion.');
    }
  }

  async function createCompanyFundingAccount(customer: Customer) {
    if (!customer.id) return;
    setMessage('');
    setError('');
    try {
      const accountNumber = companyFundingAccountNumber(customer);
      await coreApi.createAccount({
        accountNumber,
        customerId: customer.id,
        branchId: 1,
        accountSubtypeId: 2,
        isFavorite: true,
        initialBalance: 0,
      });
      setCashForm((current) => ({ ...current, accountNumber }));
      setCashTarget('EMPRESAS');
      setMessage(`Cuenta empresarial ${accountNumber} creada para ${customerDisplayName(customer)}. Ya puedes registrar el deposito.`);
      await loadStaffData();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo crear la cuenta empresarial para fondeo.');
    }
  }

  if (loading) {
    return <SectionCard title={isAdvisor ? 'Portal Asesor' : 'Portal Cajero'} subtitle="Consultando Core bancario"><div className="empty-state"><div className="empty-icon"><Loader2 className="spin" size={34} /></div><h3>Cargando informacion operativa</h3><p>Estamos leyendo clientes, cuentas y movimientos desde la base del Core.</p></div></SectionCard>;
  }

  const hero = <section className="staff-hero"><div><p className="eyebrow dark">{isAdvisor ? 'Gestion comercial Core' : 'Operacion de caja Core'}</p><h2>{isAdvisor ? 'Portal Asesor' : 'Portal Cajero'}</h2><p>{isAdvisor ? 'Alta de clientes, apertura de productos y consulta de titulares.' : 'Busqueda de cuentas, depositos empresariales, retiros y revision de movimientos en tiempo real.'}</p></div><div className="staff-hero-actions"><span><Users size={16} /> {customers.length} clientes</span><span><Building2 size={16} /> {companyAccounts.length} ctas empresa</span><span><UserRound size={16} /> {naturalAccounts.length} ctas persona</span><span><ReceiptText size={16} /> {transactionsData.length} movimientos</span></div></section>;
  const alerts = <>{message && <div className="alert success"><CheckCircle2 size={18} /> {message}</div>}{error && <div className="alert error"><AlertCircle size={18} /> {error}</div>}</>;
  const stats = <div className="stats-grid staff-stats"><StatCard label="Clientes" value={String(customers.length)} detail="Naturales y juridicos" icon={Users} /><StatCard label="Cuentas" value={String(accountsData.length)} detail="Productos activos del Core" icon={WalletCards} accent="gold" /><StatCard label="Movimientos" value={String(transactionsData.length)} detail="Debitos y creditos registrados" icon={ReceiptText} accent="green" /></div>;
  const advisorSummary = <div className="page-grid two-col"><SectionCard title="Clientes recientes" subtitle="Ultimos titulares creados en el Core"><div className="compact-list">{customers.slice(-5).reverse().map((customer) => <article key={customer.id || customer.identification} className="compact-row"><div><strong>{customerDisplayName(customer)}</strong><span>{customer.identification} - {customerTypeLabel(customer)}</span></div><span className={statusClass(customer.status)}>{customer.status}</span></article>)}</div></SectionCard><SectionCard title="Cuentas recientes" subtitle="Productos abiertos para clientes naturales y empresas"><div className="compact-list">{accountsData.slice(-5).reverse().map((account) => <article key={account.id || account.accountNumber} className="compact-row"><div><strong>{account.accountNumber}</strong><span>{accountOwner(account)} - {accountType(account)}</span></div><strong>{money(Number(account.availableBalance ?? account.balance ?? 0))}</strong></article>)}</div></SectionCard></div>;
  const customerDirectory = <SectionCard title="Clientes registrados" subtitle="Personas naturales, juridicas y empresas creadas"><div className="filters-row"><div className="filter"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nombre, RUC/cedula, correo, telefono o estado..." /></div></div><div className="table-wrap"><table className="pro-table customer-table"><thead><tr><th>Cliente</th><th>Identificacion</th><th>Tipo</th><th>Contacto</th><th>Cuentas</th><th>Estado</th></tr></thead><tbody>{filteredCustomers.map((customer) => { const linkedAccounts = accountsForCustomer(customer.id); return <tr key={customer.id || customer.identification}><td><strong>{customerDisplayName(customer)}</strong><span className="table-subtext">{customer.address || 'Sin direccion'}</span></td><td>{customer.identificationType} {customer.identification}</td><td><span className={customer.customerType === 'JURIDICO' ? 'status warn' : 'status neutral'}>{customerTypeLabel(customer)}</span></td><td>{customer.email || '-'}<span className="table-subtext">{customer.mobilePhone || '-'}</span></td><td><strong>{linkedAccounts.length}</strong><span className="table-subtext">{linkedAccounts.length ? linkedAccounts.map((account) => account.accountNumber).join(', ') : 'Sin cuentas'}</span></td><td><div className="status-control"><span className={statusClass(customer.status)}>{customer.status}</span><select value={customer.status} onChange={(event) => updateCustomerStatus(customer, event.target.value)}>{customerStatuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></div></td></tr>; })}</tbody></table></div></SectionCard>;

  const customerFormView = <SectionCard title={page === 'crear-empresa' ? 'Crear empresa' : 'Crear persona natural'} subtitle="Registro de titular en el Core"><div className="staff-form-grid"><label className="field"><span>Tipo de cliente</span><input value={customerForm.customerType} disabled /></label><label className="field"><span>Tipo de identificacion</span><select value={customerForm.identificationType} onChange={(event) => setCustomerForm({ ...customerForm, identificationType: event.target.value })}><option value="CEDULA">Cedula</option><option value="RUC">RUC</option><option value="PASAPORTE">Pasaporte</option></select></label><label className="field"><span>Identificacion</span><input value={customerForm.identification} onChange={(event) => setCustomerForm({ ...customerForm, identification: event.target.value })} /></label>{customerForm.customerType === 'JURIDICO' ? <><label className="field"><span>Razon social</span><input value={customerForm.legalName} onChange={(event) => setCustomerForm({ ...customerForm, legalName: event.target.value })} /></label><label className="field"><span>Fecha de constitucion</span><input type="date" value={customerForm.constitutionDate} onChange={(event) => setCustomerForm({ ...customerForm, constitutionDate: event.target.value })} /></label></> : <><label className="field"><span>Nombres</span><input value={customerForm.firstName} onChange={(event) => setCustomerForm({ ...customerForm, firstName: event.target.value })} /></label><label className="field"><span>Apellidos</span><input value={customerForm.lastName} onChange={(event) => setCustomerForm({ ...customerForm, lastName: event.target.value })} /></label><label className="field"><span>Fecha de nacimiento</span><input type="date" value={customerForm.birthDate} onChange={(event) => setCustomerForm({ ...customerForm, birthDate: event.target.value })} /></label></>}<label className="field"><span>Correo</span><input type="email" value={customerForm.email} onChange={(event) => setCustomerForm({ ...customerForm, email: event.target.value })} /></label><label className="field"><span>Telefono</span><input value={customerForm.mobilePhone} onChange={(event) => setCustomerForm({ ...customerForm, mobilePhone: event.target.value })} /></label><label className="field staff-form-wide"><span>Direccion</span><input value={customerForm.address} onChange={(event) => setCustomerForm({ ...customerForm, address: event.target.value })} /></label><button className="primary-action staff-form-action" onClick={saveCustomer}><Users size={18} /> Guardar titular</button></div></SectionCard>;

  const accountFormView = <SectionCard title="Abrir cuenta" subtitle="Producto pasivo vinculado a cliente y sucursal"><div className="staff-form-grid"><label className="field"><span>Numero de cuenta</span><input value={accountForm.accountNumber} onChange={(event) => setAccountForm({ ...accountForm, accountNumber: event.target.value })} /></label><label className="field"><span>Cliente</span><select value={accountForm.customerId} onChange={(event) => setAccountForm({ ...accountForm, customerId: event.target.value })}><option value="">Seleccionar cliente</option>{customers.map((customer) => <option key={customer.id} value={customer.id}>#{customer.id} - {customer.legalName || [customer.firstName, customer.lastName].filter(Boolean).join(' ') || customer.identification}</option>)}</select></label><label className="field"><span>Sucursal</span><select value={accountForm.branchId} onChange={(event) => setAccountForm({ ...accountForm, branchId: event.target.value })}><option value="1">Sucursal Quito Centro</option><option value="2">Sucursal Guayaquil Norte</option></select></label><label className="field"><span>Tipo de cuenta</span><select value={accountForm.accountSubtypeId} onChange={(event) => setAccountForm({ ...accountForm, accountSubtypeId: event.target.value })}><option value="1">Ahorros</option><option value="2">Corriente</option></select></label><label className="field"><span>Saldo inicial</span><input type="number" value={accountForm.initialBalance} onChange={(event) => setAccountForm({ ...accountForm, initialBalance: event.target.value })} /></label><label className="staff-check"><input type="checkbox" checked={accountForm.isFavorite} onChange={(event) => setAccountForm({ ...accountForm, isFavorite: event.target.checked })} /><span>Marcar como favorita</span></label><button className="primary-action staff-form-action" onClick={saveAccount}><CreditCard size={18} /> Abrir cuenta</button></div></SectionCard>;

  const accountsTable = <SectionCard title={isAdvisor ? 'Cuentas abiertas' : page === 'depositos' ? 'Cuentas para deposito' : 'Buscar cuenta'} subtitle={isAdvisor ? 'Productos disponibles en el Core' : page === 'depositos' ? 'Selecciona una cuenta natural o empresarial para acreditar fondos' : 'Consulta previa para operaciones de caja'}><div className="filters-row"><div className="filter"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cuenta, titular, RUC/cedula, sucursal o estado..." /></div>{!isAdvisor && page === 'depositos' && <div className="cash-target-tabs"><button className={cashTarget === 'EMPRESAS' ? 'active' : ''} onClick={() => setCashTarget('EMPRESAS')}><Building2 size={15} /> Empresas</button><button className={cashTarget === 'NATURALES' ? 'active' : ''} onClick={() => setCashTarget('NATURALES')}><UserRound size={15} /> Personas</button><button className={cashTarget === 'TODAS' ? 'active' : ''} onClick={() => setCashTarget('TODAS')}>Todas</button></div>}</div><div className="table-wrap"><table className="pro-table"><thead><tr><th>Cuenta</th><th>Titular</th><th>Cliente</th><th>Tipo</th><th>Sucursal</th><th className="amount">Disponible</th><th>Estado</th></tr></thead><tbody>{filteredAccounts.map((account) => { const owner = customerById.get(account.customerId); return <tr key={account.id || account.accountNumber} onClick={() => setCashForm((current) => ({ ...current, accountNumber: account.accountNumber }))}><td><strong>{account.accountNumber}</strong></td><td>{owner ? customerDisplayName(owner) : accountOwner(account)}</td><td><span className={owner?.customerType === 'JURIDICO' ? 'status warn' : 'status neutral'}>{customerTypeLabel(owner)}</span></td><td>{accountType(account)}</td><td>{accountBranch(account)}</td><td className="amount"><strong>{money(Number(account.availableBalance ?? account.balance ?? 0))}</strong></td><td><span className={statusClass(account.status)}>{account.status}</span></td></tr>; })}</tbody></table></div></SectionCard>;

  const companiesWithoutAccountPanel = page === 'depositos' && companiesWithoutAccounts.length > 0
    ? <SectionCard title="Empresas sin cuenta de fondeo" subtitle="Crea una cuenta corriente para poder recibir depositos y procesar lotes"><div className="company-funding-list">{companiesWithoutAccounts.map((company) => <article key={company.id || company.identification} className="company-funding-row"><div><strong>{customerDisplayName(company)}</strong><span>{company.identification} - {company.email || 'Sin correo registrado'}</span></div><button className="secondary-action" onClick={() => createCompanyFundingAccount(company)}><CreditCard size={16} /> Crear cuenta</button></article>)}</div></SectionCard>
    : null;

  const cashOperation = <SectionCard title={page === 'retiros' ? 'Retiro por ventanilla' : 'Deposito por ventanilla'} subtitle={page === 'depositos' ? 'Acredita fondos a personas naturales o empresas para fondeo de lotes' : 'Movimiento atomico contra el Core Bancario'}>{page === 'depositos' && <div className="cash-funding-banner"><Building2 size={18} /><div><strong>Fondeo empresarial para pagos masivos</strong><span>Busca la empresa por RUC o razon social, selecciona su cuenta matriz/corriente y acredita saldo antes de procesar lotes.</span></div></div>}<div className="cash-grid"><div className="staff-form-grid"><label className="field staff-form-wide"><span>Cuenta destino</span><input value={cashForm.accountNumber} onChange={(event) => setCashForm({ ...cashForm, accountNumber: event.target.value })} /></label><label className="field"><span>Monto</span><input type="number" value={cashForm.amount} onChange={(event) => setCashForm({ ...cashForm, amount: event.target.value })} /></label><label className="field"><span>Operacion</span><input value={page === 'depositos' ? selectedCashCustomer?.customerType === 'JURIDICO' ? 'Deposito empresarial' : 'Deposito por ventanilla' : 'Retiro por ventanilla'} disabled /></label><button className={`primary-action staff-form-action ${page === 'retiros' ? 'danger-action' : 'success-action'}`} onClick={() => sendCashMovement(page === 'retiros' ? 'debit' : 'credit')}>{page === 'retiros' ? <Banknote size={18} /> : <CircleDollarSign size={18} />}{page === 'retiros' ? 'Procesar retiro' : selectedCashCustomer?.customerType === 'JURIDICO' ? 'Fondear empresa' : 'Procesar deposito'}</button></div><div className={`cash-preview ${selectedCashCustomer?.customerType === 'JURIDICO' ? 'company-cash-preview' : ''}`}><span>{selectedCashCustomer?.customerType === 'JURIDICO' ? 'Cuenta empresarial seleccionada' : 'Cuenta seleccionada'}</span><strong>{selectedCashAccount ? selectedCashAccount.accountNumber : cashForm.accountNumber || 'Sin cuenta'}</strong><p>{selectedCashAccount ? `${selectedCashCustomer ? customerDisplayName(selectedCashCustomer) : accountOwner(selectedCashAccount)} - ${customerTypeLabel(selectedCashCustomer)} - Disponible ${money(Number(selectedCashAccount.availableBalance ?? 0))}` : 'Selecciona una cuenta desde la tabla o escribe el numero manualmente.'}</p>{selectedCashCustomer?.customerType === 'JURIDICO' && <div className="cash-preview-note"><ReceiptText size={16} /> Saldo disponible para debitos de lotes, nomina y proveedores.</div>}</div></div></SectionCard>;

  const movements = <SectionCard title="Movimientos recientes" subtitle="Debitos y creditos registrados por el Core"><div className="personal-movement-list">{lastTransactions.map((movement) => { const debit = isDebitMovement(movement.movementType); return <article key={movement.id || movement.transactionUuid} className="personal-movement-row"><div className={`personal-movement-icon ${debit ? 'debit' : 'credit'}`}>{debit ? <Banknote size={18} /> : <CircleDollarSign size={18} />}</div><div className="personal-movement-copy"><strong>{movement.accountNumber || movement.account?.accountNumber || 'Cuenta'}</strong><span>{movement.message || movement.status || 'Movimiento'} - {dt(movement.transactionDate)}</span></div><div className="personal-movement-amount"><strong className={debit ? 'amount-negative' : 'amount-positive'}>{debit ? '-' : '+'}{money(Number(movement.amount ?? 0)).replace('$', '').trim()}</strong><span>Saldo {money(Number(movement.resultingBalance ?? 0))}</span></div></article>; })}</div></SectionCard>;
  const cashierSummary = <div className="page-grid two-col"><SectionCard title="Operaciones de caja" subtitle="Resumen para atencion en ventanilla"><div className="compact-list"><article className="compact-row"><div><strong>Depositos disponibles</strong><span>Personas naturales y empresas con cuenta activa</span></div><CircleDollarSign size={22} /></article><article className="compact-row"><div><strong>Retiros habilitados</strong><span>Debito directo sobre cuentas activas del Core</span></div><Banknote size={22} /></article><article className="compact-row"><div><strong>Consulta de cuentas</strong><span>Busqueda por titular, numero, RUC o cedula</span></div><Search size={22} /></article></div></SectionCard>{movements}</div>;

  if (isAdvisor) {
    if (page === 'crear-natural' || page === 'crear-empresa') return <div className="space-y">{hero}{alerts}{customerFormView}</div>;
    if (page === 'abrir-cuenta') return <div className="space-y">{hero}{alerts}<div className="page-grid two-col">{accountFormView}{accountsTable}</div></div>;
    if (page === 'clientes') return <div className="space-y">{hero}{alerts}{customerDirectory}</div>;
    return <div className="space-y">{hero}{alerts}{stats}{advisorSummary}</div>;
  }

  if (page === 'depositos' || page === 'retiros') return <div className="space-y">{hero}{alerts}{companiesWithoutAccountPanel}<div className="page-grid two-col">{cashOperation}{accountsTable}</div></div>;
  if (page === 'buscar-cuenta') return <div className="space-y">{hero}{alerts}{accountsTable}</div>;
  if (page === 'movimientos') return <div className="space-y">{hero}{alerts}{movements}</div>;
  return <div className="space-y">{hero}{alerts}{stats}{cashierSummary}</div>;
}

function PersonalBankingPage({ page, session }: { page: PageKey; session: Session }) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [accountsData, setAccountsData] = useState<Account[]>([]);
  const [transactionsData, setTransactionsData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [nextCustomers, nextAccounts, nextTransactions] = await Promise.all([
          coreApi.customers(),
          coreApi.accounts(),
          coreApi.transactions(),
        ]);
        if (!active) return;
        setCustomers(nextCustomers);
        setAccountsData(nextAccounts);
        setTransactionsData(nextTransactions);
      } catch (e) {
        if (!active) return;
        setError(e instanceof Error ? e.message : 'No se pudo cargar la informaciÃ³n del cliente.');
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const activeCustomer =
    customers.find((customer) => customer.id === session.customerId && customer.customerType === 'NATURAL') ||
    null;

  const personalAccounts = activeCustomer?.id
    ? accountsData.filter((account) => account.customerId === activeCustomer.id)
    : [];

  const accountNumbers = new Set(personalAccounts.map((account) => account.accountNumber));
  const hasLinkedTransactions = transactionsData.some((transaction: any) => transaction.accountNumber || transaction.account?.accountNumber || transaction.account?.customerId);
  const linkedTransactions = transactionsData.filter((transaction) => {
    if (transaction.account?.customerId && activeCustomer?.id) return transaction.account.customerId === activeCustomer.id;
    if (transaction.account?.accountNumber) return accountNumbers.has(transaction.account.accountNumber);
    if ((transaction as any).accountNumber) return accountNumbers.has((transaction as any).accountNumber);
    return false;
  });
  const personalTransactions = hasLinkedTransactions ? linkedTransactions : [];
  const orderedTransactions = [...personalTransactions].sort((a, b) => {
    const left = a.transactionDate ? new Date(a.transactionDate).getTime() : 0;
    const right = b.transactionDate ? new Date(b.transactionDate).getTime() : 0;
    return right - left;
  });

  const displayName = activeCustomer ? customerName(activeCustomer) : session.displayName;
  const primaryAccount = personalAccounts[0];
  const totalAvailable = personalAccounts.reduce((sum, account) => sum + Number(account.availableBalance ?? account.balance ?? 0), 0);
  const averageBalance = personalAccounts.length ? totalAvailable / personalAccounts.length : 0;
  const latestMovement = orderedTransactions[0];

  if (loading) {
    return (
      <SectionCard title="Banca personal" subtitle="Cargando informaciÃ³n del titular">
        <div className="empty-state">
          <div className="empty-icon"><Loader2 className="spin" size={34} /></div>
          <h3>Estamos preparando tu resumen</h3>
          <p>Consultando cuentas y movimientos del Core bancario.</p>
        </div>
      </SectionCard>
    );
  }

  if (error) {
    return (
      <SectionCard title="Banca personal" subtitle="No fue posible consultar el Core">
        <div className="alert error"><AlertCircle size={18} /> {error}</div>
      </SectionCard>
    );
  }

  const hero = (
    <section className="personal-hero">
      <div className="personal-hero-main">
        <div className="personal-avatar">{initials(displayName)}</div>
        <div>
          <p className="eyebrow dark">Banca personal BanQuito</p>
          <h2>{displayName}</h2>
          <p>Consulta tus productos de depÃ³sito, revisa tus saldos disponibles y sigue tu historial reciente en un solo lugar.</p>
        </div>
      </div>
      <div className="personal-hero-side">
        <span className={statusClass(primaryAccount?.status || activeCustomer?.status)}>{primaryAccount?.status || activeCustomer?.status || 'ACTIVO'}</span>
        <strong>{money(totalAvailable)}</strong>
        <small>Disponible total en tus cuentas activas</small>
      </div>
    </section>
  );

  const stats = (
    <div className="stats-grid personal-stats">
      <StatCard label="Cuentas activas" value={String(personalAccounts.length)} detail="Productos propios del titular" icon={WalletCards} />
      <StatCard label="Saldo disponible" value={money(totalAvailable)} detail={primaryAccount ? `Cuenta principal ${maskAccountNumber(primaryAccount.accountNumber)}` : 'Sin cuenta principal identificada'} icon={Landmark} accent="gold" />
      <StatCard label="Ultimo movimiento" value={latestMovement ? money(latestMovement.amount as number) : '$0,00'} detail={latestMovement ? `${isDebitMovement(latestMovement.movementType) ? 'Debito' : 'Credito'} · ${dt(latestMovement.transactionDate)}` : 'Sin movimientos recientes'} icon={ReceiptText} accent="green" />
    </div>
  );

  const profileCard = (
    <SectionCard title="Titular" subtitle="Datos visibles para persona natural">
      <div className="personal-profile-grid">
        <div className="info-item">
          <span>IdentificaciÃ³n</span>
          <strong>{activeCustomer?.identification || '-'}</strong>
        </div>
        <div className="info-item">
          <span>Correo</span>
          <strong>{activeCustomer?.email || '-'}</strong>
        </div>
        <div className="info-item">
          <span>Celular</span>
          <strong>{activeCustomer?.mobilePhone || '-'}</strong>
        </div>
        <div className="info-item">
          <span>DirecciÃ³n</span>
          <strong>{activeCustomer?.address || '-'}</strong>
        </div>
      </div>
    </SectionCard>
  );

  const accountsSection = (
    <SectionCard title="Mis cuentas" subtitle="Productos de depÃ³sito asociados a tu perfil">
      {personalAccounts.length ? (
        <div className="personal-account-grid">
          {personalAccounts.map((account) => (
            <article key={account.id || account.accountNumber} className="personal-account-card">
              <div className="personal-account-top">
                <div>
                  <span>{account.accountSubtype?.name || account.accountSubtype?.code || 'Cuenta bancaria'}</span>
                  <strong>{maskAccountNumber(account.accountNumber)}</strong>
                </div>
                <span className={statusClass(account.status)}>{account.status}</span>
              </div>
              <div className="personal-account-balance">
                <p>Disponible</p>
                <strong>{money(Number(account.availableBalance ?? account.balance ?? 0))}</strong>
              </div>
              <div className="personal-account-meta">
                <div>
                  <span>Sucursal</span>
                  <strong>{account.branch?.name || 'Canal digital'}</strong>
                </div>
                <div>
                  <span>Saldo contable</span>
                  <strong>{money(Number(account.accountingBalance ?? account.balance ?? 0))}</strong>
                </div>
                <div>
                  <span>Apertura</span>
                  <strong>{dt(account.creationDate)}</strong>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state compact-empty">
          <div className="empty-icon"><WalletCards size={34} /></div>
          <h3>No hay cuentas para mostrar</h3>
          <p>El Core no devolviÃ³ productos asociados al titular natural.</p>
        </div>
      )}
    </SectionCard>
  );

  const movementsSection = (
    <SectionCard title="Movimientos recientes" subtitle="Historial visible del titular natural">
      {orderedTransactions.length ? (
        <div className="personal-movement-list">
          {orderedTransactions.map((movement) => {
            const debit = isDebitMovement(movement.movementType);
            return (
              <article key={movement.id || movement.transactionUuid} className="personal-movement-row">
                <div className={`personal-movement-icon ${debit ? 'debit' : 'credit'}`}>
                  {debit ? <CircleDollarSign size={18} /> : <Sparkles size={18} />}
                </div>
                <div className="personal-movement-copy">
                  <strong>{movement.description || (debit ? 'Salida de dinero' : 'Entrada de dinero')}</strong>
                  <span>{movement.movementType} · {dt(movement.transactionDate)}</span>
                </div>
                <div className="personal-movement-amount">
                  <strong className={debit ? 'amount-negative' : 'amount-positive'}>
                    {debit ? '-' : '+'}{money(movement.amount as number).replace('$', '').trim()}
                  </strong>
                  <span>Saldo {money(Number(movement.resultingBalance ?? 0))}</span>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="empty-state compact-empty">
          <div className="empty-icon"><CalendarClock size={34} /></div>
          <h3>Aun no existen movimientos</h3>
          <p>Cuando el Core registre actividad en tus cuentas, la verÃ¡s aquÃ­.</p>
        </div>
      )}
    </SectionCard>
  );

  if (page === 'cuentas') {
    return (
      <div className="space-y">
        {hero}
        <div className="page-grid two-col personal-page-grid">
          {accountsSection}
          {profileCard}
        </div>
      </div>
    );
  }

  if (page === 'movimientos') {
    return (
      <div className="space-y">
        {hero}
        <div className="personal-highlight-strip">
          <div><span>Promedio disponible</span><strong>{money(averageBalance)}</strong></div>
          <div><span>Movimientos listados</span><strong>{String(orderedTransactions.length)}</strong></div>
          <div><span>Cuenta principal</span><strong>{primaryAccount ? maskAccountNumber(primaryAccount.accountNumber) : 'No disponible'}</strong></div>
        </div>
        {movementsSection}
      </div>
    );
  }

  return (
    <div className="space-y">
      {hero}
      {stats}
      <div className="page-grid two-col personal-page-grid">
        {accountsSection}
        {movementsSection}
      </div>
    </div>
  );
}

function PlaceholderPage({ title, subtitle, icon: Icon }: { title: string; subtitle: string; icon: React.ElementType }) {
  return (
    <SectionCard title={title} subtitle={subtitle}>
      <div className="empty-state">
        <div className="empty-icon"><Icon size={36} /></div>
        <h3>Módulo preparado visualmente</h3>
        <p>Esta vista queda lista para conectar el endpoint real cuando el backend exponga el servicio correspondiente.</p>
      </div>
    </SectionCard>
  );
}

function Content({ session, page }: { session: Session; page: PageKey }) {
  const role = session.role as Role;
  if (role === 'EMPRESA') return <CompanyBankingPage page={page} session={session} />;
  if (role === 'CLIENTE_NATURAL') return <PersonalBankingPage page={page} session={session} />;
  if (role === 'ASESOR' || role === 'CAJERO') return <StaffOperationsPage role={role} page={page} />;
  if (role === 'SWITCH') return <SwitchOperationsPage page={page} />;
  if (page === 'csv') return <UploadCsvPage />;
  if (page === 'lotes') return <BatchesPage />;
  if (page === 'cuentas') return <AccountsPanel />;
  if (page === 'clientes') return <PlaceholderPage title="Clientes" subtitle="Consulta y administración de titulares" icon={Users} />;
  if (page === 'movimientos') return <PlaceholderPage title="Movimientos" subtitle="Historial financiero por cuenta" icon={ReceiptText} />;
  if (page === 'transferencias') return <PlaceholderPage title="Transferencias" subtitle="Operaciones unitarias del Core" icon={CircleDollarSign} />;
  if (page === 'crear-natural') return <PlaceholderPage title="Crear persona natural" subtitle="Registro de clientes individuales" icon={UserRound} />;
  if (page === 'crear-empresa') return <PlaceholderPage title="Crear empresa" subtitle="Registro de persona jurídica y representante legal" icon={Building2} />;
  if (page === 'abrir-cuenta') return <PlaceholderPage title="Apertura de cuentas" subtitle="Productos pasivos por sucursal" icon={CreditCard} />;
  if (page === 'buscar-cuenta') return <PlaceholderPage title="Buscar cuenta" subtitle="Consulta operativa en ventanilla" icon={Search} />;
  if (page === 'depositos') return <PlaceholderPage title="Depósitos" subtitle="Créditos por ventanilla" icon={CircleDollarSign} />;
  if (page === 'retiros') return <PlaceholderPage title="Retiros" subtitle="Débitos por ventanilla" icon={CreditCard} />;
  if (page === 'validaciones') return <PlaceholderPage title="Validaciones" subtitle="RF-02: estructura, duplicidad, cliente y totales" icon={ShieldCheck} />;
  if (page === 'pagos') return <PlaceholderPage title="Pagos" subtitle="Procesamiento línea por línea" icon={FileCheck2} />;
  if (page === 'comisiones') return <PlaceholderPage title="Comisiones" subtitle="Tarifaje, IVA y liquidación contable" icon={ReceiptText} />;
  return <DashboardPage role={role} />;
}

function AppShell({ session, onLogout }: { session: Session; onLogout: () => void }) {
  const role = session.role as Role;
  const [page, setPage] = useState<PageKey>('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebar = <Sidebar role={role} page={page} setPage={(p) => { setPage(p); setMobileOpen(false); }} onLogout={onLogout} />;

  return (
    <div className="app-shell">
      {sidebar}
      <div className="mobile-top">
        <button className="icon-button" onClick={() => setMobileOpen(true)}><Menu size={21} /></button>
        <strong>Banco BanQuito</strong>
      </div>
      {mobileOpen && <div className="mobile-drawer"><button className="drawer-close" onClick={() => setMobileOpen(false)}><X size={18} /></button>{sidebar}</div>}
      <main className="main-area">
        <Topbar session={session} page={page} />
        <div className="content-area">
          <Content session={session} page={page} />
        </div>
      </main>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState<Session | null>(() => savedSession());
  const handleLogin = (nextSession: Session) => {
    localStorage.setItem('banquito-role', nextSession.role);
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextSession));
    setSession(nextSession);
  };
  const handleLogout = () => {
    localStorage.removeItem('banquito-role');
    localStorage.removeItem(SESSION_STORAGE_KEY);
    setSession(null);
  };

  return session ? <AppShell session={session} onLogout={handleLogout} /> : <Login onLogin={handleLogin} />;
}
