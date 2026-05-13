import { useState } from 'react';
import {
  getBatchDetails,
  downloadComprobanteLiquidacion,
  downloadReporteNovedades,
} from '../api/switchService';

export function useBatchDetails() {
  const [batchDetails, setBatchDetails] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isDownloadingComprobante, setIsDownloadingComprobante] = useState(false);
  const [isDownloadingNovedades, setIsDownloadingNovedades] = useState(false);
  const [error, setError] = useState(null);

  const fetchBatchDetails = async (batchId) => {
    setIsLoadingDetails(true);
    setError(null);

    try {
      const details = await getBatchDetails(batchId);
      setBatchDetails(details);
      return details;
    } catch (err) {
      const errorMsg = err.message || 'Error al cargar los detalles del lote';
      setError(errorMsg);
      console.error('Error fetching batch details:', err);
      throw err;
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const downloadComprobante = async (batchId) => {
    setIsDownloadingComprobante(true);
    setError(null);

    try {
      await downloadComprobanteLiquidacion(batchId);
    } catch (err) {
      const errorMsg = err.message || 'Error al descargar el comprobante';
      setError(errorMsg);
      console.error('Error downloading comprobante:', err);
      throw err;
    } finally {
      setIsDownloadingComprobante(false);
    }
  };

  const downloadNovedades = async (batchId) => {
    setIsDownloadingNovedades(true);
    setError(null);

    try {
      await downloadReporteNovedades(batchId);
    } catch (err) {
      const errorMsg = err.message || 'Error al descargar el reporte de novedades';
      setError(errorMsg);
      console.error('Error downloading novedades:', err);
      throw err;
    } finally {
      setIsDownloadingNovedades(false);
    }
  };

  const clearError = () => setError(null);

  return {
    batchDetails,
    isLoadingDetails,
    isDownloadingComprobante,
    isDownloadingNovedades,
    error,
    fetchBatchDetails,
    downloadComprobante,
    downloadNovedades,
    clearError,
  };
}
