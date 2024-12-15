import React from 'react';
import { 
  Card, 
  CardHeader, 
  CardBody, 
  Table,
  Badge,
  Spinner
} from 'reactstrap';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { BatchResult, BatchStatus } from '@/types/batch';
import { formatDateTime, formatDuration } from '@/utils/date';

interface BatchHistoryProps {
  batchId: string;
}

const statusColors: Record<BatchStatus, string> = {
  [BatchStatus.PENDING]: 'info',
  [BatchStatus.RUNNING]: 'primary',
  [BatchStatus.COMPLETED]: 'success',
  [BatchStatus.FAILED]: 'danger',
  [BatchStatus.INACTIVE]: 'secondary'
};

export const BatchHistory: React.FC<BatchHistoryProps> = ({ batchId }) => {
  const { data: history, isLoading } = useQuery({
    queryKey: ['batch-history', batchId],
    queryFn: () => apiService.batch.getHistory(batchId)
  });

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
        <h4 className="mb-0">실행 이력</h4>
      </CardHeader>
      <CardBody>
        <div className="table-responsive">
          <Table className="mb-0">
            <thead>
              <tr>
                <th>실행 시작</th>
                <th>실행 시간</th>
                <th>상태</th>
                <th>결과</th>
              </tr>
            </thead>
            <tbody>
              {history?.map((result: BatchResult) => (
                <tr key={result.id}>
                  <td>
                    {formatDateTime(result.startTime)}
                  </td>
                  <td>
                    {formatDuration(result.executionTime)}
                  </td>
                  <td>
                    <Badge color={statusColors[result.status]}>
                      {result.status}
                    </Badge>
                  </td>
                  <td>
                    {result.error ? (
                      <div>
                        <span className="text-danger">{result.error}</span>
                        {result.metadata?.errorStack && (
                          <pre className="mt-2 mb-0 small text-muted">
                            {result.metadata.errorStack}
                          </pre>
                        )}
                      </div>
                    ) : (
                      result.data && (
                        <pre className="mb-0 small">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      )
                    )}
                  </td>
                </tr>
              ))}
              {(!history || history.length === 0) && (
                <tr>
                  <td colSpan={4} className="text-center py-4">
                    실행 이력이 없습니다.
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