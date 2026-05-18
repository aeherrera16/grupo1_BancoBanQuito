import { runReport, runDownload } from '../services/api';
import { getState } from '../hooks/useState';
import { escapeHtml, formatDate, formatMoney, statusClass } from '../helpers/formatters';

const $ = (selector: string): any => document.querySelector(selector);

const reportTitles: any = {
  summary: 'Resumen del lote',
  detail: 'Detalle del lote',
  charge: 'Cargo del lote',
  receipt: 'Comprobante del lote',
};

const fieldLabels: any = {
  id: 'Referencia',
  fileName: 'Archivo',
  ruc: 'RUC',
  status: 'Estado',
  headerTotalRecords: 'Registros',
  headerTotalAmount: 'Monto total',
  totalAmount: 'Monto total',
  amount: 'Monto',
  chargeAmount: 'Valor comision',
  commissionAmount: 'Valor comision',
  feeAmount: 'Valor comision',
  totalChargeAmount: 'Valor comision',
  chargeStatus: 'Respuesta del proceso',
  commissionStatus: 'Estado comision',
  chargeDate: 'Fecha de cobro',
  receivedAt: 'Recibido',
  createdAt: 'Creado',
  processedAt: 'Procesado',
  updatedAt: 'Actualizado',
  validationResult: 'Validacion',
  batchStatus: 'Estado del lote',
  accountNumber: 'Cuenta',
  description: 'Descripcion',
  message: 'Mensaje',
  notificationStatus: 'Estado notif.',
  rejectionReason: 'Motivo rechazo',
  lineNumber: 'Linea',
  beneficiaryName: 'Beneficiario',
  identification: 'Identificacion',
  identificationNumber: 'Identificacion',
  executedAt: 'Ejecutado',
};

const summaryFields = [
  'fileName',
  'ruc',
  'status',
  'validationResult',
  'batchStatus',
  'headerTotalRecords',
  'totalRecords',
  'processedRecords',
  'successfulRecords',
  'failedRecords',
  'headerTotalAmount',
  'totalAmount',
  'amount',
  'chargeAmount',
  'receivedAt',
  'processedAt',
  'createdAt',
  'message',
];

const chargeAmountFields = ['chargeAmount', 'commissionAmount', 'feeAmount', 'amount', 'totalChargeAmount'];
const chargeStatusFields = ['chargeStatus', 'commissionStatus', 'status', 'result'];

const tableFields = [
  'lineNumber',
  'accountNumber',
  'beneficiaryName',
  'identification',
  'identificationNumber',
  'amount',
  'status',
  'validationResult',
  'notificationStatus',
  'rejectionReason',
  'message',
  'description',
  'executedAt',
  'createdAt',
  'processedAt',
];

const technicalFields = new Set([
  'id',
  'batchId',
  'customerId',
  'userId',
  'createdBy',
  'updatedBy',
  'deletedBy',
  'version',
  'trace',
  'stack',
  'rawPayload',
  'payload',
]);

function isDisplayableField(key: string, value: any) {
  if (value === null || value === undefined || value === '') return false;
  if (Array.isArray(value) || typeof value === 'object') return false;
  if (technicalFields.has(key)) return false;
  if (key.startsWith('_')) return false;
  return true;
}

function labelFor(key: string) {
  return fieldLabels[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, (char) => char.toUpperCase());
}

function formatValue(key: string, value: any) {
  if (value === null || value === undefined || value === '') return 'N/D';
  const normalizedKey = key.toLowerCase();
  if (normalizedKey.includes('amount') || normalizedKey.includes('monto') || normalizedKey.includes('balance')) {
    return formatMoney(value);
  }
  if (normalizedKey.includes('date') || normalizedKey.includes('at') || normalizedKey.includes('fecha')) {
    return formatDate(value);
  }
  return String(value);
}

function normalized(value: any) {
  return String(value || '').trim().toUpperCase();
}

function getBatchKey(batch: any) {
  return String(batch?.id || batch?.batchId || batch?.reference || '');
}

function selectedBatchId() {
  return $('#batchSelector')?.value?.trim() || '';
}

function currentBatch() {
  const batchId = selectedBatchId();
  return getState().batches.find((batch: any) => getBatchKey(batch) === batchId) || null;
}

function valueFromFields(source: any, fields: string[]) {
  if (!source || typeof source !== 'object') return undefined;
  const direct = fields.find((field) => source[field] !== undefined && source[field] !== null && source[field] !== '');
  return direct ? source[direct] : undefined;
}

