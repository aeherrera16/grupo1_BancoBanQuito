import { loadBatches as loadBatchesApi, uploadScheduledCsv } from '../services/api';
import { getState, setState } from '../hooks/useState';
import { formatMoney, statusClass, escapeHtml, setMessage, formatDate } from '../helpers/formatters';

const $ = (selector: string): any => document.querySelector(selector);

async function loadSftpBatches() {
  const state = getState();
  if (state.customerType !== 'JURIDICO') return;

  try {
    const batches = await loadBatchesApi();

    const companyRuc = state.session?.identification;
    const filteredBatches = batches.filter(
      (batch: any) => !companyRuc || batch.ruc === companyRuc
    );
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
    table.innerHTML = `
      <div class="empty-state">
        <strong>No hay archivos en el buzón.</strong>
        <br><small>Cuando subas un CSV via SFTP o programes un lote, aparecerá aquí con su estado.</small>
      </div>`;
    return;
  }

  const pending = filtered.filter((b: any) =>
    ['PROGRAMADO', 'PENDIENTE', 'SCHEDULED', 'PENDING', 'RECIBIDO'].includes((b.status || '').toUpperCase())
  );
  const others = filtered.filter((b: any) =>
    !['PROGRAMADO', 'PENDIENTE', 'SCHEDULED', 'PENDING', 'RECIBIDO'].includes((b.status || '').toUpperCase())
  );

  const sorted = [
    ...pending.sort((a: any, b: any) =>
      new Date(a.scheduledDate || a.receivedAt).getTime() -
      new Date(b.scheduledDate || b.receivedAt).getTime()
    ),
    ...others.sort((a: any, b: any) => (b.id || 0) - (a.id || 0)),
  ];

  const rows = sorted
    .map((batch: any) => {
      const isPending = ['PROGRAMADO', 'PENDIENTE', 'SCHEDULED', 'PENDING', 'RECIBIDO'].includes(
        (batch.status || '').toUpperCase()
      );
      return `
        <tr${isPending ? ' class="row-pending"' : ''}>
          <td>${escapeHtml(String(batch.id || 'N/D'))}</td>
          <td>${escapeHtml(batch.fileName || 'archivo.csv')}</td>
          <td><span class="badge ${statusClass(batch.status)}">${escapeHtml(batch.status || 'N/D')}</span></td>
          <td>${escapeHtml(String(batch.headerTotalRecords || 0))}</td>
          <td>${formatMoney(batch.headerTotalAmount)}</td>
          <td>${formatDate(batch.receivedAt)}</td>
          <td>
            ${batch.scheduledDate
              ? `<span class="badge badge-info">📅 ${formatDate(batch.scheduledDate)}</span>`
              : '<span class="text-muted">Inmediato</span>'}
          </td>
        </tr>
      `;
    })
    .join('');

  table.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Archivo</th>
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

  setMessage(uploadMessage, '⏳ Programando lote...');

  try {
    const result = await uploadScheduledCsv(file, scheduledDateVal);
    setMessage(
      uploadMessage,
      `✅ Lote programado exitosamente. ID: ${result.id || 'N/D'} — se procesará el ${scheduledDateVal.replace('T', ' ')}`,
      'success'
    );
    $('#sftpCsvFile').value = '';
    $('#sftpFileName').textContent = 'Seleccionar CSV';
    $('#sftpScheduledDate').value = '';

    await loadSftpBatches();
  } catch (error: any) {
    setMessage(uploadMessage, error.message || 'No se pudo programar el archivo.', 'error');
  }
}

export {
  loadSftpBatches,
  renderSftpBatches,
  uploadScheduledCsvHandler,
};
