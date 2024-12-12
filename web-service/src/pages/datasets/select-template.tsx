import React from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  CardText,
  Button,
} from 'reactstrap';
import { templateService } from '@/services/templateService';

const SelectTemplatePage = () => {
  const router = useRouter();
  const { data: templates, isLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: () => templateService.findAll(),
  });

  const handleTemplateSelect = (templateId: string) => {
    router.push(\`/datasets/new?templateId=\${templateId}\`);
  };

  if (isLoading) {
    return <div>Loading templates...</div>;
  }

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <h1>Select Template</h1>
          <p>Choose a template to create a new dataset</p>
        </Col>
      </Row>

      <Row>
        {templates?.map((template) => (
          <Col md={4} key={template._id} className="mb-4">
            <Card>
              <CardBody>
                <CardTitle tag="h5">{template.name}</CardTitle>
                <CardText>{template.description}</CardText>
                <div className="mb-3">
                  <small className="text-muted">
                    Fields: {template.fields.length}
                  </small>
                </div>
                <Button
                  color="primary"
                  onClick={() => handleTemplateSelect(template._id!)}
                >
                  Use Template
                </Button>
              </CardBody>
            </Card>
          </Col>
        ))}
        
        {templates?.length === 0 && (
          <Col>
            <Card body>
              <CardText>
                No templates found. Please create a template first.
              </CardText>
              <Button color="primary" onClick={() => router.push('/templates')}>
                Create Template
              </Button>
            </Card>
          </Col>
        )}
      </Row>
    </Container>
  );
};

export default SelectTemplatePage;