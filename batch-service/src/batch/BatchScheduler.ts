import { schedule, ScheduledTask } from 'node-cron';
import { BatchExecutor } from './BatchExecutor';
import { BatchConfig, ScheduleConfig } from '../models/batch';
import { Logger } from '../utils/logger';

export class BatchScheduler {
  private activeTasks: Map<string, ScheduledTask>;
  private batchExecutor: BatchExecutor;
  private logger: Logger;

  constructor(batchExecutor: BatchExecutor, logger: Logger) {
    this.activeTasks = new Map();
    this.batchExecutor = batchExecutor;
    this.logger = logger;
  }

  async scheduleBatch(config: BatchConfig, scheduleConfig: ScheduleConfig): Promise<void> {
    if (this.activeTasks.has(config.id)) {
      throw new Error(`Batch ${config.id} is already scheduled`);
    }

    let cronExpression: string;
    if (scheduleConfig.type === 'periodic') {
      cronExpression = scheduleConfig.cronExpression;
    } else {
      cronExpression = this.convertDatesToCron(scheduleConfig.executionDates);
    }

    const task = schedule(cronExpression, async () => {
      try {
        // Add random delay if configured
        if (scheduleConfig.randomDelay) {
          const delay = Math.floor(Math.random() * scheduleConfig.randomDelay);
          await new Promise(resolve => setTimeout(resolve, delay));
        }

        // Load dataset
        const dataset = await this.loadDataset(config.datasetId);
        
        // Execute batch
        const result = await this.batchExecutor.executeBatch(config, dataset);
        
        // Log results
        if (result.success) {
          this.logger.info(`Batch ${config.id} executed successfully`, result);
        } else {
          this.logger.error(`Batch ${config.id} failed`, result);
        }
        
        // Store results in database
        await this.storeBatchResult(result);
      } catch (error) {
        this.logger.error(`Failed to execute batch ${config.id}`, error);
      }
    });

    this.activeTasks.set(config.id, task);
    this.logger.info(`Scheduled batch ${config.id} with cron: ${cronExpression}`);
  }

  stopBatch(batchId: string): void {
    const task = this.activeTasks.get(batchId);
    if (task) {
      task.stop();
      this.activeTasks.delete(batchId);
      this.logger.info(`Stopped batch ${batchId}`);
    }
  }

  private convertDatesToCron(dates: Date[]): string {
    const date = dates[0];
    return `${date.getMinutes()} ${date.getHours()} ${date.getDate()} ${date.getMonth() + 1} *`;
  }

  private async loadDataset(datasetId: string): Promise<any> {
    // Implementation to load dataset from NeDB
    // This would be implemented in a separate service
    return {};
  }

  private async storeBatchResult(result: any): Promise<void> {
    // Implementation to store batch results in NeDB
    // This would be implemented in a separate service
  }
}