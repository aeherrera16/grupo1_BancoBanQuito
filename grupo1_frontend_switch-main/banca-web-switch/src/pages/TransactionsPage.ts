import { loadTransactions as loadTransactionsApi } from '../services/api';
import { getState, setState } from '../hooks/useState';
import { formatMoney, statusClass, movementClass, escapeHtml, formatDate } from '../helpers/formatters';

const $ = (selector: string): any => document.querySelector(selector);

let dateFilter: { from: string | null; to: string | null } = { from: null, to: null };

function applyTransactionsFilter() {
  const fromInput = $('#transactionsFromDate');
  const toInput = $('#transactionsToDate');
  dateFilter = {
    from: fromInput?.value || null,
    to: toInput?.value || null,
  };
  renderTransactions();
}

function clearTransactionsFilter() {
  const fromInput = $('#transactionsFromDate');
  const toInput = $('#transactionsToDate');
  if (fromInput) fromInput.value = '';
  if (toInput) toInput.value = '';
  dateFilter = { from: null, to: null };
  renderTransactions();
}

function filterByDate(transactions: any[]) {
  if (!dateFilter.from && !dateFilter.to) return transactions;

  const fromTime = dateFilter.from ? new Date(`${dateFilter.from}T00:00:00`).getTime() : null;
  const toTime = dateFilter.to ? new Date(`${dateFilter.to}T23:59:59.999`).getTime() : null;

  return transactions.filter((transaction: any) => {
    const raw = transaction.transactionDate;
    if (!raw) return false;
    const time = new Date(raw).getTime();
    if (Number.isNaN(time)) return false;
    if (fromTime !== null && time < fromTime) return false;
    if (toTime !== null && time > toTime) return false;
    return true;
  });
}

async function loadTransactions() {
  const state = getState();
  if (!state.session?.customerId) return;

  try {
    const transactions = await loadTransactionsApi(state.session.customerId, state.coreUserId || 1);
    setState({ transactions });
  } catch (error: any) {
    setState({ transactions: [] });
    $('#transactionsTable').innerHTML = `<div class="empty-state">${escapeHtml(error.message)}</div>`;
  }

  renderTransactions();
}

function renderTransactions() {
  const state = getState();
  const filtered = filterByDate(state.transactions || []);
  const metric = $('#transactionsMetric');
  if (metric) metric.textContent = state.transactions.length;
  const recent = $('#recentTransactions');
  const table = $('#transactionsTable');

  if (!filtered.length) {
    const empty = state.transactions.length
      ? '<div class="empty-state">Sin movimientos en el periodo seleccionado.</div>'
      : '<div class="empty-state">Sin transacciones registradas.</div>';
    table.innerHTML = empty;
    if (recent && !state.transactions.length) recent.innerHTML = empty;
    return;
  }

  const statusLabel = (s: string) => {
    const up = (s || '').toUpperCase();
    if (up === 'COMPLETADA') return 'Exitoso';
    if (up === 'RECHAZADA') return 'Rechazado';
    return s || 'N/D';
  };

  const rows = filtered
    .map((transaction: any) => {
      const isDebit = (transaction.movementType || '').toUpperCase() === 'DEBITO';
      const counterpart = transaction.counterpartAccountNumber || '—';
      return `
      <tr>
        <td>${isDebit ? escapeHtml(transaction.accountNumber || 'N/D') : escapeHtml(counterpart)}</td>
        <td>${!isDebit ? escapeHtml(transaction.accountNumber || 'N/D') : escapeHtml(counterpart)}</td>
        <td><span class="badge ${movementClass(transaction.movementType)}">${escapeHtml(transaction.movementType || 'N/D')}</span></td>
        <td>${formatMoney(transaction.amount)}</td>
        <td>${formatMoney(transaction.resultingBalance)}</td>
        <td><span class="badge ${statusClass(transaction.status)}">${escapeHtml(statusLabel(transaction.status))}</span></td>
        <td>${formatDate(transaction.transactionDate)}</td>
        <td>${escapeHtml(transaction.message || 'N/D')}</td>
      </tr>
    `})
    .join('');

  const markup = `
    <table>
      <thead>
        <tr>
          <th>Cuenta Origen</th>
          <th>Cuenta Destino</th>
          <th>Movimiento</th>
          <th>Monto</th>
          <th>Saldo resultante</th>
          <th>Estado</th>
          <th>Fecha</th>
          <th>Descripcion</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;

  table.innerHTML = markup;
  if (recent) recent.innerHTML = `<div class="table-wrap compact-table">${markup}</div>`;
}

function shortId(value: any) {
  const text = String(value || 'N/D');
  return text.length > 14 ? `${text.slice(0, 8)}...${text.slice(-4)}` : text;
}

export {
  loadTransactions,
  renderTransactions,
  applyTransactionsFilter,
  clearTransactionsFilter,
};
