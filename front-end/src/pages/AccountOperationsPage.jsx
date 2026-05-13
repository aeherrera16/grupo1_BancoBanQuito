import { useState } from 'react';
import { Field, inputClass, PageShell, Panel, primaryButtonClass, ResultBox, secondaryButtonClass } from '../components/PageShell';
import { useAuth } from '../hooks/useAuth';
import { coreRequest } from '../services/apiClient';

export function AccountOperationsPage() {
  const { user } = useAuth();
  const [accountNumber, setAccountNumber] = useState('');
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

  const accountPath = `/core/v1/accounts/${accountNumber}`;

  return (
    <PageShell
      title="Cuentas de personas"
      description="El operador administra estados de cuenta; no registra movimientos de caja."
    >
      <Panel title="Consulta y estado de cuenta">
        <div className="grid gap-4 md:grid-cols-[1fr_auto]">
          <Field label="Número de cuenta">
            <input className={inputClass} value={accountNumber} onChange={(event) => setAccountNumber(event.target.value)} />
          </Field>
          <div className="flex items-end">
            <button className={primaryButtonClass} disabled={loading || !accountNumber} onClick={() => submit(() => coreRequest(accountPath, { coreUserId: user.coreUserId }))}>
              Consultar
            </button>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button className={secondaryButtonClass} disabled={loading || !accountNumber} onClick={() => submit(() => coreRequest(`${accountPath}/block`, { method: 'PATCH', coreUserId: user.coreUserId }))}>
            Bloquear
          </button>
          <button className={secondaryButtonClass} disabled={loading || !accountNumber} onClick={() => submit(() => coreRequest(`${accountPath}/suspend`, { method: 'PATCH', coreUserId: user.coreUserId }))}>
            Suspender
          </button>
          <button className={secondaryButtonClass} disabled={loading || !accountNumber} onClick={() => submit(() => coreRequest(`${accountPath}/inactivate`, { method: 'PATCH', coreUserId: user.coreUserId }))}>
            Inactivar
          </button>
        </div>
      </Panel>
      <ResultBox result={result} error={error} />
    </PageShell>
  );
}
