import React from 'react';
import { Row, Col, Card, CardBody, Badge } from 'reactstrap';
import { BatchConfig } from '../../types/batch';
import { Template } from '../../types/template';
import { Dataset } from '../../types/dataset';
import { formatDateTime } from '../../utils/dateUtils';
import { BatchScriptEditor } from './BatchScriptEditor';

interface BatchDetailsProps {
  batch: BatchConfig;
  template: Template;
  dataset: Dataset;
}

export const BatchDetails: React.FC<BatchDetailsProps> = ({
  batch,
  template,
  dataset
}) => {
  return (
    <div>
      <Row>
        <Col md={6}>
          <Card className="mb-4">
            <CardBody>
              <h5 className="card-title">Schedule Configuration</h5>
              <dl>
                <dt>Type</dt>
                <dd>
                  <Badge color="info">
                    {batch.schedule.type === 'periodic' ? 'Periodic' : 'Specific Dates'}
                  </Badge>
                </dd>

                {batch.schedule.type === 'periodic' && (
                  <>
                    <dt>Cron Expression</dt>
                    <dd>{batch.schedule.cronExpression}</dd>
                  </>
                )}

                {batch.schedule.type === 'specific' && (
                  <>
                    <dt>Execution Dates</dt>
                    <dd>
                      <ul className="list-unstyled">
                        {batch.schedule.executionDates?.map((date, index) => (
                          <li key={index}>{formatDateTime(date)}</li>
                        ))}
                      </ul>
                    </dd>
                  </>
                )}

                <dt>Random Delay</dt>
                <dd>
                  {batch.schedule.randomDelay ? 
                    `Up to ${batch.schedule.randomDelay}ms` : 
                    'No delay'
                  }
                </dd>

                <dt>Status</dt>
                <dd>
                  <Badge color={batch.isActive ? 'success' : 'secondary'}>
                    {batch.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </dd>
              </dl>
            </CardBody>
          </Card>

          <Card className="mb-4">
            <CardBody>
              <h5 className="card-title">Template & Dataset</h5>
              <dl>
                <dt>Template</dt>
                <dd>{template.name}</dd>

                <dt>Dataset</dt>
                <dd>{dataset.name || 'Unnamed Dataset'}</dd>

                <dt>Created</dt>
                <dd>{formatDateTime(batch.createdAt)}</dd>

                <dt>Last Updated</dt>
                <dd>{formatDateTime(batch.updatedAt)}</dd>
              </dl>
            </CardBody>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="mb-4">
            <CardBody>
              <h5 className="card-title">Dataset Values</h5>
              <div className="table-responsive">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Field</th>
                      <th>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {template.fields.map(field => (
                      <tr key={field.name}>
                        <td>{field.label}</td>
                        <td>
                          {field.type === 'file' ? (
                            dataset.data[field.name] ? 'File uploaded' : 'No file'
                          ) : (
                            String(dataset.data[field.name] || '')
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Card>
        <CardBody>
          <h5 className="card-title">Playwright Script</h5>
          <BatchScriptEditor
            value={template.script}
            readOnly
          />
        </CardBody>
      </Card>
    </div>
  );
};