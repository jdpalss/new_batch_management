import React, { useState } from 'react';
import {
  Table,
  Badge,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Card,
  CardBody,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane
} from 'reactstrap';
import { BatchResult, BatchStatus } from '../../types/batch';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { formatDateTime, formatDuration } from '../../utils/dateUtils';

interface BatchHistoryProps {
  results: BatchResult[];
  isLoading?: boolean;
}

const StatusBadge: React.FC<{ status: BatchStatus }> = ({ status }) => {
  const colors = {
    [BatchStatus.SUCCESS]: 'success',
    [BatchStatus.FAILURE]: 'danger',
    [BatchStatus.RUNNING]: 'warning',
    [BatchStatus.STOPPED]: 'secondary'
  };

  const labels = {
    [BatchStatus.SUCCESS]: '성공',
    [BatchStatus.FAILURE]: '실패',
    [BatchStatus.RUNNING]: '실행중',
    [BatchStatus.STOPPED]: '중지됨'
  };

  return (
    <Badge color={colors[status]}>
      {labels[status]}
    </Badge>
  );
};

interface LogViewProps {
  logs: BatchResult['logs'];
}

const LogView: React.FC<LogViewProps> = ({ logs }) => {
  const getLogLevelClass = (level: 'info' | 'error' | 'warn') => {
    switch (level) {
      case 'error': return 'text-danger';
      case 'warn': return 'text-warning';
      default: return 'text-info';
    }
  };

  if (logs.length === 0) {
    return <div className="text-center py-4 text-muted">로그가 없습니다.</div>;
  }

  return (
    <div className="bg-dark text-light p-3 rounded" style={{ maxHeight: '400px', overflow: 'auto' }}>
      {logs.map((log, index) => (
        <div key={index} className={getLogLevelClass(log.level)}>
          [{formatDateTime(log.timestamp)}] {log.message}
          {log.metadata && (
            <pre className="mt-1 ms-4 mb-2 small">
              {JSON.stringify(log.metadata, null, 2)}
            </pre>
          )}
        </div>
      ))}
    </div>
  );
};

export const BatchHistory: React.FC<BatchHistoryProps> = ({
  results,
  isLoading
}) => {
  const [selectedResult, setSelectedResult] = useState<BatchResult | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'logs'>('details');

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-4 text-muted">
        실행 이력이 없습니다.
      </div>
    );
  }

  return (
    <>
      <Table hover responsive>
        <thead>
          <tr>
            <th>상태</th>
            <th>시작 시간</th>
            <th>실행 시간</th>
            <th>로그</th>
            <th>에러</th>
            <th>작업</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result) => (
            <tr key={result.id}>
              <td>
                <StatusBadge status={result.status} />
              </td>
              <td>{formatDateTime(result.timestamp)}</td>
              <td>{formatDuration(result.executionTime)}</td>
              <td>{result.logs.length}개</td>
              <td>
                {result.error && (
                  <span className="text-danger">
                    {result.error.length > 50
                      ? `${result.error.substring(0, 50)}...`
                      : result.error}
                  </span>
                )}
              </td>
              <td>
                <Button
                  color="link"
                  size="sm"
                  onClick={() => setSelectedResult(result)}
                >
                  상세보기
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal
        isOpen={!!selectedResult}
        toggle={() => setSelectedResult(null)}
        size="lg"
      >
        <ModalHeader toggle={() => setSelectedResult(null)}>
          실행 상세 정보
        </ModalHeader>
        {selectedResult && (
          <>
            <ModalBody>
              <Card className="mb-3">
                <CardBody>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <div className="text-muted small">상태</div>
                        <StatusBadge status={selectedResult.status} />
                      </div>
                      <div className="mb-3">
                        <div className="text-muted small">시작 시간</div>
                        <div>{formatDateTime(selectedResult.timestamp)}</div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <div className="text-muted small">실행 시간</div>
                        <div>{formatDuration(selectedResult.executionTime)}</div>
                      </div>
                      {selectedResult.error && (
                        <div>
                          <div className="text-muted small">에러</div>
                          <div className="text-danger">{selectedResult.error}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Nav tabs>
                <NavItem>
                  <NavLink
                    className={activeTab === 'details' ? 'active' : ''}
                    onClick={() => setActiveTab('details')}
                    style={{ cursor: 'pointer' }}
                  >
                    실행 세부사항
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={activeTab === 'logs' ? 'active' : ''}
                    onClick={() => setActiveTab('logs')}
                    style={{ cursor: 'pointer' }}
                  >
                    로그
                  </NavLink>
                </NavItem>
              </Nav>

              <TabContent activeTab={activeTab} className="mt-3">
                <TabPane tabId="details">
                  {/* TODO: Add execution details */}
                </TabPane>
                <TabPane tabId="logs">
                  <LogView logs={selectedResult.logs} />
                </TabPane>
              </TabContent>
            </ModalBody>
            <ModalFooter>
              <Button color="secondary" onClick={() => setSelectedResult(null)}>
                닫기
              </Button>
            </ModalFooter>
          </>
        )}
      </Modal>
    </>
  );
};