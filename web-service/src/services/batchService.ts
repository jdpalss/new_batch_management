import apiClient from '../lib/axios';
import { BatchConfig } from '../types/batch';

export const batchService = {
  // 배치 목록 조회
  listBatches: async () => {
    const { data } = await apiClient.get('/batch');
    return data;
  },

  // 배치 상세 조회
  getBatch: async (id: string) => {
    const { data } = await apiClient.get(`/batch/${id}`);
    return data;
  },

  // 배치 생성
  createBatch: async (batchConfig: Partial<BatchConfig>) => {
    const { data } = await apiClient.post('/batch', batchConfig);
    return data;
  },

  // 배치 수정
  updateBatch: async (id: string, batchConfig: Partial<BatchConfig>) => {
    const { data } = await apiClient.put(`/batch/${id}`, batchConfig);
    return data;
  },

  // 배치 삭제
  deleteBatch: async (id: string) => {
    await apiClient.delete(`/batch/${id}`);
  }
};