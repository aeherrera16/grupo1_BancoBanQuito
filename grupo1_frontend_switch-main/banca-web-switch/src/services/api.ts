async function api(path: string, options: any = {}) {
  const response = await fetch(path, options);
  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message = typeof payload === 'object' ? payload.error || payload.detail || payload.message : payload;
    throw new Error(message || `Error HTTP ${response.status}`);
  }

  return payload;
}

async function download(path: string, fileName: string) {
  const response = await fetch(path);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Error HTTP ${response.status}`);
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

async function checkServices() {
  try {
    await api('http://localhost:8080/health');
    return { coreUserId: 1, coreStatus: 'Banca disponible', switchStatus: null };
  } catch (error) {
    return { coreUserId: 1, coreStatus: 'Banca no disponible', switchStatus: null };
  }
}

async function checkSwitchService() {
  try {
    await api('/api/switch/switch/v1/switch/health');
    return 'Pagos disponibles';
  } catch (error) {
    return 'Pagos no disponibles';
  }
}

async function login(username: string, password: string) {
  return api('http://localhost:8080/core/v1/auth/customers/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
}

async function loadAccounts(customerId: string, coreUserId: number) {
  return api(`/core/v1/accounts/customer/${customerId}`, {
    headers: { 'X-Core-User-Id': String(coreUserId || 1) },
  });
}

async function loadTransactions(customerId: string, coreUserId: number) {
  return api(`/core/v1/accounts/customer/${customerId}/transactions`, {
    headers: { 'X-Core-User-Id': String(coreUserId || 1) },
  });
}

async function loadBatches() {
  return api('/api/switch/switch/v1/payment-batch');
}

async function loadCharges() {
  const response = await api('/api/switch/switch/v1/billing/charges');
  return response.cargos || [];
}

async function loadCompanyAccount() {
  const response = await api('/api/switch/switch/v1/billing/empresa-account');
  return response.cuentaEmpresa || null;
}

async function uploadCsv(file: File) {
  const form = new FormData();
  form.append('file', file);
  form.append('channel', 'PORTAL');

  return api('/api/switch/switch/v1/payment-batch/upload-csv', {
    method: 'POST',
    body: form,
  });
}

async function processBatch(batchId: string) {
  return api(`/api/switch/switch/v1/payment-batch/${batchId}/process`, { method: 'POST' });
}

async function runReport(type: string, batchId: string) {
  const endpoints: any = {
    summary: `/api/switch/switch/v1/billing/batches/${batchId}/summary`,
    detail: `/api/switch/switch/v1/billing/batches/${batchId}/detail`,
    history: `/api/switch/switch/v1/billing/batches/${batchId}/history`,
    charge: `/api/switch/switch/v1/billing/batches/${batchId}/charge`,
    receipt: `/api/switch/switch/v1/billing/batches/${batchId}/receipt`,
  };

  return api(endpoints[type]);
}

async function runDownload(type: string, batchId: string) {
  const endpoints: any = {
    'receipt-pdf': `/api/switch/switch/v1/payment-batch/${batchId}/receipt`,
    'billing-novelties': `/api/switch/switch/v1/billing/batches/${batchId}/novelties`,
  };
  const fileNames: any = {
    'receipt-pdf': `recibo_lote_${batchId}.pdf`,
    'billing-novelties': `novedades_${batchId}.csv`,
  };

  await download(endpoints[type], fileNames[type]);
  return fileNames[type];
}

export {
  api,
  download,
  checkServices,
  checkSwitchService,
  login,
  loadAccounts,
  loadTransactions,
  loadBatches,
  loadCharges,
  loadCompanyAccount,
  uploadCsv,
  processBatch,
  runReport,
  runDownload,
};
