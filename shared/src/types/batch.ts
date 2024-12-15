export enum BatchStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  INACTIVE = 'INACTIVE'
}

export type ScheduleType = 'periodic' | 'specific';

export interface BatchSchedule {
  type: ScheduleType;
  cronExpression?: string;
  executionDates?: string[];
  useRandomDelay?: boolean;
  timezone?: string;
}

export interface BatchConfig {
  id: string;
  title: string;
  description?: string;
  templateId: string;
  datasetId: string;
  schedule: BatchSchedule;
  isActive: boolean;
  script?: string;
  lastExecutedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface BatchResult {
  id: string;
  batchId: string;
  status: BatchStatus;
  startTime: Date;
  endTime: Date;
  executionTime: number;
  success: boolean;
  data?: any;
  error?: string;
  metadata?: Record<string, any>;
}

export interface BatchLog {
  id: string;
  batchId: string;
  executionId: string;
  level: 'info' | 'error' | 'warn';
  message: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

export interface BatchWithDetails extends BatchConfig {
  template: {
    id: string;
    name: string;
  };
  dataset: {
    id: string;
    name: string;
  };
  lastRun?: Date;
  nextRun?: Date;
  status: BatchStatus;
}