import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardHeader,
  CardBody,
  Table,
  Badge
} from 'reactstrap';
import { BatchService } from '../../services/api';
import { BatchStatus } from '../../types/batch';
import { formatDateTime, getRelativeTime } from '../../utils/date';

interface BatchHistoryProps {
  batchId: string;
}

export const BatchHistory: React.FC<BatchHistoryProps> = ({ batchId }) => {
  const { data: history = [], isLoading } = useQuery({
    queryKey: ['batchHistory', batchId],
    queryFn: () => BatchService.getHistory(batchId),
    refetchInterval: 5000 // 5초마다 갱신
  });

  const getStatusBadgeColor = (status: BatchStatus) => {
    switch (status) {
      case BatchStatus.SUCCESS:
        return 'success';
      case BatchStatus.FAILURE:
        return 'danger';
      case BatchStatus.RUNNING:
        return 'primary';
      case BatchStatus.PENDING:
        return 'warning';
      default:
        return 'secondary';
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <h4 className="mb-0">실행 이력</h4>
      </CardHeader>
      <CardBody>
        {isLoading ? (
          <div className="text-center p-3">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">로딩중...</span>
            </div>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center text-muted p-3">
            실행 이력이 없습니다.
          </div>
        ) : (
          <div className="table-responsive">
            <Table className="mb-0">
              <thead>
                <tr>
                  <th>실행 시작</th>
                  <th>상태</th>
                  <th>실행 시간</th>
                  <th>결과</th>
                </tr>
              </thead>
              <tbody>
                {history.map((execution) => (
                  <tr key={execution.id}>
                    <td>
                      <div>{formatDateTime(new Date(execution.startTime))}</div>
                      <small className="text-muted">
                        {getRelativeTime(new Date(execution.startTime))}
                      </small>
                    </td>
                    <td>
                      <Badge color={getStatusBadgeColor(execution.status)}>
                        {execution.status}
                      </Badge>
                    </td>
                    <td>
                      {execution.executionTime ? 
                        `${(execution.executionTime / 1000).toFixed(1)}초` : 
                        '-'}
                    </td>
                    <td>
                      {execution.error ? (
                        <span className="text-danger">{execution.error}</span>
                      ) : execution.success ? (
                        <span className="text-success">성공</span>
                      ) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </CardBody>
    </Card>
  );
};