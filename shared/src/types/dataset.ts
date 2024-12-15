export interface Dataset {
  id: string;
  name: string;
  templateId: string;
  data: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface DatasetInput {
  name: string;
  templateId: string;
  data: Record<string, any>;
}

export interface DatasetService {
  getDatasetData(id: string): Promise<Record<string, any> | null>;
  findDatasetsByTemplateId(templateId: string): Promise<Dataset[]>;
  createDataset(input: DatasetInput): Promise<Dataset>;
  updateDataset(id: string, input: Partial<DatasetInput>): Promise<Dataset>;
  deleteDataset(id: string): Promise<void>;
}