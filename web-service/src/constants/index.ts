export const FIELD_TYPES = {
  TEXT: 'text',
  NUMBER: 'number',
  EMAIL: 'email',
  JSON: 'json',
  RADIO: 'radio',
  TEXTAREA: 'textarea',
  CHECKBOX: 'checkbox',
  COMBO: 'combo',
  FILE: 'file',
  DATE: 'date',
  DATETIME: 'datetime',
  CODE: 'code'
} as const;

export const BATCH_STATUS = {
  SUCCESS: 'success',
  FAILURE: 'failure',
  RUNNING: 'running',
  STOPPED: 'stopped'
} as const;

export const SCHEDULE_TYPE = {
  PERIODIC: 'periodic',
  SPECIFIC: 'specific'
} as const;

// Common validation patterns
export const VALIDATION_PATTERNS = {
  FIELD_NAME: /^[a-zA-Z][a-zA-Z0-9_]*$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
};