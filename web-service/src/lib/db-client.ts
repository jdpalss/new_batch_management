import path from 'path';
import { createDatabaseClient, DatabaseClient, DatabaseCollection } from '@batch-automation/shared';
import { BatchConfig } from '../types/batch';
import { Template } from '../types/template';
import { Dataset } from '../types/dataset';

let dbClient: DatabaseClient | null = null;

export async function initializeDatabase() {
  if (!dbClient) {
    const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), '..', 'data');
    dbClient = createDatabaseClient({
      path: dbPath,
      autoload: true,
      autosave: true,
      autosaveInterval: 4000
    });
    await dbClient.connect();
  }
  return dbClient;
}

export const collections = {
  get batches(): DatabaseCollection<BatchConfig> {
    if (!dbClient) throw new Error('Database not initialized');
    return dbClient.getCollection<BatchConfig>('batches');
  },
  
  get templates(): DatabaseCollection<Template> {
    if (!dbClient) throw new Error('Database not initialized');
    return dbClient.getCollection<Template>('templates');
  },
  
  get datasets(): DatabaseCollection<Dataset> {
    if (!dbClient) throw new Error('Database not initialized');
    return dbClient.getCollection<Dataset>('datasets');
  }
};