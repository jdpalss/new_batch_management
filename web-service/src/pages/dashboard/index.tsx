import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Row, Col, Card, CardBody } from 'reactstrap';
import { PageHeader } from '../../components/common/PageHeader';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

interface DashboardStats {
  totalTemplates: number;
  totalDatasets: number;
  totalBatches: number;
  activeBatches: number;
  successRate: number;
  lastExecutionTime?: string;
  nextScheduledRun?: string;
}

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const response = await axios.get('/api/dashboard/stats');
      return response.data;
    }
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of your batch automation system"
      />

      <Row>
        <Col md={3}>
          <Card>
            <CardBody>
              <div className="stat-card">
                <div className="stat-title">Total Templates</div>
                <div className="stat-value">{stats?.totalTemplates || 0}</div>
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col md={3}>
          <Card>
            <CardBody>
              <div className="stat-card">
                <div className="stat-title">Total Datasets</div>
                <div className="stat-value">{stats?.totalDatasets || 0}</div>
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col md={3}>
          <Card>
            <CardBody>
              <div className="stat-card">
                <div className="stat-title">Active Batches</div>
                <div className="stat-value">{stats?.activeBatches || 0}</div>
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col md={3}>
          <Card>
            <CardBody>
              <div className="stat-card">
                <div className="stat-title">Success Rate</div>
                <div className="stat-value">
                  {stats ? `${stats.successRate.toFixed(1)}%` : '0%'}
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* TODO: Add recent batch executions list */}
      {/* TODO: Add system health status */}
      {/* TODO: Add batch execution timeline */}
    </div>
  );
}