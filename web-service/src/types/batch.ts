export enum BatchStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  INACTIVE = 'INACTIVE'
}

export interface BatchSchedule {
  type: 'periodic' | 'specific';
  cronExpression?: string;
  executionDates?: string[];
  randomDelay?: boolean;
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
  nextExecutionAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface BatchResult {
  id: string;
  batchId: string;
  status: BatchStatus;
  startTime: Date;         // 시작 시간
  endTime: Date;           // 종료 시간
  executionTime: number;   // 실행 시간 (밀리초)
  success: boolean;
  data?: any;             // 실행 결과 데이터
  error?: string;         // 오류 메시지
  metadata?: {
    scriptVersion?: string;
    environment?: string;
    errorStack?: string;
    [key: string]: any;
  };
}

export interface BatchLog {
  id: string;
  batchId: string;
  executionId: string;
  level: 'info' | 'error' | 'warn';
  message: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface BatchStats {
  totalExecutions: number;
  successCount: number;
  failureCount: number;
  averageExecutionTime: number;
  lastExecution?: BatchResult;
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
  stats?: BatchStats;
}