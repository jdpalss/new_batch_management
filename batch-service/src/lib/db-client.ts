import path from 'path';
import { createDatabaseClient, DatabaseClient, DatabaseCollection } from '@batch-automation/shared';
import { BatchConfig } from '../types/batch';
import { Logger } from '../utils/logger';

export class BatchServiceDatabase {
  private static instance: BatchServiceDatabase;
  private dbClient: DatabaseClient | null = null;
  private logger: Logger;

  private constructor() {
    this.logger = new Logger();
  }

  static getInstance(): BatchServiceDatabase {
    if (!BatchServiceDatabase.instance) {
      BatchServiceDatabase.instance = new BatchServiceDatabase();
    }
    return BatchServiceDatabase.instance;
  }

  async initialize(): Promise<void> {
    if (!this.dbClient) {
      const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), '..', 'data');
      this.logger.info(`Initializing database at: ${dbPath}`);
      
      this.dbClient = createDatabaseClient({
        path: dbPath,
        autoload: true,
        autosave: true,
        autosaveInterval: 4000
      });

      await this.dbClient.connect();
      this.logger.info('Database initialized successfully');
    }
  }

  get batches(): DatabaseCollection<BatchConfig> {
    if (!this.dbClient) throw new Error('Database not initialized');
    return this.dbClient.getCollection<BatchConfig>('batches');
  }

  async disconnect(): Promise<void> {
    if (this.dbClient) {
      await this.dbClient.disconnect();
      this.dbClient = null;
    }
  }
}