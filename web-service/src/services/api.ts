import axios, { AxiosError } from 'axios';
import { Template, Dataset, BatchConfig, BatchResult, BatchLog } from '../types';

// API 응답 타입 정의
interface ApiResponse<T> {
  data: T;
  message?: string;
}

// API 에러 타입 정의
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  timeout: 10000, // 10초 타임아웃 설정
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    // 토큰이 필요한 경우 여기에 추가
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // 인증 에러 처리
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    const message = error.response?.data?.error || error.message || 'An error occurred';
    throw new ApiError(
      message,
      error.response?.status,
      error.response?.data
    );
  }
);

export class BatchService {
  static async list() {
    try {
      const { data } = await api.get<ApiResponse<BatchConfig[]>>('/batch');
      return data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static async get(id: string) {
    try {
      const { data } = await api.get<ApiResponse<BatchConfig>>(`/batch/${id}`);
      return data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static async create(batch: Partial<BatchConfig>) {
    try {
      const { data } = await api.post<ApiResponse<BatchConfig>>('/batch', batch);
      return data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static async update(id: string, batch: Partial<BatchConfig>) {
    try {
      const { data } = await api.put<ApiResponse<BatchConfig>>(`/batch/${id}`, batch);
      return data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static async delete(id: string) {
    try {
      await api.delete(`/batch/${id}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static async execute(id: string) {
    try {
      const { data } = await api.post<ApiResponse<BatchResult>>(`/batch/${id}/execute`);
      return data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static async stop(id: string) {
    try {
      await api.post(`/batch/${id}/stop`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static async test(script: string, datasetId: string) {
    try {
      const { data } = await api.post<ApiResponse<BatchResult>>('/batch/test', {
        script,
        datasetId
      });
      return data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static async getHistory(id: string) {
    try {
      const { data } = await api.get<ApiResponse<BatchResult[]>>(`/batch/${id}/history`);
      return data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static async getLogs(id: string) {
    try {
      const { data } = await api.get<ApiResponse<BatchLog[]>>(`/batch/${id}/logs`);
      return data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static async getStats(id: string) {
    try {
      const { data } = await api.get<ApiResponse<any>>(`/batch/${id}/stats`);
      return data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private static handleError(error: any) {
    if (error instanceof ApiError) {
      return error;
    }
    return new ApiError(error.message || 'Unexpected error occurred');
  }
}

export class TemplateService {
  static async list() {
    try {
      const { data } = await api.get<ApiResponse<Template[]>>('/template');
      return data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static async get(id: string) {
    try {
      const { data } = await api.get<ApiResponse<Template>>(`/template/${id}`);
      return data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static async create(template: Partial<Template>) {
    try {
      const { data } = await api.post<ApiResponse<Template>>('/template', template);
      return data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static async update(id: string, template: Partial<Template>) {
    try {
      const { data } = await api.put<ApiResponse<Template>>(`/template/${id}`, template);
      return data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static async delete(id: string) {
    try {
      await api.delete(`/template/${id}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private static handleError(error: any) {
    if (error instanceof ApiError) {
      return error;
    }
    return new ApiError(error.message || 'Unexpected error occurred');
  }
}

export class DatasetService {
  static async list(templateId?: string) {
    try {
      const { data } = await api.get<ApiResponse<Dataset[]>>('/dataset', {
        params: { templateId }
      });
      return data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static async get(id: string) {
    try {
      const { data } = await api.get<ApiResponse<Dataset>>(`/dataset/${id}`);
      return data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static async create(dataset: Partial<Dataset>) {
    try {
      const { data } = await api.post<ApiResponse<Dataset>>('/dataset', dataset);
      return data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static async update(id: string, dataset: Partial<Dataset>) {
    try {
      const { data } = await api.put<ApiResponse<Dataset>>(`/dataset/${id}`, dataset);
      return data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static async delete(id: string) {
    try {
      await api.delete(`/dataset/${id}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private static handleError(error: any) {
    if (error instanceof ApiError) {
      return error;
    }
    return new ApiError(error.message || 'Unexpected error occurred');
  }
}

export const apiService = {
  batch: BatchService,
  template: TemplateService,
  dataset: DatasetService
};