import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useMassivePayments } from '../hooks/useMassivePayments';
import { FileUpload } from '../components/FileUpload';
import { BatchDetailsModal } from '../components/BatchDetailsModal';
import { getAllBatches } from '../api/switchService';

export function PagosMasivosPage() {
  const { user } = useAuth();
  const { selectedFile, isUploading, response, error, uploadFile, resetState } = useMassivePayments();
  const [batches, setBatches] = useState([]);
  const [isLoadingBatches, setIsLoadingBatches] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');

  useEffect(() => {
    let isMounted = true;

    const initializePage = async () => {
      try {
        if (isMounted) {
          await loadBatches();
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error initializing page:', err);
        }
      }
    };

    initializePage();

    return () => {
      isMounted = false;
    };
  }, []);

  const loadBatches = async (isMounted = true) => {
    if (!isMounted) return;
    setIsLoadingBatches(true);
    try {
      const data = await getAllBatches();
      if (isMounted) {
        setBatches(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      if (isMounted) {
        console.error('Error loading batches:', err);
        setBatches([]);
      }
    } finally {
      if (isMounted) {
        setIsLoadingBatches(false);
      }
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

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setTimeout(() => {
      setSelectedBatchId(null);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-900 via-red-800 to-red-700 text-white py-16 px-4 md:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              <div>
                <p className="text-red-200 text-sm uppercase tracking-widest font-semibold mb-2">
                  Sistema de Pagos
                </p>
                <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-4">
                  Pagos
                  <br />
                  Masivos
                </h1>
              </div>
              <p className="text-xl text-red-100 leading-relaxed">
                Procesa y gestiona cientos de pagos de forma simultánea con validaciones automáticas y reportes detallados.
              </p>
              <button
                onClick={() => setActiveTab('upload')}
                className="inline-block bg-white text-red-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-red-50 transition-all shadow-lg hover:shadow-xl"
              >
                Cargar Archivo
              </button>
            </div>

            {/* Right Visual */}
            <div className="hidden md:flex justify-center">
              <div className="relative w-64 h-64">
                <div className="absolute inset-0 bg-white/10 rounded-2xl backdrop-blur-xl flex items-center justify-center">
                  <svg className="w-32 h-32 text-white/30" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="max-w-6xl mx-auto px-4 -mt-8 relative z-10 mb-8">
        {response && !error && (
          <div className={`rounded-xl shadow-lg p-6 mb-6 ${response.success ? 'bg-green-50 border-l-4 border-green-500' : 'bg-amber-50 border-l-4 border-amber-500'}`}>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                {response.success ? (
                  <svg className="h-6 w-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <h3 className={`text-lg font-bold mb-1 ${response.success ? 'text-green-900' : 'text-amber-900'}`}>
                  {response.success ? 'Archivo Procesado Exitosamente' : 'Archivo Encolado'}
                </h3>
                <p className={`text-sm mb-4 ${response.success ? 'text-green-700' : 'text-amber-700'}`}>
                  {response.success
                    ? 'Tu archivo ha sido procesado correctamente y está listo para ser ejecutado.'
                    : 'Tu archivo será procesado en la próxima ventana de ingesta (después de las 18:00 o el próximo día hábil).'
                  }
                </p>
                <button
                  onClick={resetState}
                  className={`px-4 py-2 rounded-lg font-semibold text-white transition-colors ${response.success ? 'bg-green-600 hover:bg-green-700' : 'bg-amber-600 hover:bg-amber-700'}`}
                >
                  Cargar otro archivo
                </button>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-xl shadow-lg p-6 mb-6 bg-red-50 border-l-4 border-red-500">
            <div className="flex items-start gap-4">
              <svg className="h-6 w-6 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-red-900 mb-1">
                  {error.rejectedEarly ? 'Validación Rechazada' : 'Error al Procesar Archivo'}
                </h3>
                <p className="text-sm text-red-700 mb-4">{error.message}</p>
                <button
                  onClick={resetState}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Intentar de nuevo
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 pb-12">
        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-6 py-3 font-bold text-lg transition-all border-b-2 ${
              activeTab === 'upload'
                ? 'text-red-900 border-red-900'
                : 'text-gray-600 border-transparent hover:text-gray-900'
            }`}
          >
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm14 0H4v8h12V6z" />
              </svg>
              Cargar Archivo
            </span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-3 font-bold text-lg transition-all border-b-2 ${
              activeTab === 'history'
                ? 'text-red-900 border-red-900'
                : 'text-gray-600 border-transparent hover:text-gray-900'
            }`}
          >
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4z" clipRule="evenodd" />
              </svg>
              Historial
            </span>
          </button>
        </div>

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Upload Card */}
            <div className="bg-white rounded-2xl shadow-lg p-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-900" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-red-900">Cargar archivo</h2>
              </div>

              {!response && !error ? (
                <FileUpload
                  selectedFile={selectedFile}
                  isUploading={isUploading}
                  onUpload={handleUpload}
                />
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600 mb-6 text-lg">Archivo procesado correctamente</p>
                  <button
                    onClick={resetState}
                    className="w-full px-6 py-3 bg-red-900 hover:bg-red-800 text-white rounded-lg font-bold transition-colors"
                  >
                    Cargar otro archivo
                  </button>
                </div>
              )}
            </div>

            {/* Info Section */}
            <div className="space-y-6">
              <div className="bg-red-50 rounded-2xl p-8 border border-red-100">
                <h3 className="text-xl font-bold text-red-900 mb-4 flex items-center gap-2">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zm-11-1a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
                  </svg>
                  Información importante
                </h3>
                <ul className="space-y-3 text-sm text-gray-700">
                  <li className="flex gap-3">
                    <span className="text-red-600 font-bold">•</span>
                    <span><strong>Horario de corte:</strong> Antes de las 18:00 se procesan el mismo día</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-red-600 font-bold">•</span>
                    <span><strong>Formato:</strong> CSV o TXT con estructura validada</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-red-600 font-bold">•</span>
                    <span><strong>Validaciones:</strong> Sumatoria, duplicidad y permisos</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-red-600 font-bold">•</span>
                    <span><strong>Soporte:</strong> Contacta a tu gestor de cuenta</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-red-100 to-red-50 rounded-2xl p-8 border border-red-200">
                <p className="text-sm text-red-900">
                  <strong>¿Necesitas ayuda?</strong> Nuestro equipo de soporte está disponible para asistirte en cualquier momento. Contacta a tu gestor de cuenta para resolver dudas.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div>
            <h2 className="text-2xl font-bold text-red-900 mb-8 flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-red-900" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 1 1 0 000 2H3h12a1 1 0 100-2 2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9 6a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
                </svg>
              </div>
              Historial de Pagos
            </h2>

            {isLoadingBatches ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-900 border-t-transparent"></div>
              </div>
            ) : batches.length === 0 ? (
              <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
                <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-gray-600 text-lg font-semibold">No hay lotes procesados aún</p>
                <p className="text-gray-500 mt-2">Carga tu primer archivo para verlo aquí</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {batches.slice().reverse().map((batch) => {
                  const getStatusColor = (status) => {
                    if (status === 'PROCESSED') return 'bg-green-100 text-green-800 border-green-300';
                    if (status === 'QUEUED') return 'bg-amber-100 text-amber-800 border-amber-300';
                    if (status === 'REJECTED') return 'bg-red-100 text-red-800 border-red-300';
                    return 'bg-gray-100 text-gray-800 border-gray-300';
                  };

                  const getStatusIcon = (status) => {
                    if (status === 'PROCESSED') return '✓';
                    if (status === 'QUEUED') return '⏱';
                    if (status === 'REJECTED') return '✕';
                    return '?';
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
                      className="bg-white rounded-xl shadow hover:shadow-lg transition-all cursor-pointer border-l-4 border-red-900 hover:border-red-700 p-6"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-red-900">Lote #{batch.id}</h3>
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(batch.status)}`}>
                              <span className="w-4 h-4 flex items-center justify-center text-xs font-bold">{getStatusIcon(batch.status)}</span>
                              {getStatusDisplayName(batch.status)}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-1"><strong>RUC:</strong> {batch.ruc}</p>
                          <p className="text-gray-600 mb-2"><strong>Archivo:</strong> {batch.fileName}</p>
                          <p className="text-sm text-gray-500">
                            Recibido: {new Date(batch.receivedAt).toLocaleDateString('es-EC', {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Batch Details Modal */}
      {selectedBatchId && (
        <BatchDetailsModal
          batchId={selectedBatchId}
          isOpen={showDetailsModal}
          onClose={handleCloseDetailsModal}
        />
      )}
    </div>
  );
}
