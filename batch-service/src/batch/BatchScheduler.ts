import { schedule, ScheduledTask } from 'node-cron';
import { BatchExecutor } from './BatchExecutor';
import { BatchQueueManager } from './BatchQueueManager';
import { DatasetService } from '../services/datasetService';
import { Logger } from '../utils/logger';
import { loadBatches } from '../models/batch';
import { BatchConfig, BatchStatus } from '../types/batch';
import config from '../config';

export class BatchScheduler {
  private activeTasks: Map<string, ScheduledTask[]>;
  private batchExecutor: BatchExecutor;
  private datasetService: DatasetService;
  private logger: Logger;
  private queueManager: BatchQueueManager;

  constructor(
    batchExecutor: BatchExecutor, 
    datasetService: DatasetService, 
    logger: Logger,
    maxConcurrent?: number
  ) {
    this.activeTasks = new Map();
    this.batchExecutor = batchExecutor;
    this.datasetService = datasetService;
    this.logger = logger;
    this.queueManager = new BatchQueueManager(logger, datasetService, maxConcurrent);

    // BatchQueueManager에 실제 실행 함수 설정
    this.queueManager['executeBatch'] = this.executeBatchWithDelay.bind(this);
  }

  async loadExistingBatches(): Promise<void> {
    try {
      this.logger.info('Loading existing batches...');
      const batches = await loadBatches();
      
      for (const batch of batches) {
        if (batch.isActive) {
          await this.scheduleBatch(batch);
          this.logger.info(`Loaded and scheduled batch: ${batch.id}`);
        }
      }
      
      this.logger.info(`Loaded ${batches.length} batches`);
    } catch (error) {
      this.logger.error('Failed to load existing batches', error);
      throw error;
    }
  }

  async scheduleBatch(config: BatchConfig): Promise<void> {
    if (this.activeTasks.has(config.id)) {
      await this.stopBatch(config.id);
    }

    const tasks: ScheduledTask[] = [];

    if (config.schedule.type === 'periodic' && config.schedule.cronExpression) {
      const task = schedule(config.schedule.cronExpression, async () => {
        // 배치를 큐에 추가
        await this.queueManager.addToQueue(config)
          .catch(error => this.logger.error(`Failed to execute batch ${config.id}`, error));
      });
      tasks.push(task);
      
    } else if (config.schedule.type === 'specific' && config.schedule.executionDates?.length) {
      for (const dateStr of config.schedule.executionDates) {
        const executeTime = new Date(dateStr);
        if (executeTime > new Date()) {
          const task = this.scheduleOneTimeExecution(config, executeTime);
          if (task) tasks.push(task);
        }
      }
    }

    if (tasks.length > 0) {
      this.activeTasks.set(config.id, tasks);
    }
  }

  private scheduleOneTimeExecution(config: BatchConfig, executeTime: Date): ScheduledTask | null {
    const now = new Date();
    const delay = executeTime.getTime() - now.getTime();
    
    if (delay <= 0) return null;

    const timeoutId = setTimeout(async () => {
      await this.queueManager.addToQueue(config)
        .catch(error => this.logger.error(`Failed to execute batch ${config.id}`, error));
    }, delay);

    return {
      stop: () => clearTimeout(timeoutId)
    } as ScheduledTask;
  }

  private async executeBatchWithDelay(config: BatchConfig): Promise<any> {
    if (config.schedule.randomDelay) {
      const delay = Math.floor(Math.random() * (5 * 60 * 1000)); // 0-5분 랜덤 지연
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    return await this.batchExecutor.executeBatch(config, null); // 데이터는 실행 시점에 로드
  }

  async stopBatch(batchId: string): Promise<void> {
    const tasks = this.activeTasks.get(batchId);
    if (tasks) {
      tasks.forEach(task => task.stop());
      this.activeTasks.delete(batchId);
      this.logger.info(`Stopped batch ${batchId}`);
    }
  }

  async stopAllBatches(): Promise<void> {
    for (const [batchId, tasks] of this.activeTasks) {
      tasks.forEach(task => task.stop());
      this.logger.info(`Stopped batch ${batchId}`);
    }
    this.activeTasks.clear();
    this.queueManager.clearQueue();
    this.logger.info('Stopped all batches');
  }

  setMaxConcurrent(value: number): void {
    this.queueManager.setMaxConcurrent(value);
  }

  getQueueStatus() {
    return this.queueManager.getQueueStatus();
  }
}