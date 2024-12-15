import { Logger } from '../utils/logger';
import { BatchServiceDatabase } from '../lib/db-client';
import { IDatasetService, Dataset, DatasetInput } from '@batch-automation/shared';

export class DatasetServiceImpl implements IDatasetService {
  private logger: Logger;
  private db: BatchServiceDatabase;

  constructor(logger: Logger) {
    this.logger = logger;
    this.db = BatchServiceDatabase.getInstance();
  }

  async initialize(): Promise<void> {
    try {
      await this.db.initialize();
      this.logger.info('DatasetService initialized');
    } catch (error) {
      this.logger.error('Failed to initialize DatasetService:', error);
      throw error;
    }
  }

  async getDatasetData(id: string): Promise<Record<string, any> | null> {
    try {
      this.logger.info(`Getting dataset data: ${id}`);
      const dataset = await this.db.getCollection<Dataset>('datasets').findOne({ id });
      return dataset?.data || null;
    } catch (error) {
      this.logger.error(`Failed to get dataset data: ${id}`, error);
      throw error;
    }
  }

  async findDatasetsByTemplateId(templateId: string): Promise<Dataset[]> {
    try {
      this.logger.info(`Finding datasets for template: ${templateId}`);
      return await this.db.getCollection<Dataset>('datasets').find({ templateId });
    } catch (error) {
      this.logger.error(`Failed to find datasets for template: ${templateId}`, error);
      throw error;
    }
  }

  async createDataset(input: DatasetInput): Promise<Dataset> {
    try {
      this.logger.info('Creating new dataset');
      return await this.db.getCollection<Dataset>('datasets').insert(input);
    } catch (error) {
      this.logger.error('Failed to create dataset', error);
      throw error;
    }
  }

  async updateDataset(id: string, input: Partial<DatasetInput>): Promise<Dataset> {
    try {
      this.logger.info(`Updating dataset: ${id}`);
      const updated = await this.db.getCollection<Dataset>('datasets').update({ id }, input);
      if (!updated) {
        throw new Error(`Dataset not found: ${id}`);
      }
      return updated;
    } catch (error) {
      this.logger.error(`Failed to update dataset: ${id}`, error);
      throw error;
    }
  }

  async deleteDataset(id: string): Promise<void> {
    try {
      this.logger.info(`Deleting dataset: ${id}`);
      await this.db.getCollection<Dataset>('datasets').remove({ id });
    } catch (error) {
      this.logger.error(`Failed to delete dataset: ${id}`, error);
      throw error;
    }
  }
}