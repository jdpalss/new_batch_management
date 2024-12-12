import { TemplateField, TemplateValidationError } from '../types/template';

export class TemplateValidator {
  static validateFieldName(name: string): boolean {
    return /^[a-zA-Z][a-zA-Z0-9_]*$/.test(name);
  }

  static validateFields(fields: TemplateField[]): TemplateValidationError[] {
    const errors: TemplateValidationError[] = [];
    const fieldNames = new Set<string>();

    fields.forEach(field => {
      // Check field name
      if (!this.validateFieldName(field.name)) {
        errors.push({
          field: field.name,
          message: 'Field name must start with a letter and contain only letters, numbers, and underscores'
        });
      }

      // Check for duplicate field names
      if (fieldNames.has(field.name)) {
        errors.push({
          field: field.name,
          message: 'Duplicate field name'
        });
      }
      fieldNames.add(field.name);

      // Check options for radio, checkbox, combo
      if (['radio', 'checkbox', 'combo'].includes(field.type)) {
        if (!field.options?.length) {
          errors.push({
            field: field.name,
            message: field.type + ' field must have at least one option'
          });
        }
      }

      // Validate numeric constraints
      if (field.type === 'number' && field.validation) {
        const { min, max } = field.validation;
        if (min !== undefined && max !== undefined && min > max) {
          errors.push({
            field: field.name,
            message: 'Minimum value cannot be greater than maximum value'
          });
        }
      }
    });

    return errors;
  }

  static validateScript(script: string): TemplateValidationError[] {
    const errors: TemplateValidationError[] = [];
    
    try {
      // Basic syntax check
      new Function('context', script);
      
      // Check for required context usage
      if (!script.includes('context.page') || !script.includes('context.data')) {
        errors.push({
          field: 'script',
          message: 'Script must use context.page and context.data'
        });
      }

      // Check for common Playwright patterns
      if (!script.includes('async function')) {
        errors.push({
          field: 'script',
          message: 'Script must be an async function'
        });
      }

      if (!script.includes('await')) {
        errors.push({
          field: 'script',
          message: 'Script should contain await expressions for Playwright actions'
        });
      }

      if (!script.includes('try') || !script.includes('catch')) {
        errors.push({
          field: 'script',
          message: 'Script should include error handling with try/catch'
        });
      }

    } catch (error) {
      errors.push({
        field: 'script',
        message: error instanceof Error ? error.message : 'Invalid script syntax'
      });
    }
    
    return errors;
  }
}