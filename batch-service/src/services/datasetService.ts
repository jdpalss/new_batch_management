import Datastore from 'nedb-promises';
import path from 'path';
import { Logger } from '../utils/logger';

export class DatasetService {
  private db: Datastore;
  private logger: Logger;

  constructor(dbPath: string, logger: Logger) {
    // 절대 경로로 변환
    const dbFilePath = path.resolve(dbPath, 'datasets.db');
    this.db = Datastore.create({
      filename: dbFilePath,
      autoload: true
    });
    this.logger = logger;
  }

  async getDataset(id: string): Promise<any> {
    try {
      const dataset = await this.db.findOne({ id });
      if (!dataset) {
        throw new Error(`Dataset ${id} not found`);
      }
      return dataset;
    } catch (error) {
      this.logger.error(`Failed to get dataset ${id}`, error);
      throw error;
    }
  }

  async getDatasetData(id: string): Promise<Record<string, any>> {
    const dataset = await this.getDataset(id);
    return dataset.data;
  }

  async validateDataset(id: string): Promise<boolean> {
    try {
      const dataset = await this.getDataset(id);
      return !!dataset && !!dataset.data;
    } catch {
      return false;
    }
  }
}