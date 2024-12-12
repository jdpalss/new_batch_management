import React from 'react';
import { useRouter } from 'next/router';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { Template } from '../../types/template';
import { Dataset } from '../../types/dataset';
import { BatchConfig } from '../../types/batch';
import { PageHeader } from '../../components/common/PageHeader';
import { BatchForm } from '../../components/batch/BatchForm';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useToasts } from '../../hooks/useToasts';

export default function CreateBatchPage() {
  const router = useRouter();
  const { datasetId } = router.query;
  const { addToast } = useToasts();

  const { data: templates, isLoading: isLoadingTemplates } = useQuery<Template[]>({
    queryKey: ['templates'],
    queryFn: async () => {
      const response = await axios.get('/api/template');
      return response.data;
    }
  });

  const { data: datasets, isLoading: isLoadingDatasets } = useQuery<Dataset[]>({
    queryKey: ['datasets'],
    queryFn: async () => {
      const response = await axios.get('/api/dataset');
      return response.data;
    }
  });

  const createBatch = useMutation({
    mutationFn: async (batch: Partial<BatchConfig>) => {
      const response = await axios.post('/api/batch', batch);
      return response.data;
    },
    onSuccess: () => {
      addToast({
        type: 'success',
        message: 'Batch created successfully'
      });
      router.push('/batch');
    },
    onError: (error) => {
      addToast({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to create batch'
      });
    }
  });

  if (isLoadingTemplates || isLoadingDatasets) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <PageHeader
        title="Create Batch"
        description="Configure a new batch execution"
      />

      <BatchForm
        templates={templates || []}
        datasets={datasets || []}
        initialValues={datasetId ? { datasetId } : undefined}
        onSubmit={async (values) => {
          await createBatch.mutateAsync(values);
        }}
      />
    </div>
  );
}