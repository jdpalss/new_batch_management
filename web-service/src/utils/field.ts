import { FIELD_TYPES } from '../constants';
import { FieldType } from '../types/template';

export const needsOptions = (type: FieldType): boolean => {
  return [FIELD_TYPES.RADIO, FIELD_TYPES.CHECKBOX, FIELD_TYPES.COMBO].includes(type);
};

export const generateFieldValue = (label: string): string => {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
};

export const validateFieldValue = (value: any, type: FieldType): string | null => {
  if (!value) return null;

  switch (type) {
    case FIELD_TYPES.NUMBER:
      return isNaN(Number(value)) ? 'Must be a valid number' : null;

    case FIELD_TYPES.EMAIL:
      return !value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) ? 'Must be a valid email' : null;

    case FIELD_TYPES.DATE:
      return isNaN(Date.parse(value)) ? 'Must be a valid date' : null;

    case FIELD_TYPES.JSON:
      try {
        if (typeof value === 'string') {
          JSON.parse(value);
        }
        return null;
      } catch {
        return 'Must be valid JSON';
      }

    case FIELD_TYPES.FILE:
      return !value.startsWith('data:') ? 'Must be a base64 encoded file' : null;

    default:
      return null;
  }
};