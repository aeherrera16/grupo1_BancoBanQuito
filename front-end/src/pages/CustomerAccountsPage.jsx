import { useState, useEffect } from 'react';
import { Field, inputClass, PageShell, Panel, primaryButtonClass, ResultBox } from '../components/PageShell';
import { useAuth } from '../hooks/useAuth';
import { coreRequest, fetchBalance, fetchAccountHistory } from '../services/apiClient';

export function CustomerAccountsPage({ cashierMode = false }) {
  const { user, portal } = useAuth();
  const [accountNumber, setAccountNumber] = useState(portal === 'personaNatural' ? (user?.username === 'ana123' ? '001-00005678' : '001-00001234') : (portal === 'empresa' ? '0050000202' : ''));
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const needsCoreUser = portal === 'operador' || portal === 'cajero';

  // Autocargar para Persona Natural para simular el "Resumen" directo
  useEffect(() => {
    if (!needsCoreUser) {
      fetchAccount();
    }
  }, []);

  const fetchAccount = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    setHistory(null);
    try {
      if (needsCoreUser) {
        setResult(await coreRequest(`/core/v1/accounts/${accountNumber}`, {
          coreUserId: user.coreUserId,
        }));
      } else {
        const bal = await fetchBalance(accountNumber);
        setResult(bal);
        try {
          const hist = await fetchAccountHistory(accountNumber);
          setHistory(hist);
        } catch (e) {
          // ignorar historial fallido
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    if (result?.accountNumber) {
      navigator.clipboard.writeText(result.accountNumber);
      alert(`¡Número de cuenta ${result.accountNumber} copiado al portapapeles!`);
    }
  };

  const handleDetails = () => {
    if (result) {
      alert(`Detalles de la Cuenta:\n\nTitular: ${user?.name}\nNúmero de Cuenta: ${result.accountNumber}\nTipo: ${result.accountSubtype || 'Cuenta Digital'}\nEstado: ${result.status || 'ACTIVA'}\n\nSaldo Contable: $${result.accountingBalance?.toFixed(2)}\nSaldo Disponible: $${result.availableBalance?.toFixed(2)}`);
    }
  };

  if (needsCoreUser) {
    return (
      <PageShell title="Consulta de cuenta" description="Consulta mínima para atención en ventanilla.">
        <Panel title="Consultar cuenta">
          <div className="grid gap-4 md:grid-cols-[1fr_auto]">
            <Field label="Número de cuenta">
              <input className={inputClass} value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} />
            </Field>
            <div className="flex items-end">
              <button className={primaryButtonClass} disabled={loading || !accountNumber} onClick={fetchAccount}>
                Consultar
              </button>
            </div>
          </div>
        </Panel>
        {error && <div className="p-4 mt-4 text-red-700 bg-red-100 rounded-lg">{error}</div>}
        <div className="mt-4"><ResultBox result={result} error={error} /></div>
      </PageShell>
    );
  }

  // Interfaz Produbanco-style para Persona Natural
  return (
    <div className="max-w-6xl p-8 mx-auto mt-6 bg-white">
      <h1 className="text-3xl font-bold text-[#006644] mb-8">Resumen de {user?.name}</h1>
      
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Cuentas</h2>
      </div>

      {loading && <p className="text-gray-500">Cargando cuentas...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {result && (
        <div className="flex flex-col border border-gray-200 rounded-lg shadow-sm">
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <svg className="w-6 h-6 text-[#006644]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900">{result.accountSubtype || 'Cuenta Digital'}</p>
                <p className="text-sm font-medium text-[#006644] hover:underline cursor-pointer">{result.accountNumber}</p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Saldo disponible</p>
              <p className="text-xl font-bold text-gray-900">${result.availableBalance?.toFixed(2) || '0.00'}</p>
            </div>

            <div className="text-right">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Saldo Contable (RF-05)</p>
              <p className="text-xl font-semibold text-gray-500">${result.accountingBalance?.toFixed(2) || '0.00'}</p>
            </div>
          </div>

          <div className="flex justify-end p-4 border-t border-gray-100 bg-gray-50 space-x-4">
             <button onClick={handleShare} className="flex items-center text-sm font-medium text-[#006644] hover:text-[#004d33]">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
                Compartir
             </button>
             <button onClick={handleDetails} className="flex items-center text-sm font-medium text-[#006644] hover:text-[#004d33]">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                Ver Detalle
             </button>
          </div>
        </div>
      )}

      {history && history.length > 0 && (
         <div className="mt-8">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">Historial de Movimientos (RF-07)</h2>
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Fecha</th>
                    <th className="px-4 py-3 font-semibold">Tipo</th>
                    <th className="px-4 py-3 font-semibold">Subtipo (Detalle)</th>
                    <th className="px-4 py-3 font-semibold text-right">Monto</th>
                    <th className="px-4 py-3 font-semibold text-right">Saldo Resultante</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {history.map((tx, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 text-gray-500">{new Date(tx.transactionDate).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          tx.movementType === 'CREDITO' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {tx.movementType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{tx.message || tx.subtypeCode || 'Transacción general'}</td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900">${tx.amount?.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-medium text-gray-500">${tx.resultingBalance?.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
         </div>
      )}
    </div>
  );
}
