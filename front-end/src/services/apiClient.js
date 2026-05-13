const coreBaseUrl = import.meta.env.VITE_CORE_API_URL || 'http://localhost:8080';
const switchBaseUrl = import.meta.env.VITE_SWITCH_API_URL || 'http://localhost:8081';
const sftpBaseUrl = import.meta.env.VITE_SFTP_API_URL || 'http://localhost:8082';

async function parseResponse(response) {
  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message = typeof payload === 'string' ? payload : payload.error || 'Error en la solicitud';
    throw new Error(message);
  }

  return payload;
}

export async function coreRequest(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.coreUserId ? { 'X-Core-User-Id': String(options.coreUserId) } : {}),
    ...options.headers,
  };

  return parseResponse(await fetch(`${coreBaseUrl}${path}`, { ...options, headers }));
}

export async function authCustomer(username, password) {
  return coreRequest('/core/v1/auth/customers/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export async function authCoreUser(username, password) {
  return coreRequest('/core/v1/auth/core-users/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export const fetchBalance = async (accountNumber) => {
  // Se usa el endpoint de accounts con un coreUserId simulado porque el integration controller no tiene CORS habilitado
  return await coreRequest(`/core/v1/accounts/${accountNumber}`, { coreUserId: 1 });
};

export const fetchAccountHistory = async (accountNumber) => {
  return await coreRequest(`/core/v1/accounts/${accountNumber}/transactions`);
};

export async function uploadPaymentBatch(file, channel = 'PORTAL') {
  const body = new FormData();
  body.append('file', file);
  body.append('channel', channel);

  return parseResponse(
    await fetch(`${switchBaseUrl}/api/payment-batch/upload-csv`, {
      method: 'POST',
      body,
    }),
  );
}

export async function fetchPaymentBatches() {
  return parseResponse(await fetch(`${switchBaseUrl}/api/payment-batch`));
}

export async function downloadComprobante(batchId) {
  window.open(`${switchBaseUrl}/api/billing/batches/${batchId}/download/comprobante`, '_blank');
}

export async function downloadNovedades(batchId) {
  window.open(`${switchBaseUrl}/api/billing/batches/${batchId}/download/novedades`, '_blank');
}

export async function uploadSftpMailboxFile(file) {
  const body = new FormData();
  body.append('file', file);

  return parseResponse(
    await fetch(`${sftpBaseUrl}/api/sftp/upload`, {
      method: 'POST',
      body,
    }),
  );
}

export async function checkSftpStatus() {
  return parseResponse(
    await fetch(`${sftpBaseUrl}/api/sftp/status`, {
      method: 'POST',
    }),
  );
}
