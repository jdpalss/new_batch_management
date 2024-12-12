export type FieldType = 
  | 'text'
  | 'number'
  | 'email'
  | 'json'
  | 'radio'
  | 'textarea'
  | 'checkbox'
  | 'combo'
  | 'file'
  | 'date'
  | 'datetime'
  | 'code';

export interface FieldOption {
  label: string;
  value: string;
}

export interface FieldValidation {
  min?: number;
  max?: number;
  pattern?: string;
  message?: string;
}

export interface TemplateField {
  name: string;
  type: FieldType;
  label: string;
  description?: string;
  required: boolean;
  defaultValue?: any;
  options?: FieldOption[];
  validation?: FieldValidation;
  placeholder?: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  fields: TemplateField[];
  script: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: TemplateValidationError[];
}