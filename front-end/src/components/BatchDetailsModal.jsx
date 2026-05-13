import { useEffect } from 'react';
import { useBatchDetails } from '../hooks/useBatchDetails';

export function BatchDetailsModal({ batchId, isOpen, onClose }) {
  const {
    batchDetails,
    isLoadingDetails,
    isDownloadingComprobante,
    isDownloadingNovedades,
    error,
    fetchBatchDetails,
    downloadComprobante,
    downloadNovedades,
    clearError,
    reset,
  } = useBatchDetails();

  useEffect(() => {
    if (isOpen && batchId) {
      fetchBatchDetails(batchId);
    } else {
      reset();
    }
  }, [isOpen, batchId, fetchBatchDetails, reset]);

  const handleOpen = async () => {
    clearError();
    try {
      await fetchBatchDetails(batchId);
    } catch (err) {
      console.error('Error loading batch details:', err);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleDownloadComprobante = async () => {
    try {
      await downloadComprobante(batchId);
    } catch (err) {
      console.error('Error downloading comprobante:', err);
    }
  };

  const handleDownloadNovedades = async () => {
    try {
      await downloadNovedades(batchId);
    } catch (err) {
      console.error('Error downloading novedades:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-banker-navy text-white p-6 flex justify-between items-center border-b">
          <h2 className="text-2xl font-bold">Detalle del Lote #{batchId}</h2>
          <button
            onClick={handleClose}
            className="text-white hover:bg-banker-navy/80 rounded p-2 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {isLoadingDetails ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-banker-blue border-t-transparent"></div>
            </div>
          ) : batchDetails ? (
            <>
              {/* Estado del Lote */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-banker-navy mb-4">Estado del Lote</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-banker-gray mb-1">Archivo</p>
                    <p className="font-semibold text-banker-navy">{batchDetails.fileName}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-banker-gray mb-1">RUC</p>
                    <p className="font-semibold text-banker-navy">{batchDetails.ruc}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-banker-gray mb-1">Estado</p>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          batchDetails.status === 'PROCESSED'
                            ? 'bg-green-100 text-green-800'
                            : batchDetails.status === 'QUEUED'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {batchDetails.status}
                      </span>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-banker-gray mb-1">Fecha Recibida</p>
                    <p className="font-semibold text-banker-navy">
                      {new Date(batchDetails.receivedAt).toLocaleDateString('es-EC')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Resumen Financiero */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-banker-navy mb-4">Resumen Financiero</h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 border-b">
                    <div>
                      <p className="text-sm text-banker-gray mb-1">Total Registros</p>
                      <p className="text-2xl font-bold text-banker-navy">{batchDetails.totalRecords}</p>
                    </div>
                    <div>
                      <p className="text-sm text-banker-gray mb-1">Registros Exitosos</p>
                      <p className="text-2xl font-bold text-green-600">{batchDetails.successfulRecords}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 p-4 bg-white border-b">
                    <div>
                      <p className="text-sm text-banker-gray mb-1">Registros Rechazados</p>
                      <p className="text-2xl font-bold text-red-600">{batchDetails.rejectedRecords}</p>
                    </div>
                    <div>
                      <p className="text-sm text-banker-gray mb-1">Monto Total</p>
                      <p className="text-2xl font-bold text-banker-navy">
                        ${batchDetails.totalAmount?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 p-4 bg-banker-navy/5 border-t">
                    <div className="border-r border-gray-200">
                      <p className="text-sm text-banker-gray mb-2">Comisión</p>
                      <p className="text-xl font-bold text-banker-navy">
                        ${batchDetails.commissionSubtotal?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                    <div className="border-r border-gray-200">
                      <p className="text-sm text-banker-gray mb-2">IVA (15%)</p>
                      <p className="text-xl font-bold text-banker-navy">
                        ${batchDetails.vatAmount?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-banker-gray mb-2">Total Comisión</p>
                      <p className="text-xl font-bold" style={{ color: '#d4a574' }}>
                        ${batchDetails.totalCharge?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={handleDownloadComprobante}
                  disabled={isDownloadingComprobante || isDownloadingNovedades}
                  className="flex-1 px-6 py-3 bg-banker-blue hover:bg-banker-navy text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isDownloadingComprobante ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Descargando...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                      Descargar Comprobante
                    </>
                  )}
                </button>
                <button
                  onClick={handleDownloadNovedades}
                  disabled={isDownloadingComprobante || isDownloadingNovedades}
                  className="flex-1 px-6 py-3 border-2 border-banker-blue text-banker-blue hover:bg-banker-blue/5 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isDownloadingNovedades ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-banker-blue border-t-transparent"></div>
                      Descargando...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                      Descargar Novedades
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <button
                onClick={handleOpen}
                className="px-6 py-3 bg-banker-blue text-white rounded-lg font-semibold hover:bg-banker-navy transition-colors"
              >
                Cargar Detalles
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
