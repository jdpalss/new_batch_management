import Loki from 'lokijs';
import path from 'path';
import { Logger } from '../utils/logger';

const logger = new Logger();

export interface Collections {
  batches: Collection<any>;
  templates: Collection<any>;
  datasets: Collection<any>;
  batchLogs: Collection<any>;
  batchResults: Collection<any>;
}

class Database {
  private db: Loki;
  private collections: Partial<Collections> = {};
  private initialized: boolean = false;

  constructor(dbPath: string) {
    this.db = new Loki(path.join(dbPath, 'batch-automation.db'), {
      autoload: true,
      autosave: true,
      autosaveInterval: 4000,
      autoloadCallback: () => {
        this.initializeCollections();
      }
    });
  }

  private initializeCollections() {
    // 배치 컬렉션
    this.collections.batches = this.db.getCollection('batches') || 
      this.db.addCollection('batches', {
        indices: ['id', 'templateId', 'datasetId', 'isActive'],
        unique: ['id']
      });

    // 템플릿 컬렉션
    this.collections.templates = this.db.getCollection('templates') || 
      this.db.addCollection('templates', {
        indices: ['id'],
        unique: ['id']
      });

    // 데이터셋 컬렉션
    this.collections.datasets = this.db.getCollection('datasets') || 
      this.db.addCollection('datasets', {
        indices: ['id', 'templateId'],
        unique: ['id']
      });

    // 배치 로그 컬렉션
    this.collections.batchLogs = this.db.getCollection('batchLogs') || 
      this.db.addCollection('batchLogs', {
        indices: ['batchId', 'timestamp']
      });

    // 배치 결과 컬렉션
    this.collections.batchResults = this.db.getCollection('batchResults') || 
      this.db.addCollection('batchResults', {
        indices: ['batchId', 'timestamp']
      });

    this.initialized = true;
    logger.info('Database collections initialized');
  }

  async waitForInitialization(): Promise<void> {
    if (this.initialized) return;

    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (this.initialized) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
    });
  }

  getCollection<T = any>(name: keyof Collections): Collection<T> {
    if (!this.collections[name]) {
      throw new Error(`Collection ${name} not initialized`);
    }
    return this.collections[name] as Collection<T>;
  }

  async saveDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.saveDatabase((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

// 데이터 디렉토리 설정
const dataDir = process.env.DATABASE_PATH || path.join(process.cwd(), 'data');
const db = new Database(dataDir);

export { db };

// 컬렉션 유틸리티 함수
export const stores = {
  batches: {
    async find(query: any = {}) {
      await db.waitForInitialization();
      return db.getCollection('batches').find(query);
    },
    async findOne(query: any = {}) {
      await db.waitForInitialization();
      return db.getCollection('batches').findOne(query);
    },
    async insert(doc: any) {
      await db.waitForInitialization();
      const result = db.getCollection('batches').insert({
        ...doc,
        _meta: { createdAt: new Date(), updatedAt: new Date() }
      });
      await db.saveDatabase();
      return result;
    },
    async update(query: any, update: any) {
      await db.waitForInitialization();
      const collection = db.getCollection('batches');
      const doc = collection.findOne(query);
      if (doc) {
        Object.assign(doc, update, {
          _meta: { ...doc._meta, updatedAt: new Date() }
        });
        collection.update(doc);
        await db.saveDatabase();
      }
      return doc;
    },
    async remove(query: any) {
      await db.waitForInitialization();
      const collection = db.getCollection('batches');
      collection.findAndRemove(query);
      await db.saveDatabase();
    }
  },

  // 다른 컬렉션들에 대해서도 동일한 패턴으로 구현
  templates: {
    // ...동일한 패턴의 CRUD 구현
  },
  datasets: {
    // ...동일한 패턴의 CRUD 구현
  },
  batchLogs: {
    // ...동일한 패턴의 CRUD 구현
  },
  batchResults: {
    // ...동일한 패턴의 CRUD 구현
  }
};