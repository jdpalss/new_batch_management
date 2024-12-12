import React from 'react';
import { useRouter } from 'next/router';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { Card, CardBody } from 'reactstrap';
import { Template } from '../../types/template';
import { Dataset } from '../../types/dataset';
import { PageHeader } from '../../components/common/PageHeader';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { DatasetForm } from '../../components/datasets/DatasetForm';
import { useToasts } from '../../hooks/useToasts';

export default function CreateDatasetPage() {
  const router = useRouter();
  const { templateId } = router.query;
  const { addToast } = useToasts();

  const { data: template, isLoading: isLoadingTemplate } = useQuery<Template>({
    queryKey: ['template', templateId],
    queryFn: async () => {
      const response = await axios.get(\`/api/template/\${templateId}\`);
      return response.data;
    },
    enabled: !!templateId
  });

  const { data: templates, isLoading: isLoadingTemplates } = useQuery<Template[]>({
    queryKey: ['templates'],
    queryFn: async () => {
      const response = await axios.get('/api/template');
      return response.data;
    },
    enabled: !templateId
  });

  const createDataset = useMutation({
    mutationFn: async (dataset: Partial<Dataset>) => {
      const response = await axios.post('/api/dataset', dataset);
      return response.data;
    },
    onSuccess: () => {
      addToast({
        type: 'success',
        message: 'Dataset created successfully'
      });
      router.push('/datasets');
    },
    onError: (error) => {
      addToast({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to create dataset'
      });
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
      <Card>
        <CardBody className="text-center py-5">
          <h3>No Templates Available</h3>
          <p className="text-muted">
            Create a template first to define the structure of your dataset.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => router.push('/templates/create')}
          >
            Create Template
          </button>
        </CardBody>
      </Card>
    );
  }

  return (
    <div>
      <PageHeader
        title="Create Dataset"
        description="Create a new dataset based on a template"
      />

      {template ? (
        <DatasetForm
          template={template}
          onSubmit={async (values) => {
            await createDataset.mutateAsync(values);
          }}
        />
      ) : (
        <div>
          <h3>Select Template</h3>
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
                      <Badge color="info">
                        {template.fields.length} fields
                      </Badge>
                    </div>
                  </CardBody>
                </Card>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}