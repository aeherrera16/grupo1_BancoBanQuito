import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useMassivePayments } from '../hooks/useMassivePayments';
import { FileUpload } from '../components/FileUpload';
import { BatchDetailsModal } from '../components/BatchDetailsModal';
import { getAllBatches } from '../api/switchService';

export function PagosMasivosPage() {
  const { user } = useAuth();
  const { selectedFile, isUploading, response, error, uploadFile, resetState } = useMassivePayments();
  const [showHistory, setShowHistory] = useState(false);
  const [batches, setBatches] = useState([]);
  const [isLoadingBatches, setIsLoadingBatches] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    loadBatches();
  }, []);

  const loadBatches = async () => {
    setIsLoadingBatches(true);
    try {
      const data = await getAllBatches();
      setBatches(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading batches:', err);
      setBatches([]);
    } finally {
      setIsLoadingBatches(false);
    }
  };

  const handleUpload = async (file) => {
    try {
      await uploadFile(file);
      await loadBatches();
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  const handleSelectBatch = (batchId) => {
    setSelectedBatchId(batchId);
    setShowDetailsModal(true);
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-banker-navy mb-2">
          Pagos Masivos
        </h1>
        <p className="text-banker-gray mb-8">
          Gestiona tus pagos masivos de forma eficiente
        </p>

        {/* Response Messages */}
        {response && !error && (
          <>
            {response.success ? (
              <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-6 rounded-lg">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-green-800 mb-1">Archivo Procesado Exitosamente</h3>
                    <p className="text-green-700 text-sm mb-3">
                      Tu archivo ha sido procesado correctamente y está listo para ser ejecutado.
                    </p>
                    <div className="bg-white rounded p-3 text-sm text-green-700 font-mono mb-3">
                      Estado: <strong>{response.batchStatus}</strong>
                    </div>
                    <button
                      onClick={resetState}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-semibold transition-colors"
                    >
                      Subir otro archivo
                    </button>
                  </div>
                </div>
              </div>
            ) : response.isEnqueued ? (
              <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-yellow-800 mb-1">Archivo Encolado</h3>
                    <p className="text-yellow-700 text-sm mb-3">
                      Tu archivo ha sido recibido correctamente pero será procesado en la próxima ventana de ingesta (después de las 18:00 o el próximo día hábil).
                    </p>
                    <div className="bg-white rounded p-3 text-sm text-yellow-700 font-mono mb-3">
                      Estado: <strong>{response.batchStatus}</strong>
                    </div>
                    <button
                      onClick={resetState}
                      className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded font-semibold transition-colors"
                    >
                      Subir otro archivo
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-6 rounded-lg">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-800 mb-1">
                  {error.rejectedEarly ? 'Validación Rechazada' : 'Error al Procesar Archivo'}
                </h3>
                <p className="text-red-700 text-sm mb-3">
                  {error.message}
                </p>
                <button
                  onClick={resetState}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-semibold transition-colors"
                >
                  Intentar de nuevo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* File Upload Section */}
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-xl font-bold text-banker-navy mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-banker-blue rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
              </div>
              Cargar archivo de pagos
            </h2>
            {!response && !error ? (
              <FileUpload
                selectedFile={selectedFile}
                isUploading={isUploading}
                onUpload={handleUpload}
              />
            ) : (
              <div className="text-center py-8">
                <p className="text-banker-gray mb-4">Carga completada</p>
                <button
                  onClick={resetState}
                  className="px-6 py-2 bg-banker-blue text-white rounded-lg font-semibold hover:bg-banker-navy transition-colors"
                >
                  Cargar otro archivo
                </button>
              </div>
            )}
          </div>

          {/* History Section */}
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-xl font-bold text-banker-navy mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-banker-blue rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 1 1 0 000 2H3h12a1 1 0 100-2 2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9 6a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
                </svg>
              </div>
              Historial de pagos
            </h2>
            <div className="space-y-4">
              {isLoadingBatches ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-banker-blue border-t-transparent"></div>
                </div>
              ) : batches.length === 0 ? (
                <div className="text-center py-8 text-banker-gray">
                  <p>No hay lotes procesados aún</p>
                </div>
              ) : (
                batches.slice().reverse().map((batch) => {
                  const getStatusBadgeColor = (status) => {
                    if (status === 'PROCESSED') return 'bg-green-100 text-green-800';
                    if (status === 'QUEUED') return 'bg-yellow-100 text-yellow-800';
                    if (status === 'REJECTED') return 'bg-red-100 text-red-800';
                    return 'bg-gray-100 text-gray-800';
                  };

                  const getStatusDisplayName = (status) => {
                    if (status === 'PROCESSED') return 'Procesado';
                    if (status === 'QUEUED') return 'Encolado';
                    if (status === 'REJECTED') return 'Rechazado';
                    return status;
                  };

                  return (
                    <div
                      key={batch.id}
                      onClick={() => handleSelectBatch(batch.id)}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer hover:border-banker-blue"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold text-banker-navy">Lote #{batch.id}</h4>
                          <p className="text-sm text-banker-gray">
                            RUC: {batch.ruc}
                          </p>
                        </div>
                        <span className={`px-3 py-1 text-xs rounded-full font-semibold ${getStatusBadgeColor(batch.status)}`}>
                          {getStatusDisplayName(batch.status)}
                        </span>
                      </div>
                      <p className="text-sm text-banker-gray mb-2">
                        Archivo: {batch.fileName}
                      </p>
                      <p className="text-xs text-banker-gray">
                        Recibido: {new Date(batch.receivedAt).toLocaleString('es-EC')}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-banker-navy/5 border border-banker-navy/20 rounded-lg p-6">
          <h3 className="font-semibold text-banker-navy mb-3 flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zm-11-1a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
            </svg>
            Información importante
          </h3>
          <ul className="text-sm text-banker-gray space-y-2">
            <li>• <strong>Horario de corte:</strong> Archivos recibidos antes de las 18:00 se procesan el mismo día hábil</li>
            <li>• <strong>Formato:</strong> Solo se aceptan archivos CSV o TXT con estructura validada</li>
            <li>• <strong>Validaciones:</strong> Se verifica sumatoria, duplicidad y permisos de cliente</li>
            <li>• <strong>Soporte:</strong> Contacta a tu gestor si necesitas asistencia</li>
          </ul>
        </div>
      </div>

      {/* Batch Details Modal */}
      {selectedBatchId && (
        <BatchDetailsModal
          batchId={selectedBatchId}
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedBatchId(null);
          }}
        />
      )}
    </div>
  );
}
