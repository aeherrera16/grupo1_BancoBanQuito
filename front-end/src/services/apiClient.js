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

// === CUSTOMER ENDPOINTS ===

export async function getCustomerByIdentification(type, number) {
  return coreRequest(`/core/v1/customers/identification/${type}/${number}`);
}

export async function getCustomerById(id) {
  return coreRequest(`/core/v1/customers/${id}`);
}

export async function createCustomer(data) {
  return coreRequest('/core/v1/customers', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getCustomerSubtypes() {
  return coreRequest('/core/v1/customers/subtypes');
}

// === BRANCH & ACCOUNT SUBTYPE ENDPOINTS ===

export async function getBranches() {
  return coreRequest('/core/v1/branches');
}

export async function getAccountSubtypes() {
  return coreRequest('/core/v1/accounts/subtypes');
}

// === ACCOUNT ENDPOINTS ===

export async function getAccountsByCustomerId(customerId) {
  return coreRequest(`/core/v1/accounts/customer/${customerId}`);
}

export async function getAccountByNumber(accountNumber) {
  return coreRequest(`/core/v1/accounts/${accountNumber}`);
}

export async function createAccount(data) {
  return coreRequest('/core/v1/accounts', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function changeAccountStatus(accountNumber, action) {
  return coreRequest(`/core/v1/accounts/${accountNumber}/${action}`, {
    method: 'PATCH',
  });
}

export async function getTransactions(accountNumber) {
  return coreRequest(`/core/v1/accounts/${accountNumber}/transactions`);
}

export async function getFavoriteAccount() {
  return coreRequest('/core/v1/accounts/default/favorite');
}

export async function setFavoriteAccount(accountNumber) {
  return coreRequest(`/core/v1/accounts/${accountNumber}/set-favorite`, {
    method: 'PATCH',
  });
}

// === TRANSACTION ENDPOINTS (Legacy/Core) ===

export async function debit(accountNumber, amount) {
  return coreRequest(`/core/v1/accounts/${accountNumber}/debit`, {
    method: 'POST',
    body: JSON.stringify({ amount }),
  });
}

export async function credit(accountNumber, amount) {
  return coreRequest(`/core/v1/accounts/${accountNumber}/credit`, {
    method: 'POST',
    body: JSON.stringify({ amount }),
  });
}

export async function transfer(origin, destination, amount, uuid) {
  return coreRequest('/core/v1/accounts/transfer', {
    method: 'POST',
    body: JSON.stringify({ origin, destination, amount, uuid }),
  });
}

// === NOTIFICATION ENDPOINTS ===

export async function getNotifications(userId) {
  return coreRequest(`/core/v1/notifications/user/${userId}`);
}

export async function markNotificationAsRead(id) {
  return coreRequest(`/core/v1/notifications/${id}/read`, {
    method: 'PUT',
  });
}

// === CREDENTIALS ENDPOINTS ===

export async function createWebCredential(data) {
  return coreRequest('/core/v1/auth/customers/credentials', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// === HOLIDAY ENDPOINTS ===

export async function getHolidays() {
  return coreRequest('/core/v1/holidays');
}

export async function createHoliday(data) {
  return coreRequest('/core/v1/holidays', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deleteHoliday(date) {
  return coreRequest(`/core/v1/holidays/${date}`, {
    method: 'DELETE',
  });
}

export async function isBusinessDay(date) {
  return coreRequest(`/core/v1/holidays/business-day?date=${date}`);
}

// === PAYMENT BATCH ENDPOINTS (SWITCH) ===

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

export async function getPaymentBatches() {
  return parseResponse(await fetch(`${switchBaseUrl}/api/payment-batch`));
}

export async function getBatchDetails(batchId) {
  return parseResponse(await fetch(`${switchBaseUrl}/api/billing/batches/${batchId}/summary`));
}

async function downloadBlobFile(url, filename) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Error descargando archivo: ${response.statusText}`);

  const blob = await response.blob();
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

export async function downloadComprobante(batchId) {
  await downloadBlobFile(
    `${switchBaseUrl}/api/billing/batches/${batchId}/download/comprobante`,
    `comprobante-${batchId}.pdf`
  );
}

export async function downloadNovedades(batchId) {
  await downloadBlobFile(
    `${switchBaseUrl}/api/billing/batches/${batchId}/download/novedades`,
    `novedades-${batchId}.xlsx`
  );
}

// === SFTP ENDPOINTS ===

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
      method: 'GET',
    }),
  );
}
