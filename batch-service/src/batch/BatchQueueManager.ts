import { Logger } from '../utils/logger';
import { BatchConfig, BatchStatus } from '../types/batch';
import { DatasetService } from '../services/datasetService';
import config from '../config';

interface QueueItem {
  batch: BatchConfig;
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
}

export class BatchQueueManager {
  private queue: QueueItem[] = [];
  private runningCount = 0;
  private maxConcurrent: number;
  private logger: Logger;
  private datasetService: DatasetService;
  private executeBatchFn: (batch: BatchConfig, data: any) => Promise<any>;

  constructor(
    logger: Logger, 
    datasetService: DatasetService, 
    maxConcurrent?: number
  ) {
    this.logger = logger;
    this.datasetService = datasetService;
    this.maxConcurrent = maxConcurrent || config.batch.maxConcurrent;
    this.logger.info(`BatchQueueManager initialized with max concurrent jobs: ${this.maxConcurrent}`);
  }

  setExecuteBatchFunction(fn: (batch: BatchConfig, data: any) => Promise<any>) {
    this.executeBatchFn = fn;
  }

  async addToQueue(batch: BatchConfig): Promise<any> {
    return new Promise((resolve, reject) => {
      this.queue.push({ batch, resolve, reject });
      this.logger.info(`Added batch to queue: ${batch.id}. Current queue length: ${this.queue.length}`);
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.runningCount >= this.maxConcurrent || this.queue.length === 0 || !this.executeBatchFn) {
      return;
    }

    while (this.runningCount < this.maxConcurrent && this.queue.length > 0) {
      const item = this.queue.shift();
      if (!item) break;

      this.runningCount++;
      this.logger.info(`Starting batch execution: ${item.batch.id}. Running jobs: ${this.runningCount}`);

      try {
        // 데이터셋 로드
        const data = await this.loadBatchData(item.batch);
        
        // 로드된 데이터 확인
        this.logger.info(`Loaded data for batch ${item.batch.id}:`, {
          datasetId: item.batch.datasetId,
          dataPreview: JSON.stringify(data).substring(0, 200)
        });

        if (!data) {
          throw new Error(`No data available for batch ${item.batch.id}`);
        }

        // 배치 실행
        const result = await this.executeBatchFn(item.batch, data);
        item.resolve(result);

      } catch (error) {
        this.logger.error(`Failed to process batch ${item.batch.id}:`, error);
        item.reject(error);
      } finally {
        this.runningCount--;
        this.logger.info(`Completed batch execution: ${item.batch.id}. Running jobs: ${this.runningCount}`);
        // 큐에 남은 작업이 있으면 계속 처리
        setImmediate(() => this.processQueue());
      }
    }
  }

  private async loadBatchData(batch: BatchConfig): Promise<any> {
    try {
      this.logger.info(`Loading dataset for batch: ${batch.id}, dataset: ${batch.datasetId}`);
      const data = await this.datasetService.getDatasetData(batch.datasetId);

      if (!data) {
        throw new Error(`Dataset not found: ${batch.datasetId}`);
      }

      return data;
    } catch (error) {
      this.logger.error(`Failed to load data for batch: ${batch.id}`, error);
      throw error;
    }
  }

  setMaxConcurrent(value: number) {
    if (value < 1) {
      throw new Error('Max concurrent jobs must be greater than 0');
    }
    this.maxConcurrent = value;
    this.logger.info(`Updated max concurrent jobs to: ${value}`);
    this.processQueue();
  }

  getQueueStatus() {
    return {
      queueLength: this.queue.length,
      runningJobs: this.runningCount,
      maxConcurrent: this.maxConcurrent
    };
  }

  clearQueue() {
    const remainingJobs = this.queue.length;
    this.queue = [];
    this.logger.info(`Cleared queue. Removed ${remainingJobs} pending jobs.`);
  }
}