import { useState, useEffect } from 'react';
import { Field, inputClass, PageShell, Panel, primaryButtonClass, ResultBox } from '../components/PageShell';
import {
  getCustomerByIdentification,
  createCustomer as createCustomerApi,
  createAccount as createAccountApi,
  getBranches,
  getAccountSubtypes,
} from '../services/apiClient';

const emptyCustomer = {
  identificationType: 'CEDULA',
  identification: '',
  customerType: 'NATURAL',
  firstName: '',
  lastName: '',
  birthDate: '',
  legalName: '',
  constitutionDate: '',
  email: '',
  mobilePhone: '',
  address: '',
  customerSubtypeId: '',
};

const emptyAccount = {
  customerId: '',
  accountSubtypeId: '',
  branchId: '',
  accountNumber: '',
  isFavorite: false,
};

function SuccessMessage({ message }) {
  return (
    <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4">
      <p className="text-sm font-semibold text-green-700">✓ {message}</p>
    </div>
  );
}

function ErrorMessage({ message }) {
  return (
    <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
      <p className="text-sm font-semibold text-red-700">✗ {message}</p>
    </div>
  );
}

export function CustomerOnboardingPage() {
  const [lookup, setLookup] = useState({ type: 'CEDULA', number: '' });
  const [customer, setCustomer] = useState(emptyCustomer);
  const [account, setAccount] = useState(emptyAccount);

  const [branches, setBranches] = useState([]);
  const [accountSubtypes, setAccountSubtypes] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(true);

  const [lookupResult, setLookupResult] = useState(null);
  const [lookupError, setLookupError] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);

  const [createCustomerResult, setCreateCustomerResult] = useState(null);
  const [createCustomerError, setCreateCustomerError] = useState('');
  const [createCustomerLoading, setCreateCustomerLoading] = useState(false);

  const [createAccountResult, setCreateAccountResult] = useState(null);
  const [createAccountError, setCreateAccountError] = useState('');
  const [createAccountLoading, setCreateAccountLoading] = useState(false);

  const [branchesResult, setBranchesResult] = useState(null);
  const [branchesError, setBranchesError] = useState('');
  const [branchesLoading, setBranchesLoading] = useState(false);

  useEffect(() => {
    const loadCatalogs = async () => {
      setCatalogLoading(true);
      try {
        const [branchesData, subtypesData] = await Promise.all([
          getBranches(),
          getAccountSubtypes(),
        ]);
        setBranches(branchesData);
        setAccountSubtypes(subtypesData);
      } catch (err) {
        console.error('Error cargando catálogos:', err);
      } finally {
        setCatalogLoading(false);
      }
    };

    loadCatalogs();
  }, []);

  const handleLookup = async () => {
    setLookupLoading(true);
    setLookupError('');
    setLookupResult(null);
    try {
      const result = await getCustomerByIdentification(lookup.type, lookup.number);
      setLookupResult(result);
      setCustomer(emptyCustomer);
    } catch (err) {
      setLookupError(err.message);
    } finally {
      setLookupLoading(false);
    }
  };

  const handleCreateCustomer = async () => {
    setCreateCustomerLoading(true);
    setCreateCustomerError('');
    setCreateCustomerResult(null);
    try {
      const result = await createCustomerApi({
        ...customer,
        customerSubtypeId: customer.customerSubtypeId ? Number(customer.customerSubtypeId) : null,
      });
      setCreateCustomerResult(result);
      setCustomer(emptyCustomer);
    } catch (err) {
      setCreateCustomerError(err.message);
    } finally {
      setCreateCustomerLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    setCreateAccountLoading(true);
    setCreateAccountError('');
    setCreateAccountResult(null);
    try {
      const result = await createAccountApi({
        ...account,
        customerId: Number(account.customerId),
        accountSubtypeId: Number(account.accountSubtypeId),
        branchId: Number(account.branchId),
      });
      setCreateAccountResult(result);
      setAccount(emptyAccount);
    } catch (err) {
      setCreateAccountError(err.message);
    } finally {
      setCreateAccountLoading(false);
    }
  };

  const handleShowBranches = async () => {
    setBranchesLoading(true);
    setBranchesError('');
    setBranchesResult(null);
    try {
      const result = await getBranches();
      setBranchesResult(result);
    } catch (err) {
      setBranchesError(err.message);
    } finally {
      setBranchesLoading(false);
    }
  };

  const isFormValid = (form, required) => {
    return required.every(field => form[field]);
  };

  return (
    <PageShell
      title="Clientes y cuentas"
      description="El operador gestiona altas y consultas, sin acceso a transacciones de caja ni módulos del Switch."
    >
      <div className="grid gap-6 xl:grid-cols-2">
        {/* CONSULTAR CLIENTE */}
        <Panel title="Consultar cliente">
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Tipo">
              <select
                className={inputClass}
                value={lookup.type}
                onChange={(e) => setLookup({ ...lookup, type: e.target.value })}
              >
                <option value="CEDULA">CEDULA</option>
                <option value="RUC">RUC</option>
                <option value="PASAPORTE">PASAPORTE</option>
              </select>
            </Field>
            <Field label="Número">
              <input
                className={inputClass}
                value={lookup.number}
                onChange={(e) => setLookup({ ...lookup, number: e.target.value })}
                placeholder="Ej: 0912345678"
              />
            </Field>
            <div className="flex items-end">
              <button
                className={primaryButtonClass}
                disabled={lookupLoading || !lookup.number}
                onClick={handleLookup}
              >
                Buscar
              </button>
            </div>
          </div>
          {lookupResult && <SuccessMessage message="Cliente encontrado" />}
          {lookupError && <ErrorMessage message={lookupError} />}
          {lookupResult && (
            <ResultBox result={lookupResult} error="" />
          )}
        </Panel>

        {/* CREAR CLIENTE */}
        <Panel title="Crear cliente">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Tipo de cliente">
              <select
                className={inputClass}
                value={customer.customerType}
                onChange={(e) => setCustomer({ ...customer, customerType: e.target.value })}
              >
                <option value="NATURAL">Persona natural</option>
                <option value="JURIDICO">Persona jurídica</option>
              </select>
            </Field>
            <Field label="Tipo de identificación">
              <select
                className={inputClass}
                value={customer.identificationType}
                onChange={(e) => setCustomer({ ...customer, identificationType: e.target.value })}
              >
                <option value="CEDULA">Cédula</option>
                <option value="RUC">RUC</option>
                <option value="PASAPORTE">Pasaporte</option>
              </select>
            </Field>
            <Field label="Identificación">
              <input
                className={inputClass}
                value={customer.identification}
                onChange={(e) => setCustomer({ ...customer, identification: e.target.value })}
                placeholder="Ej: 0912345678"
              />
            </Field>

            {customer.customerType === 'NATURAL' ? (
              <>
                <Field label="Nombres">
                  <input
                    className={inputClass}
                    value={customer.firstName}
                    onChange={(e) => setCustomer({ ...customer, firstName: e.target.value })}
                  />
                </Field>
                <Field label="Apellidos">
                  <input
                    className={inputClass}
                    value={customer.lastName}
                    onChange={(e) => setCustomer({ ...customer, lastName: e.target.value })}
                  />
                </Field>
                <Field label="Fecha de nacimiento">
                  <input
                    className={inputClass}
                    type="date"
                    value={customer.birthDate}
                    onChange={(e) => setCustomer({ ...customer, birthDate: e.target.value })}
                  />
                </Field>
              </>
            ) : (
              <>
                <Field label="Razón social">
                  <input
                    className={inputClass}
                    value={customer.legalName}
                    onChange={(e) => setCustomer({ ...customer, legalName: e.target.value })}
                  />
                </Field>
                <Field label="Fecha de constitución">
                  <input
                    className={inputClass}
                    type="date"
                    value={customer.constitutionDate}
                    onChange={(e) => setCustomer({ ...customer, constitutionDate: e.target.value })}
                  />
                </Field>
              </>
            )}

            <Field label="Correo">
              <input
                className={inputClass}
                type="email"
                value={customer.email}
                onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
              />
            </Field>
            <Field label="Teléfono">
              <input
                className={inputClass}
                value={customer.mobilePhone}
                onChange={(e) => setCustomer({ ...customer, mobilePhone: e.target.value })}
              />
            </Field>
            <Field label="Subtipo de cliente (opcional)">
              <input
                className={inputClass}
                type="number"
                value={customer.customerSubtypeId}
                onChange={(e) => setCustomer({ ...customer, customerSubtypeId: e.target.value })}
                placeholder="ID del subtipo"
              />
            </Field>
            <Field label="Dirección">
              <input
                className={inputClass}
                value={customer.address}
                onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
              />
            </Field>
          </div>
          <button
            className={`${primaryButtonClass} mt-5`}
            disabled={createCustomerLoading}
            onClick={handleCreateCustomer}
          >
            Crear cliente
          </button>
          {createCustomerResult && <SuccessMessage message="Cliente creado exitosamente" />}
          {createCustomerError && <ErrorMessage message={createCustomerError} />}
        </Panel>

        {/* ABRIR CUENTA */}
        <Panel title="Abrir cuenta">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Cliente (ID)">
              <input
                className={inputClass}
                type="number"
                value={account.customerId}
                onChange={(e) => setAccount({ ...account, customerId: e.target.value })}
                placeholder="ID del cliente"
              />
            </Field>
            <Field label="Sucursal">
              <select
                className={inputClass}
                value={account.branchId}
                onChange={(e) => setAccount({ ...account, branchId: e.target.value })}
                disabled={catalogLoading}
              >
                <option value="">-- Seleccionar --</option>
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Tipo de cuenta">
              <select
                className={inputClass}
                value={account.accountSubtypeId}
                onChange={(e) => setAccount({ ...account, accountSubtypeId: e.target.value })}
                disabled={catalogLoading}
              >
                <option value="">-- Seleccionar --</option>
                {accountSubtypes.map(st => (
                  <option key={st.id} value={st.id}>{st.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Número de cuenta (opcional)">
              <input
                className={inputClass}
                value={account.accountNumber}
                onChange={(e) => setAccount({ ...account, accountNumber: e.target.value })}
                placeholder="Auto-generado si se deja en blanco"
              />
            </Field>
          </div>
          <label className="mt-4 flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={account.isFavorite}
              onChange={(e) => setAccount({ ...account, isFavorite: e.target.checked })}
            />
            Marcar como favorita para SFTP
          </label>
          <button
            className={`${primaryButtonClass} mt-5`}
            disabled={createAccountLoading || !account.customerId || !account.branchId || !account.accountSubtypeId}
            onClick={handleCreateAccount}
          >
            Abrir cuenta
          </button>
          {createAccountResult && <SuccessMessage message="Cuenta abierta exitosamente" />}
          {createAccountError && <ErrorMessage message={createAccountError} />}
        </Panel>

        {/* CONSULTAR SUCURSALES */}
        <Panel title="Catálogo de sucursales">
          <p className="mb-4 text-sm text-slate-600">Datos operativos para apertura de cuentas.</p>
          <button
            className={primaryButtonClass}
            disabled={branchesLoading}
            onClick={handleShowBranches}
          >
            {branchesLoading ? 'Cargando...' : 'Ver sucursales'}
          </button>
          {branchesResult && <SuccessMessage message="Sucursales cargadas" />}
          {branchesError && <ErrorMessage message={branchesError} />}
          {branchesResult && (
            <ResultBox result={branchesResult} error="" />
          )}
        </Panel>
      </div>
    </PageShell>
  );
}
