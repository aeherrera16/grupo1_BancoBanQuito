import { useState } from 'react';
import { Field, inputClass, PageShell, Panel, primaryButtonClass, ResultBox } from '../components/PageShell';
import { coreRequest } from '../services/apiClient';

export function CustomerTransferPage() {
  const [form, setForm] = useState({
    originAccountNumber: '',
    destinationAccountNumber: '',
    amount: '',
    subtypeCode: 'TRANSFERENCIA',
    description: '',
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submitTransfer = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      setResult(await coreRequest('/core/v1/transactions/transfers', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          amount: Number(form.amount),
          transactionUuid: crypto.randomUUID(),
        }),
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell
      title="Transferencias"
      description="Persona natural solo envía transferencias propias mediante el endpoint transaccional del Core."
    >
      <Panel title="Nueva transferencia">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Cuenta origen">
            <input className={inputClass} value={form.originAccountNumber} onChange={(event) => setForm({ ...form, originAccountNumber: event.target.value })} />
          </Field>
          <Field label="Cuenta destino">
            <input className={inputClass} value={form.destinationAccountNumber} onChange={(event) => setForm({ ...form, destinationAccountNumber: event.target.value })} />
          </Field>
          <Field label="Monto">
            <input className={inputClass} type="number" min="0" step="0.01" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} />
          </Field>
          <Field label="Subtipo">
            <input className={inputClass} value={form.subtypeCode} onChange={(event) => setForm({ ...form, subtypeCode: event.target.value })} />
          </Field>
          <Field label="Descripción">
            <input className={inputClass} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
          </Field>
        </div>
        <button className={`${primaryButtonClass} mt-5`} disabled={loading || !form.originAccountNumber || !form.destinationAccountNumber || !form.amount} onClick={submitTransfer}>
          Enviar transferencia
        </button>
      </Panel>
      <ResultBox result={result} error={error} />
    </PageShell>
  );
}
