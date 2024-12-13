import Datastore from 'nedb';
import path from 'path';

interface Stores {
  batches: Datastore;
  templates: Datastore;
  datasets: Datastore;
  batchExecutions: Datastore;
  batchLogs: Datastore;
}

// DB 파일 경로
const DATA_DIR = process.env.DATABASE_PATH || path.join(process.cwd(), 'data');

// DB 인스턴스 생성
export const stores: Stores = {
  batches: new Datastore({ 
    filename: path.join(DATA_DIR, 'batches.db'),
    autoload: true 
  }),
  templates: new Datastore({ 
    filename: path.join(DATA_DIR, 'templates.db'),
    autoload: true 
  }),
  datasets: new Datastore({ 
    filename: path.join(DATA_DIR, 'datasets.db'),
    autoload: true 
  }),
  batchExecutions: new Datastore({ 
    filename: path.join(DATA_DIR, 'batch-executions.db'),
    autoload: true 
  }),
  batchLogs: new Datastore({ 
    filename: path.join(DATA_DIR, 'batch-logs.db'),
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
      stores.batchExecutions.ensureIndex({ fieldName: 'id', unique: true });
      stores.batchLogs.ensureIndex({ fieldName: 'id', unique: true });

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