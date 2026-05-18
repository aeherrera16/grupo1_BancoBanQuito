import { loadBatches as loadBatchesApi, loadCharges as loadChargesApi, loadCompanyAccount as loadCompanyAccountApi, uploadCsv, processBatch } from '../services/api';
import { getState, setState } from '../hooks/useState';
import { formatMoney, statusClass, escapeHtml, setMessage, compactAccount, formatDate } from '../helpers/formatters';
import { syncReportBatchOptions } from './ReportsPage';

const $ = (selector: string): any => document.querySelector(selector);

function resolveCompanyAccountFallback() {
  const state = getState();
  const favorite = state.accounts.find((account: any) => account.isFavorite);
  return favorite?.accountNumber || state.accounts[0]?.accountNumber || null;
}

async function loadBatches() {
  const state = getState();
  if (state.customerType !== 'JURIDICO') return;

  try {
    const batches = await loadBatchesApi();
    const companyRuc = state.session?.identification;
    const filtered = batches.filter((b: any) => !companyRuc || b.ruc === companyRuc);
    setState({ batches: filtered, paymentBatches: filtered });
  } catch (error: any) {
    setState({ batches: [], paymentBatches: [] });
    $('#batchesTable').innerHTML = `<div class="empty-state">${escapeHtml(error.message)}</div>`;
  }

  renderBatches();

  const table = document.getElementById('batchesTable');
  if (table) {
    table.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

async function loadCharges() {
  const state = getState();
  if (state.customerType !== 'JURIDICO') return;

  try {
    const charges = await loadChargesApi();
    setState({ charges });
  } catch (error) {
    setState({ charges: [] });
  }
  const chargesMetric = $('#chargesMetric');
  if (chargesMetric) chargesMetric.textContent = getState().charges.length;
}

async function loadCompanyAccount() {
  const state = getState();
  if (state.customerType !== 'JURIDICO') return;

  try {
    const companyAccount = await loadCompanyAccountApi();
    setState({ companyAccount });
  } catch (error) {
    setState({ companyAccount: resolveCompanyAccountFallback() });
  }

  const currentState = getState();
  if (!currentState.companyAccount) {
    setState({ companyAccount: resolveCompanyAccountFallback() });
  }

  const value = compactAccount(getState().companyAccount);
  const companyAccountMetric = $('#companyAccountMetric');
  if (companyAccountMetric) companyAccountMetric.textContent = value;
  $('#companyAccountHero').textContent = value;
}

function renderBatches() {
  const state = getState();
  const batchesMetric = $('#batchesMetric');
  const paymentBatches = state.paymentBatches || [];
  if (batchesMetric) batchesMetric.textContent = paymentBatches.length;
  const table = $('#batchesTable');
  const recent = $('#recentBatches');

  if (!paymentBatches.length) {
    const empty = '<div class="empty-state">Sin lotes cargados todavia.</div>';
    table.innerHTML = empty;
    if (recent) recent.innerHTML = empty;
    return;
  }

  const companyRuc = state.session?.identification;
  const rows = paymentBatches
    .slice()
    .filter((batch: any) => !batch.channel || !(batch.channel + '').toLowerCase().includes('sftp'))
    .filter((batch: any) => !companyRuc || batch.ruc === companyRuc)
    .filter((batch: any) => !['PROGRAMADO', 'SCHEDULED'].includes((batch.status || '').toUpperCase()))
    .sort((a: any, b: any) => (b.id || 0) - (a.id || 0))
    .map((batch: any) => `
      <tr>
        <td>${escapeHtml(batch.id || 'N/D')}</td>
        <td>${escapeHtml(batch.fileName || 'Archivo CSV')}</td>
        <td>${escapeHtml(batch.ruc || 'N/D')}</td>
        <td><span class="badge ${statusClass(batch.status)}">${escapeHtml(batch.status || 'N/D')}</span></td>
        <td>${escapeHtml(batch.headerTotalRecords || 0)}</td>
        <td>${formatMoney(batch.headerTotalAmount)}</td>
        <td>${formatDate(batch.receivedAt)}</td>

      </tr>
    `)
    .join('');

  const markup = `
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Archivo</th>
          <th>RUC</th>
          <th>Estado</th>
          <th>Registros</th>
          <th>Monto</th>
          <th>Recibido</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;

  table.innerHTML = markup;
  if (recent) recent.innerHTML = `<div class="table-wrap compact-table">${markup}</div>`;
  syncReportBatchOptions();
}

const TERMINAL_STATUSES = ['PROCESADO', 'PROCESSED', 'REJECTED', 'RECHAZADO'];

function pollBatchUntilDone(uploadMessage: any, batchId: number) {
  let attempts = 0;
  const timer = setInterval(async () => {
    attempts++;
    try {
      await refreshCompanyData();
      const batch = getState().batches.find((b: any) => Number(b.id) === batchId);
      const status = (batch?.status || '').toUpperCase();
      if (batch && TERMINAL_STATUSES.includes(status)) {
        clearInterval(timer);
        const isOk = ['PROCESADO', 'PROCESSED'].includes(status);
        setMessage(uploadMessage, `Procesamiento completado. Estado final: ${batch.status}`, isOk ? 'success' : 'error');
        return;
      }
    } catch (_) {}
    if (attempts >= 40) {
      clearInterval(timer);
      setMessage(uploadMessage, 'El procesamiento está tomando más tiempo del esperado. Actualiza la lista manualmente.', 'error');
    }
  }, 2000);
}

async function uploadCsvHandler(event: SubmitEvent) {
  event.preventDefault();
  const uploadMessage = $('#uploadMessage');
  const state = getState();

  if (state.customerType !== 'JURIDICO') {
    setMessage(uploadMessage, 'Solo clientes juridicos pueden enviar pagos masivos.', 'error');
    return;
  }

  const file = $('#csvFile').files[0];
  if (!file) {
    setMessage(uploadMessage, 'Selecciona un archivo CSV.', 'error');
    return;
  }

  setMessage(uploadMessage, 'Enviando archivo de pagos...');
  try {
    const response = await uploadCsv(file);
    await refreshCompanyData();

    const batchId = Number(response.batchId);
    const batchStatus = (response.batchStatus || '').toUpperCase();

    if (TERMINAL_STATUSES.includes(batchStatus)) {
      const isOk = ['PROCESADO', 'PROCESSED'].includes(batchStatus);
      setMessage(uploadMessage, `Resultado: ${response.validationResult || 'procesado'} | Estado: ${response.batchStatus}`, isOk ? 'success' : 'error');
    } else {
      setMessage(uploadMessage, `Lote recibido. Procesando pagos automáticamente... ⏳`);
      pollBatchUntilDone(uploadMessage, batchId);
    }
  } catch (error: any) {
    setMessage(uploadMessage, error.message || 'No se pudo cargar el CSV.', 'error');
  }
}

async function processBatchHandler(batchId: string) {
  const state = getState();
  if (state.customerType !== 'JURIDICO') return;

  try {
    const response = await processBatch(batchId);
    $('#reportOutput').textContent = typeof response === 'string' ? response : JSON.stringify(response, null, 2);
    await refreshCompanyData();
  } catch (error: any) {
    $('#reportOutput').textContent = error.message;
  }
}

async function refreshCompanyData() {
  const state = getState();
  if (state.customerType !== 'JURIDICO') return;
  await Promise.all([loadBatches(), loadCharges(), loadCompanyAccount()]);
}

export {
  loadBatches,
  loadCharges,
  loadCompanyAccount,
  renderBatches,
  uploadCsvHandler,
  processBatchHandler,
  refreshCompanyData,
};
