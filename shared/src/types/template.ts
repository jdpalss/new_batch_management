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

export interface TemplateField {
  name: string;
  type: FieldType;
  label: string;
  required: boolean;
  defaultValue?: any;
  options?: FieldOption[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    customValidation?: string;
  };
}

export interface Template {
  id: string;
  name: string;
  description?: string;
  fields: TemplateField[];
  script?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateInput {
  name: string;
  description?: string;
  fields: TemplateField[];
  script?: string;
}