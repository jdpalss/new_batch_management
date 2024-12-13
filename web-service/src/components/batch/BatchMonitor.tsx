import React, { useEffect, useState } from 'react';
import { Card, CardBody, Badge, Progress, Table } from 'reactstrap';
import { BatchExecution, BatchStatus } from '../../types/batch';

interface BatchMonitorProps {
  batchId: string;
  refreshInterval?: number; // ms
}

export const BatchMonitor: React.FC<BatchMonitorProps> = ({ 
  batchId,
  refreshInterval = 5000 
}) => {
  const [executions, setExecutions] = useState<BatchExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 실행 상태 주기적으로 조회
  useEffect(() => {
    const fetchExecutions = async () => {
      try {
        const response = await fetch(`/api/batch/${batchId}/executions`);
        if (!response.ok) {
          throw new Error('Failed to fetch batch executions');
        }
        const data = await response.json();
        setExecutions(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching executions');
      } finally {
        setLoading(false);
      }
    };

    fetchExecutions();
    const interval = setInterval(fetchExecutions, refreshInterval);

    return () => clearInterval(interval);
  }, [batchId, refreshInterval]);

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

  const calculateSuccessRate = () => {
    if (executions.length === 0) return 0;
    const successCount = executions.filter(e => e.status === BatchStatus.SUCCESS).length;
    return (successCount / executions.length) * 100;
  };

  return (
    <Card className="mb-4">
      <CardBody>
        <h4 className="mb-4">배치 실행 모니터링</h4>

        {error && (
          <div className="alert alert-danger">{error}</div>
        )}

        {loading ? (
          <div className="text-center">
            <div className="spinner-border"></div>
            <p>로딩 중...</p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <h5>성공률</h5>
              <Progress value={calculateSuccessRate()} className="mb-2">
                {calculateSuccessRate().toFixed(1)}%
              </Progress>
            </div>

            <Table responsive>
              <thead>
                <tr>
                  <th>실행 ID</th>
                  <th>상태</th>
                  <th>시작 시간</th>
                  <th>종료 시간</th>
                  <th>실행 시간</th>
                  <th>에러</th>
                </tr>
              </thead>
              <tbody>
                {executions.map(execution => (
                  <tr key={execution.id}>
                    <td>{execution.id}</td>
                    <td>
                      <Badge color={getStatusBadgeColor(execution.status)}>
                        {execution.status}
                      </Badge>
                    </td>
                    <td>{new Date(execution.startTime).toLocaleString()}</td>
                    <td>
                      {execution.endTime 
                        ? new Date(execution.endTime).toLocaleString() 
                        : '-'}
                    </td>
                    <td>
                      {execution.executionTime 
                        ? `${execution.executionTime.toFixed(2)}초` 
                        : '-'}
                    </td>
                    <td>
                      {execution.error ? (
                        <span className="text-danger">{execution.error}</span>
                      ) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </>
        )}
      </CardBody>
    </Card>
  );
};
