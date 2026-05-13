const API_BASE_URL = 'http://localhost:8080/api/payment-batch';

export async function uploadPaymentBatch(file, channel = 'PORTAL') {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('channel', channel);

    const response = await fetch(`${API_BASE_URL}/upload-csv`, {
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
