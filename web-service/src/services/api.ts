import axios from 'axios';
import { Template, Dataset, BatchConfig, BatchResult, BatchLog } from '../types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'
});

export class BatchService {
  static async list() {
    const { data } = await api.get<BatchConfig[]>('/batch');
    return data;
  }

  static async get(id: string) {
    const { data } = await api.get<BatchConfig>(`/batch/${id}`);
    return data;
  }

  static async create(batch: Partial<BatchConfig>) {
    const { data } = await api.post<BatchConfig>('/batch', batch);
    return data;
  }

  static async update(id: string, batch: Partial<BatchConfig>) {
    const { data } = await api.put<BatchConfig>(`/batch/${id}`, batch);
    return data;
  }

  static async delete(id: string) {
    await api.delete(`/batch/${id}`);
  }

  static async execute(id: string) {
    const { data } = await api.post<BatchResult>(`/batch/${id}/execute`);
    return data;
  }

  static async stop(id: string) {
    await api.post(`/batch/${id}/stop`);
  }

  static async test(script: string, datasetId: string) {
    const { data } = await api.post<BatchResult>('/batch/test', {
      script,
      datasetId
    });
    return data;
  }

  static async getHistory(id: string) {
    const { data } = await api.get<BatchResult[]>(`/batch/${id}/history`);
    return data;
  }

  static async getLogs(id: string) {
    const { data } = await api.get<BatchLog[]>(`/batch/${id}/logs`);
    return data;
  }

  static async getStats(id: string) {
    const { data } = await api.get(`/batch/${id}/stats`);
    return data;
  }
}

export class TemplateService {
  static async list() {
    const { data } = await api.get<Template[]>('/template');
    return data;
  }

  static async get(id: string) {
    const { data } = await api.get<Template>(`/template/${id}`);
    return data;
  }

  static async create(template: Partial<Template>) {
    const { data } = await api.post<Template>('/template', template);
    return data;
  }

  static async update(id: string, template: Partial<Template>) {
    const { data } = await api.put<Template>(`/template/${id}`, template);
    return data;
  }

  static async delete(id: string) {
    await api.delete(`/template/${id}`);
  }
}

export class DatasetService {
  static async list(templateId?: string) {
    const { data } = await api.get<Dataset[]>('/dataset', {
      params: { templateId }
    });
    return data;
  }

  static async get(id: string) {
    const { data } = await api.get<Dataset>(`/dataset/${id}`);
    return data;
  }

  static async create(dataset: Partial<Dataset>) {
    const { data } = await api.post<Dataset>('/dataset', dataset);
    return data;
  }

  static async update(id: string, dataset: Partial<Dataset>) {
    const { data } = await api.put<Dataset>(`/dataset/${id}`, dataset);
    return data;
  }

  static async delete(id: string) {
    await api.delete(`/dataset/${id}`);
  }
}

// Error handling interceptor
api.interceptors.response.use(
  response => response,
  error => {
    const message = error.response?.data?.error || error.message || 'An error occurred';
    throw new Error(message);
  }
);