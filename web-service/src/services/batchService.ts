import { 
  BatchService as IBatchService, 
  BatchConfig, 
  BaseServiceConfig 
} from '@batch-automation/shared';
import { collections } from '../lib/db-client';
import { Logger } from '../utils/logger';

export class BatchService implements IBatchService {
  private logger: Logger;

  constructor(config: BaseServiceConfig = {}) {
    this.logger = config.logger || new Logger();
  }

  async create(data: Omit<BatchConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<BatchConfig> {
    try {
      const batch = await collections.batches.insert(data);
      this.logger.info(`Created batch: ${batch.id}`);
      return batch;
    } catch (error) {
      this.logger.error('Failed to create batch:', error);
      throw error;
    }
  }

  async update(id: string, data: Partial<BatchConfig>): Promise<BatchConfig> {
    try {
      const batch = await collections.batches.update({ id }, data);
      if (!batch) throw new Error(`Batch not found: ${id}`);
      
      this.logger.info(`Updated batch: ${id}`);
      return batch;
    } catch (error) {
      this.logger.error(`Failed to update batch ${id}:`, error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await collections.batches.remove({ id });
      this.logger.info(`Deleted batch: ${id}`);
    } catch (error) {
      this.logger.error(`Failed to delete batch ${id}:`, error);
      throw error;
    }
  }

  async findById(id: string): Promise<BatchConfig | null> {
    return await collections.batches.findOne({ id });
  }

  async findAll(query: Partial<BatchConfig> = {}): Promise<BatchConfig[]> {
    return await collections.batches.find(query);
  }

  async executeBatch(id: string): Promise<any> {
    try {
      const batch = await this.findById(id);
      if (!batch) throw new Error(`Batch not found: ${id}`);
      if (!batch.isActive) throw new Error(`Batch is not active: ${id}`);

      // API를 통해 배치 실행 요청
      const response = await fetch(`/api/batch/${id}/execute`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error(`Failed to execute batch: ${await response.text()}`);
      }

      const result = await response.json();
      this.logger.info(`Executed batch: ${id}`, result);
      return result;
    } catch (error) {
      this.logger.error(`Failed to execute batch ${id}:`, error);
      throw error;
    }
  }

  async getBatchHistory(id: string): Promise<any[]> {
    try {
      const response = await fetch(`/api/batch/${id}/history`);
      if (!response.ok) {
        throw new Error(`Failed to get batch history: ${await response.text()}`);
      }
      return await response.json();
    } catch (error) {
      this.logger.error(`Failed to get batch history ${id}:`, error);
      throw error;
    }
  }

  async getBatchLogs(id: string): Promise<any[]> {
    try {
      const response = await fetch(`/api/batch/${id}/logs`);
      if (!response.ok) {
        throw new Error(`Failed to get batch logs: ${await response.text()}`);
      }
      return await response.json();
    } catch (error) {
      this.logger.error(`Failed to get batch logs ${id}:`, error);
      throw error;
    }
  }
}