function matchesSelectedBatch(item: any, batchId: string) {
  if (!item || typeof item !== 'object') return false;
  return [item.batchId, item.paymentBatchId, item.loteId, item.idLote, item.reference]
    .filter((value) => value !== undefined && value !== null)
    .some((value) => String(value) === String(batchId));
}

function findRegisteredCharge(batchId: string, reportData: any) {
  const stateCharge = getState().charges.find((charge: any) => matchesSelectedBatch(charge, batchId));
  if (stateCharge) return stateCharge;
  if (Array.isArray(reportData)) return reportData.find((item: any) => valueFromFields(item, chargeAmountFields));
  if (reportData && typeof reportData === 'object') return valueFromFields(reportData, chargeAmountFields) ? reportData : null;
  return null;
}

function renderChargeReconciliation(batchId: string, data: any) {
  const registeredCharge = findRegisteredCharge(batchId, data);
  const status = normalized(valueFromFields(data, chargeStatusFields));
  const amount = valueFromFields(registeredCharge, chargeAmountFields) ?? valueFromFields(data, chargeAmountFields);
  const hasAmount = Number(amount || 0) > 0;
  const isRejectedResponse = ['REJECTED', 'RECHAZADO', 'FAILED', 'ERROR'].some((value) => status.includes(value));

  if (!registeredCharge && !hasAmount && !status) return '';

  const operationalStatus = registeredCharge || hasAmount ? 'Comision registrada' : 'Sin cargo confirmado';
  const badgeClass = registeredCharge || hasAmount ? 'is-success' : 'is-neutral';
  const detail = isRejectedResponse && (registeredCharge || hasAmount)
    ? 'La respuesta del proceso vino rechazada, pero existe evidencia de comision registrada. No se interpreta como comision pendiente.'
    : 'Validado con la informacion operativa disponible para el lote.';

  return `
    <div class="charge-reconciliation">
      <div>
        <span>Estado operativo del cobro</span>
        <strong class="badge ${badgeClass}">${escapeHtml(operationalStatus)}</strong>
      </div>
      <div>
        <span>Valor comision</span>
        <strong>${escapeHtml(formatMoney(amount || 0))}</strong>
      </div>
      <p>${escapeHtml(detail)}</p>
    </div>
  `;
}

function renderStatus(value: any) {
  return `<span class="badge ${statusClass(value)}">${escapeHtml(value || 'N/D')}</span>`;
}

function reportStatusValue(batch: any, data: any) {
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    return data.status || data.batchStatus || data.validationResult || batch?.status || 'Generado';
  }
  return batch?.status || 'Generado';
}

function renderReportDocument(type: string, batchId: string, batch: any, data: any) {
  const state = getState();
  const session = state.session || {};
  const emittedAt = new Intl.DateTimeFormat('es-EC', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date());
  const status = reportStatusValue(batch, data);
  const reportTitle = reportTitles[type] || 'Reporte del lote';

  return `
    <article class="bank-report">
      <header class="bank-report-cover">
        <div class="bank-report-brand">
          <span>BQ</span>
          <div>
            <strong>Banco BanQuito</strong>
            <small>Informe empresarial</small>
          </div>
        </div>
        <div class="bank-report-title">
          <span>Reporte generado</span>
          <h3>${escapeHtml(reportTitle)}</h3>
          <p>${escapeHtml(batch?.fileName || `Referencia de lote ${batchId}`)}</p>
        </div>
        <div class="bank-report-status">
          ${renderStatus(status)}
          <small>Emitido ${escapeHtml(emittedAt)}</small>
        </div>
      </header>

      <dl class="bank-report-context">
        <div>
          <dt>Cliente</dt>
          <dd>${escapeHtml(session.customerName || 'Cliente juridico')}</dd>
        </div>
        <div>
          <dt>Identificacion</dt>
          <dd>${escapeHtml(`${session.identificationType || 'RUC'} ${session.identification || batch?.ruc || 'N/D'}`.trim())}</dd>
        </div>
        <div>
          <dt>Lote consultado</dt>
          <dd>${escapeHtml(batch?.fileName || `Lote ${batchId}`)}</dd>
        </div>
        <div>
          <dt>Fecha de recepcion</dt>
          <dd>${escapeHtml(formatDate(batch?.receivedAt))}</dd>
        </div>
      </dl>

      ${type === 'charge' ? renderChargeReconciliation(batchId, data) : ''}

      <section class="bank-report-body">
        <div class="bank-report-section-title">
          <span>Contenido del informe</span>
          <strong>${escapeHtml(reportTitle)}</strong>
        </div>
        ${renderReportPayload(data)}
      </section>

      <footer class="bank-report-footer">
        <span>Documento informativo generado desde Banca Web BanQuito.</span>
        <strong>Grupo 1 - Switch de pagos</strong>
      </footer>
    </article>
  `;
}

