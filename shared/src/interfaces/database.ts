export interface DatabaseRecord {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DatabaseConfig {
  path: string;
  autoload?: boolean;
  autosave?: boolean;
  autosaveInterval?: number;
}

export interface QueryOptions {
  sort?: Record<string, 1 | -1>;
  skip?: number;
  limit?: number;
}

export interface DatabaseCollection<T extends DatabaseRecord> {
  find(query?: Partial<T>, options?: QueryOptions): Promise<T[]>;
  findOne(query: Partial<T>): Promise<T | null>;
  insert(doc: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;
  update(query: Partial<T>, update: Partial<T>): Promise<T | null>;
  remove(query: Partial<T>): Promise<void>;
  count(query?: Partial<T>): Promise<number>;
}

export interface DatabaseClient {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  getCollection<T extends DatabaseRecord>(name: string): DatabaseCollection<T>;
}

export class DatabaseError extends Error {
  constructor(message: string, public cause?: any) {
    super(message);
    this.name = 'DatabaseError';
  }
}