import React from 'react';
import { 
  Card, 
  CardHeader, 
  CardBody, 
  Badge,
  Spinner 
} from 'reactstrap';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../../services/api';
import { formatDateTime } from '@/utils/date';

interface BatchLogsProps {
  batchId: string;
}

export const BatchLogs: React.FC<BatchLogsProps> = ({ batchId }) => {
  const { data: logs, isLoading } = useQuery({
    queryKey: ['batch-logs', batchId],
    queryFn: () => apiService.batch.getLogs(batchId),
    refetchInterval: 5000 // 5초마다 자동 갱신
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
        <h4 className="mb-0">실행 로그</h4>
      </CardHeader>
      <CardBody>
        {logs?.length === 0 ? (
          <div className="text-center text-muted py-4">
            실행 로그가 없습니다.
          </div>
        ) : (
          <div className="log-entries" style={{ maxHeight: '500px', overflowY: 'auto' }}>
            {logs?.map((log, index) => (
              <div key={index} className="log-entry mb-2 pb-2 border-bottom">
                <div className="d-flex justify-content-between align-items-start mb-1">
                  <div>
                    <Badge 
                      color={log.level === 'error' ? 'danger' : 'info'}
                      className="me-2"
                    >
                      {log.level.toUpperCase()}
                    </Badge>
                    <span className="text-muted small">
                      {formatDateTime(log.timestamp)}
                    </span>
                  </div>
                </div>
                <div className="log-message">
                  {log.message}
                  {log.metadata && (
                    <pre className="mt-1 mb-0 bg-light p-2 rounded small">
                      {JSON.stringify(log.metadata, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
};