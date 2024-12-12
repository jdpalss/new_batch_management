import React, { useState } from 'react';
import {
  Table,
  Badge,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter
} from 'reactstrap';
import { BatchResult, BatchStatus } from '../../types/batch';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { formatDateTime, formatDuration } from '../../utils/dateUtils';

interface BatchHistoryProps {
  results: BatchResult[];
  isLoading?: boolean;
}

export const BatchHistory: React.FC<BatchHistoryProps> = ({
  results,
  isLoading
}) => {
  const [selectedResult, setSelectedResult] = useState<BatchResult | null>(null);

  const getStatusBadge = (status: BatchStatus) => {
    const colors = {
      [BatchStatus.SUCCESS]: 'success',
      [BatchStatus.FAILURE]: 'danger',
      [BatchStatus.RUNNING]: 'warning',
      [BatchStatus.STOPPED]: 'secondary'
    };

    return (
      <Badge color={colors[status]}>
        {status}
      </Badge>
    );
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!results.length) {
    return (
      <div className="text-center py-4">
        <p className="text-muted">No execution history available.</p>
      </div>
    );
  }

  return (
    <>
      <Table hover responsive>
        <thead>
          <tr>
            <th>Status</th>
            <th>Started At</th>
            <th>Duration</th>
            <th>Logs</th>
            <th>Error</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result) => (
            <tr key={result.id}>
              <td>{getStatusBadge(result.status)}</td>
              <td>{formatDateTime(result.timestamp)}</td>
              <td>{formatDuration(result.executionTime)}</td>
              <td>{result.logs.length} entries</td>
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
                  Details
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
          Execution Details
        </ModalHeader>
        <ModalBody>
          {selectedResult && (
            <div>
              <dl>
                <dt>Status</dt>
                <dd>{getStatusBadge(selectedResult.status)}</dd>

                <dt>Started At</dt>
                <dd>{formatDateTime(selectedResult.timestamp)}</dd>

                <dt>Duration</dt>
                <dd>{formatDuration(selectedResult.executionTime)}</dd>

                {selectedResult.error && (
                  <>
                    <dt>Error</dt>
                    <dd className="text-danger">{selectedResult.error}</dd>
                  </>
                )}

                <dt>Logs</dt>
                <dd>
                  <div
                    className="bg-dark text-light p-3 rounded"
                    style={{ maxHeight: '300px', overflow: 'auto' }}
                  >
                    {selectedResult.logs.map((log, index) => (
                      <div key={index} className={`text-${log.level}`}>
                        [{formatDateTime(log.timestamp)}] {log.message}
                        {log.metadata && (
                          <pre className="mt-1 ms-4 mb-2">
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                </dd>
              </dl>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setSelectedResult(null)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};