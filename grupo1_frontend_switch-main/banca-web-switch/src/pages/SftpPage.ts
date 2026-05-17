import { loadBatches as loadBatchesApi, uploadScheduledCsv } from '../services/api';
import { getState, setState } from '../hooks/useState';
import { formatMoney, statusClass, escapeHtml, setMessage, formatDate } from '../utils/formatters';

const $ = (selector: string): any => document.querySelector(selector);
const $$ = (selector: string): any[] => Array.from(document.querySelectorAll(selector));

async function loadSftpBatches() {
  const state = getState();
  if (state.customerType !== 'JURIDICO') return;

  try {
    const batches = await loadBatchesApi();
    // Filter batches to only show the ones belonging to the logged-in company (RUC)
    const companyRuc = state.session?.identification;
    const filteredBatches = batches.filter((batch: any) => !companyRuc || batch.ruc === companyRuc);
    setState({ sftpBatches: filteredBatches });
  } catch (error: any) {
    setState({ sftpBatches: [] });
    const sftpTable = $('#sftpBatchesTable');
    if (sftpTable) {
      sftpTable.innerHTML = `<div class="empty-state">${escapeHtml(error.message)}</div>`;
    }
  }

  renderSftpBatches();
}

function renderSftpBatches() {
  const state = getState();
  const filtered = state.sftpBatches || [];
  const table = $('#sftpBatchesTable');

  if (!table) return;

  if (!filtered.length) {
    table.innerHTML = '<div class="empty-state">No se encontraron lotes del buzón SFTP.</div>';
    return;
  }

  const rows = filtered
    .slice()
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
        <td>${batch.scheduledDate ? formatDate(batch.scheduledDate) : '<span class="text-muted">Inmediato</span>'}</td>
      </tr>
    `)
    .join('');

  table.innerHTML = `
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
          <th>Ejecución Programada</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

async function uploadScheduledCsvHandler(event: SubmitEvent) {
  event.preventDefault();
  const uploadMessage = $('#sftpUploadMessage');
  const state = getState();

  if (state.customerType !== 'JURIDICO') {
    setMessage(uploadMessage, 'Solo clientes jurídicos pueden programar pagos masivos.', 'error');
    return;
  }

  const file = $('#sftpCsvFile').files[0];
  if (!file) {
    setMessage(uploadMessage, 'Selecciona un archivo CSV.', 'error');
    return;
  }

  const scheduledDateVal = $('#sftpScheduledDate').value;
  if (!scheduledDateVal) {
    setMessage(uploadMessage, 'Selecciona una fecha y hora de efectivización.', 'error');
    return;
  }

  setMessage(uploadMessage, 'Subiendo y programando archivo...');

  try {
    const result = await uploadScheduledCsv(file, scheduledDateVal);
    setMessage(
      uploadMessage,
      `Archivo programado exitosamente. ID: ${result.id || 'N/D'} | Estado: ${result.status || 'PROGRAMADO'}`,
      'success'
    );
    $('#sftpCsvFile').value = '';
    $('#sftpFileName').textContent = 'Seleccionar CSV';
    $('#sftpScheduledDate').value = '';
    
    await loadSftpBatches();
  } catch (error: any) {
    setMessage(uploadMessage, error.message || 'No se pudo subir o programar el archivo.', 'error');
  }
}

export {
  loadSftpBatches,
  renderSftpBatches,
  uploadScheduledCsvHandler
};
