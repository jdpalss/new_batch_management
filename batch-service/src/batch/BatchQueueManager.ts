import { Logger } from '../utils/logger';
import { BatchConfig } from '../types/batch';
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

  constructor(logger: Logger, datasetService: DatasetService, maxConcurrent?: number) {
    this.logger = logger;
    this.datasetService = datasetService;
    this.maxConcurrent = maxConcurrent || config.batch.maxConcurrent;
    this.logger.info(`BatchQueueManager initialized with max concurrent jobs: ${this.maxConcurrent}`);
  }

  async addToQueue(batch: BatchConfig): Promise<any> {
    return new Promise((resolve, reject) => {
      this.queue.push({ batch, resolve, reject });
      this.logger.info(`Added batch to queue: ${batch.id}. Current queue length: ${this.queue.length}`);
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.runningCount >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    while (this.runningCount < this.maxConcurrent && this.queue.length > 0) {
      const item = this.queue.shift();
      if (!item) break;

      this.runningCount++;
      this.logger.info(`Starting batch execution: ${item.batch.id}. Running jobs: ${this.runningCount}`);

      try {
        // 실행 직전에 데이터셋 로드
        const data = await this.loadBatchData(item.batch);
        
        // 데이터가 있는 경우에만 실행
        if (data) {
          const result = await this.executeBatch(item.batch, data);
          item.resolve(result);
        } else {
          item.reject(new Error('No data available for batch execution'));
        }
      } catch (error) {
        item.reject(error);
      } finally {
        this.runningCount--;
        this.logger.info(`Completed batch execution: ${item.batch.id}. Running jobs: ${this.runningCount}`);
        this.processQueue(); // 다음 큐 처리
      }
    }
  }

  private async loadBatchData(batch: BatchConfig): Promise<any> {
    try {
      // 데이터셋 동적 로드
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

  private async executeBatch(batch: BatchConfig, data: any): Promise<any> {
    // 실제 BatchExecutor에 위임 (이 부분은 BatchScheduler에서 주입받을 예정)
    return Promise.resolve();
  }

  setMaxConcurrent(value: number) {
    if (value < 1) {
      throw new Error('Max concurrent jobs must be greater than 0');
    }
    this.maxConcurrent = value;
    this.logger.info(`Updated max concurrent jobs to: ${value}`);
    this.processQueue(); // 새로운 설정으로 큐 처리 시도
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