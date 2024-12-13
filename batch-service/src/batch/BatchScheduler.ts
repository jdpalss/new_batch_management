import { schedule, ScheduledTask } from 'node-cron';
import { BatchExecutor } from './BatchExecutor';
import { DatasetService } from '../services/datasetService';
import { Logger } from '../utils/logger';
import { loadBatches } from '../models/batch';
import { BatchConfig, BatchStatus } from '../types/batch';

export class BatchScheduler {
  private activeTasks: Map<string, ScheduledTask[]>;
  private batchExecutor: BatchExecutor;
  private datasetService: DatasetService;
  private logger: Logger;

  constructor(batchExecutor: BatchExecutor, datasetService: DatasetService, logger: Logger) {
    this.activeTasks = new Map();
    this.batchExecutor = batchExecutor;
    this.datasetService = datasetService;
    this.logger = logger;
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
    // 기존 작업이 있다면 중지
    await this.stopBatch(config.id);

    const tasks: ScheduledTask[] = [];
    this.logger.info(`Scheduling batch ${config.id}`, { 
      type: config.schedule.type,
      times: config.schedule.type === 'specific' ? config.schedule.executionDates : config.schedule.cronExpression
    });

    if (config.schedule.type === 'periodic') {
      // 주기적 실행
      const task = schedule(config.schedule.cronExpression!, async () => {
        await this.executeBatchWithDelay(config);
      });
      tasks.push(task);
      
    } else if (config.schedule.type === 'specific') {
      // 특정 일시 실행
      for (const dateStr of config.schedule.executionDates || []) {
        const executeTime = new Date(dateStr);
        if (executeTime > new Date()) { // 미래 시간만 스케줄링
          const task = this.scheduleOneTimeExecution(config, executeTime);
          if (task) {
            tasks.push(task);
            this.logger.info(`Scheduled one-time execution for batch ${config.id}`, {
              executionTime: executeTime.toISOString()
            });
          }
        }
      }
    }

    if (tasks.length > 0) {
      this.activeTasks.set(config.id, tasks);
      this.logger.info(`Scheduled ${tasks.length} executions for batch ${config.id}`);
    }
  }

  private scheduleOneTimeExecution(config: BatchConfig, executeTime: Date): ScheduledTask | null {
    const now = new Date();
    const delay = executeTime.getTime() - now.getTime();
    
    if (delay <= 0) return null;

    // node-cron으로는 정확한 시간 실행이 어려우므로 setTimeout 사용
    const timeoutId = setTimeout(async () => {
      await this.executeBatchWithDelay(config);
      // 실행 후 tasks 배열에서 제거
      const tasks = this.activeTasks.get(config.id) || [];
      const updatedTasks = tasks.filter(t => t !== task);
      if (updatedTasks.length > 0) {
        this.activeTasks.set(config.id, updatedTasks);
      } else {
        this.activeTasks.delete(config.id);
      }
    }, delay);

    // setTimeout을 node-cron task처럼 다룰 수 있도록 래핑
    const task = {
      stop: () => clearTimeout(timeoutId)
    } as ScheduledTask;

    return task;
  }

  private async executeBatchWithDelay(config: BatchConfig): Promise<void> {
    try {
      // Random delay if configured
      if (config.schedule.randomDelay) {
        const delay = Math.floor(Math.random() * (5 * 60 * 1000)); // 0-5분 사이 랜덤 지연
        this.logger.info(`Applying random delay for batch ${config.id}: ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      // 데이터셋 로드
      const dataset = await this.datasetService.getDatasetData(config.datasetId);

      // 실행 시작 로그
      this.logger.info(`Starting batch execution: ${config.id}`, {
        templateId: config.templateId,
        datasetId: config.datasetId,
        executionTime: new Date().toISOString()
      });

      // 배치 실행
      const result = await this.batchExecutor.executeBatch(config, dataset);

      // 실행 결과 로그
      this.logger.info(`Batch execution completed: ${config.id}`, {
        status: result.status,
        executionTime: result.executionTime,
        success: result.success
      });

    } catch (error) {
      this.logger.error(`Batch execution failed: ${config.id}`, error);
    }
  }

  async stopBatch(batchId: string): Promise<void> {
    const tasks = this.activeTasks.get(batchId);
    if (tasks) {
      tasks.forEach(task => task.stop());
      this.activeTasks.delete(batchId);
      this.logger.info(`Stopped all tasks for batch ${batchId}`);
    }
  }

  async stopAllBatches(): Promise<void> {
    for (const [batchId, tasks] of this.activeTasks) {
      tasks.forEach(task => task.stop());
      this.logger.info(`Stopped batch ${batchId}`);
    }
    this.activeTasks.clear();
    this.logger.info('Stopped all batches');
  }
}