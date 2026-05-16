import { loadAccounts as loadAccountsApi } from '../services/api';
import { getState, setState } from '../hooks/useState';
import { formatMoney, statusClass, escapeHtml, setMessage } from '../utils/formatters';

const $ = (selector: string): any => document.querySelector(selector);

async function loadAccounts() {
  const state = getState();
  if (!state.session?.customerId) return;

  try {
    const accounts = await loadAccountsApi(state.session.customerId, state.coreUserId || 1);
    setState({ accounts });
  } catch (error: any) {
    setState({ accounts: [] });
    $('#accountsList').innerHTML = `<div class="empty-state">${escapeHtml(error.message)}</div>`;
  }

  renderAccounts();
}

function renderAccounts() {
  const state = getState();
  $('#accountsMetric').textContent = state.accounts.length;
  const totalAvailable = state.accounts.reduce((sum: number, account: any) => sum + Number(account.availableBalance || 0), 0);
  $('#balanceMetric').textContent = formatMoney(totalAvailable);
  renderDashboardAccounts();

  const container = $('#accountsList');
  if (!state.accounts.length) {
    container.innerHTML = '<div class="empty-state">No hay cuentas disponibles para este cliente.</div>';
    return;
  }

  container.innerHTML = state.accounts
    .map((account: any) => `
      <article class="account-card">
        <span>${escapeHtml(account.accountSubtypeDescription || 'Cuenta')}</span>
        <strong>${escapeHtml(account.accountNumber || 'Sin numero')}</strong>
        <dl>
          <div>
            <dt>Disponible</dt>
            <dd>${formatMoney(account.availableBalance)}</dd>
          </div>
          <div>
            <dt>Contable</dt>
            <dd>${formatMoney(account.accountingBalance)}</dd>
          </div>
          <div>
            <dt>Estado</dt>
            <dd><span class="badge ${statusClass(account.status)}">${escapeHtml(account.status || 'N/D')}</span></dd>
          </div>
          <div>
            <dt>Agencia</dt>
            <dd>${escapeHtml(account.branchName || 'N/D')}</dd>
          </div>
        </dl>
      </article>
    `)
    .join('');
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
