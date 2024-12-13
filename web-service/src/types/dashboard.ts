export interface DashboardStats {
  totalTemplates: number;
  totalDatasets: number;
  totalBatches: number;
  activeBatches: number;
  successRate: number;
  lastExecutionTime?: Date;
  nextScheduledRun?: Date;
}

export interface BatchQuickStats {
  total: number;
  running: number;
  success: number;
  failed: number;
  successRate: number;
  averageExecutionTime: number;
}

export interface RecentExecution {
  id: string;
  batchId: string;
  batchTitle: string;
  status: 'success' | 'failure' | 'running';
  startTime: Date;
  duration: number;
  error?: string;
}

export interface DashboardData extends DashboardStats {
  recentExecutions: RecentExecution[];
  batchQuickStats: BatchQuickStats;
}