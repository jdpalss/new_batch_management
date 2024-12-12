import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Container,
  Row,
  Col,
  Card,
  Alert,
} from 'reactstrap';
import { templateService } from '@/services/templateService';
import { datasetService } from '@/services/datasetService';
import { Dataset } from '@/types/dataset';
import { PageHeader } from '@/components/common';
import DatasetForm from '@/components/datasets/DatasetForm';
import { useToasts } from '@/hooks/useToasts';

const CreateDatasetPage = () => {
  const router = useRouter();
  const { templateId } = router.query;
  const queryClient = useQueryClient();
  const { addToast } = useToasts();

  // 템플릿 데이터 조회
  const { data: template, isLoading, error } = useQuery({
    queryKey: ['template', templateId],
    queryFn: () => templateService.findById(templateId as string),
    enabled: !!templateId,
  });

  // 템플릿 ID가 없으면 선택 페이지로 리다이렉트
  useEffect(() => {
    if (!templateId) {
      router.replace('/datasets/new/select-template');
    }
  }, [templateId, router]);

  const handleSubmit = async (values: Dataset) => {
    try {
      await datasetService.create(values);
      queryClient.invalidateQueries(['datasets']);
      
      addToast({
        type: 'success',
        title: 'Success',
        message: 'Dataset created successfully'
      });
      
      router.push('/datasets');
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to create dataset'
      });
    }
  };

  if (isLoading) {
    return (
      <Container fluid className="px-4">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" />
        </div>
      </Container>
    );
  }

  if (error || !template) {
    return (
      <Container fluid className="px-4">
        <Alert color="danger">
          Template not found. Please select a different template.
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="px-4">
      <PageHeader
        title="Create Dataset"
        subtitle={`Based on template: ${template.name}`}
        breadcrumbs={[
          { label: 'Datasets', href: '/datasets' },
          { label: 'Select Template', href: '/datasets/new/select-template' },
          { label: 'Create Dataset' }
        ]}
      />

      <Row>
        <Col lg={8}>
          <DatasetForm 
            template={template}
            onSubmit={handleSubmit}
            onCancel={() => router.back()}
          />
        </Col>

        <Col lg={4}>
          <Card className="mb-4">
            <div className="card-body">
              <h4 className="card-title h5">Template Details</h4>
              <p className="text-muted small">{template.description}</p>

              <h5 className="h6 mt-4">Available Fields</h5>
              <div className="table-responsive">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Field</th>
                      <th>Type</th>
                      <th>Required</th>
                    </tr>
                  </thead>
                  <tbody>
                    {template.fields.map(field => (
                      <tr key={field.id}>
                        <td>
                          <div>{field.label}</div>
                          <small className="text-muted">{field.name}</small>
                        </td>
                        <td>
                          <code>{field.type}</code>
                        </td>
                        <td>
                          {field.required ? (
                            <span className="text-danger">Yes</span>
                          ) : (
                            <span className="text-muted">No</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h5 className="h6 mt-4">Playwright Script Preview</h5>
              <div className="border rounded p-2 bg-light">
                <pre className="small mb-0" style={{ maxHeight: '200px', overflow: 'auto' }}>
                  {template.playwrightScript}
                </pre>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CreateDatasetPage;