import { stores } from '../lib/db';
import { BatchConfig, BatchResult, BatchStatus } from '../types/batch';
import { logger } from '../utils/logger';
import { validateBatchConfig } from '../utils/validation';

export class BatchService {
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  async createBatch(config: Omit<BatchConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<BatchConfig> {
    try {
      await validateBatchConfig(config);

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
      if (!batch) {
        throw new Error(`Batch ${id} not found`);
      }

      const updatedBatch: BatchConfig = {
        ...batch,
        ...config,
        updatedAt: new Date()
      };

      await validateBatchConfig(updatedBatch);
      await stores.batches.update({ id }, updatedBatch);
      
      this.logger.info(`Updated batch ${id}`);
      return updatedBatch;
    } catch (error) {
      this.logger.error(`Failed to update batch ${id}`, error);
      throw error;
    }
  }

  async getBatch(id: string): Promise<BatchConfig | null> {
    return stores.batches.findOne({ id });
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

  async executeBatch(id: string): Promise<BatchResult> {
    try {
      const batch = await this.getBatch(id);
      if (!batch) {
        throw new Error(`Batch ${id} not found`);
      }

      // Create execution record
      const execution = {
        id: Date.now().toString(),
        batchId: id,
        status: BatchStatus.RUNNING,
        startTime: new Date()
      };

      await stores.batchExecutions.insert(execution);

      // TODO: Implement actual batch execution logic here
      // For now, just simulate success
      const result: BatchResult = {
        ...execution,
        status: BatchStatus.SUCCESS,
        endTime: new Date(),
        success: true,
        executionTime: Date.now() - execution.startTime.getTime()
      };

      await stores.batchResults.insert(result);
      return result;
    } catch (error) {
      this.logger.error(`Failed to execute batch ${id}`, error);
      throw error;
    }
  }

  async getBatchResults(batchId: string, limit: number = 100): Promise<BatchResult[]> {
    return stores.batchResults.find({ batchId })
      .sort({ startTime: -1 })
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
    const averageExecutionTime = results.reduce((acc, r) => acc + (r.executionTime || 0), 0) / total || 0;

    return {
      total,
      success,
      failed,
      averageExecutionTime
    };
  }
}
