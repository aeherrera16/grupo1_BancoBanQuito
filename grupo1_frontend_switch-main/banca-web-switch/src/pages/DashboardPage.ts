import { getState } from '../hooks/useState';

const $ = (selector: string): any => document.querySelector(selector);

function updateDashboardMetrics() {
  const state = getState();
  
  // Update overview metrics
  const totalAvailable = state.accounts.reduce((sum: number, account: any) => sum + Number(account.availableBalance || 0), 0);
  if ($('#balanceMetric')) {
    $('#balanceMetric').textContent = totalAvailable;
  }
  
  // Update company-specific metrics
  if (state.customerType === 'JURIDICO') {
    if ($('#chargesMetric')) {
      $('#chargesMetric').textContent = state.charges.length;
    }
    if ($('#batchesMetric')) {
      $('#batchesMetric').textContent = state.batches.length;
    }
  }
}

function filterVisibleRows(query: string) {
  const normalized = query.trim().toLowerCase();
  document.querySelectorAll('tbody tr, .account-card').forEach((element: any) => {
    const matches = !normalized || element.textContent.toLowerCase().includes(normalized);
    element.classList.toggle('is-filtered', !matches);
  });
}

export {
  updateDashboardMetrics,
  filterVisibleRows,
};
