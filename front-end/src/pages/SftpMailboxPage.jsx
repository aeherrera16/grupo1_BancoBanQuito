import { useState } from 'react';
import { Field, inputClass, PageShell, Panel, primaryButtonClass, secondaryButtonClass } from '../components/PageShell';
import { checkSftpStatus, uploadSftpMailboxFile } from '../services/apiClient';

function ErrorMessage({ message }) {
  return (
    <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
      <p className="text-sm font-semibold text-red-700">✗ {message}</p>
    </div>
  );
}

function SuccessMessage({ message }) {
  return (
    <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4">
      <p className="text-sm font-semibold text-green-700">✓ {message}</p>
    </div>
  );
}

export function SftpMailboxPage() {
  const [file, setFile] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState('');
  const [statusData, setStatusData] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files?.[0] || null);
    setUploadError('');
    setUploadSuccess('');
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploadLoading(true);
    setUploadError('');
    setUploadSuccess('');
    try {
      await uploadSftpMailboxFile(file);
      setUploadSuccess(`Archivo "${file.name}" (${(file.size / 1024).toFixed(2)} KB) enviado al buzón SFTP correctamente`);
      setFile(null);
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleCheckStatus = async () => {
    setStatusLoading(true);
    setStatusError('');
    setStatusData(null);
    try {
      const result = await checkSftpStatus();
      setStatusData(result);
    } catch (err) {
      setStatusError(err.message);
    } finally {
      setStatusLoading(false);
    }
  };

  return (
    <PageShell
      title="Buzón SFTP"
      description="Entrada operativa donde las empresas dejan archivos CSV; el servicio los guarda en sftp-downloads y los envía al Switch."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        {/* PANEL DE CARGA */}
        <Panel title="Recepción de archivos">
          <Field label="Archivo CSV empresarial">
            <input
              className={inputClass}
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileChange}
              disabled={uploadLoading}
            />
          </Field>

          {file && (
            <div className="mt-4 rounded-lg bg-blue-50 p-3 text-sm">
              <p className="font-semibold text-blue-900">Archivo seleccionado:</p>
              <p className="mt-1 text-blue-800">
                <strong>{file.name}</strong> — {(file.size / 1024).toFixed(2)} KB
              </p>
            </div>
          )}

          <button
            className={`${primaryButtonClass} mt-5 w-full`}
            disabled={uploadLoading || !file}
            onClick={handleUpload}
          >
            {uploadLoading ? 'Enviando...' : 'Enviar a buzón SFTP'}
          </button>

          {uploadSuccess && <SuccessMessage message={uploadSuccess} />}
          {uploadError && <ErrorMessage message={uploadError} />}
        </Panel>

        {/* PANEL DE ESTADO */}
        <Panel title="Estado del buzón">
          <div className="space-y-4">
            <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
              <p className="font-semibold text-slate-900 mb-2">Información del sistema:</p>
              <ul className="space-y-1 text-xs">
                <li>✓ Directorio de almacenamiento: <code className="bg-white px-1 rounded">./sftp-downloads</code></li>
                <li>✓ Procesamiento automático de lotes CSV</li>
                <li>✓ Envío a Switch tras validación</li>
              </ul>
            </div>

            <button
              className={`${secondaryButtonClass} w-full`}
              disabled={statusLoading}
              onClick={handleCheckStatus}
            >
              {statusLoading ? 'Verificando...' : 'Verificar estado SFTP'}
            </button>

            {statusData && (
              <div className="rounded-lg bg-green-50 p-3 border border-green-200">
                <p className="text-sm font-semibold text-green-800 mb-2">✓ Buzón operativo</p>
                <div className="text-xs text-green-700 space-y-1">
                  {Object.entries(statusData).map(([key, value]) => (
                    <p key={key}>
                      <strong>{key}:</strong> {String(value)}
                    </p>
                  ))}
                </div>
              </div>
            )}
            {statusError && <ErrorMessage message={statusError} />}
          </div>
        </Panel>
      </div>
    </PageShell>
  );
}
