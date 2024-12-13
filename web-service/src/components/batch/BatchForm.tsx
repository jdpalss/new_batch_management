import React, { useState } from 'react';
import { Formik, Form, Field } from 'formik';
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

// Yup validation schema 수정
const validationSchema = Yup.object().shape({
  title: Yup.string()
    .required('배치명을 입력해주세요')
    .max(100, '배치명은 100자를 초과할 수 없습니다'),
  description: Yup.string()
    .max(500, '설명은 500자를 초과할 수 없습니다'),
  templateId: Yup.string()
    .required('템플릿을 선택해주세요'),
  datasetId: Yup.string()
    .required('데이터셋을 선택해주세요'),
  isActive: Yup.boolean(),
  schedule: Yup.object({
    type: Yup.string()
      .oneOf(['periodic', 'specific'])
      .required('스케줄 유형을 선택해주세요'),
    cronExpression: Yup.string().when('type', {
      is: 'periodic',
      then: () => Yup.string().required('Cron 표현식을 입력해주세요')
    }),
    executionDates: Yup.array().when('type', {
      is: 'specific',
      then: () => Yup.array()
        .min(1, '최소 하나의 실행 일시를 선택해주세요')
        .max(50, '실행 일시는 최대 50개까지 설정할 수 없습니다')
    }),
    randomDelay: Yup.boolean()
  }).required('스케줄 설정은 필수입니다')
});

const defaultValues: Partial<BatchConfig> = {
  title: '',
  description: '',
  templateId: '',
  datasetId: '',
  isActive: true,
  schedule: {
    type: 'periodic',
    cronExpression: '0 0 * * *',  // 매일 자정
    executionDates: [],
    randomDelay: false
  }
};

export const BatchForm: React.FC<BatchFormProps> = ({
  templates,
  datasets,
  initialValues,
  onSubmit
}) => {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (values: Partial<BatchConfig>, { setSubmitting }: any) => {
    try {
      setSubmitError(null);
      await onSubmit(values);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : '배치 저장에 실패했습니다');
      setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={{ ...defaultValues, ...initialValues }}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ values, errors, touched, setFieldValue, isSubmitting }) => (
        <Form>
          {submitError && (
            <Alert color="danger" className="mb-4">
              {submitError}
            </Alert>
          )}

          <Card className="mb-4">
            <CardBody>
              <FormGroup>
                <Label for="title">배치명 *</Label>
                <Field
                  name="title"
                  type="text"
                  className={`form-control ${touched.title && errors.title ? 'is-invalid' : ''}`}
                  placeholder="배치 작업의 이름을 입력하세요"
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
                  placeholder="배치 작업에 대한 설명을 입력하세요"
                />
                {touched.description && errors.description && (
                  <div className="invalid-feedback">{errors.description}</div>
                )}
              </FormGroup>

              <FormGroup>
                <Label for="templateId">템플릿 *</Label>
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
                <Label for="datasetId">데이터셋 *</Label>
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
                <Label>스케줄 유형 *</Label>
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
                  <Label>Cron 표현식 *</Label>
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
                  <small className="form-text text-muted">
                    예시: 0 0 * * * (매일 자정), 0 9 * * 1-5 (평일 오전 9시)
                  </small>
                </FormGroup>
              )}

              {values.schedule.type === 'specific' && (
                <FormGroup>
                  <Label>실행 일시 *</Label>
                  <div className="mb-2">
                    <Input
                      type="datetime-local"
                      min={new Date().toISOString().slice(0, 16)}
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
                  {touched.schedule?.executionDates && errors.schedule?.executionDates && (
                    <div className="invalid-feedback d-block">{errors.schedule.executionDates}</div>
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
                  <small className="form-text text-muted d-block">
                    배치 실행 시 1~5분 사이의 무작위 지연을 추가합니다
                  </small>
                </Label>
              </FormGroup>

              <FormGroup check>
                <Label check>
                  <Field
                    type="checkbox"
                    name="isActive"
                    className="form-check-input"
                  />{' '}
                  배치 활성화
                  <small className="form-text text-muted d-block">
                    비활성화 시 스케줄에 따른 자동 실행이 중지됩니다
                  </small>
                </Label>
              </FormGroup>
            </CardBody>
          </Card>

          <div className="d-flex justify-content-between align-items-center">
            <small className="text-muted">* 필수 입력 항목</small>
            <Button 
              type="submit" 
              color="primary" 
              disabled={isSubmitting}
              className="px-4"
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  저장 중...
                </>
              ) : '배치 저장'}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};
