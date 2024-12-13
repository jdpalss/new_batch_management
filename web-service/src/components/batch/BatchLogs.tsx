import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardHeader,
  CardBody,
  Table,
  Badge
} from 'reactstrap';
import { formatDateTime } from '@/utils/date';
import { BatchService } from '@/services/api';

interface BatchLogsProps {
  batchId: string;
}

export const BatchLogs: React.FC<BatchLogsProps> = ({ batchId }) => {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['batchLogs', batchId],
    queryFn: () => BatchService.getLogs(batchId),
    refetchInterval: 5000 // 5초마다 갱신
  });

  return (
    <Card className="mb-4">
      <CardHeader>
        <h4 className="mb-0">실행 로그</h4>
      </CardHeader>
      <CardBody>
        {isLoading ? (
          <div className="text-center p-3">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">로딩중...</span>
            </div>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center text-muted p-3">
            로그가 없습니다.
          </div>
        ) : (
          <div className="table-responsive">
            <Table className="mb-0">
              <thead>
                <tr>
                  <th>시간</th>
                  <th>수준</th>
                  <th>메시지</th>
                  <th>메타데이터</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, index) => (
                  <tr key={index}>
                    <td className="text-nowrap">
                      {formatDateTime(new Date(log.timestamp))}
                    </td>
                    <td>
                      <Badge
                        color={
                          log.level === 'error' ? 'danger' :
                          log.level === 'warn' ? 'warning' : 
                          'info'
                        }
                      >
                        {log.level.toUpperCase()}
                      </Badge>
                    </td>
                    <td>{log.message}</td>
                    <td>
                      {log.metadata && (
                        <pre className="mb-0 small">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      )}
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