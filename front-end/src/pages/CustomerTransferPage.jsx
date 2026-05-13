import { useState, useRef, useEffect } from 'react';
import { Field, inputClass, PageShell, Panel, primaryButtonClass } from '../components/PageShell';
import { transfer, getAccountByNumber, getAccountsByCustomerId, getCustomerByIdentification } from '../services/apiClient';
import { useAuth } from '../hooks/useAuth';

const emptyForm = (origin) => ({
  originAccountNumber: origin,
  destinationAccountNumber: '',
  amount: '',
});

export function CustomerTransferPage() {
  const { user } = useAuth();

  const [customerAccounts, setCustomerAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);

  const [form, setForm] = useState(emptyForm(''));
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [destinationInfo, setDestinationInfo] = useState(null);
  const txUuidRef = useRef(crypto.randomUUID());

  // Cargar cuentas del cliente al montar
  useEffect(() => {
    const loadAccounts = async () => {
      setLoadingAccounts(true);
      try {
        const customer = await getCustomerByIdentification(
          user.identificationType || 'CEDULA',
          user.identificacion
        );
        const accounts = await getAccountsByCustomerId(customer.id);
        setCustomerAccounts(accounts);
        if (accounts.length > 0) {
          setForm(emptyForm(accounts[0].accountNumber));
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingAccounts(false);
      }
    };

    loadAccounts();
  }, [user]);

  const resetForm = () => {
    if (customerAccounts.length > 0) {
      setForm(emptyForm(customerAccounts[0].accountNumber));
    } else {
      setForm(emptyForm(''));
    }
    setResult(null);
    setError('');
    setDestinationInfo(null);
    txUuidRef.current = crypto.randomUUID();
  };

  const validateDestination = async () => {
    if (!form.destinationAccountNumber) return;
    try {
      const data = await getAccountByNumber(form.destinationAccountNumber);
      setDestinationInfo(data.customerName || 'Titular encontrado');
      setError('');
    } catch {
      setDestinationInfo(null);
      setError('Cuenta destino no encontrada');
    }
  };

  const submitTransfer = async () => {
    if (loading || result) return;
    setLoading(true);
    setError('');
    try {
      const res = await transfer(
        form.originAccountNumber,
        form.destinationAccountNumber,
        Number(form.amount),
        txUuidRef.current
      );
      setResult(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const w = window.open('', '_blank');
    w.document.write(`
      <html>
      <head>
        <title>Comprobante de Transferencia</title>
        <style>
          *{margin:0;padding:0;box-sizing:border-box}
          body{font-family:'Segoe UI',sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f5f5f5}
          .card{background:white;border-radius:16px;overflow:hidden;width:380px;box-shadow:0 8px 32px rgba(0,0,0,0.12)}
          .header{background:#006644;padding:24px;text-align:center;color:white}
          .header h1{font-size:18px;font-weight:700;letter-spacing:1px}
          .header .icon{font-size:32px;margin-bottom:8px}
          .header p{font-size:12px;opacity:0.8;margin-top:4px}
          .body{padding:24px}
          .row{display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid #f0f0f0}
          .row:last-child{border-bottom:none}
          .label{color:#888;font-size:12px}
          .value{font-size:13px;font-weight:600;color:#111;text-align:right}
          .amount{font-size:22px;font-weight:800;color:#006644}
          .footer{background:#f9f9f9;padding:12px;text-align:center;font-size:10px;color:#aaa;border-top:1px solid #eee}
          @media print{body{background:white}.card{box-shadow:none;border-radius:0;width:100%}}
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <div class="icon">✅</div>
            <h1>BancoBanQuito EN LÍNEA</h1>
            <p>Comprobante de Transferencia</p>
            <p>${new Date(result.transactionDate).toLocaleString()}</p>
          </div>
          <div class="body">
            <div class="row"><span class="label">Monto enviado</span><span class="amount">$${result.amount?.toFixed(2)}</span></div>
            <div class="row"><span class="label">Cuenta Origen</span><span class="value">${form.originAccountNumber}</span></div>
            <div class="row"><span class="label">Cuenta Destino</span><span class="value">${form.destinationAccountNumber}</span></div>
            <div class="row"><span class="label">Beneficiario</span><span class="value">${destinationInfo || 'N/A'}</span></div>
            <div class="row"><span class="label">Concepto</span><span class="value">${(form.description || form.subtypeCode).toUpperCase()}</span></div>
            <div class="row"><span class="label">Referencia</span><span class="value">${result.transactionUuid?.slice(-8).toUpperCase()}</span></div>
          </div>
          <div class="footer">Documento generado digitalmente &mdash; Información confidencial &mdash; BancoBanQuito</div>
        </div>
        <script>window.onload=()=>window.print();<\/script>
      </body>
      </html>
    `);
    w.document.close();
  };

  const isFormValid =
    form.originAccountNumber &&
    form.destinationAccountNumber &&
    form.amount &&
    Number(form.amount) > 0 &&
    destinationInfo;

  if (loadingAccounts) {
    return (
      <PageShell title="Transferencias" description="">
        <Panel title="Cargando cuentas...">
          <p className="text-slate-600">Por favor espera mientras cargamos tus cuentas...</p>
        </Panel>
      </PageShell>
    );
  }

  if (customerAccounts.length === 0) {
    return (
      <PageShell title="Transferencias" description="">
        <Panel title="Sin cuentas disponibles">
          <p className="text-slate-600">
            No se encontraron cuentas asociadas a tu identificación.
          </p>
        </Panel>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Transferencias"
      description="Persona natural solo envía transferencias propias mediante el endpoint transaccional del Core."
    >
      {/* ── FORMULARIO (oculto al imprimir) ── */}
      {!result && (
        <div className="print:hidden">
          <Panel title="Nueva transferencia">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Cuenta origen">
                <select
                  className={inputClass}
                  value={form.originAccountNumber}
                  disabled={customerAccounts.length === 1}
                  onChange={(e) => setForm({ ...form, originAccountNumber: e.target.value })}
                >
                  {customerAccounts.map((acc) => (
                    <option key={acc.accountNumber} value={acc.accountNumber}>
                      {acc.description} — {acc.accountNumber}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Cuenta destino">
                <div className="flex gap-2">
                  <input
                    className={`${inputClass} flex-1`}
                    value={form.destinationAccountNumber}
                    onChange={(e) => {
                      setForm({ ...form, destinationAccountNumber: e.target.value });
                      setDestinationInfo(null);
                    }}
                    placeholder="Ej: 001-00001234"
                  />
                  <button
                    className={`${primaryButtonClass} bg-[#006644]`}
                    onClick={validateDestination}
                    disabled={!form.destinationAccountNumber}
                  >
                    Validar
                  </button>
                </div>
                {destinationInfo && (
                  <p className="mt-1 text-sm text-green-700 font-medium">Titular: {destinationInfo}</p>
                )}
              </Field>
              <Field label="Monto">
                <input
                  className={inputClass}
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                />
              </Field>
              <Field label="Subtipo">
                <input className={inputClass} value={form.subtypeCode} disabled />
              </Field>
              <Field label="Descripción">
                <input
                  className={inputClass}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Ej: Pago de arriendo"
                />
              </Field>
            </div>
            <button
              className={`${primaryButtonClass} mt-5`}
              disabled={loading || !isFormValid}
              onClick={submitTransfer}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Procesando…
                </span>
              ) : (
                'Enviar transferencia'
              )}
            </button>
          </Panel>
        </div>
      )}

      {/* ── ERROR ESTILIZADO (oculto al imprimir) ── */}
      {error && !result && (
        <div className="print:hidden mt-6 max-w-lg mx-auto bg-red-50 border border-red-200 rounded-xl p-5 flex gap-4 items-start shadow-sm">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-red-700">Transacción rechazada</p>
            <p className="mt-1 text-sm text-red-600">
              {error.toLowerCase().includes('insuficiente')
                ? `Saldo insuficiente en la cuenta ${form.originAccountNumber}. Verifique su saldo disponible antes de reintentar.`
                : error}
            </p>
          </div>
          <button
            onClick={() => setError('')}
            className="text-red-400 hover:text-red-600 focus:outline-none"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        </div>
      )}

      {/* ── COMPROBANTE (único visible al imprimir) ── */}
      {result && (
        <>
          {/* Sección solo para impresión */}
          <div className="print:block hidden print-voucher">
            <div className="max-w-sm mx-auto mt-8 border border-gray-200 rounded-xl overflow-hidden shadow-lg">
              <div className="bg-[#006644] px-6 py-4 text-center">
                <p className="text-white font-bold text-lg">BancoBanQuito</p>
                <p className="text-green-100 text-xs">Comprobante de Transferencia</p>
              </div>
              <div className="p-6 space-y-3 text-sm">
                {[
                  ['Fecha', new Date(result.transactionDate).toLocaleString()],
                  ['Referencia', result.transactionUuid?.slice(-8).toUpperCase()],
                  ['Monto', `$${result.amount?.toFixed(2)}`],
                  ['Cuenta Origen', form.originAccountNumber],
                  ['Cuenta Destino', form.destinationAccountNumber],
                  ['Beneficiario', destinationInfo || 'N/A'],
                  ['Concepto', form.description || form.subtypeCode],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-500">{label}</span>
                    <span className="font-semibold text-gray-800">{val}</span>
                  </div>
                ))}
              </div>
              <div className="bg-gray-50 px-6 py-3 text-center text-xs text-gray-400">
                Documento generado digitalmente — BancoBanQuito EN LÍNEA
              </div>
            </div>
          </div>

          {/* Comprobante visual (oculto al imprimir el resto de la página) */}
          <div className="mt-8 max-w-md mx-auto print:hidden">
            <div className="bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-[#006644] px-6 py-5 text-center">
                <svg className="w-12 h-12 text-white mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 className="text-xl font-bold text-white">¡Transferencia Exitosa!</h2>
                <p className="text-green-100 text-sm mt-1">{new Date(result.transactionDate).toLocaleString()}</p>
              </div>
              <div className="p-6 space-y-3">
                {[
                  ['Monto enviado', `$${result.amount?.toFixed(2)}`, true],
                  ['Cuenta Origen', form.originAccountNumber, false],
                  ['Cuenta Destino', form.destinationAccountNumber, false],
                  ['Beneficiario', destinationInfo || 'N/A', false],
                  ['Concepto', (form.description || form.subtypeCode).toUpperCase(), false],
                  ['Referencia', result.transactionUuid?.slice(-8).toUpperCase(), false],
                ].map(([label, val, big]) => (
                  <div key={label} className="flex justify-between items-center border-b border-gray-100 pb-2 last:border-none last:pb-0">
                    <span className="text-gray-500 text-sm">{label}</span>
                    <span className={big ? 'text-2xl font-black text-gray-900' : 'font-semibold text-gray-800 text-sm'}>
                      {val}
                    </span>
                  </div>
                ))}
              </div>

              {/* Botones de acción */}
              <div className="px-6 pb-6 flex flex-col gap-3">
                <button
                  onClick={handlePrint}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border-2 border-[#006644] text-[#006644] font-semibold text-sm hover:bg-green-50 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Descargar / Imprimir comprobante
                </button>
                <button
                  onClick={resetForm}
                  className={`${primaryButtonClass} w-full`}
                >
                  Hacer otra transferencia
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Estilos de impresión */}
      <style>{`
        @media print {
          body > * { display: none !important; }
          .print-voucher { display: block !important; }
        }
      `}</style>
    </PageShell>
  );
}
