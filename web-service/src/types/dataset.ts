export interface Dataset {
  id: string;
  templateId: string;
  name?: string;
  description?: string;
  data: Record<string, any>;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DatasetValidationError {
  field: string;
  message: string;
}

export interface DatasetValidationResult {
  isValid: boolean;
  errors: DatasetValidationError[];
}