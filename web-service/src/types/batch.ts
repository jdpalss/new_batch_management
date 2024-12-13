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
  lastExecutedAt?: Date;
  nextExecutionAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface BatchExecution {
  id: string;
  batchId: string;
  status: BatchStatus;
  startTime: Date;
  endTime?: Date;
  error?: string;
  executionTime?: number;
  logs: string[];
}

export interface BatchResult {
  id: string;
  batchId: string;
  executionId: string;
  status: BatchStatus;
  timestamp: Date;
  executionTime: number;
  error?: string;
  data?: any;
}

export interface BatchStats {
  totalExecutions: number;
  successCount: number;
  failureCount: number;
  averageExecutionTime: number;
  lastExecutionStatus?: BatchStatus;
  lastExecutionTime?: Date;
  nextExecutionTime?: Date;
}

export interface BatchLog {
  id: string;
  batchId: string;
  executionId: string;
  timestamp: Date;
  level: 'info' | 'warn' | 'error';
  message: string;
  metadata?: Record<string, any>;
}

// 배치 필터링 및 정렬을 위한 타입
export interface BatchFilter {
  status?: BatchStatus;
  templateId?: string;
  isActive?: boolean;
  from?: Date;
  to?: Date;
}

export interface BatchSort {
  field: keyof BatchConfig | 'lastExecutionStatus';
  direction: 'asc' | 'desc';
}

// 배치 실행 시 사용되는 컨텍스트
export interface BatchExecutionContext {
  batchId: string;
  executionId: string;
  templateId: string;
  datasetId: string;
  templateData: any;
  dataset: any;
  logger: {
    info: (message: string, metadata?: Record<string, any>) => void;
    warn: (message: string, metadata?: Record<string, any>) => void;
    error: (message: string, metadata?: Record<string, any>) => void;
  };
}
