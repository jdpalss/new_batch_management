import { TemplateField, TemplateValidationError } from '../types/template';
import { FIELD_TYPES, VALIDATION_PATTERNS } from '../constants';

export class TemplateValidator {
  static validateFieldName(name: string): boolean {
    return VALIDATION_PATTERNS.FIELD_NAME.test(name);
  }

  static validateFields(fields: TemplateField[]): TemplateValidationError[] {
    const errors: TemplateValidationError[] = [];
    const fieldNames = new Set<string>();

    fields.forEach((field, index) => {
      // Check field name format
      if (!this.validateFieldName(field.name)) {
        errors.push({
          field: field.name,
          message: 'Field name must start with a letter and contain only letters, numbers, and underscores'
        });
      }

      // Check for duplicate names
      if (fieldNames.has(field.name)) {
        errors.push({
          field: field.name,
          message: 'Duplicate field name'
        });
      }
      fieldNames.add(field.name);

      // Check required properties
      if (!field.label?.trim()) {
        errors.push({
          field: field.name,
          message: 'Field label is required'
        });
      }

      // Validate field type specific requirements
      this.validateFieldConfiguration(field, errors);
    });

    return errors;
  }

  private static validateFieldConfiguration(
    field: TemplateField,
    errors: TemplateValidationError[]
  ): void {
    // Validate options for select fields
    if ([FIELD_TYPES.RADIO, FIELD_TYPES.CHECKBOX, FIELD_TYPES.COMBO].includes(field.type)) {
      if (!field.options?.length) {
        errors.push({
          field: field.name,
          message: `${field.type} field must have at least one option`
        });
      } else {
        // Check for duplicate option values
        const optionValues = new Set<string>();
        field.options.forEach(option => {
          if (!option.label?.trim() || !option.value?.trim()) {
            errors.push({
              field: field.name,
              message: 'Option label and value are required'
            });
          }
          if (optionValues.has(option.value)) {
            errors.push({
              field: field.name,
              message: `Duplicate option value: ${option.value}`
            });
          }
          optionValues.add(option.value);
        });
      }
    }

    // Validate numeric constraints
    if (field.type === FIELD_TYPES.NUMBER && field.validation) {
      const { min, max } = field.validation;
      if (min !== undefined && max !== undefined && min > max) {
        errors.push({
          field: field.name,
          message: 'Minimum value cannot be greater than maximum value'
        });
      }
    }

    // Validate regex pattern
    if (field.validation?.pattern) {
      try {
        new RegExp(field.validation.pattern);
      } catch {
        errors.push({
          field: field.name,
          message: 'Invalid regular expression pattern'
        });
      }
    }
  }

  static validateScript(script: string): TemplateValidationError[] {
    const errors: TemplateValidationError[] = [];
    
    try {
      // Basic syntax check
      new Function('context', script);
      
      // Verify script structure
      if (!script.includes('async function')) {
        errors.push({
          field: 'script',
          message: 'Script must be defined as an async function'
        });
      }

      if (!script.includes('try') || !script.includes('catch')) {
        errors.push({
          field: 'script',
          message: 'Script must include error handling with try/catch'
        });
      }

      if (!script.includes('await')) {
        errors.push({
          field: 'script',
          message: 'Script should use await for asynchronous operations'
        });
      }

      // Context 객체 구조 분해가 있는지 확인
      if (!script.includes('const { page, data, log }') && !script.includes('const { page }') && !script.includes('context.page')) {
        errors.push({
          field: 'script',
          message: 'Script must use page from context for automation'
        });
      }

      if (!script.includes('data.') && !script.includes('context.data.')) {
        errors.push({
          field: 'script',
          message: 'Script should use dataset values (data object)'
        });
      }

      if (!script.includes('log(') && !script.includes('context.log(')) {
        errors.push({
          field: 'script',
          message: 'Script should include logging'
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