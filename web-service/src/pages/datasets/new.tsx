import React from 'react';
import { useRouter } from 'next/router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardBody } from 'reactstrap';
import { Template } from '../../types/template';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { PageHeader } from '../../components/common/PageHeader';
import { DatasetForm } from '../../components/datasets/DatasetForm';
import { useToasts } from '../../hooks/useToasts';

const CreateDatasetPage: React.FC = () => {
  const router = useRouter();
  const { templateId } = router.query;
  const { success, error } = useToasts();

  const { data: template, isLoading: isLoadingTemplate } = useQuery<Template>({
    queryKey: ['template', templateId],
    queryFn: async () => {
      const response = await fetch(\`/api/template/\${templateId}\`);
      if (!response.ok) {
        throw new Error('Failed to fetch template');
      }
      return response.json();
    },
    enabled: !!templateId
  });

  const { data: templates, isLoading: isLoadingTemplates } = useQuery<Template[]>({
    queryKey: ['templates'],
    queryFn: async () => {
      const response = await fetch('/api/template');
      if (!response.ok) {
        throw new Error('Failed to fetch templates');
      }
      return response.json();
    },
    enabled: !templateId
  });

  const createDataset = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/dataset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        throw new Error('Failed to create dataset');
      }
      return response.json();
    },
    onSuccess: () => {
      success('Dataset created successfully');
      router.push('/datasets');
    },
    onError: (err) => {
      error(err instanceof Error ? err.message : 'Failed to create dataset');
    }
  });

  if (!templateId && isLoadingTemplates) {
    return <LoadingSpinner />;
  }

  if (templateId && isLoadingTemplate) {
    return <LoadingSpinner />;
  }

  if (!templateId && templates?.length === 0) {
    return (
      <EmptyState
        title="No Templates Available"
        description="Create a template first to define the structure of your dataset."
        action={{
          label: 'Create Template',
          onClick: () => router.push('/templates/create')
        }}
      />
    );
  }

  return (
    <div className="container py-4">
      <PageHeader
        title="Create Dataset"
        description="Create a new dataset based on a template"
      />

      {template ? (
        <DatasetForm
          template={template}
          onSubmit={async (values) => {
            await createDataset.mutateAsync({
              templateId: template.id,
              ...values
            });
          }}
        />
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {templates?.map((template) => (
            <div key={template.id} className="col">
              <Card 
                className="h-100 cursor-pointer"
                onClick={() =>
                  router.push(\`/datasets/new?templateId=\${template.id}\`)
                }
              >
                <CardBody>
                  <h5 className="card-title">{template.name}</h5>
                  <p className="card-text text-muted">
                    {template.description}
                  </p>
                  <div className="mt-3">
                    <small className="text-muted">
                      {template.fields.length} fields
                    </small>
                  </div>
                </CardBody>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CreateDatasetPage;