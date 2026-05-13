import { useState } from 'react';
import { Field, inputClass, PageShell, Panel, primaryButtonClass, ResultBox } from '../components/PageShell';
import { coreRequest, fetchBalance } from '../services/apiClient';

import { useAuth } from '../hooks/useAuth';

export function CustomerTransferPage() {
  const { portal, user } = useAuth();
  const defaultOrigin = user?.username === 'ana123' ? '001-00005678' : '001-00001234';
  const [form, setForm] = useState({
    originAccountNumber: portal === 'personaNatural' ? defaultOrigin : '',
    destinationAccountNumber: '',
    amount: '',
    subtypeCode: 'TRANSFER',
    description: '',
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [destinationInfo, setDestinationInfo] = useState(null);

  const validateDestination = async () => {
    if (!form.destinationAccountNumber) return;
    try {
      const data = await fetchBalance(form.destinationAccountNumber);
      setDestinationInfo(data.customerFullName || 'Titular encontrado');
      setError('');
    } catch (err) {
      setDestinationInfo(null);
      setError('Cuenta destino no encontrada');
    }
  };

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
      <div className="print:hidden">
        <Panel title="Nueva transferencia">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Cuenta origen">
            <select 
              className={inputClass} 
              value={form.originAccountNumber} 
              disabled={true}
              onChange={(event) => setForm({ ...form, originAccountNumber: event.target.value })}
            >
              <option value={defaultOrigin}>Cuenta Digital - {defaultOrigin}</option>
            </select>
          </Field>
          <Field label="Cuenta destino">
            <div className="flex gap-2">
              <input className={`${inputClass} flex-1`} value={form.destinationAccountNumber} onChange={(event) => { setForm({ ...form, destinationAccountNumber: event.target.value }); setDestinationInfo(null); }} placeholder="Ej: 001-00005678" />
              <button className={`${primaryButtonClass} bg-[#006644]`} onClick={validateDestination} disabled={!form.destinationAccountNumber}>
                Validar
              </button>
            </div>
            {destinationInfo && <p className="mt-1 text-sm text-green-700 font-medium">Titular: {destinationInfo}</p>}
          </Field>
          <Field label="Monto">
            <input className={inputClass} type="number" min="0" step="0.01" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} />
          </Field>
          <Field label="Subtipo">
            <input className={inputClass} value={form.subtypeCode} disabled={true} />
          </Field>
          <Field label="Descripción">
            <input className={inputClass} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Ej: Pago de tarjeta" />
          </Field>
        </div>
          <button className={`${primaryButtonClass} mt-5`} disabled={loading || !form.originAccountNumber || !form.destinationAccountNumber || !form.amount} onClick={submitTransfer}>
            Enviar transferencia
          </button>
        </Panel>
      </div>
      {error && <div className="p-4 mt-6 text-red-700 bg-red-100 rounded-lg print:hidden">{error}</div>}
      
      {result && (
        <div className="mt-8 max-w-md mx-auto bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          <div className="bg-[#006644] px-6 py-4 text-center">
            <svg className="w-12 h-12 text-white mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <h2 className="text-xl font-bold text-white">¡Transferencia Exitosa!</h2>
            <p className="text-green-100 text-sm">{new Date(result.transactionDate).toLocaleString()}</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <span className="text-gray-500 text-sm">Monto enviado</span>
              <span className="text-2xl font-bold text-gray-900">${result.amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <span className="text-gray-500 text-sm">Cuenta Origen</span>
              <span className="font-medium text-gray-800">{form.originAccountNumber}</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <span className="text-gray-500 text-sm">Cuenta Destino</span>
              <span className="font-medium text-gray-800">{form.destinationAccountNumber}</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <span className="text-gray-500 text-sm">Beneficiario</span>
              <span className="font-medium text-gray-800">{destinationInfo || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center pb-2">
              <span className="text-gray-500 text-sm">Concepto</span>
              <span className="font-medium text-gray-800 uppercase">{form.description || form.subtypeCode}</span>
            </div>
            <div className="pt-4 flex justify-center print:hidden">
               <button onClick={() => window.print()} className="flex items-center text-sm font-medium text-[#006644] hover:text-[#004d33]">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                  Descargar o Imprimir
               </button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
