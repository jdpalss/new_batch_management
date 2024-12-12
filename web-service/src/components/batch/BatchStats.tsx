import React from 'react';
import { Card, CardBody, CardHeader, Row, Col } from 'reactstrap';

interface BatchStatsProps {
  stats: {
    total: number;
    success: number;
    failed: number;
    averageExecutionTime: number;
  };
}

export const BatchStats: React.FC<BatchStatsProps> = ({ stats }) => {
  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds} seconds`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const calculateSuccessRate = (): string => {
    if (stats.total === 0) return '0%';
    return `${((stats.success / stats.total) * 100).toFixed(1)}%`;
  };

  return (
    <Card>
      <CardHeader>Batch Statistics</CardHeader>
      <CardBody>
        <Row>
          <Col md={3}>
            <div className="stat-card">
              <div className="stat-title">Total Executions</div>
              <div className="stat-value">{stats.total}</div>
            </div>
          </Col>
          <Col md={3}>
            <div className="stat-card">
              <div className="stat-title">Success Rate</div>
              <div className="stat-value text-success">{calculateSuccessRate()}</div>
            </div>
          </Col>
          <Col md={3}>
            <div className="stat-card">
              <div className="stat-title">Failed Runs</div>
              <div className="stat-value text-danger">{stats.failed}</div>
            </div>
          </Col>
          <Col md={3}>
            <div className="stat-card">
              <div className="stat-title">Avg. Execution Time</div>
              <div className="stat-value">{formatDuration(stats.averageExecutionTime)}</div>
            </div>
          </Col>
        </Row>
      </CardBody>
    </Card>
  );
};