import { loadAccounts as loadAccountsApi } from '../services/api';
import { getState, setState } from '../hooks/useState';
import { formatMoney, statusClass, escapeHtml, setMessage } from '../helpers/formatters';

const $ = (selector: string): any => document.querySelector(selector);

async function loadAccounts() {
  const state = getState();
  if (!state.session?.customerId) return;

  try {
    const accounts = await loadAccountsApi(state.session.customerId, state.coreUserId || 1);
    setState({ accounts });
  } catch (error: any) {
    setState({ accounts: [] });
    $('#accountsTable').innerHTML = `<div class="empty-state">${escapeHtml(error.message)}</div>`;
  }

  renderAccounts();
}

function renderAccounts() {
  const state = getState();
  $('#accountsMetric').textContent = state.accounts.length;
  const totalAvailable = state.accounts.reduce((sum: number, account: any) => sum + Number(account.availableBalance || 0), 0);
  $('#balanceMetric').textContent = formatMoney(totalAvailable);
  renderDashboardAccounts();

  const container = $('#accountsTable');
  if (!container) return;

  if (!state.accounts.length) {
    container.innerHTML = '<div class="empty-state">No hay cuentas disponibles para este cliente.</div>';
    return;
  }

  const rows = state.accounts
    .map((account: any) => `
      <tr>
        <td><strong>${escapeHtml(account.accountNumber || 'Sin numero')}</strong></td>
        <td>${escapeHtml(account.accountSubtypeDescription || 'Cuenta')}</td>
        <td>${formatMoney(account.accountingBalance)}</td>
        <td><strong class="amount-highlight" style="color: #02745c; font-size: 15px;">${formatMoney(account.availableBalance)}</strong></td>
        <td><span class="badge ${statusClass(account.status)}">${escapeHtml(account.status || 'N/D')}</span></td>
        <td>${escapeHtml(account.branchName || 'N/D')}</td>
        <td>${account.openingDate ? escapeHtml(String(account.openingDate).split('T')[0]) : 'N/D'}</td>
      </tr>
    `)
    .join('');

  container.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Número de Cuenta</th>
          <th>Tipo de Cuenta</th>
          <th>Saldo Contable</th>
          <th>Saldo Disponible</th>
          <th>Estado</th>
          <th>Agencia</th>
          <th>Fecha de Apertura</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function renderDashboardAccounts() {
  const state = getState();
  const container = $('#dashboardAccounts');
  if (!container) return;

  if (!state.accounts.length) {
    container.innerHTML = '<div class="empty-state">No hay cuentas disponibles para este cliente.</div>';
    return;
  }

  container.innerHTML = state.accounts
    .slice(0, 3)
    .map((account: any) => `
      <article class="dashboard-account-card">
        <span>${escapeHtml(account.accountSubtypeDescription || 'Cuenta')}</span>
        <strong>${escapeHtml(account.accountNumber || 'Sin numero')}</strong>
        <div>
          <small>Disponible</small>
          <b>${formatMoney(account.availableBalance)}</b>
        </div>
        <em class="badge ${statusClass(account.status)}">${escapeHtml(account.status || 'N/D')}</em>
      </article>
    `)
    .join('');
}

export {
  loadAccounts,
  renderAccounts,
  renderDashboardAccounts,
};
