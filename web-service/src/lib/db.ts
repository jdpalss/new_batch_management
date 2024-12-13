import Datastore from 'nedb';
import path from 'path';
import config from '../config';

interface Stores {
  batches: Datastore;
  templates: Datastore;
  datasets: Datastore;
  batchResults: Datastore;
  batchLogs: Datastore;
}

const dataDir = process.env.DATABASE_PATH || './data';

// DB 인스턴스 생성
export const stores: Stores = {
  batches: new Datastore({ 
    filename: path.join(dataDir, 'batches.db'),
    autoload: true 
  }),
  templates: new Datastore({ 
    filename: path.join(dataDir, 'templates.db'),
    autoload: true 
  }),
  datasets: new Datastore({ 
    filename: path.join(dataDir, 'datasets.db'),
    autoload: true 
  }),
  batchResults: new Datastore({ 
    filename: path.join(dataDir, 'batch-results.db'),
    autoload: true 
  }),
  batchLogs: new Datastore({ 
    filename: path.join(dataDir, 'batch-logs.db'),
    autoload: true 
  })
};

// DB 초기화 함수
export async function initializeDB() {
  return new Promise((resolve, reject) => {
    try {
      // 인덱스 생성
      stores.batches.ensureIndex({ fieldName: 'id', unique: true });
      stores.templates.ensureIndex({ fieldName: 'id', unique: true });
      stores.datasets.ensureIndex({ fieldName: 'id', unique: true });
      stores.batchResults.ensureIndex({ fieldName: 'id', unique: true });
      stores.batchLogs.ensureIndex({ fieldName: 'id', unique: true });

      // batchResults와 batchLogs에 추가 인덱스 생성
      stores.batchResults.ensureIndex({ fieldName: 'batchId' });
      stores.batchLogs.ensureIndex({ fieldName: 'batchId' });

      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
}

// API 라우트에서 사용할 DB 초기화 함수
export async function ensureDBInitialized() {
  try {
    await initializeDB();
    return true;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    return false;
  }
}