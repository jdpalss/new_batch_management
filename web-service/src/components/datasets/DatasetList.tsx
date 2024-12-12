import React from 'react';
import {
  Card,
  CardBody,
  Table,
  Badge,
  Button,
  UncontrolledTooltip,
} from 'reactstrap';
import { Eye, Edit2, Trash2, Code } from 'lucide-react';
import { Dataset } from '@/types/dataset';
import { Template } from '@/types/template';
import { formatDateTime, formatRelativeTime } from '@/utils/date';
import { truncate } from '@/utils/format';

interface DatasetListProps {
  datasets: Dataset[];
  templates: Template[];
  onEdit?: (dataset: Dataset) => void;
  onDelete?: (dataset: Dataset) => void;
  onView?: (dataset: Dataset) => void;
  isLoading?: boolean;
}

const DatasetList: React.FC<DatasetListProps> = ({
  datasets,
  templates,
  onEdit,
  onDelete,
  onView,
  isLoading,
}) => {
  const getTemplateName = (templateId: string): string => {
    return templates.find(t => t._id === templateId)?.name || 'Unknown Template';
  };

  const getFieldPreview = (data: any, template: Template | undefined): string => {
    if (!template) return '';

    return template.fields
      .slice(0, 3)
      .map(field => `${field.name}: ${truncate(String(data[field.name]), 20)}`)
      .join(', ');
  };

  if (isLoading) {
    return (
      <Card>
        <CardBody className="text-center py-5">
          <div className="spinner-border text-primary" />
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <div className="table-responsive">
        <Table className="align-middle mb-0">
          <thead>
            <tr>
              <th>Name</th>
              <th>Template</th>
              <th>Data Preview</th>
              <th>Created</th>
              <th>Updated</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {datasets.map((dataset) => {
              const template = templates.find(t => t._id === dataset.templateId);
              const dataPreview = getFieldPreview(dataset.data, template);

              return (
                <tr key={dataset._id}>
                  <td>
                    <div className="fw-medium">{dataset.name}</div>
                    {dataset.description && (
                      <small className="text-muted d-block">
                        {dataset.description}
                      </small>
                    )}
                  </td>
                  <td>
                    <Badge color="info" pill>
                      {getTemplateName(dataset.templateId)}
                    </Badge>
                  </td>
                  <td>
                    {dataPreview && (
                      <>
                        <span
                          id={`data-${dataset._id}`}
                          className="text-muted small cursor-pointer"
                        >
                          {dataPreview}
                          {template && template.fields.length > 3 && ' ...'}
                        </span>
                        <UncontrolledTooltip
                          target={`data-${dataset._id}`}
                          placement="right"
                        >
                          <div className="text-start">
                            <pre className="mb-0" style={{ fontSize: '0.75rem' }}>
                              {JSON.stringify(dataset.data, null, 2)}
                            </pre>
                          </div>
                        </UncontrolledTooltip>
                      </>
                    )}
                  </td>
                  <td>
                    <div>{formatDateTime(dataset.createdAt)}</div>
                    <small className="text-muted">
                      {formatRelativeTime(dataset.createdAt)}
                    </small>
                  </td>
                  <td>
                    <div>{formatDateTime(dataset.updatedAt)}</div>
                    <small className="text-muted">
                      {formatRelativeTime(dataset.updatedAt)}
                    </small>
                  </td>
                  <td>
                    <div className="d-flex justify-content-end gap-1">
                      {onView && (
                        <Button
                          color="light"
                          size="sm"
                          onClick={() => onView(dataset)}
                          title="View Dataset"
                        >
                          <Eye size={16} />
                        </Button>
                      )}
                      {onEdit && (
                        <Button
                          color="light"
                          size="sm"
                          onClick={() => onEdit(dataset)}
                          title="Edit Dataset"
                        >
                          <Edit2 size={16} />
                        </Button>
                      )}
                      <Button
                        color="light"
                        size="sm"
                        title="View Playwright Script"
                      >
                        <Code size={16} />
                      </Button>
                      {onDelete && (
                        <Button
                          color="light"
                          size="sm"
                          onClick={() => onDelete(dataset)}
                          title="Delete Dataset"
                        >
                          <Trash2 size={16} />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {datasets.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-4">
                  <div className="text-muted">No datasets available</div>
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </Card>
  );
};

export default DatasetList;