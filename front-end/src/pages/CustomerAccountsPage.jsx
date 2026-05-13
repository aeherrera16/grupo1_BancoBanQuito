import { useState, useEffect } from 'react';
import { Field, inputClass, PageShell, Panel, primaryButtonClass, ResultBox } from '../components/PageShell';
import { useAuth } from '../hooks/useAuth';
import { coreRequest, fetchBalance, fetchAccountHistory } from '../services/apiClient';

export function CustomerAccountsPage({ cashierMode = false }) {
  const { user, portal } = useAuth();
  const [accountNumber, setAccountNumber] = useState(
    portal === 'personaNatural'
      ? (user?.email === 'ana123' ? 'GYE-200001' : 'UIO-100001')
      : (portal === 'empresa' ? 'UIO-300001' : '')
  );
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const needsCoreUser = portal === 'operador' || portal === 'cajero';

  // Autocargar para Persona Natural para simular el "Resumen" directo
  useEffect(() => {
    if (!needsCoreUser) {
      fetchAccount();
      
      // Polling para refrescar datos automáticamente
      const interval = setInterval(async () => {
        try {
          const accNum =
            portal === 'personaNatural'
              ? (user?.email === 'ana123' ? 'GYE-200001' : 'UIO-100001')
              : (portal === 'empresa' ? 'UIO-300001' : '');
          if (accNum) {
            const bal = await fetchBalance(accNum);
            setResult(bal);
            try {
              const hist = await fetchAccountHistory(accNum);
              setHistory(hist);
            } catch (e) {}
          }
        } catch (err) {}
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [user, portal, needsCoreUser]);

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
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const handleDetails = () => {
    if (result) {
      setShowDetails(true);
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
                <div className="flex items-center gap-2">
                  {/* RF-03: Tipo de cuenta real desde el backend */}
                  <p className="font-semibold text-gray-900">
                    {result.accountSubtypeDescription || 'Cuenta de Ahorros'}
                  </p>
                  {/* RF-03: Badge de estado de cuenta */}
                  <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                    result.status === 'ACTIVO' ? 'bg-green-100 text-green-700' :
                    result.status === 'INACTIVO' ? 'bg-gray-100 text-gray-500' :
                    result.status === 'BLOQUEADO' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {result.status || 'ACTIVO'}
                  </span>
                </div>
                {/* RF-02: Número de cuenta con nombre de sucursal desde el backend */}
                <p className="text-sm font-medium text-[#006644]">{result.accountNumber}</p>
                {result.branchName && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    <span className="font-medium">Sucursal:</span> {result.branchName}
                  </p>
                )}
              </div>
            </div>

            <div className="text-right">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Saldo disponible</p>
              <p className="text-xl font-bold text-gray-900">${result.availableBalance?.toFixed(2) || '0.00'}</p>
            </div>

            <div className="text-right">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Saldo Contable</p>
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Historial de Movimientos</h2>
              <button
                onClick={() => {
                  const w = window.open('', '_blank');
                  w.document.write(`
                    <html><head><title>Reporte de Movimientos</title>
                    <style>
                      body{font-family:sans-serif;padding:24px;color:#111}
                      h1{color:#006644;margin-bottom:4px}p{color:#666;font-size:13px;margin-bottom:20px}
                      table{width:100%;border-collapse:collapse}
                      th{background:#006644;color:white;padding:10px 12px;text-align:left;font-size:12px}
                      td{padding:10px 12px;border-bottom:1px solid #eee;font-size:13px}
                      .cr{color:#16a34a;font-weight:600}.db{color:#dc2626;font-weight:600}
                      .badge{display:inline-block;padding:2px 8px;border-radius:99px;font-size:11px;font-weight:700}
                      .badge-cr{background:#dcfce7;color:#16a34a}.badge-db{background:#fee2e2;color:#dc2626}
                      footer{margin-top:24px;font-size:11px;color:#999;text-align:center}
                    </style></head><body>
                    <h1>BancoBanQuito EN LÍNEA</h1>
                    <p>Reporte de Movimientos &mdash; Cuenta: ${result?.accountNumber} &mdash; ${new Date().toLocaleString()}</p>
                    <table>
                      <thead><tr><th>Fecha</th><th>Tipo</th><th>Detalle</th><th style="text-align:right">Monto</th><th style="text-align:right">Saldo</th></tr></thead>
                      <tbody>
                        ${history.map(tx => `
                          <tr>
                            <td>${new Date(tx.transactionDate).toLocaleString()}</td>
                            <td><span class="badge ${tx.movementType === 'CREDITO' ? 'badge-cr' : 'badge-db'}">${tx.movementType}</span></td>
                            <td>${tx.message || tx.subtypeCode || 'Transacción'}</td>
                            <td style="text-align:right;font-weight:600">$${tx.amount?.toFixed(2)}</td>
                            <td style="text-align:right;color:#555">$${tx.resultingBalance?.toFixed(2)}</td>
                          </tr>
                        `).join('')}
                      </tbody>
                    </table>
                    <footer>Documento generado digitalmente &mdash; BancoBanQuito &mdash; Información confidencial</footer>
                    </body></html>
                  `);
                  w.document.close();
                  w.print();
                }}
                className="flex items-center gap-1.5 text-sm font-medium text-[#006644] hover:text-[#004d33] border border-[#006644] rounded-lg px-3 py-1.5 hover:bg-green-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Generar Reporte
              </button>
            </div>
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

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 z-50 animate-fade-in-up">
          <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <span className="font-medium">Número de cuenta copiado al portapapeles</span>
        </div>
      )}

      {/* Detalles Modal */}
      {showDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setShowDetails(false)}></div>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative z-10">
            <div className="bg-[#006644] px-6 py-4 flex justify-between items-center">
               <h3 className="text-lg font-bold text-white">Detalles de la Cuenta</h3>
               <button onClick={() => setShowDetails(false)} className="text-green-100 hover:text-white transition-colors focus:outline-none">
                 <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>
               </button>
            </div>
            <div className="p-6 space-y-4">
               <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                 <span className="text-gray-500 text-sm">Titular</span>
                 <span className="font-semibold text-gray-800 uppercase">{result.customerFullName || user?.name}</span>
               </div>
               <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                 <span className="text-gray-500 text-sm">Número de Cuenta</span>
                 <span className="font-semibold text-gray-800">{result.accountNumber}</span>
               </div>
               <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                 <span className="text-gray-500 text-sm">Tipo de Cuenta</span>
                 <span className="font-semibold text-gray-800">{result.accountSubtypeDescription || 'Cuenta de Ahorros'}</span>
               </div>
               {result.branchName && (
                 <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                   <span className="text-gray-500 text-sm">Sucursal</span>
                   <span className="font-semibold text-gray-800">{result.branchName}</span>
                 </div>
               )}
               <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                 <span className="text-gray-500 text-sm">Estado</span>
                 <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                   result.status === 'ACTIVO' ? 'bg-green-100 text-green-800' :
                   result.status === 'BLOQUEADO' ? 'bg-red-100 text-red-800' :
                   'bg-gray-100 text-gray-600'
                 }`}>
                   {result.status || 'ACTIVA'}
                 </span>
               </div>
               <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                 <span className="text-gray-500 text-sm">Saldo Contable</span>
                 <span className="font-bold text-gray-600">${result.accountingBalance?.toFixed(2)}</span>
               </div>
               <div className="flex justify-between items-center pb-1">
                 <span className="text-gray-500 text-sm">Saldo Disponible</span>
                 <span className="font-black text-[#006644] text-xl">${result.availableBalance?.toFixed(2)}</span>
               </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
               <button onClick={() => setShowDetails(false)} className={`${primaryButtonClass} w-auto px-6`}>
                 Entendido
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
