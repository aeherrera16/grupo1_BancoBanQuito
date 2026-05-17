import { loadBatches as loadBatchesApi, scheduleQueuedBatches } from '../services/api';
import { getState, setState } from '../hooks/useState';
import { formatMoney, statusClass, escapeHtml, setMessage, formatDate } from '../helpers/formatters';

const $ = (selector: string): any => document.querySelector(selector);

async function loadSftpBatches() {
  const state = getState();
  if (state.customerType !== 'JURIDICO') return;

  const btn = document.getElementById('loadSftpBatchesButton') as HTMLButtonElement | null;
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span class="btn-spinner">⟳</span> Actualizando...';
  }

  try {
    const batches = await loadBatchesApi();

    const companyRuc = state.session?.identification;
    const filteredBatches = batches.filter(
      (batch: any) =>
        (batch.channel + '').toLowerCase().includes('sftp') &&
        (!companyRuc || batch.ruc === companyRuc)
    );
    setState({ sftpBatches: filteredBatches });
  } catch (error: any) {
    setState({ sftpBatches: [] });
    const sftpTable = $('#sftpBatchesTable');
    if (sftpTable) {
      sftpTable.innerHTML = `<div class="empty-state">${escapeHtml(error.message)}</div>`;
    }
  } finally {
    if (btn) {
      btn.disabled = false;
      const now = new Date().toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      btn.innerHTML = `⟳ Actualizar <small style="opacity:0.6;font-size:0.7em">${now}</small>`;
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

  const scheduledDateVal = $('#sftpScheduledDate').value;
  if (!scheduledDateVal) {
    setMessage(uploadMessage, 'Selecciona una fecha y hora de efectivización.', 'error');
    return;
  }

  setMessage(uploadMessage, '⏳ Aplicando regla de efectivización...');

  try {
    const result = await scheduleQueuedBatches(scheduledDateVal);
    setMessage(
      uploadMessage,
      `✅ Regla de efectivización aplicada. ${result.count || 0} lotes del buzón programados para el ${scheduledDateVal.replace('T', ' ')}`,
      'success'
    );
    $('#sftpScheduledDate').value = '';

    await loadSftpBatches();
  } catch (error: any) {
    setMessage(uploadMessage, error.message || 'No se pudo aplicar la regla.', 'error');
  }
}

export {
  loadSftpBatches,
  renderSftpBatches,
  uploadScheduledCsvHandler,
};
