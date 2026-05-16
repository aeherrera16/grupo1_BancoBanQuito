function formatMoney(value: any) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

function formatDate(value: any) {
  if (!value) return 'Sin fecha';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('es-EC', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function statusClass(value: any) {
  const normalized = String(value || '').toUpperCase();
  if (['ACTIVO', 'COMPLETADA', 'SUCCESS', 'PROCESADO', 'APROBADO'].some((item) => normalized.includes(item))) {
    return 'is-success';
  }
  if (['ERROR', 'RECHAZ', 'REJECT', 'FALL', 'BLOQUEADO', 'INACTIVO'].some((item) => normalized.includes(item))) {
    return 'is-danger';
  }
  return 'is-neutral';
}

function compactAccount(value: any) {
  const text = String(value || 'N/D');
  return text.length > 4 ? `**** ${text.slice(-4)}` : text;
}

function movementClass(value: any) {
  return String(value || '').toUpperCase().includes('CREDITO') ? 'is-credit' : 'is-debit';
}

function shortId(value: any) {
  const text = String(value || 'N/D');
  return text.length > 14 ? `${text.slice(0, 8)}...${text.slice(-4)}` : text;
}

function escapeHtml(value: any) {
  const str = String(value ?? '');
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function setMessage(element: any, text: string, type = '') {
  element.textContent = text || '';
  element.classList.toggle('is-error', type === 'error');
  element.classList.toggle('is-success', type === 'success');
}

export {
  formatMoney,
  formatDate,
  statusClass,
  compactAccount,
  movementClass,
  shortId,
  escapeHtml,
  setMessage,
};
