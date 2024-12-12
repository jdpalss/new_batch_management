import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardBody, Container } from 'reactstrap';
import axios from 'axios';
import { Template } from '../../types/template';
import { Dataset } from '../../types/dataset';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { PageHeader } from '../../components/common/PageHeader';
import { DatasetForm } from '../../components/datasets/DatasetForm';
import { useToasts } from '../../hooks/useToasts';

const CreateDatasetPage: NextPage = () => {
  const router = useRouter();
  const { templateId } = router.query;
  const { success, error } = useToasts();

  const { data: template, isLoading: isLoadingTemplate } = useQuery<Template>({
    queryKey: ['template', templateId],
    queryFn: async () => {
      const { data } = await axios.get(`/api/template/${templateId}`);
      return data;
    },
    enabled: !!templateId
  });

  const { data: templates, isLoading: isLoadingTemplates } = useQuery<Template[]>({
    queryKey: ['templates'],
    queryFn: async () => {
      const { data } = await axios.get('/api/template');
      return data;
    },
    enabled: !templateId
  });

  const createDataset = useMutation({
    mutationFn: async (newDataset: Partial<Dataset>) => {
      const { data } = await axios.post('/api/dataset', newDataset);
      return data;
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
      <Container className="py-4">
        <EmptyState
          title="No Templates Available"
          description="Create a template first to define the structure of your dataset."
          action={{
            label: 'Create Template',
            onClick: () => router.push('/templates/create')
          }}
        />
      </Container>
    );
  }

  return (
    <Container className="py-4">
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
                  router.push(`/datasets/new?templateId=${template.id}`)
                }
                style={{ cursor: 'pointer' }}
              >
                <CardBody>
                  <h5 className="mb-2">{template.name}</h5>
                  <p className="text-muted mb-3">
                    {template.description}
                  </p>
                  <small className="text-muted">
                    {template.fields.length} fields
                  </small>
                </CardBody>
              </Card>
            </div>
          ))}
        </div>
      )}
    </Container>
  );
};

export default CreateDatasetPage;