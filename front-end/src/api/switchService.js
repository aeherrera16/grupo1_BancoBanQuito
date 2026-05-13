const API_BASE_URL = 'http://localhost:8080/api';
const PAYMENT_BATCH_URL = `${API_BASE_URL}/payment-batch`;
const BILLING_URL = `${API_BASE_URL}/billing`;

export async function uploadPaymentBatch(file, channel = 'PORTAL') {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('channel', channel);

    const response = await fetch(`${PAYMENT_BATCH_URL}/upload-csv`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw {
        status: response.status,
        error: data.error || 'Error al procesar el archivo',
        rejectedEarly: data.rejectedEarly || false,
      };
    }

    return {
      success: data.isSuccess,
      validationResult: data.validationResult,
      batchStatus: data.batchStatus,
      fileValidation: data.fileValidation,
      isEnqueued: data.batchStatus === 'Encolado',
    };
  } catch (error) {
    console.error('Error in uploadPaymentBatch:', error);
    throw error;
  }
}

export async function getBatchDetails(batchId) {
  try {
    const response = await fetch(`${BILLING_URL}/batches/${batchId}/summary`);

    if (!response.ok) {
      throw new Error(`Error fetching batch details: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error in getBatchDetails:', error);
    throw error;
  }
}

export async function getAllBatches() {
  try {
    const response = await fetch(`${PAYMENT_BATCH_URL}`);

    if (!response.ok) {
      throw new Error(`Error fetching batches: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error in getAllBatches:', error);
    throw error;
  }
}

export async function downloadComprobanteLiquidacion(batchId) {
  try {
    const response = await fetch(`${BILLING_URL}/batches/${batchId}/download/comprobante`);

    if (!response.ok) {
      throw new Error(`Error downloading comprobante: ${response.status}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `comprobante_${batchId}.txt`);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error in downloadComprobanteLiquidacion:', error);
    throw error;
  }
}

export async function downloadReporteNovedades(batchId) {
  try {
    const response = await fetch(`${BILLING_URL}/batches/${batchId}/download/novedades`);

    if (!response.ok) {
      throw new Error(`Error downloading reporte: ${response.status}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `novedades_${batchId}.csv`);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error in downloadReporteNovedades:', error);
    throw error;
  }
}
