import { stores } from '../lib/db';
import { Template, TemplateValidationError } from '../types/template';
import { Logger } from '../utils/logger';
import { TemplateValidator } from '../utils/validation';

export class TemplateService {
  constructor(private readonly logger: Logger) {}

  async createTemplate(template: Omit<Template, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Promise<Template> {
    try {
      // Validate fields
      const fieldErrors = TemplateValidator.validateFields(template.fields);
      if (fieldErrors.length > 0) {
        throw new Error(`Invalid template fields: ${fieldErrors.map(e => e.message).join(', ')}`);
      }

      // Validate script
      const scriptErrors = TemplateValidator.validateScript(template.script);
      if (scriptErrors.length > 0) {
        throw new Error(`Invalid script: ${scriptErrors.map(e => e.message).join(', ')}`);
      }

      const newTemplate: Template = {
        id: Date.now().toString(),
        ...template,
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await stores.templates.insert(newTemplate);
      this.logger.info(`Created template ${newTemplate.id}`);
      
      return newTemplate;
    } catch (error) {
      this.logger.error('Failed to create template:', error);
      throw error;
    }
  }

  async updateTemplate(id: string, template: Partial<Template>): Promise<Template> {
    try {
      const existingTemplate = await this.getTemplate(id);

      // Validate fields if provided
      if (template.fields) {
        const fieldErrors = TemplateValidator.validateFields(template.fields);
        if (fieldErrors.length > 0) {
          throw new Error(`Invalid template fields: ${fieldErrors.map(e => e.message).join(', ')}`);
        }
      }

      // Validate script if provided
      if (template.script) {
        const scriptErrors = TemplateValidator.validateScript(template.script);
        if (scriptErrors.length > 0) {
          throw new Error(`Invalid script: ${scriptErrors.map(e => e.message).join(', ')}`);
        }
      }

      const updatedTemplate: Template = {
        ...existingTemplate,
        ...template,
        version: existingTemplate.version + 1,
        updatedAt: new Date()
      };

      await stores.templates.update({ id }, updatedTemplate, { returnUpdatedDocs: true });
      this.logger.info(`Updated template ${id} to version ${updatedTemplate.version}`);
      
      return updatedTemplate;
    } catch (error) {
      this.logger.error(`Failed to update template ${id}:`, error);
      throw error;
    }
  }

  async getTemplate(id: string): Promise<Template> {
    const template = await stores.templates.findOne({ id });
    if (!template) {
      throw new Error(`Template ${id} not found`);
    }
    return template;
  }

  async listTemplates(): Promise<Template[]> {
    try {
      const templates = await stores.templates.find({});
      return templates.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      this.logger.error('Failed to list templates:', error);
      throw error;
    }
  }

  async deleteTemplate(id: string): Promise<void> {
    try {
      // Check if template is in use
      const datasetExists = await stores.datasets.findOne({ templateId: id });
      if (datasetExists) {
        throw new Error('Cannot delete template that is in use by datasets');
      }

      const batchExists = await stores.batches.findOne({ templateId: id });
      if (batchExists) {
        throw new Error('Cannot delete template that is in use by batches');
      }

      await stores.templates.remove({ id });
      this.logger.info(`Deleted template ${id}`);
    } catch (error) {
      this.logger.error(`Failed to delete template ${id}:`, error);
      throw error;
    }
  }

  async validateTemplateData(templateId: string, data: Record<string, any>): Promise<TemplateValidationError[]> {
    try {
      const template = await this.getTemplate(templateId);
      return TemplateValidator.validateFields(template.fields);
    } catch (error) {
      this.logger.error(`Failed to validate template data for ${templateId}:`, error);
      throw error;
    }
  }
}