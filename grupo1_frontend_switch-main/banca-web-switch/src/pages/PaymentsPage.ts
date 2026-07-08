import { loadBatches as loadBatchesApi, loadCharges as loadChargesApi, loadBatchDetail, loadCompanyAccount as loadCompanyAccountApi, uploadCsv, processBatch } from '../services/api';
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

// La API devuelve el estado de cada linea ya traducido (p.ej. "Exitoso", "Rechazado"),
// no las claves del enum en ingles, por eso se compara por contenido en vez de igualdad exacta.
function isSuccessDetail(status: any) {
  const s = (status || '').toString().toUpperCase();
  return s.includes('EXITO') || s === 'SUCCESS';
}
function isRejectedDetail(status: any) {
  const s = (status || '').toString().toUpperCase();
  return s.includes('RECHAZ') || s === 'REJECTED';
}

function formatElapsed(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function renderLiveDetail(details: any[]) {
  const total = details.length;
  const success = details.filter((d: any) => isSuccessDetail(d.status)).length;
  const rejected = details.filter((d: any) => isRejectedDetail(d.status)).length;
  const done = success + rejected;

  const countsEl = $('#uploadCounts');
  if (countsEl) countsEl.textContent = `${done} / ${total} procesadas (${success} exitosas, ${rejected} rechazadas)`;

  const barEl = $('#uploadProgressBar');
  if (barEl) barEl.style.width = total ? `${Math.round((done / total) * 100)}%` : '0%';

  const rowsEl = $('#uploadLiveRows');
  if (!rowsEl) return;

  const recentResolved = details
    .filter((d: any) => isSuccessDetail(d.status) || isRejectedDetail(d.status))
    .slice(-15)
    .reverse();

  if (!recentResolved.length) {
    rowsEl.innerHTML = '<div class="empty-state">Analizando líneas del archivo...</div>';
    return;
  }

  rowsEl.innerHTML = `
    <table>
      <thead>
        <tr><th>Línea</th><th>Cuenta destino</th><th>Monto</th><th>Estado</th></tr>
      </thead>
      <tbody>
        ${recentResolved.map((d: any) => `
          <tr>
            <td>${escapeHtml(d.lineNumber)}</td>
            <td>${escapeHtml(d.destinationAccountNumber)}</td>
            <td>${formatMoney(d.amount)}</td>
            <td><span class="badge ${statusClass(d.status)}">${escapeHtml(d.status)}</span></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function pollBatchUntilDone(uploadMessage: any, batchId: number) {
  const panel = $('#uploadProgressPanel');
  const timerEl = $('#uploadTimer');
  panel?.classList.remove('is-hidden');
  if (timerEl) timerEl.textContent = '00:00';

  const startTime = Date.now();
  const timerInterval = setInterval(() => {
    if (timerEl) timerEl.textContent = formatElapsed(Date.now() - startTime);
  }, 1000);

  let attempts = 0;
  const poll = setInterval(async () => {
    attempts++;
    try {
      const [details] = await Promise.all([loadBatchDetail(batchId), refreshCompanyData()]);
      renderLiveDetail(details);

      const batch = getState().batches.find((b: any) => Number(b.id) === batchId);
      const status = (batch?.status || '').toUpperCase();
      if (batch && TERMINAL_STATUSES.includes(status)) {
        clearInterval(poll);
        clearInterval(timerInterval);
        const elapsed = formatElapsed(Date.now() - startTime);
        if (timerEl) timerEl.textContent = elapsed;
        const isOk = ['PROCESADO', 'PROCESSED'].includes(status);
        setMessage(uploadMessage, `Procesamiento completado en ${elapsed}. Estado final: ${batch.status}`, isOk ? 'success' : 'error');
        return;
      }
    } catch (_) {}
    if (attempts >= 600) {
      clearInterval(poll);
      clearInterval(timerInterval);
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

  const progressPanel = $('#uploadProgressPanel');
  progressPanel?.classList.add('is-hidden');
  const liveRows = $('#uploadLiveRows');
  if (liveRows) liveRows.innerHTML = '';
  const countsEl = $('#uploadCounts');
  if (countsEl) countsEl.textContent = '0 / 0 procesadas';
  const barEl = $('#uploadProgressBar');
  if (barEl) barEl.style.width = '0%';

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
