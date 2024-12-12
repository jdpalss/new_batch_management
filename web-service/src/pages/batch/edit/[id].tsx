import React from 'react';
import { useRouter } from 'next/router';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { Template } from '../../../types/template';
import { Dataset } from '../../../types/dataset';
import { BatchConfig } from '../../../types/batch';
import { PageHeader } from '../../../components/common/PageHeader';
import { BatchForm } from '../../../components/batch/BatchForm';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { useToasts } from '../../../hooks/useToasts';

export default function EditBatchPage() {
  const router = useRouter();
  const { id } = router.query;
  const { addToast } = useToasts();

  const { data: batch, isLoading: isLoadingBatch } = useQuery<BatchConfig>({
    queryKey: ['batch', id],
    queryFn: async () => {
      const response = await axios.get(`/api/batch/${id}`);
      return response.data;
    },
    enabled: !!id
  });

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

  const updateBatch = useMutation({
    mutationFn: async (updatedBatch: Partial<BatchConfig>) => {
      const response = await axios.put(`/api/batch/${id}`, updatedBatch);
      return response.data;
    },
    onSuccess: () => {
      addToast({
        type: 'success',
        message: 'Batch updated successfully'
      });
      router.push('/batch');
    },
    onError: (error) => {
      addToast({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to update batch'
      });
    }
  });

  if (isLoadingBatch || isLoadingTemplates || isLoadingDatasets) {
    return <LoadingSpinner />;
  }

  if (!batch) {
    return <div>Batch not found</div>;
  }

  return (
    <div>
      <PageHeader
        title={`Edit Batch: ${batch.title}`}
        description="Modify batch configuration"
      />

      <BatchForm
        templates={templates || []}
        datasets={datasets || []}
        initialValues={batch}
        onSubmit={async (values) => {
          await updateBatch.mutateAsync(values);
        }}
      />
    </div>
  );
}