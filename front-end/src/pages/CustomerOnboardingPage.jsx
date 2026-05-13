import { useState } from 'react';
import { Field, inputClass, PageShell, Panel, primaryButtonClass, ResultBox } from '../components/PageShell';
import { coreRequest } from '../services/apiClient';
import { useAuth } from '../hooks/useAuth';

const emptyCustomer = {
  identificationType: 'CEDULA',
  identification: '',
  customerType: 'NATURAL',
  firstName: '',
  lastName: '',
  legalName: '',
  email: '',
  mobilePhone: '',
  address: '',
  customerSubtypeId: '',
  legalRepresentativeId: '',
};

const emptyAccount = {
  customerId: '',
  accountSubtypeId: '',
  branchId: '',
  accountNumber: '',
  isFavorite: false,
};

export function CustomerOnboardingPage() {
  const { user } = useAuth();
  const [lookup, setLookup] = useState({ type: 'CEDULA', number: '' });
  const [customer, setCustomer] = useState(emptyCustomer);
  const [account, setAccount] = useState(emptyAccount);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (callback) => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      setResult(await callback());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createCustomer = () => coreRequest('/core/v1/customers', {
    method: 'POST',
    body: JSON.stringify({
      ...customer,
      customerSubtypeId: customer.customerSubtypeId ? Number(customer.customerSubtypeId) : null,
      legalRepresentativeId: customer.legalRepresentativeId ? Number(customer.legalRepresentativeId) : null,
    }),
  });

  const createAccount = () => coreRequest('/core/v1/accounts', {
    method: 'POST',
    coreUserId: user.coreUserId,
    body: JSON.stringify({
      ...account,
      customerId: Number(account.customerId),
      accountSubtypeId: Number(account.accountSubtypeId),
      branchId: Number(account.branchId),
    }),
  });

  return (
    <PageShell
      title="Clientes y cuentas"
      description="El operador gestiona altas y consultas, sin acceso a transacciones de caja ni módulos del Switch."
    >
      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Consultar cliente">
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Tipo">
              <select className={inputClass} value={lookup.type} onChange={(event) => setLookup({ ...lookup, type: event.target.value })}>
                <option value="CEDULA">CEDULA</option>
                <option value="RUC">RUC</option>
                <option value="PASAPORTE">PASAPORTE</option>
              </select>
            </Field>
            <Field label="Número">
              <input className={inputClass} value={lookup.number} onChange={(event) => setLookup({ ...lookup, number: event.target.value })} />
            </Field>
            <div className="flex items-end">
              <button className={primaryButtonClass} disabled={loading || !lookup.number} onClick={() => submit(() => coreRequest(`/core/v1/customers/identification/${lookup.type}/${lookup.number}`))}>
                Buscar
              </button>
            </div>
          </div>
        </Panel>

        <Panel title="Crear cliente">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Tipo de cliente">
              <select className={inputClass} value={customer.customerType} onChange={(event) => setCustomer({ ...customer, customerType: event.target.value })}>
                <option value="NATURAL">Persona natural</option>
                <option value="JURIDICO">Persona jurídica</option>
              </select>
            </Field>
            <Field label="Identificación">
              <input className={inputClass} value={customer.identification} onChange={(event) => setCustomer({ ...customer, identification: event.target.value })} />
            </Field>
            <Field label="Nombre">
              <input className={inputClass} value={customer.firstName} onChange={(event) => setCustomer({ ...customer, firstName: event.target.value })} />
            </Field>
            <Field label="Apellido">
              <input className={inputClass} value={customer.lastName} onChange={(event) => setCustomer({ ...customer, lastName: event.target.value })} />
            </Field>
            <Field label="Razón social">
              <input className={inputClass} value={customer.legalName} onChange={(event) => setCustomer({ ...customer, legalName: event.target.value })} />
            </Field>
            <Field label="Correo">
              <input className={inputClass} type="email" value={customer.email} onChange={(event) => setCustomer({ ...customer, email: event.target.value })} />
            </Field>
            <Field label="Teléfono">
              <input className={inputClass} value={customer.mobilePhone} onChange={(event) => setCustomer({ ...customer, mobilePhone: event.target.value })} />
            </Field>
            <Field label="Subtipo de cliente">
              <input className={inputClass} value={customer.customerSubtypeId} onChange={(event) => setCustomer({ ...customer, customerSubtypeId: event.target.value })} />
            </Field>
            <Field label="Representante legal">
              <input className={inputClass} value={customer.legalRepresentativeId} onChange={(event) => setCustomer({ ...customer, legalRepresentativeId: event.target.value })} />
            </Field>
            <Field label="Dirección">
              <input className={inputClass} value={customer.address} onChange={(event) => setCustomer({ ...customer, address: event.target.value })} />
            </Field>
          </div>
          <button className={`${primaryButtonClass} mt-5`} disabled={loading} onClick={() => submit(createCustomer)}>
            Crear cliente
          </button>
        </Panel>

        <Panel title="Abrir cuenta">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="ID cliente">
              <input className={inputClass} value={account.customerId} onChange={(event) => setAccount({ ...account, customerId: event.target.value })} />
            </Field>
            <Field label="ID subtipo cuenta">
              <input className={inputClass} value={account.accountSubtypeId} onChange={(event) => setAccount({ ...account, accountSubtypeId: event.target.value })} />
            </Field>
            <Field label="ID sucursal">
              <input className={inputClass} value={account.branchId} onChange={(event) => setAccount({ ...account, branchId: event.target.value })} />
            </Field>
            <Field label="Número de cuenta">
              <input className={inputClass} value={account.accountNumber} onChange={(event) => setAccount({ ...account, accountNumber: event.target.value })} />
            </Field>
          </div>
          <label className="mt-4 flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={account.isFavorite} onChange={(event) => setAccount({ ...account, isFavorite: event.target.checked })} />
            Cuenta favorita para pagos por SFTP cuando aplique
          </label>
          <button className={`${primaryButtonClass} mt-5`} disabled={loading} onClick={() => submit(createAccount)}>
            Abrir cuenta
          </button>
        </Panel>

        <Panel title="Sucursales">
          <p className="mb-4 text-sm text-slate-600">Catálogo operativo usado para apertura de cuentas.</p>
          <button className={primaryButtonClass} disabled={loading} onClick={() => submit(() => coreRequest('/core/v1/branches'))}>
            Consultar sucursales
          </button>
        </Panel>
      </div>
      <ResultBox result={result} error={error} />
    </PageShell>
  );
}
