import { DatabaseRecord } from './database';

export interface BaseServiceConfig {
  logger?: any;
  dbClient?: any;
}

export interface BatchConfig extends DatabaseRecord {
  title: string;
  description?: string;
  templateId: string;
  datasetId: string;
  isActive: boolean;
  schedule: {
    type: 'periodic' | 'specific';
    cronExpression?: string;
    executionDates?: string[];
    randomDelay?: boolean;
  };
  lastExecutedAt?: Date;
  nextExecutionAt?: Date;
  script?: string;
}

export interface Template extends DatabaseRecord {
  name: string;
  description?: string;
  fields: TemplateField[];
  script?: string;
}

export interface Dataset extends DatabaseRecord {
  name: string;
  templateId: string;
  description?: string;
  data: Record<string, any>;
}

export interface TemplateField {
  name: string;
  type: string;
  required?: boolean;
  options?: any[];
  defaultValue?: any;
}

export interface BaseService<T extends DatabaseRecord> {
  create(data: Omit<T, keyof DatabaseRecord>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<T | null>;
  findAll(query?: Partial<T>): Promise<T[]>;
}

export interface BatchService extends BaseService<BatchConfig> {
  executeBatch(id: string): Promise<any>;
  getBatchHistory(id: string): Promise<any[]>;
  getBatchLogs(id: string): Promise<any[]>;
}

export interface TemplateService extends BaseService<Template> {
  validateTemplate(template: Partial<Template>): Promise<void>;
  getTemplateWithDatasets(id: string): Promise<{
    template: Template;
    datasets: Dataset[];
  }>;
}

export interface DatasetService extends BaseService<Dataset> {
  validateDataset(dataset: Partial<Dataset>): Promise<void>;
  getDatasetsByTemplate(templateId: string): Promise<Dataset[]>;
}