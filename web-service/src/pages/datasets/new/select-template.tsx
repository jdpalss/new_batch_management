import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Button,
  Badge,
  ListGroup,
  ListGroupItem,
} from 'reactstrap';
import Link from 'next/link';
import { templateService } from '@/services/templateService';
import { Template } from '@/types/template';
import { PageHeader } from '@/components/common';

const SelectTemplatePage = () => {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const { data: templates, isLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: () => templateService.findAll(),
  });

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
  };

  const handleContinue = () => {
    if (selectedTemplate) {
      router.push(`/datasets/new/create?templateId=${selectedTemplate}`);
    }
  };

  return (
    <Container fluid className="px-4">
      <PageHeader
        title="Create Dataset"
        subtitle="Select a template to create your dataset"
        breadcrumbs={[
          { label: 'Datasets', href: '/datasets' },
          { label: 'Create Dataset' }
        ]}
      />

      {isLoading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" />
        </div>
      ) : templates?.length === 0 ? (
        <Card>
          <CardBody className="text-center py-5">
            <h4>No Templates Available</h4>
            <p className="text-muted">Create a template first to start creating datasets.</p>
            <Link href="/templates/new">
              <Button color="primary">Create Template</Button>
            </Link>
          </CardBody>
        </Card>
      ) : (
        <>
          <Row className="mb-4">
            {templates?.map((template) => (
              <Col md={6} lg={4} key={template._id} className="mb-4">
                <Card
                  className={`template-card ${selectedTemplate === template._id ? 'selected' : ''}`}
                  onClick={() => handleTemplateSelect(template._id!)}
                  style={{ cursor: 'pointer' }}
                >
                  <CardBody>
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <h4 className="mb-0">{template.name}</h4>
                      <Badge color="info" pill>
                        {template.fields.length} fields
                      </Badge>
                    </div>

                    <p className="text-muted small mb-3">
                      {template.description}
                    </p>

                    <ListGroup flush className="border-top pt-3">
                      {template.fields.map(field => (
                        <ListGroupItem key={field.id} className="px-0 py-2">
                          <div className="d-flex justify-content-between">
                            <div>
                              <strong>{field.label}</strong>
                              {field.required && <span className="text-danger ms-1">*</span>}
                              <br />
                              <small className="text-muted">{field.name}</small>
                            </div>
                            <Badge color="light" className="align-self-start">
                              {field.type}
                            </Badge>
                          </div>
                          {field.options && field.options.length > 0 && (
                            <div className="mt-1">
                              <small className="text-muted">
                                Options: {field.options.map(opt => opt.label).join(', ')}
                              </small>
                            </div>
                          )}
                        </ListGroupItem>
                      ))}
                    </ListGroup>

                    {selectedTemplate === template._id && (
                      <div className="text-end mt-3">
                        <Badge color="primary">Selected</Badge>
                      </div>
                    )}
                  </CardBody>
                </Card>
              </Col>
            ))}
          </Row>

          <div className="d-flex justify-content-end">
            <Button
              color="secondary"
              outline
              className="me-2"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button
              color="primary"
              onClick={handleContinue}
              disabled={!selectedTemplate}
            >
              Continue with Selected Template
            </Button>
          </div>
        </>
      )}
    </Container>
  );
};

export default SelectTemplatePage;