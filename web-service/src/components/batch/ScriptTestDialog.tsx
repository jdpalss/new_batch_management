import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Alert
} from 'reactstrap';
import { Template } from '../../types/template';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { formatDateTime, formatDuration } from '../../utils/dateUtils';

interface ScriptTestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  template: Template;
  datasetId: string;
}

interface TestResult {
  success: boolean;
  logs: Array<{
    level: 'info' | 'error' | 'warn';
    message: string;
    timestamp: string;
    metadata?: any;
  }>;
  error?: string;
  executionTime: number;
}

export const ScriptTestDialog: React.FC<ScriptTestDialogProps> = ({
  isOpen,
  onClose,
  template,
  datasetId
}) => {
  const [result, setResult] = useState<TestResult | null>(null);

  const testScript = useMutation({
    mutationFn: async () => {
      const response = await axios.post('/api/batch/test', {
        script: template.script,
        datasetId
      });
      return response.data as TestResult;
    },
    onSuccess: (data) => {
      setResult(data);
    }
  });

  const handleTest = () => {
    setResult(null);
    testScript.mutate();
  };

  return (
    <Modal isOpen={isOpen} toggle={onClose} size="lg">
      <ModalHeader toggle={onClose}>Test Script Execution</ModalHeader>
      <ModalBody>
        {testScript.isLoading && (
          <div className="text-center py-4">
            <LoadingSpinner text="Executing script..." />
          </div>
        )}

        {result && (
          <div>
            <Alert color={result.success ? 'success' : 'danger'}>
              {result.success ? 'Script executed successfully' : 'Script execution failed'}
              <br />
              <small>
                Execution time: {formatDuration(result.executionTime)}
              </small>
            </Alert>

            {result.error && (
              <div className="mb-4">
                <h6>Error:</h6>
                <pre className="bg-danger text-white p-3 rounded">
                  {result.error}
                </pre>
              </div>
            )}

            <h6>Execution Logs:</h6>
            <div
              className="bg-dark text-light p-3 rounded"
              style={{ maxHeight: '300px', overflow: 'auto' }}
            >
              {result.logs.map((log, index) => (
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
          </div>
        )}

        {!testScript.isLoading && !result && (
          <div className="text-center py-4">
            <p>Click the Test button to execute the script with the selected dataset.</p>
          </div>
        )}
      </ModalBody>
      <ModalFooter>
        <Button
          color="primary"
          onClick={handleTest}
          disabled={testScript.isLoading}
        >
          {testScript.isLoading ? 'Testing...' : 'Test'}
        </Button>
        <Button color="secondary" onClick={onClose}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
};