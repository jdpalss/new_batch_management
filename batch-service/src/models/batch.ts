import { Page } from 'playwright';

export interface BatchConfig {
  id: string;
  title: string;
  description?: string;
  templateId: string;
  datasetId: string;
  script: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ScheduleConfig {
  type: 'periodic' | 'specific';
  cronExpression?: string;
  executionDates?: Date[];
  randomDelay?: number;  // milliseconds
}

export interface BatchContext {
  page: Page;
  data: any;
  log: (message: string) => void;
  error: (message: string, error?: Error) => void;
}

export interface BatchResult {
  id: string;
  batchId: string;
  status: BatchStatus;
  executionTime: number;
  error?: string;
  timestamp: Date;
  logs: BatchLogEntry[];
}

export enum BatchStatus {
  SUCCESS = 'success',
  FAILURE = 'failure',
  RUNNING = 'running',
  STOPPED = 'stopped'
}

export interface BatchLogEntry {
  timestamp: Date;
  level: 'info' | 'error' | 'warn';
  message: string;
  metadata?: Record<string, any>;
}