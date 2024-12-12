import React, { useState } from 'react';
import { Formik, Form } from 'formik';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  FormGroup,
  Label,
  Input,
  Row,
  Col
} from 'reactstrap';
import * as Yup from 'yup';
import { BatchConfig } from '../../types/batch';
import { Template } from '../../types/template';
import { Dataset } from '../../types/dataset';
import { ScriptTestDialog } from './ScriptTestDialog';

interface BatchFormProps {
  templates: Template[];
  datasets: Dataset[];
  initialValues?: Partial<BatchConfig>;
  onSubmit: (values: Partial<BatchConfig>) => Promise<void>;
}

const validationSchema = Yup.object().shape({
  title: Yup.string().required('Title is required'),
  templateId: Yup.string().required('Template is required'),
  datasetId: Yup.string().required('Dataset is required'),
  schedule: Yup.object().shape({
    type: Yup.string().oneOf(['periodic', 'specific']).required(),
    cronExpression: Yup.string().when('type', {
      is: 'periodic',
      then: Yup.string().required('Cron expression is required')
    }),
    executionDates: Yup.array().when('type', {
      is: 'specific',
      then: Yup.array().min(1, 'At least one execution date is required')
    })
  })
});

export const BatchForm: React.FC<BatchFormProps> = ({
  templates,
  datasets,
  initialValues,
  onSubmit
}) => {
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    initialValues?.templateId
      ? templates.find(t => t.id === initialValues.templateId) || null
      : null
  );

  const defaultValues: Partial<BatchConfig> = {
    title: '',
    description: '',
    templateId: '',
    datasetId: '',
    isActive: true,
    schedule: {
      type: 'periodic',
      cronExpression: '0 0 * * *', // Daily at midnight
      randomDelay: 0
    },
    ...initialValues
  };

  const filteredDatasets = datasets.filter(
    d => d.templateId === selectedTemplate?.id
  );

  return (
    <Formik
      initialValues={defaultValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {({ values, setFieldValue, errors, touched, isSubmitting }) => (
        <Form>
          <Row>
            <Col md={8}>
              <Card className="mb-4">
                <CardHeader>Basic Information</CardHeader>
                <CardBody>
                  <FormGroup>
                    <Label for="title">Title</Label>
                    <Input
                      id="title"
                      name="title"
                      value={values.title}
                      onChange={(e) => setFieldValue('title', e.target.value)}
                      invalid={touched.title && !!errors.title}
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label for="description">Description</Label>
                    <Input
                      type="textarea"
                      id="description"
                      name="description"
                      value={values.description}
                      onChange={(e) => setFieldValue('description', e.target.value)}
                    />
                  </FormGroup>
                </CardBody>
              </Card>

              <Card className="mb-4">
                <CardHeader>Template & Dataset</CardHeader>
                <CardBody>
                  <FormGroup>
                    <Label for="templateId">Template</Label>
                    <Input
                      type="select"
                      id="templateId"
                      name="templateId"
                      value={values.templateId}
                      onChange={(e) => {
                        const template = templates.find(
                          t => t.id === e.target.value
                        );
                        setSelectedTemplate(template || null);
                        setFieldValue('templateId', e.target.value);
                        setFieldValue('datasetId', '');
                      }}
                      invalid={touched.templateId && !!errors.templateId}
                    >
                      <option value="">Select template...</option>
                      {templates.map(template => (
                        <option key={template.id} value={template.id}>
                          {template.name}
                        </option>
                      ))}
                    </Input>
                  </FormGroup>

                  <FormGroup>
                    <Label for="datasetId">Dataset</Label>
                    <Input
                      type="select"
                      id="datasetId"
                      name="datasetId"
                      value={values.datasetId}
                      onChange={(e) => setFieldValue('datasetId', e.target.value)}
                      invalid={touched.datasetId && !!errors.datasetId}
                      disabled={!selectedTemplate}
                    >
                      <option value="">
                        {selectedTemplate
                          ? 'Select dataset...'
                          : 'Select template first'}
                      </option>
                      {filteredDatasets.map(dataset => (
                        <option key={dataset.id} value={dataset.id}>
                          {dataset.name || 'Unnamed Dataset'}
                        </option>
                      ))}
                    </Input>
                  </FormGroup>

                  {selectedTemplate && values.datasetId && (
                    <Button
                      color="secondary"
                      outline
                      onClick={() => setIsTestDialogOpen(true)}
                    >
                      Test Script
                    </Button>
                  )}
                </CardBody>
              </Card>

              <Card>
                <CardHeader>Schedule Configuration</CardHeader>
                <CardBody>
                  <FormGroup>
                    <Label for="scheduleType">Schedule Type</Label>
                    <Input
                      type="select"
                      id="scheduleType"
                      name="schedule.type"
                      value={values.schedule?.type}
                      onChange={(e) =>
                        setFieldValue('schedule.type', e.target.value)
                      }
                    >
                      <option value="periodic">Periodic</option>
                      <option value="specific">Specific Dates</option>
                    </Input>
                  </FormGroup>

                  {values.schedule?.type === 'periodic' && (
                    <FormGroup>
                      <Label for="cronExpression">Cron Expression</Label>
                      <Input
                        id="cronExpression"
                        name="schedule.cronExpression"
                        value={values.schedule.cronExpression}
                        onChange={(e) =>
                          setFieldValue('schedule.cronExpression', e.target.value)
                        }
                        invalid={
                          touched.schedule?.cronExpression &&
                          !!errors.schedule?.cronExpression
                        }
                      />
                      <small className="form-text text-muted">
                        Use cron expression format (e.g., "0 0 * * *" for daily at
                        midnight)
                      </small>
                    </FormGroup>
                  )}

                  {values.schedule?.type === 'specific' && (
                    <FormGroup>
                      <Label for="executionDates">Execution Dates</Label>
                      <Input
                        type="datetime-local"
                        multiple
                        id="executionDates"
                        name="schedule.executionDates"
                        value={values.schedule.executionDates}
                        onChange={(e) => {
                          const dates = Array.from(e.target.selectedOptions).map(
                            option => new Date(option.value)
                          );
                          setFieldValue('schedule.executionDates', dates);
                        }}
                        invalid={
                          touched.schedule?.executionDates &&
                          !!errors.schedule?.executionDates
                        }
                      />
                    </FormGroup>
                  )}

                  <FormGroup>
                    <Label for="randomDelay">Random Delay</Label>
                    <Input
                      type="number"
                      id="randomDelay"
                      name="schedule.randomDelay"
                      value={values.schedule?.randomDelay}
                      onChange={(e) =>
                        setFieldValue('schedule.randomDelay', Number(e.target.value))
                      }
                    />
                    <small className="form-text text-muted">
                      Add random delay (in milliseconds) to execution time
                    </small>
                  </FormGroup>

                  <FormGroup check>
                    <Label check>
                      <Input
                        type="checkbox"
                        name="isActive"
                        checked={values.isActive}
                        onChange={(e) =>
                          setFieldValue('isActive', e.target.checked)
                        }
                      />{' '}
                      Active
                    </Label>
                  </FormGroup>
                </CardBody>
              </Card>
            </Col>
          </Row>

          <div className="d-flex justify-content-end mt-4">
            <Button 
              type="submit" 
              color="primary" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Batch'}
            </Button>
          </div>

          {selectedTemplate && values.datasetId && (
            <ScriptTestDialog
              isOpen={isTestDialogOpen}
              onClose={() => setIsTestDialogOpen(false)}
              template={selectedTemplate}
              datasetId={values.datasetId}
            />
          )}
        </Form>
      )}
    </Formik>
  );
};