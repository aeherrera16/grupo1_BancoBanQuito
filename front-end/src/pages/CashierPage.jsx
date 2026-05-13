import { useState } from 'react';
import { Field, inputClass, PageShell, Panel, primaryButtonClass, ResultBox } from '../components/PageShell';
import { coreRequest } from '../services/apiClient';

const initialForm = {
  operation: 'credits',
  accountNumber: '',
  originAccountNumber: '',
  destinationAccountNumber: '',
  amount: '',
  subtypeCode: 'VENTANILLA',
  description: '',
};

export function CashierPage() {
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const isTransfer = form.operation === 'transfers';

  const submitTransaction = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const body = isTransfer
        ? {
            originAccountNumber: form.originAccountNumber,
            destinationAccountNumber: form.destinationAccountNumber,
            amount: Number(form.amount),
            transactionUuid: crypto.randomUUID(),
            subtypeCode: form.subtypeCode,
            description: form.description,
          }
        : {
            accountNumber: form.accountNumber,
            amount: Number(form.amount),
            transactionUuid: crypto.randomUUID(),
            subtypeCode: form.subtypeCode,
            description: form.description,
          };

      setResult(await coreRequest(`/core/v1/transactions/${form.operation}`, {
        method: 'POST',
        body: JSON.stringify(body),
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell
      title="Ventanilla"
      description="El cajero registra créditos, débitos y transferencias; no crea clientes ni administra estados de cuenta."
    >
      <Panel title="Movimiento financiero">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Operación">
            <select className={inputClass} value={form.operation} onChange={(event) => setForm({ ...form, operation: event.target.value })}>
              <option value="credits">Depósito / crédito</option>
              <option value="debits">Retiro / débito</option>
              <option value="transfers">Transferencia</option>
            </select>
          </Field>
          {!isTransfer && (
            <Field label="Cuenta">
              <input className={inputClass} value={form.accountNumber} onChange={(event) => setForm({ ...form, accountNumber: event.target.value })} />
            </Field>
          )}
          {isTransfer && (
            <>
              <Field label="Cuenta origen">
                <input className={inputClass} value={form.originAccountNumber} onChange={(event) => setForm({ ...form, originAccountNumber: event.target.value })} />
              </Field>
              <Field label="Cuenta destino">
                <input className={inputClass} value={form.destinationAccountNumber} onChange={(event) => setForm({ ...form, destinationAccountNumber: event.target.value })} />
              </Field>
            </>
          )}
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
        <button className={`${primaryButtonClass} mt-5`} disabled={loading || !form.amount} onClick={submitTransaction}>
          Registrar movimiento
        </button>
      </Panel>
      <ResultBox result={result} error={error} />
    </PageShell>
  );
}
