import { FIELD_TYPES, VALIDATION_PATTERNS } from '../constants';
import { FieldType } from '../types/template';

export const validateFieldValue = (value: any, type: FieldType): string | null => {
  if (!value) return null;

  switch (type) {
    case FIELD_TYPES.NUMBER:
      if (isNaN(Number(value))) {
        return 'Must be a valid number';
      }
      break;

    case FIELD_TYPES.EMAIL:
      if (!VALIDATION_PATTERNS.EMAIL.test(value)) {
        return 'Must be a valid email address';
      }
      break;

    case FIELD_TYPES.DATE:
      if (isNaN(Date.parse(value))) {
        return 'Must be a valid date';
      }
      break;

    case FIELD_TYPES.JSON:
      try {
        if (typeof value === 'string') {
          JSON.parse(value);
        }
      } catch {
        return 'Must be valid JSON';
      }
      break;

    case FIELD_TYPES.FILE:
      if (typeof value === 'string' && !value.startsWith('data:')) {
        return 'Must be a base64 encoded file';
      }
      break;
  }

  return null;
};

export const generateFieldValue = (label: string): string => {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
};

export const formatFieldValue = (value: any, type: FieldType): string => {
  if (value === null || value === undefined) return '';

  switch (type) {
    case FIELD_TYPES.DATE:
      return new Date(value).toISOString().split('T')[0];

    case FIELD_TYPES.DATETIME:
      return new Date(value).toISOString().slice(0, 16);

    case FIELD_TYPES.JSON:
      return typeof value === 'string' ? value : JSON.stringify(value, null, 2);

    case FIELD_TYPES.FILE:
      return value ? 'File uploaded' : '';

    default:
      return String(value);
  }
};

export const parseFieldValue = (value: string, type: FieldType): any => {
  if (!value) return null;

  switch (type) {
    case FIELD_TYPES.NUMBER:
      return Number(value);

    case FIELD_TYPES.DATE:
    case FIELD_TYPES.DATETIME:
      return new Date(value);

    case FIELD_TYPES.JSON:
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }

    case FIELD_TYPES.CHECKBOX:
      return value === 'true';

    default:
      return value;
  }
};