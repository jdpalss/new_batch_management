import { DataStore } from 'nedb-promises';
import { Logger } from '../utils/logger';

export class DatasetService {
  private db: DataStore;
  private logger: Logger;

  constructor(dbPath: string, logger: Logger) {
    this.db = DataStore.create({
      filename: `${dbPath}/datasets.db`,
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