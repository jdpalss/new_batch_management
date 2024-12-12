import { stores } from '../lib/db';
import { BatchConfig, BatchResult, BatchStatus } from '../types/batch';
import { Logger } from '../utils/logger';
import * as cronValidator from 'cron-validator';

export class BatchService {
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  async createBatch(config: Omit<BatchConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<BatchConfig> {
    try {
      await this.validateBatchConfig(config);

      const batch: BatchConfig = {
        id: Date.now().toString(),
        ...config,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await stores.batches.insert(batch);
      this.logger.info(`Created batch ${batch.id}`);
      
      return batch;
    } catch (error) {
      this.logger.error('Failed to create batch', error);
      throw error;
    }
  }

  async updateBatch(id: string, config: Partial<BatchConfig>): Promise<BatchConfig> {
    try {
      const batch = await this.getBatch(id);
      const updatedBatch: BatchConfig = {
        ...batch,
        ...config,
        updatedAt: new Date()
      };

      await this.validateBatchConfig(updatedBatch);
      await stores.batches.update({ id }, updatedBatch);
      
      this.logger.info(`Updated batch ${id}`);
      return updatedBatch;
    } catch (error) {
      this.logger.error(`Failed to update batch ${id}`, error);
      throw error;
    }
  }

  async getBatch(id: string): Promise<BatchConfig> {
    const batch = await stores.batches.findOne({ id });
    if (!batch) {
      throw new Error(`Batch ${id} not found`);
    }
    return batch;
  }

  async listBatches(filter?: {
    isActive?: boolean;
    templateId?: string;
  }): Promise<BatchConfig[]> {
    return stores.batches.find(filter || {}).sort({ createdAt: -1 });
  }

  async deleteBatch(id: string): Promise<void> {
    try {
      await stores.batches.remove({ id });
      
      // Clean up related data
      await stores.batchResults.remove({ batchId: id }, { multi: true });
      await stores.batchLogs.remove({ batchId: id }, { multi: true });
      
      this.logger.info(`Deleted batch ${id} and related data`);
    } catch (error) {
      this.logger.error(`Failed to delete batch ${id}`, error);
      throw error;
    }
  }

  async getBatchResults(batchId: string, limit: number = 100): Promise<BatchResult[]> {
    return stores.batchResults.find({ batchId })
      .sort({ timestamp: -1 })
      .limit(limit);
  }

  async getBatchStats(batchId: string): Promise<{
    total: number;
    success: number;
    failed: number;
    averageExecutionTime: number;
  }> {
    const results = await this.getBatchResults(batchId);
    
    const total = results.length;
    const success = results.filter(r => r.status === BatchStatus.SUCCESS).length;
    const failed = results.filter(r => r.status === BatchStatus.FAILURE).length;
    const averageExecutionTime = results.reduce((acc, r) => acc + r.executionTime, 0) / total || 0;

    return {
      total,
      success,
      failed,
      averageExecutionTime
    };
  }

  private async validateBatchConfig(config: Partial<BatchConfig>): Promise<void> {
    const errors: string[] = [];

    // Basic validations
    if (!config.title?.trim()) {
      errors.push('Title is required');
    }

    if (!config.templateId) {
      errors.push('Template ID is required');
    } else {
      const template = await stores.templates.findOne({ id: config.templateId });
      if (!template) {
        errors.push('Template not found');
      }
    }

    if (!config.datasetId) {
      errors.push('Dataset ID is required');
    } else {
      const dataset = await stores.datasets.findOne({ id: config.datasetId });
      if (!dataset) {
        errors.push('Dataset not found');
      }
    }

    // Schedule validation
    if (config.schedule) {
      if (config.schedule.type === 'periodic' && config.schedule.cronExpression) {
        if (!cronValidator.isValidCron(config.schedule.cronExpression)) {
          errors.push('Invalid cron expression');
        }
      } else if (config.schedule.type === 'specific' && config.schedule.executionDates) {
        if (!config.schedule.executionDates.length) {
          errors.push('At least one execution date is required');
        }
        
        for (const date of config.schedule.executionDates) {
          if (isNaN(new Date(date).getTime())) {
            errors.push('Invalid execution date');
            break;
          }
        }
      } else {
        errors.push('Invalid schedule configuration');
      }

      if (config.schedule.randomDelay && config.schedule.randomDelay < 0) {
        errors.push('Random delay must be non-negative');
      }
    } else {
      errors.push('Schedule configuration is required');
    }

    if (errors.length > 0) {
      throw new Error(`Invalid batch configuration: ${errors.join(', ')}`);
    }
  }
}