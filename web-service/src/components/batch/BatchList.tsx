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
  ButtonGroup,
  Spinner
} from 'reactstrap';
import { Play, Pause, Edit, Trash2, Info } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { apiService } from '@/services/api';
import { BatchWithDetails, BatchStatus } from '@/types/batch';
import { formatDateTime, formatRelativeTime } from '@/utils/date';
import { describeCronExpression } from '@/utils/cronUtils';
import { useToasts } from '@/hooks/useToasts';

const statusColors: Record<BatchStatus, string> = {
  [BatchStatus.PENDING]: 'info',
  [BatchStatus.RUNNING]: 'primary',
  [BatchStatus.COMPLETED]: 'success',
  [BatchStatus.FAILED]: 'danger',
  [BatchStatus.INACTIVE]: 'secondary'
};

export const BatchList: React.FC = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const toasts = useToasts();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<BatchStatus | ''>('');

  // 배치 목록 조회
  const { data: batches, isLoading } = useQuery({
    queryKey: ['batches'],
    queryFn: () => apiService.batch.list()
  });

  // 배치 삭제
  const deleteMutation = useMutation({
    mutationFn: apiService.batch.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      toasts.addToast({
        type: 'success',
        title: '배치 삭제',
        message: '배치가 삭제되었습니다.'
      });
    },
    onError: (error: Error) => {
      toasts.addToast({
        type: 'error',
        title: '배치 삭제 실패',
        message: error.message
      });
    }
  });

  // 배치 활성화/비활성화
  const toggleMutation = useMutation({
    mutationFn: (batch: BatchWithDetails) => 
      apiService.batch.update(batch.id, { isActive: !batch.isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batches'] });
    },
    onError: (error: Error) => {
      toasts.addToast({
        type: 'error',
        title: '상태 변경 실패',
        message: error.message
      });
    }
  });

  // 배치 실행
  const executeMutation = useMutation({
    mutationFn: apiService.batch.execute,
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['batches'],
        exact: false 
      });
      toasts.addToast({
        type: 'success',
        title: '배치 실행',
        message: '배치가 실행되었습니다.'
      });
    },
    onError: (error: Error) => {
      toasts.addToast({
        type: 'error',
        title: '실행 실패',
        message: error.message
      });
    }
  });

  const filteredBatches = batches?.filter(batch => {
    const matchesSearch = 
      batch.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.dataset.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter ? batch.status === statusFilter : true;

    return matchesSearch && matchesStatus;
  }) ?? [];

  const renderSchedule = (batch: BatchWithDetails) => {
    if (batch.schedule.type === 'periodic') {
      return (
        <div>
          <small className="d-block text-muted">
            {describeCronExpression(batch.schedule.cronExpression || '')}
          </small>
          <code className="small">{batch.schedule.cronExpression}</code>
        </div>
      );
    }

    return (
      <div>
        <small className="d-block text-muted">
          {batch.schedule.executionDates?.length} execution time(s)
        </small>
        {batch.schedule.executionDates?.slice(0, 2).map((date, index) => (
          <div key={index} className="small">
            {formatDateTime(date)}
          </div>
        ))}
        {batch.schedule.executionDates && batch.schedule.executionDates.length > 2 && (
          <small className="text-muted">
            +{batch.schedule.executionDates.length - 2} more
          </small>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardBody className="text-center py-5">
          <Spinner color="primary" />
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
                <th>Status</th>
                <th>Last Run</th>
                <th>Next Run</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBatches.map((batch) => (
                <tr key={batch.id}>
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
                  <td>
                    <Badge color={statusColors[batch.status]}>
                      {batch.status}
                    </Badge>
                    {batch.schedule.randomDelay && (
                      <Badge color="warning" pill className="ms-1">
                        Random
                      </Badge>
                    )}
                  </td>
                  <td>
                    {batch.lastRun ? (
                      <>
                        <div>{formatDateTime(batch.lastRun)}</div>
                        <small className="text-muted">
                          {formatRelativeTime(batch.lastRun)}
                        </small>
                      </>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td>
                    {batch.nextRun ? (
                      <>
                        <div>{formatDateTime(batch.nextRun)}</div>
                        <small className="text-muted">
                          {formatRelativeTime(batch.nextRun)}
                        </small>
                      </>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td>
                    <ButtonGroup size="sm">
                      <Link href={`/batch/${batch.id}`} passHref>
                        <Button color="light" title="View Details">
                          <Info size={16} />
                        </Button>
                      </Link>
                      <Button
                        color="light"
                        onClick={() => toggleMutation.mutate(batch)}
                        title={batch.isActive ? 'Deactivate' : 'Activate'}
                        disabled={toggleMutation.isPending}
                      >
                        {batch.isActive ? (
                          <Pause size={16} />
                        ) : (
                          <Play size={16} />
                        )}
                      </Button>
                      <Button
                        color="light"
                        onClick={() => router.push(`/batch/edit/${batch.id}`)}
                        title="Edit"
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        color="light"
                        onClick={() => {
                          if (window.confirm('이 배치를 삭제하시겠습니까?')) {
                            deleteMutation.mutate(batch.id);
                          }
                        }}
                        title="Delete"
                        disabled={batch.isActive || deleteMutation.isPending}
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
                        검색 조건에 맞는 배치가 없습니다.
                      </div>
                    ) : (
                      <div className="text-muted">
                        등록된 배치가 없습니다.
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