function renderBatchPreview(batch: any) {
  const preview = $('#selectedBatchPreview');
  if (!preview) return;

  if (!batch) {
    preview.className = 'selected-batch empty-state';
    preview.innerHTML = 'Carga los lotes disponibles para elegir una operacion.';
    return;
  }

  preview.className = 'selected-batch';
  preview.innerHTML = `
    <div>
      <span>Archivo</span>
      <strong>${escapeHtml(batch.fileName || 'Archivo CSV')}</strong>
    </div>
    <div>
      <span>RUC</span>
      <strong>${escapeHtml(batch.ruc || 'N/D')}</strong>
    </div>
    <div>
      <span>Estado</span>
      ${renderStatus(batch.status)}
    </div>
    <div>
      <span>Monto</span>
      <strong>${formatMoney(batch.headerTotalAmount)}</strong>
    </div>
    <div>
      <span>Recibido</span>
      <strong>${escapeHtml(formatDate(batch.receivedAt))}</strong>
    </div>
  `;
}

function syncReportBatchOptions() {
  const selector = $('#batchSelector');
  if (!selector) return;

  const state = getState();
  const currentValue = selector.value;
  const batches = state.batches.slice().sort((a: any, b: any) => (Number(b.id || b.batchId || 0) - Number(a.id || a.batchId || 0)));

  selector.innerHTML = [
    '<option value="">Selecciona por archivo, RUC o fecha</option>',
    ...batches.map((batch: any) => {
      const key = getBatchKey(batch);
      const label = [
        batch.fileName || 'Archivo CSV',
        batch.ruc ? `RUC ${batch.ruc}` : 'RUC N/D',
        batch.status || 'Estado N/D',
        formatMoney(batch.headerTotalAmount),
        formatDate(batch.receivedAt),
      ].join(' - ');
      return `<option value="${escapeHtml(key)}">${escapeHtml(label)}</option>`;
    }),
  ].join('');

  if (currentValue && batches.some((batch: any) => getBatchKey(batch) === currentValue)) {
    selector.value = currentValue;
  } else if (batches.length) {
    selector.value = getBatchKey(batches[0]);
  }

  renderBatchPreview(currentBatch());
}

function renderObjectSummary(data: any) {
  const prioritized = summaryFields
    .filter((key) => Object.prototype.hasOwnProperty.call(data, key))
    .filter((key) => isDisplayableField(key, data[key]));

  const fallback = Object.keys(data)
    .filter((key) => !prioritized.includes(key))
    .filter((key) => isDisplayableField(key, data[key]))
    .slice(0, 10 - prioritized.length);

  const entries = [...prioritized, ...fallback].map((key) => [key, data[key]]);
  if (!entries.length) return '';

  return `
    <dl class="report-ledger">
      ${entries.map(([key, value]) => `
        <div>
          <dt>${escapeHtml(labelFor(key))}</dt>
          <dd>${escapeHtml(formatValue(key, value))}</dd>
        </div>
      `).join('')}
    </dl>
  `;
}

