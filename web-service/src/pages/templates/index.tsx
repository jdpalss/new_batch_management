import React from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import {
  Button,
  Card,
  CardBody,
  Table,
  Badge
} from 'reactstrap';
import axios from 'axios';
import { Template } from '../../types/template';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatDateTime } from '../../utils/dateUtils';
import { PageHeader } from '../../components/common/PageHeader';

const TemplatesPage: React.FC = () => {
  const router = useRouter();

  const { data: templates, isLoading } = useQuery<Template[]>({
    queryKey: ['templates'],
    queryFn: async () => {
      const response = await axios.get('/api/template');
      return response.data;
    }
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <PageHeader
        title="Templates"
        action={
          <Button 
            color="primary"
            onClick={() => router.push('/templates/create')}
          >
            Create Template
          </Button>
        }
      />

      <Card>
        <CardBody>
          <Table hover responsive>
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Fields</th>
                <th>Version</th>
                <th>Last Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {templates?.map((template) => (
                <tr key={template.id}>
                  <td>{template.name}</td>
                  <td>{template.description}</td>
                  <td>
                    <Badge color="info">
                      {template.fields.length} fields
                    </Badge>
                  </td>
                  <td>v{template.version}</td>
                  <td>{formatDateTime(template.updatedAt)}</td>
                  <td>
                    <Button
                      color="link"
                      size="sm"
                      onClick={() => router.push(`/templates/edit/${template.id}`)}
                    >
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
              {!templates?.length && (
                <tr>
                  <td colSpan={6} className="text-center py-4">
                    No templates found. Create your first template to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );
};

export default TemplatesPage;