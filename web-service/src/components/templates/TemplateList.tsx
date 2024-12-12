import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardBody,
  CardHeader,
  Table,
  Button,
  Badge,
} from 'reactstrap';
import { Template } from '@/types/template';
import { templateService } from '@/services/templateService';

interface TemplateListProps {
  onEdit: (template: Template) => void;
  onDelete: (template: Template) => void;
}

const TemplateList: React.FC<TemplateListProps> = ({ onEdit, onDelete }) => {
  const { data: templates, isLoading } = useQuery<Template[]>({
    queryKey: ['templates'],
    queryFn: () => templateService.findAll(),
  });

  if (isLoading) {
    return <div>Loading templates...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <h3>Templates</h3>
      </CardHeader>
      <CardBody>
        <Table responsive>
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Fields</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {templates?.map((template) => (
              <tr key={template._id}>
                <td>{template.name}</td>
                <td>{template.description}</td>
                <td>
                  {template.fields.map((field) => (
                    <Badge key={field.id} color="info" className="me-1">
                      {field.name}
                    </Badge>
                  ))}
                </td>
                <td>{new Date(template.createdAt).toLocaleDateString()}</td>
                <td>
                  <Button
                    color="primary"
                    size="sm"
                    className="me-2"
                    onClick={() => onEdit(template)}
                  >
                    Edit
                  </Button>
                  <Button
                    color="danger"
                    size="sm"
                    onClick={() => onDelete(template)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </CardBody>
    </Card>
  );
};

export default TemplateList;