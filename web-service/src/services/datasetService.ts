import { stores } from '../lib/db';
import { Template, TemplateField } from '../types/template';
import { Dataset, DatasetValidationResult } from '../types/dataset';
import { Logger } from '../utils/logger';
import { validateFieldValue } from '../utils/field';

export class DatasetService {
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  async createDataset(dataset: Omit<Dataset, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Promise<Dataset> {
    try {
      // Get template to validate dataset
      const template = await stores.templates.findOne({ id: dataset.templateId });
      if (!template) {
        throw new Error('Template not found');
      }

      // Validate dataset against template
      const validationResult = await this.validateDataset(template, dataset.data);
      if (!validationResult.isValid) {
        throw new Error(`Invalid dataset: ${validationResult.errors.join(', ')}`);
      }

      const newDataset: Dataset = {
        id: Date.now().toString(),
        ...dataset,
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await stores.datasets.insert(newDataset);
      this.logger.info(`Created dataset ${newDataset.id}`);
      
      return newDataset;
    } catch (error) {
      this.logger.error('Failed to create dataset', error);
      throw error;
    }
  }

  async updateDataset(id: string, data: Record<string, any>): Promise<Dataset> {
    try {
      const dataset = await this.getDataset(id);
      const template = await stores.templates.findOne({ id: dataset.templateId });
      if (!template) {
        throw new Error('Template not found');
      }

      const validationResult = await this.validateDataset(template, data);
      if (!validationResult.isValid) {
        throw new Error(`Invalid dataset: ${validationResult.errors.join(', ')}`);
      }

      const updatedDataset: Dataset = {
        ...dataset,
        data,
        version: dataset.version + 1,
        updatedAt: new Date()
      };

      await stores.datasets.update({ id }, updatedDataset);
      this.logger.info(`Updated dataset ${id}`);
      
      return updatedDataset;
    } catch (error) {
      this.logger.error(`Failed to update dataset ${id}`, error);
      throw error;
    }
  }

  async getDataset(id: string): Promise<Dataset> {
    const dataset = await stores.datasets.findOne({ id });
    if (!dataset) {
      throw new Error(`Dataset ${id} not found`);
    }
    return dataset;
  }

  async listDatasets(templateId?: string): Promise<Dataset[]> {
    const query = templateId ? { templateId } : {};
    return stores.datasets.find(query).sort({ createdAt: -1 });
  }

  async deleteDataset(id: string): Promise<void> {
    try {
      // Check if dataset is in use by any batches
      const batchExists = await stores.batches.findOne({ datasetId: id });
      if (batchExists) {
        throw new Error('Cannot delete dataset that is in use by batches');
      }

      await stores.datasets.remove({ id });
      this.logger.info(`Deleted dataset ${id}`);
    } catch (error) {
      this.logger.error(`Failed to delete dataset ${id}`, error);
      throw error;
    }
  }

  private async validateDataset(
    template: Template,
    data: Record<string, any>
  ): Promise<DatasetValidationResult> {
    const errors: string[] = [];

    for (const field of template.fields) {
      const value = data[field.name];

      // Required field check
      if (field.required && (value === undefined || value === null || value === '')) {
        errors.push(`Field ${field.label} is required`);
        continue;
      }

      // Type validation
      if (value !== undefined && value !== null) {
        const validationError = validateFieldValue(value, field.type);
        if (validationError) {
          errors.push(`Field ${field.label}: ${validationError}`);
        }
      }

      // Field-specific validation
      await this.validateFieldValue(field, value, errors);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private async validateFieldValue(
    field: TemplateField,
    value: any,
    errors: string[]
  ): Promise<void> {
    if (!value) return;

    // Validation rules
    if (field.validation) {
      const { min, max, pattern } = field.validation;
      
      if (min !== undefined && value < min) {
        errors.push(`Field ${field.label} must be at least ${min}`);
      }
      
      if (max !== undefined && value > max) {
        errors.push(`Field ${field.label} must be at most ${max}`);
      }
      
      if (pattern && !new RegExp(pattern).test(value)) {
        errors.push(field.validation.message || `Field ${field.label} has invalid format`);
      }
    }

    // Options validation for select fields
    if (field.options && field.options.length > 0) {
      const validValues = field.options.map(opt => opt.value);
      
      if (Array.isArray(value)) {  // Multiple select
        const invalidValues = value.filter(v => !validValues.includes(v));
        if (invalidValues.length > 0) {
          errors.push(`Field ${field.label} contains invalid values: ${invalidValues.join(', ')}`);
        }
      } else {  // Single select
        if (!validValues.includes(value)) {
          errors.push(`Field ${field.label} has invalid value: ${value}`);
        }
      }
    }
  }
}