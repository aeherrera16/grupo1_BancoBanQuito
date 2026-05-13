import { useState, useEffect } from 'react';
import { Field, inputClass, PageShell, Panel, primaryButtonClass } from '../components/PageShell';
import { useAuth } from '../hooks/useAuth';
import { getAccountByNumber, getAccountsByCustomerId, getCustomerByIdentification, getTransactions } from '../services/apiClient';

export function CustomerAccountsPage({ cashierMode = false }) {
  const { user, portal } = useAuth();
  const isStaff = portal === 'operador' || portal === 'cajero';

  // Estado para staff (búsqueda manual)
  const [accountNumber, setAccountNumber] = useState('');
  const [searching, setSearching] = useState(false);

  // Estado para clientes (búsqueda automática por identificación)
  const [customerAccounts, setCustomerAccounts] = useState([]);
  const [selectedAccountNumber, setSelectedAccountNumber] = useState('');
  const [loadingAccounts, setLoadingAccounts] = useState(true);

  // Estado compartido
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState(null);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Cargar cuentas para clientes al montar
  useEffect(() => {
    if (isStaff) {
      setLoadingAccounts(false);
      return;
    }

    const loadCustomerAccounts = async () => {
      setLoadingAccounts(true);
      setError('');
      try {
        const customer = await getCustomerByIdentification(
          user.identificationType || 'CEDULA',
          user.identificacion
        );
        const accounts = await getAccountsByCustomerId(customer.id);
        setCustomerAccounts(accounts);

        if (accounts.length === 1) {
          setSelectedAccountNumber(accounts[0].accountNumber);
          await fetchAccountDetails(accounts[0].accountNumber);
        } else if (accounts.length > 1) {
          setSelectedAccountNumber(accounts[0].accountNumber);
          await fetchAccountDetails(accounts[0].accountNumber);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingAccounts(false);
      }
    };

    loadCustomerAccounts();
  }, [user, portal, isStaff]);

  const fetchAccountDetails = async (accNumber) => {
    try {
      const account = await getAccountByNumber(accNumber);
      setResult(account);

      const txHistory = await getTransactions(accNumber);
      setHistory(txHistory);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSearch = async () => {
    setSearching(true);
    setError('');
    setResult(null);
    setHistory(null);

    try {
      await fetchAccountDetails(accountNumber);
    } catch (err) {
      setError(err.message);
    } finally {
      setSearching(false);
    }
  };

  const handleAccountChange = async (accNumber) => {
    setSelectedAccountNumber(accNumber);
    await fetchAccountDetails(accNumber);
  };

  const handleShare = () => {
    if (result?.accountNumber) {
      navigator.clipboard.writeText(result.accountNumber);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  // ====== STAFF MODE (OPERADOR / CAJERO) ======
  if (isStaff) {
    return (
      <PageShell title="Consulta de cuenta" description="Consulta mínima para atención.">
        <Panel title="Consultar cuenta">
          <div className="grid gap-4 md:grid-cols-[1fr_auto]">
            <Field label="Número de cuenta">
              <input
                className={inputClass}
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Ej: 001-ABC123"
              />
            </Field>
            <div className="flex items-end">
              <button
                className={primaryButtonClass}
                disabled={searching || !accountNumber}
                onClick={handleSearch}
              >
                Consultar
              </button>
            </div>
          </div>
        </Panel>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-semibold text-red-700">✗ {error}</p>
          </div>
        )}

        {result && (
          <div className="mt-6 rounded-lg border border-slate-200 bg-white p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs font-semibold text-slate-600">Número de cuenta</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">{result.accountNumber}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-600">Titular</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">{result.customerName}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-600">Saldo disponible</p>
                <p className="mt-1 text-lg font-semibold text-green-600">
                  ${result.availableBalance?.toLocaleString('es-EC', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-600">Saldo contable</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  ${result.accountingBalance?.toLocaleString('es-EC', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
        )}
      </PageShell>
    );
  }

  // ====== CLIENT MODE (PERSONA NATURAL / EMPRESA) ======
  if (loadingAccounts) {
    return (
      <PageShell title="Cargando cuentas..." description="">
        <Panel title="Cargando...">
          <p className="text-slate-600">Por favor espera mientras cargamos tus cuentas...</p>
        </Panel>
      </PageShell>
    );
  }

  if (customerAccounts.length === 0) {
    return (
      <PageShell title="Mis cuentas" description="">
        <Panel title="No hay cuentas">
          <p className="text-slate-600">
            No se encontraron cuentas asociadas a tu identificación.
          </p>
        </Panel>
      </PageShell>
    );
  }

  return (
    <div className="max-w-6xl p-8 mx-auto mt-6 bg-white">
      <h1 className="text-3xl font-bold text-banker-blue mb-8">
        Resumen de {user?.name}
      </h1>

      {/* Selector de cuenta si hay múltiples */}
      {customerAccounts.length > 1 && (
        <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Selecciona una cuenta
          </label>
          <select
            className={inputClass}
            value={selectedAccountNumber}
            onChange={(e) => handleAccountChange(e.target.value)}
          >
            {customerAccounts.map((acc) => (
              <option key={acc.accountNumber} value={acc.accountNumber}>
                {acc.accountNumber} - {acc.description} (Saldo: ${acc.availableBalance?.toFixed(2)})
              </option>
            ))}
          </select>
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-700">✗ {error}</p>
        </div>
      )}

      {result && (
        <div className="flex flex-col border border-gray-200 rounded-lg shadow-sm mb-8">
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <svg
                  className="w-6 h-6 text-banker-blue"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900">{result.description || 'Cuenta Digital'}</p>
                <p className="text-sm font-medium text-banker-blue hover:underline cursor-pointer">
                  {result.accountNumber}
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Saldo disponible</p>
              <p className="text-xl font-bold text-gray-900">
                ${result.availableBalance?.toLocaleString('es-EC', { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Saldo Contable</p>
              <p className="text-xl font-semibold text-gray-500">
                ${result.accountingBalance?.toLocaleString('es-EC', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          <div className="flex justify-end p-4 border-t border-gray-100 bg-gray-50 space-x-4">
            <button
              onClick={handleShare}
              className="flex items-center text-sm font-medium text-banker-blue hover:text-banker-navy"
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
              Compartir
            </button>
            <button
              onClick={() => setShowDetails(true)}
              className="flex items-center text-sm font-medium text-banker-blue hover:text-banker-navy"
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Ver Detalle
            </button>
          </div>
        </div>
      )}

      {history && history.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Historial de Movimientos</h2>
          </div>
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Fecha</th>
                  <th className="px-4 py-3 font-semibold">Tipo</th>
                  <th className="px-4 py-3 font-semibold">Detalle</th>
                  <th className="px-4 py-3 font-semibold text-right">Monto</th>
                  <th className="px-4 py-3 font-semibold text-right">Saldo Resultante</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {history.map((tx, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(tx.transactionDate).toLocaleString('es-EC')}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          tx.movementType === 'CREDITO'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {tx.movementType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {tx.message || tx.description || 'Transacción'}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">
                      ${tx.amount?.toLocaleString('es-EC', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-500">
                      ${tx.resultingBalance?.toLocaleString('es-EC', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 z-50">
          <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="font-medium">Número de cuenta copiado al portapapeles</span>
        </div>
      )}

      {/* Detalles Modal */}
      {showDetails && result && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowDetails(false)}
          />
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative z-10">
            <div className="bg-banker-blue px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Detalles de la Cuenta</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-blue-100 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <span className="text-gray-500 text-sm">Titular</span>
                <span className="font-semibold text-gray-800">{user?.name}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <span className="text-gray-500 text-sm">Número de Cuenta</span>
                <span className="font-semibold text-gray-800">{result.accountNumber}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <span className="text-gray-500 text-sm">Tipo</span>
                <span className="font-semibold text-gray-800">{result.description || 'Cuenta Digital'}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <span className="text-gray-500 text-sm">Estado</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800">
                  {result.status || 'ACTIVA'}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <span className="text-gray-500 text-sm">Saldo Contable</span>
                <span className="font-bold text-gray-600">
                  ${result.accountingBalance?.toLocaleString('es-EC', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center pb-1">
                <span className="text-gray-500 text-sm">Saldo Disponible</span>
                <span className="font-black text-banker-blue text-xl">
                  ${result.availableBalance?.toLocaleString('es-EC', { minimumFractionDigits: 2 })}
                </span>
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
