import { useState } from 'react';
import { Field, inputClass, PageShell, Panel, primaryButtonClass, ResultBox, secondaryButtonClass } from '../components/PageShell';
import { fetchPaymentBatches, processPaymentBatch, uploadPaymentBatch } from '../services/apiClient';

export function PagosMasivosPage() {
  const [file, setFile] = useState(null);
  const [batchId, setBatchId] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (callback) => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      setResult(await callback());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell
      title="Pagos masivos"
      description="Supervisión de lotes recibidos por Portal Web o SFTP, con validación RF-02 y procesamiento por batch."
    >
      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Carga por Portal Web">
          <div className="rounded-lg border border-dashed border-slate-300 p-5">
            <Field label="Archivo CSV">
              <input className={inputClass} type="file" accept=".csv,text/csv" onChange={(event) => setFile(event.target.files?.[0] || null)} />
            </Field>
            <p className="mt-3 text-sm text-slate-600">
              Formato esperado: cabecera con RUC, tipo de servicio, fecha, cuenta origen, total de registros y monto total; detalle línea por línea.
            </p>
            <button className={`${primaryButtonClass} mt-5`} disabled={loading || !file} onClick={() => submit(() => uploadPaymentBatch(file, 'PORTAL'))}>
              Validar y cargar
            </button>
          </div>
        </Panel>

        <Panel title="Operación de lotes">
          <div className="grid gap-4 md:grid-cols-[1fr_auto]">
            <Field label="ID lote">
              <input className={inputClass} value={batchId} onChange={(event) => setBatchId(event.target.value)} />
            </Field>
            <div className="flex items-end">
              <button className={primaryButtonClass} disabled={loading || !batchId} onClick={() => submit(() => processPaymentBatch(batchId))}>
                Procesar
              </button>
            </div>
          </div>
          <div className="mt-5">
            <button className={secondaryButtonClass} disabled={loading} onClick={() => submit(fetchPaymentBatches)}>
              Consultar lotes recibidos
            </button>
          </div>
          <div className="mt-5 grid gap-3 text-sm text-slate-700">
            <span>Estados del lote: Recibido, Validado, En Proceso, Procesado, Rechazado, Encolado.</span>
            <span>Estados del detalle: Pendiente, Exitoso, Rechazado.</span>
            <span>Canales del Switch: Portal Web y SFTP Seguro.</span>
          </div>
        </Panel>
      </div>
      <ResultBox result={result} error={error} />
    </PageShell>
  );
}
