import { schedule, ScheduledTask } from 'node-cron';
import { BatchExecutor } from './BatchExecutor';
import { DatasetService } from '@batch-automation/shared';
import { Logger } from '../utils/logger';
import { BatchServiceDatabase } from '../lib/db-client';
import { BatchConfig } from '../types/batch';
import * as cronParser from 'cron-parser';

export class BatchScheduler {
  private activeTasks: Map<string, ScheduledTask[]>;
  private batchExecutor: BatchExecutor;
  private datasetService: DatasetService;
  private logger: Logger;
  private db: BatchServiceDatabase;

  constructor(
    batchExecutor: BatchExecutor,
    datasetService: DatasetService,
    logger: Logger
  ) {
    this.activeTasks = new Map();
    this.batchExecutor = batchExecutor;
    this.datasetService = datasetService;
    this.logger = logger;
    this.db = BatchServiceDatabase.getInstance();
  }

  async startPeriodicCheck(intervalSeconds: number = 10): Promise<void> {
    try {
      await this.db.initialize();
      this.logger.info(`Starting periodic batch check every ${intervalSeconds} seconds`);

      setInterval(async () => {
        try {
          await this.checkAndScheduleBatches();
        } catch (error) {
          this.logger.error('Error during batch check:', error);
        }
      }, intervalSeconds * 1000);

      await this.checkAndScheduleBatches();
    } catch (error) {
      this.logger.error('Failed to start periodic check:', error);
      throw error;
    }
  }

  private async checkAndScheduleBatches(): Promise<void> {
    const now = new Date();
    this.logger.info('Checking for batches to schedule...');

    try {
      const batches = await this.db.batches.find({ isActive: true });
      this.logger.info(`Found ${batches.length} active batches`);

      for (const batch of batches) {
        if (await this.shouldScheduleBatch(batch, now)) {
          await this.scheduleBatch(batch);
        }
      }
    } catch (error) {
      this.logger.error('Error checking batches:', error);
    }
  }

  private async shouldScheduleBatch(batch: BatchConfig, now: Date): Promise<boolean> {
    if (!batch.schedule) return false;

    try {
      if (batch.schedule.type === 'periodic' && batch.schedule.cronExpression) {
        const interval = cronParser.parseExpression(batch.schedule.cronExpression);
        const nextRun = interval.next().toDate();
        const diffSeconds = Math.abs((nextRun.getTime() - now.getTime()) / 1000);

        if (diffSeconds <= 60) {
          const lastRun = batch.lastExecutedAt ? new Date(batch.lastExecutedAt) : null;
          if (!lastRun || (now.getTime() - lastRun.getTime()) >= 60000) {
            this.logger.info(`Scheduling periodic batch: ${batch.id}`, {
              nextRun,
              lastRun
            });
            return true;
          }
        }
      }

      if (batch.schedule.type === 'specific' && Array.isArray(batch.schedule.executionDates)) {
        for (const dateStr of batch.schedule.executionDates) {
          const executeTime = new Date(dateStr);
          const diffSeconds = Math.abs((executeTime.getTime() - now.getTime()) / 1000);

          if (diffSeconds <= 60) {
            const lastRun = batch.lastExecutedAt ? new Date(batch.lastExecutedAt) : null;
            if (!lastRun || lastRun.getTime() < executeTime.getTime()) {
              this.logger.info(`Scheduling specific time batch: ${batch.id}`, {
                executeTime,
                lastRun
              });
              return true;
            }
          }
        }
      }

      return false;
    } catch (error) {
      this.logger.error(`Error checking schedule for batch ${batch.id}:`, error);
      return false;
    }
  }

  private async scheduleBatch(batch: BatchConfig): Promise<void> {
    try {
      const data = await this.datasetService.getDatasetData(batch.datasetId);
      if (!data) {
        throw new Error(`Dataset not found: ${batch.datasetId}`);
      }

      if (batch.schedule.useRandomDelay) {
        const delay = Math.floor(Math.random() * (5 * 60 * 1000)); // 0-5분
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      const result = await this.batchExecutor.executeBatch(batch);
      this.logger.info(`Batch executed successfully: ${batch.id}`, result);
    } catch (error) {
      this.logger.error(`Failed to execute batch ${batch.id}:`, error);
    }
  }

  async shutdown(): Promise<void> {
    this.logger.info('Shutting down batch scheduler...');
    for (const tasks of this.activeTasks.values()) {
      for (const task of tasks) {
        task.stop();
      }
    }
    this.activeTasks.clear();
  }
}