function renderTable(rows: any[]) {
  if (!rows.length) return '<div class="empty-state">Sin registros para mostrar.</div>';

  const prioritizedColumns = tableFields.filter((key) => rows.some((row: any) => isDisplayableField(key, row?.[key])));
  const fallbackColumns = Array.from<string>(rows.reduce((set: Set<string>, row: any) => {
    Object.keys(row || {}).forEach((key) => {
      if (!prioritizedColumns.includes(key) && isDisplayableField(key, row[key])) set.add(key);
    });
    return set;
  }, new Set<string>())).slice(0, Math.max(0, 10 - prioritizedColumns.length));

  const columns: string[] = [...prioritizedColumns, ...fallbackColumns];

  if (!columns.length) {
    return '<div class="empty-state">El reporte no contiene campos operativos para mostrar.</div>';
  }

  return `
    <div class="table-wrap report-table">
      <table>
        <thead>
          <tr>${columns.map((column) => `<th>${escapeHtml(labelFor(column))}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${rows.map((row: any) => `
            <tr>
              ${columns.map((column) => `<td>${escapeHtml(formatValue(column, row?.[column]))}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderReportPayload(data: any) {
  if (Array.isArray(data)) return renderTable(data);
  if (!data || typeof data !== 'object') return `<div class="report-note">${escapeHtml(data || 'Sin datos.')}</div>`;

  const sections = Object.entries(data)
    .filter(([, value]) => Array.isArray(value))
    .map(([key, value]) => `
      <section class="report-section">
        <h3>${escapeHtml(labelFor(key))}</h3>
        ${renderTable(value as any[])}
      </section>
    `)
    .join('');

  return `${renderObjectSummary(data)}${sections || '<div class="report-note">Sin movimientos o novedades relevantes para mostrar.</div>'}`;
}

function showReportState(markup: string, type = '') {
  const output = $('#reportOutput');
  output.classList.remove('is-error', 'is-success', 'is-info');
  if (type) output.classList.add(`is-${type}`);
  output.innerHTML = markup;
}

async function runReportHandler(type: string) {
  const batchId = selectedBatchId();
  if (!batchId) {
    showReportState('<div class="report-empty"><strong>Selecciona un lote.</strong><span>Actualiza la lista y elige por archivo, RUC o fecha antes de consultar.</span></div>', 'error');
    return;
  }

  try {
    showReportState('<div class="report-empty"><strong>Consultando reporte...</strong><span>Estamos preparando la informacion del lote seleccionado.</span></div>');
    const data = await runReport(type, batchId);
    const batch = currentBatch();
    showReportState(renderReportDocument(type, batchId, batch, data));
  } catch (error: any) {
    const msg = error.message || '';
    const batch = currentBatch();
    const batchStatus = (batch?.status || '').toUpperCase();
    const isProcessed = ['PROCESADO', 'EXITOSO', 'PROCESSED', 'SUCCESS'].includes(batchStatus);
    if (msg.includes('No service charge found') || msg.includes('No hay cargo')) {
      if (isProcessed) {
        showReportState(`
          <div class="report-empty">
            <strong>Información de cargo no disponible</strong>
            <span>El lote fue procesado pero no se generó un cargo de servicio registrado. Contacte al administrador del sistema para más detalles.</span>
          </div>
        `, 'info');
      } else {
        showReportState(`
          <div class="report-empty">
            <strong>Lote en espera de procesamiento</strong>
            <span>Este lote se encuentra en estado ${escapeHtml(batch?.status || 'PENDIENTE')}. El reporte estará disponible automáticamente una vez que el banco procese la operación.</span>
          </div>
        `, 'info');
      }
      return;
    }
    showReportState(`<div class="report-empty"><strong>No se pudo consultar el reporte.</strong><span>${escapeHtml(error.message)}</span></div>`, 'error');
  }
}

async function runDownloadHandler(type: string) {
  const batchId = selectedBatchId();
  if (!batchId) {
    showReportState('<div class="report-empty"><strong>Selecciona un lote.</strong><span>Actualiza la lista y elige por archivo, RUC o fecha antes de descargar.</span></div>', 'error');
    return;
  }

  try {
    showReportState('<div class="report-empty"><strong>Preparando descarga...</strong><span>El archivo se generara con la referencia interna del lote seleccionado.</span></div>');
    const fileName = await runDownload(type, batchId);
    showReportState(`
      <div class="download-card">
        <span>Descarga generada</span>
        <strong>${escapeHtml(fileName)}</strong>
        <small>Operacion completada para el lote seleccionado.</small>
      </div>
    `, 'success');
  } catch (error: any) {
    const msg = error.message || '';
    const batch = currentBatch();
    const batchStatus = (batch?.status || '').toUpperCase();
    const isProcessed = ['PROCESADO', 'EXITOSO', 'PROCESSED', 'SUCCESS'].includes(batchStatus);
    if (msg.includes('No service charge found') || msg.includes('No hay cargo')) {
      if (isProcessed) {
        showReportState(`
          <div class="report-empty">
            <strong>Archivo no disponible</strong>
            <span>El lote fue procesado pero el archivo solicitado no está disponible. Contacte al administrador del sistema.</span>
          </div>
        `, 'info');
      } else {
        showReportState(`
          <div class="report-empty">
            <strong>Comprobante aún no generado</strong>
            <span>El lote aún no ha sido procesado. Estará disponible una vez que el lote pase a estado EXITOSO.</span>
          </div>
        `, 'info');
      }
      return;
    }
    showReportState(`<div class="report-empty"><strong>No se pudo generar la descarga.</strong><span>${escapeHtml(error.message)}</span></div>`, 'error');
  }
}

export {
  runReportHandler,
  runDownloadHandler,
  syncReportBatchOptions,
  renderBatchPreview,
  currentBatch,
};
