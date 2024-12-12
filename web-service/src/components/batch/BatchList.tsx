import React, { useState } from 'react';
import { 
  Card, 
  CardHeader, 
  CardBody, 
  Table, 
  Badge, 
  Button,
  Input,
  Row,
  Col,
  ButtonGroup
} from 'reactstrap';
import { Play, Pause, Edit, Trash2, Info } from 'lucide-react';
import { BatchWithDetails, BatchStatus } from '@/types/batch';
import { formatDateTime, formatRelativeTime } from '@/utils/date';
import { describeCronExpression } from '@/utils/cronUtils';
import Link from 'next/link';

interface BatchListProps {
  batches: BatchWithDetails[];
  onEdit: (batch: BatchWithDetails) => void;
  onDelete: (batch: BatchWithDetails) => void;
  onToggleActive: (batch: BatchWithDetails) => void;
  isLoading?: boolean;
}

const statusColors: Record<BatchStatus, string> = {
  [BatchStatus.PENDING]: 'info',
  [BatchStatus.RUNNING]: 'primary',
  [BatchStatus.COMPLETED]: 'success',
  [BatchStatus.FAILED]: 'danger',
  [BatchStatus.INACTIVE]: 'secondary'
};

const BatchList: React.FC<BatchListProps> = ({
  batches,
  onEdit,
  onDelete,
  onToggleActive,
  isLoading
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<BatchStatus | ''>('');

  const filteredBatches = batches.filter(batch => {
    const matchesSearch = 
      batch.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.dataset.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter ? batch.status === statusFilter : true;

    return matchesSearch && matchesStatus;
  });

  const renderSchedule = (batch: BatchWithDetails) => {
    if (batch.schedule.type === 'cron') {
      return (
        <div>
          <small className="d-block text-muted">
            {describeCronExpression(batch.schedule.value as string)}
          </small>
          <code className="small">{batch.schedule.value}</code>
        </div>
      );
    }

    const times = Array.isArray(batch.schedule.value) 
      ? batch.schedule.value 
      : [batch.schedule.value];

    return (
      <div>
        <small className="d-block text-muted">
          {times.length} execution time{times.length > 1 ? 's' : ''}
        </small>
        {times.slice(0, 2).map((time, index) => (
          <div key={index} className="small">
            {formatDateTime(time)}
          </div>
        ))}
        {times.length > 2 && (
          <small className="text-muted">
            +{times.length - 2} more
          </small>
        )}
      </div>
    );
  };

  const renderNextExecution = (batch: BatchWithDetails) => {
    if (!batch.isActive || !batch.nextExecutionTime) {
      return '-';
    }

    return (
      <>
        <div>{formatDateTime(batch.nextExecutionTime)}</div>
        <small className="text-muted">
          {formatRelativeTime(batch.nextExecutionTime)}
        </small>
      </>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardBody className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <Row className="align-items-center">
          <Col>
            <h3 className="mb-0">Batch Jobs</h3>
          </Col>
          <Col xs="auto">
            <Row className="g-2">
              <Col>
                <Input
                  type="select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as BatchStatus | '')}
                  bsSize="sm"
                >
                  <option value="">All Status</option>
                  {Object.values(BatchStatus).map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </Input>
              </Col>
              <Col>
                <Input
                  type="search"
                  placeholder="Search batches..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  bsSize="sm"
                />
              </Col>
            </Row>
          </Col>
        </Row>
      </CardHeader>
      <CardBody>
        <div className="table-responsive">
          <Table className="align-middle mb-0">
            <thead>
              <tr>
                <th>Title</th>
                <th>Template</th>
                <th>Dataset</th>
                <th>Schedule</th>
                <th>Next Run</th>
                <th>Status</th>
                <th>Last Run</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBatches.map((batch) => (
                <tr key={batch._id}>
                  <td>
                    <div className="fw-semibold">{batch.title}</div>
                    {batch.description && (
                      <small className="text-muted">{batch.description}</small>
                    )}
                  </td>
                  <td>
                    <Badge color="info" pill>
                      {batch.template.name}
                    </Badge>
                  </td>
                  <td>
                    <Badge color="info" pill>
                      {batch.dataset.name}
                    </Badge>
                  </td>
                  <td>{renderSchedule(batch)}</td>
                  <td>{renderNextExecution(batch)}</td>
                  <td>
                    <Badge color={statusColors[batch.status || BatchStatus.PENDING]}>
                      {batch.status}
                    </Badge>
                    {batch.schedule.useRandomDelay && (
                      <Badge color="warning" pill className="ms-1">
                        Random
                      </Badge>
                    )}
                  </td>
                  <td>
                    {batch.lastRunAt ? (
                      <>
                        <div>{formatDateTime(batch.lastRunAt)}</div>
                        <small className="text-muted">
                          {formatRelativeTime(batch.lastRunAt)}
                        </small>
                      </>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td>
                    <ButtonGroup size="sm">
                      <Link href={`/batch/${batch._id}`} passHref>
                        <Button color="light" title="View Details">
                          <Info size={16} />
                        </Button>
                      </Link>
                      <Button
                        color="light"
                        onClick={() => onToggleActive(batch)}
                        title={batch.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {batch.isActive ? (
                          <Pause size={16} />
                        ) : (
                          <Play size={16} />
                        )}
                      </Button>
                      <Button
                        color="light"
                        onClick={() => onEdit(batch)}
                        title="Edit"
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        color="light"
                        onClick={() => onDelete(batch)}
                        title="Delete"
                        disabled={batch.isActive}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </ButtonGroup>
                  </td>
                </tr>
              ))}
              {filteredBatches.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-4">
                    {searchTerm || statusFilter ? (
                      <div className="text-muted">
                        No batch jobs found matching your criteria
                      </div>
                    ) : (
                      <div className="text-muted">
                        No batch jobs available
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </CardBody>
    </Card>
  );
};

export default BatchList;