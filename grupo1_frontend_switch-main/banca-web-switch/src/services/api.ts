import { getState } from '../hooks/useState';

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
    await api('/api/core/v1/health');
    return { coreUserId: 1, coreStatus: 'Banca disponible', switchStatus: null };
  } catch (error) {
    return { coreUserId: 1, coreStatus: 'Banca no disponible', switchStatus: null };
  }
}

async function checkSwitchService() {
  try {
    await api('/api/switch/v1/switch/health');
    return 'Pagos disponibles';
  } catch (error) {
    return 'Pagos no disponibles';
  }
}

async function login(username: string, password: string) {
  return api('/api/core/v1/auth/customers/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
}

async function changePassword(username: string, currentPassword: string, newPassword: string) {
  return api('/api/core/v1/auth/customers/change-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, currentPassword, newPassword }),
  });
}

async function loadAccounts(customerId: string, coreUserId: number) {
  return api(`/api/core/v1/accounts/customer/${customerId}`, {
    headers: { 'X-Core-User-Id': String(coreUserId || 1) },
  });
}

async function loadTransactions(customerId: string, coreUserId: number) {
  return api(`/api/core/v1/accounts/customer/${customerId}/transactions`, {
    headers: { 'X-Core-User-Id': String(coreUserId || 1) },
  });
}

async function loadBatches() {
  const state = getState();
  const ruc = state.session?.identification;
  const url = ruc ? `/api/switch/v1/payment-batch?ruc=${encodeURIComponent(ruc)}` : '/api/switch/v1/payment-batch';
  return api(url);
}

async function loadCharges() {
  const response = await api('/api/switch/v1/billing/charges');
  return response.cargos || [];
}

async function loadCompanyAccount() {
  const response = await api('/api/switch/v1/billing/empresa-account');
  return response.cuentaEmpresa || null;
}

async function uploadCsv(file: File) {
  const form = new FormData();
  form.append('file', file);
  form.append('channel', 'PORTAL');

  const state = getState();
  const session = state.session;
  if (session && session.identification) {
    form.append('ruc', session.identification);
  }

  return api('/api/switch/v1/payment-batch/upload-csv', {
    method: 'POST',
    body: form,
  });
}

async function uploadScheduledCsv(file: File, scheduledDate: string) {
  const form = new FormData();
  form.append('file', file);
  form.append('channel', 'SFTP');

  const state = getState();
  const session = state.session;
  if (session && session.identification) {
    form.append('ruc', session.identification);
  }

  if (scheduledDate) {
    form.append('scheduledDate', scheduledDate + ':00');
  }

  return api('/api/switch/v1/payment-batch/upload-csv', {
    method: 'POST',
    body: form,
  });
}

async function processBatch(batchId: string) {
  return api(`/api/switch/v1/payment-batch/${batchId}/process`, { method: 'POST' });
}

async function runReport(type: string, batchId: string) {
  const endpoints: any = {
    summary: `/api/switch/v1/billing/batches/${batchId}/summary`,
    detail: `/api/switch/v1/billing/batches/${batchId}/detail`,
    history: `/api/switch/v1/billing/batches/${batchId}/history`,
    charge: `/api/switch/v1/billing/batches/${batchId}/charge`,
    receipt: `/api/switch/v1/billing/batches/${batchId}/receipt`,
  };

  return api(endpoints[type]);
}

async function runDownload(type: string, batchId: string) {
  const endpoints: any = {
    'receipt-pdf': `/api/switch/v1/payment-batch/${batchId}/receipt`,
    'billing-novelties': `/api/switch/v1/billing/batches/${batchId}/novelties`,
  };
  const fileNames: any = {
    'receipt-pdf': `recibo_lote_${batchId}.pdf`,
    'billing-novelties': `novedades_${batchId}.csv`,
  };

  await download(endpoints[type], fileNames[type]);
  return fileNames[type];
}

async function scheduleQueuedBatches(scheduledDate: string) {
  const state = getState();
  const ruc = state.session?.identification || '';

  // YYYY-MM-DDTHH:MM -> YYYY-MM-DDTHH:MM:00
  const formattedDate = scheduledDate.includes(':') && scheduledDate.split(':').length === 2
    ? scheduledDate + ':00'
    : scheduledDate;

  return api(`/api/switch/v1/payment-batch/schedule-queued?scheduledDate=${encodeURIComponent(formattedDate)}&ruc=${encodeURIComponent(ruc)}`, {
    method: 'POST',
  });
}

export {
  api,
  download,
  checkServices,
  checkSwitchService,
  login,
  changePassword,
  loadAccounts,
  loadTransactions,
  loadBatches,
  loadCharges,
  loadCompanyAccount,
  uploadCsv,
  uploadScheduledCsv,
  scheduleQueuedBatches,
  processBatch,
  runReport,
  runDownload,
};

