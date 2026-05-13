import { useState } from 'react';
import { Field, inputClass, PageShell, Panel, primaryButtonClass, ResultBox } from '../components/PageShell';
import { useAuth } from '../hooks/useAuth';
import { coreRequest } from '../services/apiClient';

export function CredentialsPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({ customerId: '', username: '', password: '' });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const createCredential = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const response = await coreRequest('/core/v1/auth/customers/credentials', {
        method: 'POST',
        coreUserId: user.coreUserId,
        body: JSON.stringify({ ...form, customerId: Number(form.customerId) }),
      });
      setResult(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell
      title="Credenciales web"
      description="Credenciales separadas para clientes, según la tabla WEB_CREDENTIAL del Core."
    >
      <Panel title="Crear acceso para cliente">
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="ID cliente">
            <input className={inputClass} value={form.customerId} onChange={(event) => setForm({ ...form, customerId: event.target.value })} />
          </Field>
          <Field label="Usuario">
            <input className={inputClass} value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} />
          </Field>
          <Field label="Contraseña temporal">
            <input className={inputClass} type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
          </Field>
        </div>
        <button className={`${primaryButtonClass} mt-5`} disabled={loading || !form.customerId || !form.username || !form.password} onClick={createCredential}>
          Crear credencial
        </button>
      </Panel>
      <ResultBox result={result} error={error} />
    </PageShell>
  );
}
