import React from 'react';
import { Formik, Form, Field, FormikProps } from 'formik';
import {
  Button,
  Card,
  CardBody,
  FormGroup,
  Label,
  Input,
  Alert
} from 'reactstrap';
import * as Yup from 'yup';
import { Template } from '../../types/template';
import { Dataset } from '../../types/dataset';
import { BatchConfig } from '../../types/batch';

interface BatchFormProps {
  templates: Template[];
  datasets: Dataset[];
  initialValues?: Partial<BatchConfig>;
  onSubmit: (values: Partial<BatchConfig>) => Promise<void>;
}

const validationSchema = Yup.object().shape({
  title: Yup.string().required('배치명을 입력해주세요'),
  templateId: Yup.string().required('템플릿을 선택해주세요'),
  datasetId: Yup.string().required('데이터셋을 선택해주세요'),
  scheduleType: Yup.string().oneOf(['periodic', 'specific']).required(),
  schedule: Yup.object().shape({
    type: Yup.string().oneOf(['periodic', 'specific']).required(),
    cronExpression: Yup.string().when('type', {
      is: 'periodic',
      then: schema => schema.required('Cron 표현식을 입력해주세요')
    }),
    executionDates: Yup.array().when('type', {
      is: 'specific',
      then: schema => schema.min(1, '최소 하나의 실행 일시를 선택해주세요')
    })
  })
});

const defaultValues: Partial<BatchConfig> = {
  title: '',
  description: '',
  templateId: '',
  datasetId: '',
  isActive: true,
  schedule: {
    type: 'periodic',
    cronExpression: '0 0 * * *',
    executionDates: [],
    randomDelay: 0
  }
};

export const BatchForm: React.FC<BatchFormProps> = ({
  templates,
  datasets,
  initialValues,
  onSubmit
}) => {
  return (
    <Formik
      initialValues={{ ...defaultValues, ...initialValues }}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {({ values, errors, touched, handleChange, setFieldValue, isSubmitting }: FormikProps<BatchConfig>) => (
        <Form>
          <Card className="mb-4">
            <CardBody>
              <FormGroup>
                <Label for="title">배치명</Label>
                <Field
                  name="title"
                  type="text"
                  className={`form-control ${touched.title && errors.title ? 'is-invalid' : ''}`}
                />
                {touched.title && errors.title && (
                  <div className="invalid-feedback">{errors.title}</div>
                )}
              </FormGroup>

              <FormGroup>
                <Label for="description">설명</Label>
                <Field
                  name="description"
                  as="textarea"
                  className="form-control"
                  rows={3}
                />
              </FormGroup>

              <FormGroup>
                <Label for="templateId">템플릿</Label>
                <Field
                  name="templateId"
                  as="select"
                  className={`form-control ${touched.templateId && errors.templateId ? 'is-invalid' : ''}`}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    setFieldValue('templateId', e.target.value);
                    setFieldValue('datasetId', '');
                  }}
                >
                  <option value="">템플릿을 선택하세요</option>
                  {templates.map(template => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </Field>
                {touched.templateId && errors.templateId && (
                  <div className="invalid-feedback">{errors.templateId}</div>
                )}
              </FormGroup>

              <FormGroup>
                <Label for="datasetId">데이터셋</Label>
                <Field
                  name="datasetId"
                  as="select"
                  className={`form-control ${touched.datasetId && errors.datasetId ? 'is-invalid' : ''}`}
                  disabled={!values.templateId}
                >
                  <option value="">
                    {values.templateId ? '데이터셋을 선택하세요' : '템플릿을 먼저 선택하세요'}
                  </option>
                  {values.templateId && datasets
                    .filter(d => d.templateId === values.templateId)
                    .map(dataset => (
                      <option key={dataset.id} value={dataset.id}>
                        {dataset.name || '이름 없는 데이터셋'}
                      </option>
                    ))}
                </Field>
                {touched.datasetId && errors.datasetId && (
                  <div className="invalid-feedback">{errors.datasetId}</div>
                )}
              </FormGroup>

              <FormGroup>
                <Label>스케줄 유형</Label>
                <Field
                  name="schedule.type"
                  as="select"
                  className="form-control"
                >
                  <option value="periodic">주기적 실행</option>
                  <option value="specific">특정 일시 실행</option>
                </Field>
              </FormGroup>

              {values.schedule.type === 'periodic' && (
                <FormGroup>
                  <Label>Cron 표현식</Label>
                  <Field
                    name="schedule.cronExpression"
                    type="text"
                    className={`form-control ${
                      touched.schedule?.cronExpression && errors.schedule?.cronExpression ? 'is-invalid' : ''
                    }`}
                    placeholder="0 0 * * * (매일 자정)"
                  />
                  {touched.schedule?.cronExpression && errors.schedule?.cronExpression && (
                    <div className="invalid-feedback">{errors.schedule.cronExpression}</div>
                  )}
                </FormGroup>
              )}

              {values.schedule.type === 'specific' && (
                <FormGroup>
                  <Label>실행 일시</Label>
                  <div className="mb-2">
                    <Input
                      type="datetime-local"
                      onChange={(e) => {
                        if (e.target.value) {
                          const currentDates = values.schedule.executionDates || [];
                          setFieldValue('schedule.executionDates', [...currentDates, e.target.value]);
                        }
                      }}
                    />
                  </div>
                  {Array.isArray(values.schedule.executionDates) && values.schedule.executionDates.length > 0 && (
                    <div className="mb-2">
                      <strong>선택된 실행 일시:</strong>
                      <ul className="list-unstyled mt-2">
                        {values.schedule.executionDates.map((date, index) => (
                          <li key={index} className="d-flex align-items-center mb-1">
                            <span>{new Date(date).toLocaleString()}</span>
                            <Button
                              color="danger"
                              size="sm"
                              className="ms-2"
                              onClick={() => {
                                const newDates = [...values.schedule.executionDates];
                                newDates.splice(index, 1);
                                setFieldValue('schedule.executionDates', newDates);
                              }}
                            >
                              삭제
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </FormGroup>
              )}

              <FormGroup check className="mb-3">
                <Label check>
                  <Field
                    type="checkbox"
                    name="schedule.randomDelay"
                    className="form-check-input"
                  />{' '}
                  실행 시 무작위 지연 추가
                </Label>
              </FormGroup>

              <FormGroup check>
                <Label check>
                  <Field
                    type="checkbox"
                    name="isActive"
                    className="form-check-input"
                  />{' '}
                  활성화
                </Label>
              </FormGroup>
            </CardBody>
          </Card>

          <div className="d-flex justify-content-end">
            <Button type="submit" color="primary" disabled={isSubmitting}>
              {isSubmitting ? '저장 중...' : '배치 저장'}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};
