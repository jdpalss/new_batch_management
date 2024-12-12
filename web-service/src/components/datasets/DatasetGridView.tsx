import React from 'react';
import {
  Row,
  Col,
  Card,
  CardBody,
  Badge,
  ButtonGroup,
  Button,
  UncontrolledTooltip,
} from 'reactstrap';
import { Eye, Edit2, Trash2, ExternalLink } from 'lucide-react';
import { Dataset } from '@/types/dataset';
import { Template } from '@/types/template';
import { formatDateTime, formatRelativeTime } from '@/utils/date';

interface DatasetGridViewProps {
  datasets: Dataset[];
  templates: Template[];
  onEdit?: (dataset: Dataset) => void;
  onDelete?: (dataset: Dataset) => void;
  onView?: (dataset: Dataset) => void;
  isLoading?: boolean;
}

const DatasetGridView: React.FC<DatasetGridViewProps> = ({
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

  const getTemplateFields = (templateId: string): number => {
    return templates.find(t => t._id === templateId)?.fields.length || 0;
  };

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" />
      </div>
    );
  }

  if (datasets.length === 0) {
    return (
      <Card>
        <CardBody className="text-center py-5">
          <h5 className="text-muted mb-0">No datasets available</h5>
        </CardBody>
      </Card>
    );
  }

  return (
    <Row>
      {datasets.map((dataset) => (
        <Col key={dataset._id} lg={4} className="mb-4">
          <Card className="h-100">
            <CardBody>
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h5 className="card-title mb-1">{dataset.name}</h5>
                  {dataset.description && (
                    <p className="text-muted small mb-0">{dataset.description}</p>
                  )}
                </div>
                <ButtonGroup size="sm">
                  {onView && (
                    <Button
                      color="light"
                      onClick={() => onView(dataset)}
                      title="View Details"
                    >
                      <Eye size={16} />
                    </Button>
                  )}
                  {onEdit && (
                    <Button
                      color="light"
                      onClick={() => onEdit(dataset)}
                      title="Edit Dataset"
                    >
                      <Edit2 size={16} />
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      color="light"
                      onClick={() => onDelete(dataset)}
                      title="Delete Dataset"
                    >
                      <Trash2 size={16} />
                    </Button>
                  )}
                </ButtonGroup>
              </div>

              <div className="mb-3">
                <Badge color="info" pill className="me-2">
                  {getTemplateName(dataset.templateId)}
                </Badge>
                <Badge color="light" pill>
                  {getTemplateFields(dataset.templateId)} fields
                </Badge>
              </div>

              <div className="mb-3">
                <div
                  id={`data-${dataset._id}`}
                  className="border rounded p-2 bg-light"
                  style={{ cursor: 'pointer' }}
                >
                  <pre className="small mb-0" style={{ maxHeight: '100px', overflow: 'auto' }}>
                    {JSON.stringify(dataset.data, null, 2)}
                  </pre>
                </div>
                <UncontrolledTooltip target={`data-${dataset._id}`}>
                  Click to view full data
                </UncontrolledTooltip>
              </div>

              <div className="d-flex justify-content-between align-items-end mt-auto">
                <div className="text-muted small">
                  <div>Created: {formatRelativeTime(dataset.createdAt)}</div>
                  <div>Updated: {formatRelativeTime(dataset.updatedAt)}</div>
                </div>
                <Button
                  color="light"
                  size="sm"
                  title="Open in New Tab"
                >
                  <ExternalLink size={16} />
                </Button>
              </div>
            </CardBody>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default DatasetGridView;