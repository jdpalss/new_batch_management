import React from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Row, Col, Card, CardBody, Nav, NavItem, NavLink } from 'reactstrap';
import { BatchConfig, BatchResult } from '../../types/batch';
import { Template } from '../../types/template';
import { Dataset } from '../../types/dataset';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { PageHeader } from '../../components/common/PageHeader';
import { BatchDetails } from '../../components/batch/BatchDetails';
import { BatchHistory } from '../../components/batch/BatchHistory';
import { BatchStats } from '../../components/batch/BatchStats';

enum TabType {
  DETAILS = 'details',
  HISTORY = 'history',
  LOGS = 'logs'
}

export default function BatchDetailsPage() {
  const router = useRouter();
  const { id } = router.query;
  const [activeTab, setActiveTab] = React.useState<TabType>(TabType.DETAILS);

  const { data: batch, isLoading: isLoadingBatch } = useQuery<BatchConfig>({
    queryKey: ['batch', id],
    queryFn: async () => {
      const response = await axios.get(`/api/batch/${id}`);
      return response.data;
    },
    enabled: !!id
  });

  const { data: template, isLoading: isLoadingTemplate } = useQuery<Template>({
    queryKey: ['template', batch?.templateId],
    queryFn: async () => {
      const response = await axios.get(`/api/template/${batch?.templateId}`);
      return response.data;
    },
    enabled: !!batch?.templateId
  });

  const { data: dataset, isLoading: isLoadingDataset } = useQuery<Dataset>({
    queryKey: ['dataset', batch?.datasetId],
    queryFn: async () => {
      const response = await axios.get(`/api/dataset/${batch?.datasetId}`);
      return response.data;
    },
    enabled: !!batch?.datasetId
  });

  const { data: history, isLoading: isLoadingHistory } = useQuery<BatchResult[]>({
    queryKey: ['batchHistory', id],
    queryFn: async () => {
      const response = await axios.get(`/api/batch/${id}/history`);
      return response.data;
    },
    enabled: !!id && activeTab === TabType.HISTORY
  });

  const { data: stats } = useQuery({
    queryKey: ['batchStats', id],
    queryFn: async () => {
      const response = await axios.get(`/api/batch/${id}/stats`);
      return response.data;
    },
    enabled: !!id
  });

  if (isLoadingBatch || isLoadingTemplate || isLoadingDataset) {
    return <LoadingSpinner />;
  }

  if (!batch || !template || !dataset) {
    return <div>Batch, template or dataset not found</div>;
  }

  return (
    <div>
      <PageHeader title={batch.title} description={batch.description} />

      <Row className="mb-4">
        <Col md={12}>
          <BatchStats stats={stats} />
        </Col>
      </Row>

      <Card>
        <CardBody>
          <Nav tabs className="mb-4">
            <NavItem>
              <NavLink
                active={activeTab === TabType.DETAILS}
                onClick={() => setActiveTab(TabType.DETAILS)}
                style={{ cursor: 'pointer' }}
              >
                Details
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                active={activeTab === TabType.HISTORY}
                onClick={() => setActiveTab(TabType.HISTORY)}
                style={{ cursor: 'pointer' }}
              >
                Execution History
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                active={activeTab === TabType.LOGS}
                onClick={() => setActiveTab(TabType.LOGS)}
                style={{ cursor: 'pointer' }}
              >
                Logs
              </NavLink>
            </NavItem>
          </Nav>

          {activeTab === TabType.DETAILS && (
            <BatchDetails
              batch={batch}
              template={template}
              dataset={dataset}
            />
          )}

          {activeTab === TabType.HISTORY && (
            <BatchHistory
              results={history || []}
              isLoading={isLoadingHistory}
            />
          )}

          {activeTab === TabType.LOGS && (
            <div>
              {/* TODO: Implement logs viewer */}
              Logs viewer coming soon...
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}