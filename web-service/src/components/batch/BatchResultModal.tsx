import React from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
} from 'reactstrap';
import { BatchResult } from '@/types/batch';
import { formatDateTime } from '@/utils/date';
import BatchLogs from './BatchLogs';

interface BatchResultModalProps {
  isOpen: boolean;
  toggle: () => void;
  result: BatchResult;
}

const BatchResultModal: React.FC<BatchResultModalProps> = ({
  isOpen,
  toggle,
  result,
}) => {
  const [activeTab, setActiveTab] = React.useState('logs');

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg">
      <ModalHeader toggle={toggle}>
        <div>
          Execution Details
          <small className="text-muted d-block">
            {formatDateTime(result.startTime)}
          </small>
        </div>
      </ModalHeader>
      <ModalBody>
        <Nav tabs className="mb-3">
          <NavItem>
            <NavLink
              className={activeTab === 'logs' ? 'active' : ''}
              onClick={() => setActiveTab('logs')}
              style={{ cursor: 'pointer' }}
            >
              Logs
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={activeTab === 'details' ? 'active' : ''}
              onClick={() => setActiveTab('details')}
              style={{ cursor: 'pointer' }}
            >
              Details
            </NavLink>
          </NavItem>
        </Nav>

        <TabContent activeTab={activeTab}>
          <TabPane tabId="logs">
            <BatchLogs
              logs={result.logs}
              startTime={result.startTime}
              error={result.error}
            />
          </TabPane>
          <TabPane tabId="details">
            <table className="table table-sm">
              <tbody>
                <tr>
                  <th>Status</th>
                  <td>
                    <span className={`badge bg-${result.status === 'success' ? 'success' : 'danger'}`}>
                      {result.status}
                    </span>
                  </td>
                </tr>
                <tr>
                  <th>Start Time</th>
                  <td>{formatDateTime(result.startTime)}</td>
                </tr>
                <tr>
                  <th>End Time</th>
                  <td>{formatDateTime(result.endTime)}</td>
                </tr>
                <tr>
                  <th>Duration</th>
                  <td>
                    {Math.round(
                      (new Date(result.endTime).getTime() - new Date(result.startTime).getTime()) / 1000
                    )}s
                  </td>
                </tr>
                {result.error && (
                  <tr>
                    <th>Error</th>
                    <td className="text-danger">{result.error}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </TabPane>
        </TabContent>
      </ModalBody>
    </Modal>
  );
};

export default BatchResultModal;