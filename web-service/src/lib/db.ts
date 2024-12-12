import Datastore from 'nedb';
import { promisifyStore } from './utils';

export const createStore = (filename: string) => {
  const db = new Datastore({ filename, autoload: true });
  return promisifyStore(db);
};

export const stores = {
  templates: createStore(process.env.DATABASE_PATH + '/templates.db'),
  datasets: createStore(process.env.DATABASE_PATH + '/datasets.db'),
  batches: createStore(process.env.DATABASE_PATH + '/batches.db'),
  batchResults: createStore(process.env.DATABASE_PATH + '/batch-results.db'),
  batchLogs: createStore(process.env.DATABASE_PATH + '/batch-logs.db')
};