import { 
  TemplateService as ITemplateService, 
  Template, 
  Dataset,
  BaseServiceConfig 
} from '@batch-automation/shared';
import { collections } from '../lib/db-client';
import { Logger } from '../utils/logger';

export class TemplateService implements ITemplateService {
  private logger: Logger;

  constructor(config: BaseServiceConfig = {}) {
    this.logger = config.logger || new Logger();
  }

  async create(data: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>): Promise<Template> {
    try {
      await this.validateTemplate(data);
      const template = await collections.templates.insert(data);
      this.logger.info(`Created template: ${template.id}`);
      return template;
    } catch (error) {
      this.logger.error('Failed to create template:', error);
      throw error;
    }
  }

  async update(id: string, data: Partial<Template>): Promise<Template> {
    try {
      const template = await collections.templates.update({ id }, data);
      if (!template) throw new Error(`Template not found: ${id}`);
      
      this.logger.info(`Updated template: ${id}`);
      return template;
    } catch (error) {
      this.logger.error(`Failed to update template ${id}:`, error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      // 템플릿을 사용하는 데이터셋이 있는지 확인
      const datasets = await collections.datasets.find({ templateId: id });
      if (datasets.length > 0) {
        throw new Error('Cannot delete template with existing datasets');
      }

      await collections.templates.remove({ id });
      this.logger.info(`Deleted template: ${id}`);
    } catch (error) {
      this.logger.error(`Failed to delete template ${id}:`, error);
      throw error;
    }
  }

  async findById(id: string): Promise<Template | null> {
    return await collections.templates.findOne({ id });
  }

  async findAll(query: Partial<Template> = {}): Promise<Template[]> {
    return await collections.templates.find(query);
  }

  async validateTemplate(template: Partial<Template>): Promise<void> {
    if (!template.name?.trim()) {
      throw new Error('Template name is required');
    }

    if (!Array.isArray(template.fields) || template.fields.length === 0) {
      throw new Error('Template must have at least one field');
    }

    // 필드 유효성 검사
    for (const field of template.fields) {
      if (!field.name?.trim()) {
        throw new Error('Field name is required');
      }
      if (!field.type?.trim()) {
        throw new Error('Field type is required');
      }

      // 옵션이 필요한 필드 타입 검사
      if (['select', 'radio', 'checkbox'].includes(field.type)) {
        if (!Array.isArray(field.options) || field.options.length === 0) {
          throw new Error(`Field "${field.name}" requires at least one option`);
        }
      }
    }
  }

  async getTemplateWithDatasets(id: string): Promise<{
    template: Template;
    datasets: Dataset[];
  }> {
    try {
      const template = await this.findById(id);
      if (!template) throw new Error(`Template not found: ${id}`);

      const datasets = await collections.datasets.find({ templateId: id });

      return { template, datasets };
    } catch (error) {
      this.logger.error(`Failed to get template with datasets ${id}:`, error);
      throw error;
    }
  }
}