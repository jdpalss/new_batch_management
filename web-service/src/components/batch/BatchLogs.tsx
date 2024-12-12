import React from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Badge,
  ListGroup,
  ListGroupItem,
} from 'reactstrap';
import { formatDateTime } from '@/utils/date';
import { Info, AlertCircle } from 'lucide-react';

interface BatchLogsProps {
  logs: string[];
  startTime?: Date;
  error?: string;
}

const BatchLogs: React.FC<BatchLogsProps> = ({
  logs,
  startTime,
  error,
}) => {
  const parseLogLevel = (log: string): 'info' | 'error' | 'warn' => {
    const lowerLog = log.toLowerCase();
    if (lowerLog.includes('error')) return 'error';
    if (lowerLog.includes('warn')) return 'warn';
    return 'info';
  };

  const getLevelColor = (level: 'info' | 'error' | 'warn'): string => {
    switch (level) {
      case 'error': return 'danger';
      case 'warn': return 'warning';
      default: return 'info';
    }
  };

  const getLevelIcon = (level: 'info' | 'error' | 'warn') => {
    switch (level) {
      case 'error':
      case 'warn':
        return <AlertCircle size={16} className="me-2" />;
      default:
        return <Info size={16} className="me-2" />;
    }
  };

  return (
    <Card>
      <CardHeader className="d-flex justify-content-between align-items-center">
        <h4 className="mb-0">Execution Logs</h4>
        {startTime && (
          <small className="text-muted">
            Started at {formatDateTime(startTime)}
          </small>
        )}
      </CardHeader>
      <CardBody>
        {error && (
          <div className="alert alert-danger mb-3">
            <AlertCircle size={16} className="me-2" />
            {error}
          </div>
        )}

        <ListGroup flush>
          {logs.map((log, index) => {
            const level = parseLogLevel(log);
            return (
              <ListGroupItem
                key={index}
                className="d-flex align-items-start py-2 px-3"
              >
                <div className={`text-${getLevelColor(level)} me-2`}>
                  {getLevelIcon(level)}
                </div>
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between">
                    <div style={{ wordBreak: 'break-word' }}>
                      {log}
                    </div>
                    <Badge
                      color={getLevelColor(level)}
                      className="ms-2"
                      pill
                    >
                      {level}
                    </Badge>
                  </div>
                </div>
              </ListGroupItem>
            );
          })}
          {logs.length === 0 && (
            <ListGroupItem className="text-center text-muted py-4">
              No logs available
            </ListGroupItem>
          )}
        </ListGroup>
      </CardBody>
    </Card>
  );
};

export default BatchLogs;