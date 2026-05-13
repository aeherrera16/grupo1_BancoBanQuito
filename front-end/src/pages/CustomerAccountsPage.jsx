import { useState } from 'react';
import { Field, inputClass, PageShell, Panel, primaryButtonClass, ResultBox } from '../components/PageShell';
import { useAuth } from '../hooks/useAuth';
import { coreRequest, fetchBalance } from '../services/apiClient';

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
      if (needsCoreUser) {
        setResult(await coreRequest(`/core/v1/accounts/${accountNumber}`, {
          coreUserId: user.coreUserId,
        }));
      } else {
        setResult(await fetchBalance(accountNumber));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell
      title={cashierMode ? 'Consulta de cuenta' : 'Saldo y cuentas'}
      description={cashierMode ? 'Consulta mínima para atención en ventanilla.' : 'Persona natural consulta saldo disponible en tiempo real y usa transferencias propias.'}
    >
      <Panel title={needsCoreUser ? 'Consultar cuenta' : 'Consulta de saldo disponible'}>
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
