import Loki, { Collection } from 'lokijs';
import path from 'path';
import {
  DatabaseClient,
  DatabaseCollection,
  DatabaseRecord,
  DatabaseError,
  DatabaseConfig,
  QueryOptions
} from '../interfaces/database';

// Loki specific types
interface LokiObj {
  $loki: number;
  meta: {
    created: number;
    revision: number;
    updated: number;
    version: number;
  };
}

type LokiDocument<T> = T & LokiObj;
type SortDirection = 1 | -1;

interface LokiOperators {
  $eq?: any;
  $ne?: any;
  $gt?: any;
  $gte?: any;
  $lt?: any;
  $lte?: any;
  $between?: any[];
  $in?: any[];
  $nin?: any[];
  $and?: any[];
  $or?: any[];
}

type LokiQuery<T> = {
  [P in keyof (T & LokiObj)]?: (T & LokiObj)[P] | LokiOperators;
};

export class LokiCollection<T extends DatabaseRecord> implements DatabaseCollection<T> {
  constructor(private collection: Collection<any>) {}

  async find(query?: Partial<T>, options?: QueryOptions): Promise<T[]> {
    try {
      const lokiQuery = this.transformQuery(query || {});
      let results = this.collection.find(lokiQuery);

      if (options?.sort) {
        Object.entries(options.sort).forEach(([field, order]: [string, SortDirection]) => {
          results = results.sort((a: Record<string, any>, b: Record<string, any>) => {
            const aValue = a[field];
            const bValue = b[field];
            return this.compareValues(aValue, bValue, order);
          });
        });
      }

      if (options?.skip) {
        results = results.slice(options.skip);
      }

      if (options?.limit) {
        results = results.slice(0, options.limit);
      }

      return results.map(doc => this.cleanDocument(doc));
    } catch (error) {
      throw new DatabaseError('Find operation failed', error);
    }
  }

  async findOne(query: Partial<T>): Promise<T | null> {
    try {
      const lokiQuery = this.transformQuery(query);
      const doc = this.collection.findOne(lokiQuery);
      return doc ? this.cleanDocument(doc) : null;
    } catch (error) {
      throw new DatabaseError('FindOne operation failed', error);
    }
  }

  async insert(doc: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    try {
      const now = new Date();
      const insertDoc = {
        ...doc,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now
      };

      const inserted = this.collection.insert(insertDoc);
      if (!inserted) {
        throw new Error('Insert operation failed');
      }

      return this.cleanDocument(inserted);
    } catch (error) {
      throw new DatabaseError('Insert operation failed', error);
    }
  }

  async update(query: Partial<T>, update: Partial<T>): Promise<T | null> {
    try {
      const lokiQuery = this.transformQuery(query);
      const doc = this.collection.findOne(lokiQuery);
      if (!doc) return null;

      const updateDoc = {
        ...doc,
        ...update,
        updatedAt: new Date()
      };

      const updated = this.collection.update(updateDoc);
      if (!updated) {
        throw new Error('Update operation failed');
      }

      return this.cleanDocument(updated);
    } catch (error) {
      throw new DatabaseError('Update operation failed', error);
    }
  }

  async remove(query: Partial<T>): Promise<void> {
    try {
      const lokiQuery = this.transformQuery(query);
      const docsToRemove = this.collection.find(lokiQuery);
      docsToRemove.forEach((doc: any) => {
        this.collection.remove(doc);
      });
    } catch (error) {
      throw new DatabaseError('Remove operation failed', error);
    }
  }

  async count(query?: Partial<T>): Promise<number> {
    try {
      const lokiQuery = query ? this.transformQuery(query) : {};
      return this.collection.count(lokiQuery);
    } catch (error) {
      throw new DatabaseError('Count operation failed', error);
    }
  }

  private cleanDocument(doc: Record<string, any>): T {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { $loki, meta, ...rest } = doc;
    return rest as T;
  }

  private transformQuery(query: Partial<T>): Record<string, any> {
    return query as Record<string, any>;
  }

  private compareValues(a: unknown, b: unknown, order: SortDirection): number {
    if (a === b) return 0;
    if (a === null || a === undefined) return order === 1 ? -1 : 1;
    if (b === null || b === undefined) return order === 1 ? 1 : -1;

    if (a instanceof Date && b instanceof Date) {
      return order === 1 ? 
        a.getTime() - b.getTime() : 
        b.getTime() - a.getTime();
    }

    if (typeof a === 'string' && typeof b === 'string') {
      return order === 1 ? 
        a.localeCompare(b) : 
        b.localeCompare(a);
    }

    if (typeof a === 'number' && typeof b === 'number') {
      return order === 1 ? a - b : b - a;
    }

    const aStr = String(a);
    const bStr = String(b);
    return order === 1 ? 
      aStr.localeCompare(bStr) : 
      bStr.localeCompare(aStr);
  }
}

export class LokiClient implements DatabaseClient {
  private db: Loki;
  private initialized = false;
  private collections = new Map<string, Collection<any>>();

  constructor(private config: DatabaseConfig) {
    const dbPath = path.join(config.path, 'batch-automation.db');
    
    this.db = new Loki(dbPath, {
      autoload: config.autoload ?? true,
      autosave: config.autosave ?? true,
      autosaveInterval: config.autosaveInterval ?? 4000,
      autoloadCallback: () => {
        this.initialized = true;
      }
    });
  }

  async connect(): Promise<void> {
    if (this.initialized) return;

    return new Promise<void>((resolve) => {
      const checkInterval = setInterval(() => {
        if (this.initialized) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
    });
  }

  async disconnect(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.db.saveDatabase((error: Error | null) => {
        if (error) reject(new DatabaseError('Failed to save database', error));
        else resolve();
      });
    });
  }

  getCollection<T extends DatabaseRecord>(name: string): DatabaseCollection<T> {
    let collection = this.collections.get(name) as Collection<T> | undefined;
    
    if (!collection) {
      collection = this.db.addCollection<T>(name, {
        indices: ['id'],
        unique: ['id']
      });
      this.collections.set(name, collection);
    }

    return new LokiCollection<T>(collection);
  }
}