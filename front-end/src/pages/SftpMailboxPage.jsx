import { useState } from 'react';
import { Field, inputClass, PageShell, Panel, primaryButtonClass, ResultBox, secondaryButtonClass } from '../components/PageShell';
import { checkSftpStatus, uploadSftpMailboxFile } from '../services/apiClient';

export function SftpMailboxPage() {
  const [file, setFile] = useState(null);
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
      title="Buzón SFTP"
      description="Entrada operativa donde las empresas dejan archivos CSV; el servicio los guarda en sftp-downloads y los envía al Switch."
    >
      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Panel title="Recepción directa">
          <Field label="Archivo CSV empresarial">
            <input className={inputClass} type="file" accept=".csv,text/csv" onChange={(event) => setFile(event.target.files?.[0] || null)} />
          </Field>
          <button className={`${primaryButtonClass} mt-5`} disabled={loading || !file} onClick={() => submit(() => uploadSftpMailboxFile(file))}>
            Enviar a buzón SFTP
          </button>
        </Panel>

        <Panel title="Ubicación y monitoreo">
          <div className="grid gap-3 text-sm text-slate-700">
            <span>Directorio remoto configurado: `/upload`.</span>
            <span>Directorio local de almacenamiento: `./sftp-downloads`.</span>
            <span>El scheduler puede descargar CSV y luego eliminar el archivo remoto procesado.</span>
            <span>El endpoint de estado verifica existencia y tamaño del directorio local.</span>
          </div>
          <button className={`${secondaryButtonClass} mt-5`} disabled={loading} onClick={() => submit(checkSftpStatus)}>
            Verificar estado SFTP
          </button>
        </Panel>
      </div>
      <ResultBox result={result} error={error} />
    </PageShell>
  );
}
