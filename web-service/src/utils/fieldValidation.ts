import { InputType } from '@/types/template';

export const validateFieldName = (name: string): boolean => {
  return /^[a-zA-Z][a-zA-Z0-9_]*$/.test(name);
};

export const validateFieldValue = (value: any, type: InputType): boolean => {
  switch (type) {
    case 'number':
      return !isNaN(Number(value));
    
    case 'email':
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    
    case 'json':
      try {
        JSON.parse(value);
        return true;
      } catch {
        return false;
      }
    
    case 'date':
      return !isNaN(Date.parse(value));
    
    case 'datetime':
      return !isNaN(Date.parse(value));
    
    default:
      return true;
  }
};

export const getFieldError = (value: any, type: InputType): string | null => {
  if (!validateFieldValue(value, type)) {
    switch (type) {
      case 'number':
        return 'Please enter a valid number';
      case 'email':
        return 'Please enter a valid email address';
      case 'json':
        return 'Please enter valid JSON';
      case 'date':
        return 'Please enter a valid date';
      case 'datetime':
        return 'Please enter a valid date and time';
      default:
        return 'Invalid value';
    }
  }
  return null;
};

export const getFieldTypeValidation = (type: InputType) => {
  switch (type) {
    case 'number':
      return {
        type: 'number' as const,
        min: -Infinity,
        max: Infinity,
        step: 'any' as const,
      };
    
    case 'email':
      return {
        type: 'email' as const,
        pattern: '[^\\s@]+@[^\\s@]+\\.[^\\s@]+',
      };
    
    case 'date':
      return {
        type: 'date' as const,
      };
    
    case 'datetime':
      return {
        type: 'datetime-local' as const,
      };
    
    default:
      return {
        type: 'text' as const,
      };
  }
};

export const formatFieldValue = (value: any, type: InputType): string => {
  switch (type) {
    case 'json':
      try {
        return JSON.stringify(JSON.parse(value), null, 2);
      } catch {
        return value;
      }
    
    case 'date':
      try {
        return new Date(value).toISOString().split('T')[0];
      } catch {
        return value;
      }
    
    case 'datetime':
      try {
        return new Date(value).toISOString().slice(0, 16);
      } catch {
        return value;
      }
    
    default:
      return String(value);
  }
};

export const getDefaultValue = (type: InputType) => {
  switch (type) {
    case 'number':
      return 0;
    case 'checkbox':
      return [];
    case 'json':
      return '{}';
    case 'date':
      return '';
    case 'datetime':
      return '';
    default:
      return '';
  }
};