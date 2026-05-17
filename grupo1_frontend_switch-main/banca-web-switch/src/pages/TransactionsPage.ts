import { loadTransactions as loadTransactionsApi } from '../services/api';
import { getState, setState } from '../hooks/useState';
import { formatMoney, statusClass, movementClass, escapeHtml, formatDate } from '../helpers/formatters';

const $ = (selector: string): any => document.querySelector(selector);

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
  const metric = $('#transactionsMetric');
  if (metric) metric.textContent = state.transactions.length;
  const recent = $('#recentTransactions');
  const table = $('#transactionsTable');

  if (!state.transactions.length) {
    const empty = '<div class="empty-state">Sin transacciones registradas.</div>';
    if (recent) recent.innerHTML = empty;
    table.innerHTML = empty;
    return;
  }

  const rows = state.transactions
    .map((transaction: any) => `
    <tr>
      <td>${escapeHtml(transaction.accountNumber || 'N/D')}</td>
      <td><span class="badge ${movementClass(transaction.movementType)}">${escapeHtml(transaction.movementType || 'N/D')}</span></td>
      <td>${formatMoney(transaction.amount)}</td>
      <td>${formatMoney(transaction.resultingBalance)}</td>
      <td><span class="badge ${statusClass(transaction.status)}">${escapeHtml(transaction.status || 'N/D')}</span></td>
      <td>${formatDate(transaction.transactionDate)}</td>
      <td>${escapeHtml(transaction.message || 'N/D')}</td>
      <td><span title="${escapeHtml(transaction.transactionUuid || 'N/D')}">${escapeHtml(shortId(transaction.transactionUuid))}</span></td>
    </tr>
  `)
    .join('');

  const markup = `
    <table>
      <thead>
        <tr>
          <th>Cuenta</th>
          <th>Movimiento</th>
          <th>Monto</th>
          <th>Saldo resultante</th>
          <th>Estado</th>
          <th>Fecha</th>
          <th>Descripcion</th>
          <th>UUID</th>
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
};
