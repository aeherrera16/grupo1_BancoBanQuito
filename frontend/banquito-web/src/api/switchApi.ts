import { switchHttp, tryGet } from './http';
import { BatchUploadResult } from '../types';
import { demoBatches } from '../data/demo';

export const switchApi = {
  health: async () => {
    try { const { data } = await switchHttp.get('/api/switch/health'); return data; }
    catch { return { status: 'DOWN' }; }
  },
  batches: () => tryGet<any[]>(switchHttp, ['/api/payment-batch'], demoBatches),
  uploadCsv: async (file: File, channel: 'PORTAL'|'SFTP'): Promise<BatchUploadResult> => {
    const form = new FormData();
    form.append('file', file);
    form.append('channel', channel);
    const { data } = await switchHttp.post('/api/payment-batch/upload-csv', form);
    return data;
  }
};
