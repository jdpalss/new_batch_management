import React from 'react';
import { useRouter } from 'next/router';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { Template } from '../../../types/template';
import { Dataset } from '../../../types/dataset';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { PageHeader } from '../../../components/common/PageHeader';
import { DatasetForm } from '../../../components/datasets/DatasetForm';
import { useToasts } from '../../../hooks/useToasts';

export default function EditDatasetPage() {
  const router = useRouter();
  const { id } = router.query;
  const { addToast } = useToasts();

  const { data: dataset, isLoading: isLoadingDataset } = useQuery<Dataset>({
    queryKey: ['dataset', id],
    queryFn: async () => {
      const response = await axios.get(\`/api/dataset/\${id}\`);
      return response.data;
    },
    enabled: !!id
  });

  const { data: template, isLoading: isLoadingTemplate } = useQuery<Template>({
    queryKey: ['template', dataset?.templateId],
    queryFn: async () => {
      const response = await axios.get(\`/api/template/\${dataset?.templateId}\`);
      return response.data;
    },
    enabled: !!dataset?.templateId
  });

  const updateDataset = useMutation({
    mutationFn: async (updatedDataset: Partial<Dataset>) => {
      const response = await axios.put(\`/api/dataset/\${id}\`, updatedDataset);
      return response.data;
    },
    onSuccess: () => {
      addToast({
        type: 'success',
        message: 'Dataset updated successfully'
      });
      router.push('/datasets');
    },
    onError: (error) => {
      addToast({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to update dataset'
      });
    }
  });

  if (isLoadingDataset || isLoadingTemplate) {
    return <LoadingSpinner />;
  }

  if (!dataset || !template) {
    return <div>Dataset or template not found</div>;
  }

  return (
    <div>
      <PageHeader
        title={`Edit Dataset: ${dataset.name || 'Unnamed Dataset'}`}
        description="Modify dataset values"
      />

      <DatasetForm
        template={template}
        initialValues={dataset}
        onSubmit={async (values) => {
          await updateDataset.mutateAsync(values);
        }}
      />
    </div>
  );
}