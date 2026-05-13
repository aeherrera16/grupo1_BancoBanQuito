import { useState } from 'react';
import { Field, inputClass, PageShell, Panel, primaryButtonClass, ResultBox } from '../components/PageShell';
import { useAuth } from '../hooks/useAuth';
import { coreRequest } from '../services/apiClient';

export function CustomerAccountsPage({ cashierMode = false }) {
  const { user, portal } = useAuth();
  const [accountNumber, setAccountNumber] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const needsCoreUser = portal !== 'personaNatural';

  const fetchAccount = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      setResult(await coreRequest(`/core/v1/accounts/${accountNumber}`, {
        coreUserId: needsCoreUser ? user.coreUserId : undefined,
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell
      title={cashierMode ? 'Consulta de cuenta' : 'Mis cuentas'}
      description={cashierMode ? 'Consulta mínima para atención en ventanilla.' : 'Portal de persona natural con alcance limitado a consulta y transferencias.'}
    >
      <Panel title="Consultar cuenta">
        <div className="grid gap-4 md:grid-cols-[1fr_auto]">
          <Field label="Número de cuenta">
            <input className={inputClass} value={accountNumber} onChange={(event) => setAccountNumber(event.target.value)} />
          </Field>
          <div className="flex items-end">
            <button className={primaryButtonClass} disabled={loading || !accountNumber} onClick={fetchAccount}>
              Consultar
            </button>
          </div>
        </div>
      </Panel>
      <ResultBox result={result} error={error} />
    </PageShell>
  );
}
