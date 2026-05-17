import './styles.css';
import { checkServices, checkSwitchService } from './services/api';
import { restoreSession as restoreSessionHook, getState, setState } from './hooks/useState';
import { login, logout, showDashboard, activateSection, renderProfile, refreshAll } from './pages/LoginPage';
import { loadAccounts, renderAccounts } from './pages/AccountsPage';
import { loadTransactions, renderTransactions } from './pages/TransactionsPage';
import { loadBatches, uploadCsvHandler, processBatchHandler, refreshCompanyData } from './pages/PaymentsPage';
import { runReportHandler, runDownloadHandler, renderBatchPreview, currentBatch, syncReportBatchOptions } from './pages/ReportsPage';
import { filterVisibleRows } from './pages/DashboardPage';
import { loadSftpBatches, uploadScheduledCsvHandler, updateScheduleSummary } from './pages/SftpPage';

const $ = (selector: string): any => document.querySelector(selector);
const $$ = (selector: string): any[] => Array.from(document.querySelectorAll(selector));

if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

let sftpAutoRefreshTimer: ReturnType<typeof setInterval> | null = null;

function startSftpAutoRefresh() {
  stopSftpAutoRefresh();
  sftpAutoRefreshTimer = setInterval(() => loadSftpBatches(true), 3000);
}

function stopSftpAutoRefresh() {
  if (sftpAutoRefreshTimer !== null) {
    clearInterval(sftpAutoRefreshTimer);
    sftpAutoRefreshTimer = null;
  }
}

async function checkServicesStatus() {
  const { coreUserId, coreStatus } = await checkServices();
  setState({ coreUserId });
  $('#coreStatus').textContent = coreStatus;
  const portalCoreStatus = $('#portalCoreStatus');
  if (portalCoreStatus) portalCoreStatus.textContent = coreStatus;

  const switchStatus = await checkSwitchService();
  $('#switchStatus').textContent = switchStatus;
}

async function activateSectionWithData(section: string) {
  stopSftpAutoRefresh();
  activateSection(section);
  if (section === 'transactions') {
    await loadTransactions();
  }
  if (section === 'payments' || section === 'reports') {
    await refreshCompanyData();
    if (section === 'reports') syncReportBatchOptions();
  }
  if (section === 'sftp') {
    await loadSftpBatches();
    startSftpAutoRefresh();
  }
}

function restoreSession() {
  const restored = restoreSessionHook();
  if (restored) {
    showDashboard();
    refreshAll();
  }
}

function bindEvents() {
  $('#loginForm').addEventListener('submit', login);
  $('#logoutButton').addEventListener('click', logout);
  $('#refreshButton').addEventListener('click', async () => {
    await refreshAll();
    const activeSection = $('.nav-item.is-active')?.dataset.section;
    if (activeSection === 'transactions') {
      await loadTransactions();
    }
    if (activeSection === 'payments' || activeSection === 'reports') {
      await refreshCompanyData();
      if (activeSection === 'reports') syncReportBatchOptions();
    }
    if (activeSection === 'sftp') {
      await loadSftpBatches();
    }
  });
  $('#globalSearch').addEventListener('input', (event: any) => filterVisibleRows(event.target.value));
  $('#uploadForm').addEventListener('submit', uploadCsvHandler);
  $('#loadBatchesButton').addEventListener('click', loadBatches);
  $('#batchSelector').addEventListener('change', () => renderBatchPreview(currentBatch()));
  $('#csvFile').addEventListener('change', (event: any) => {
    $('#fileName').textContent = event.target.files[0]?.name || 'Seleccionar CSV';
  });

  $('#sftpUploadForm').addEventListener('submit', uploadScheduledCsvHandler);
  $('#loadSftpBatchesButton').addEventListener('click', loadSftpBatches);
  $('#sftpScheduledDate').addEventListener('input', updateScheduleSummary);
  // File selection is handled via SFTP client; form only schedules execution of existing files in the buzón.

  $$('.nav-item').forEach((button: any) => {
    button.addEventListener('click', () => activateSectionWithData(button.dataset.section));
  });

  $$('[data-section-shortcut]').forEach((button: any) => {
    button.addEventListener('click', () => activateSectionWithData(button.dataset.sectionShortcut));
  });

  document.addEventListener('click', (event: any) => {
    const processButton = event.target.closest('[data-process]');
    if (processButton) processBatchHandler(processButton.dataset.process);

    const reportButton = event.target.closest('[data-report]');
    if (reportButton) runReportHandler(reportButton.dataset.report);

    const downloadButton = event.target.closest('[data-download]');
    if (downloadButton) runDownloadHandler(downloadButton.dataset.download);

    const refreshReportsButton = event.target.closest('[data-refresh-reports]');
    if (refreshReportsButton) loadBatches();

    const comingSoonButton = event.target.closest('[data-feature-coming-soon]');
    if (comingSoonButton) alert('Estamos trabajando para tu futuro');
  });
}

bindEvents();
checkServicesStatus();
restoreSession();
