export enum BatchStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
  STOPPED = 'STOPPED'
}

export interface ScheduleConfig {
  type: 'periodic' | 'specific';
  cronExpression?: string;
  executionDates?: string[];
  randomDelay?: boolean;
}

export interface BatchConfig {
  id: string;
  title: string;
  description?: string;
  templateId: string;
  datasetId: string;
  isActive: boolean;
  schedule: ScheduleConfig;
  status?: BatchStatus;
  lastExecutedAt?: Date;
  nextExecutionAt?: Date;
  lastExecutionResult?: any;
  createdAt: Date;
  updatedAt: Date;
  batch?: {
    maxRetries?: number;
    maxRandomDelay?: number;
  };
  defaultRandomDelay?: {
    min: number;
    max: number;
  };
}

export interface BatchResult {
  id: string;
  batchId: string;
  status: BatchStatus;
  startTime: Date;
  endTime?: Date;
  executionTime?: number;
  error?: string;
  success: boolean;
  data?: any;
}

export interface BatchExecution {
  id: string;
  batchId: string;
  status: BatchStatus;
  startTime: Date;
  endTime?: Date;
  executionTime?: number;
  error?: string;
  logs: string[];
}