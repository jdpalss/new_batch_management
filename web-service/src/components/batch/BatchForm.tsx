import React from 'react';
import { Formik, Form, FormikProps } from 'formik';
import {
  Button,
  Card,
  CardBody,
  FormGroup,
  Label,
  Input
} from 'reactstrap';
import * as Yup from 'yup';
import { Template } from '../../types/template';
import { Dataset } from '../../types/dataset';

interface BatchFormProps {
  templates: Template[];
  datasets: Dataset[];
  initialValues?: any;
  onSubmit: (values: any) => Promise<void>;
}

interface BatchFormValues {
  title: string;
  description?: string;
  templateId: string;
  datasetId: string;
  isActive: boolean;
  scheduleType: 'periodic' | 'specific';
  cronExpression?: string;
  executionDates?: string[];
  randomDelay: boolean;
}

const validationSchema = Yup.object().shape({
  title: Yup.string().required('배치명을 입력해주세요'),
  templateId: Yup.string().required('템플릿을 선택해주세요'),
  datasetId: Yup.string().required('데이터셋을 선택해주세요'),
  scheduleType: Yup.string().oneOf(['periodic', 'specific']).required(),
  cronExpression: Yup.string().when('scheduleType', {
    is: 'periodic',
    then: Yup.string().required('Cron 표현식을 입력해주세요')
  }),
  executionDates: Yup.array().when('scheduleType', {
    is: 'specific',
    then: Yup.array().min(1, '최소 하나의 실행 일시를 선택해주세요')
  })
});

export const BatchForm: React.FC<BatchFormProps> = ({
  templates,
  datasets,
  initialValues,
  onSubmit
}) => {
  const defaultValues: BatchFormValues = {
    title: '',
    description: '',
    templateId: '',
    datasetId: '',
    isActive: true,
    scheduleType: 'periodic',
    cronExpression: '0 0 * * *',
    executionDates: [],
    randomDelay: false,
    ...initialValues
  };

  return (
    <Formik
      initialValues={defaultValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {({ values, errors, touched, handleChange, setFieldValue }: FormikProps<BatchFormValues>) => (
        <Form>
          <Card className="mb-4">
            <CardBody>
              <FormGroup>
                <Label for="title">배치명</Label>
                <Input
                  id="title"
                  name="title"
                  value={values.title}
                  onChange={handleChange}
                  invalid={touched.title && !!errors.title}
                />
              </FormGroup>

              <FormGroup>
                <Label for="description">설명</Label>
                <Input
                  type="textarea"
                  id="description"
                  name="description"
                  value={values.description}
                  onChange={handleChange}
                />
              </FormGroup>

              <FormGroup>
                <Label for="templateId">템플릿</Label>
                <Input
                  type="select"
                  id="templateId"
                  name="templateId"
                  value={values.templateId}
                  onChange={(e) => {
                    setFieldValue('templateId', e.target.value);
                    setFieldValue('datasetId', '');
                  }}
                  invalid={touched.templateId && !!errors.templateId}
                >
                  <option value="">템플릿을 선택하세요</option>
                  {templates.map(template => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </Input>
              </FormGroup>

              <FormGroup>
                <Label for="datasetId">데이터셋</Label>
                <Input
                  type="select"
                  id="datasetId"
                  name="datasetId"
                  value={values.datasetId}
                  onChange={handleChange}
                  invalid={touched.datasetId && !!errors.datasetId}
                  disabled={!values.templateId}
                >
                  <option value="">
                    {values.templateId
                      ? '데이터셋을 선택하세요'
                      : '템플릿을 먼저 선택하세요'}
                  </option>
                  {datasets
                    .filter(d => d.templateId === values.templateId)
                    .map(dataset => (
                      <option key={dataset.id} value={dataset.id}>
                        {dataset.name || 'Unnamed Dataset'}
                      </option>
                    ))}
                </Input>
              </FormGroup>

              <FormGroup>
                <Label for="scheduleType">스케줄 유형</Label>
                <Input
                  type="select"
                  id="scheduleType"
                  name="scheduleType"
                  value={values.scheduleType}
                  onChange={handleChange}
                >
                  <option value="periodic">주기적</option>
                  <option value="specific">특정 일시</option>
                </Input>
              </FormGroup>

              {values.scheduleType === 'periodic' && (
                <FormGroup>
                  <Label for="cronExpression">Cron 표현식</Label>
                  <Input
                    id="cronExpression"
                    name="cronExpression"
                    value={values.cronExpression}
                    onChange={handleChange}
                    placeholder="예: 0 0 * * * (매일 자정)"
                    invalid={touched.cronExpression && !!errors.cronExpression}
                  />
                </FormGroup>
              )}

              {values.scheduleType === 'specific' && (
                <FormGroup>
                  <Label for="executionDates">실행 일시</Label>
                  <Input
                    type="datetime-local"
                    multiple
                    id="executionDates"
                    name="executionDates"
                    value={values.executionDates}
                    onChange={handleChange}
                    invalid={touched.executionDates && !!errors.executionDates}
                  />
                </FormGroup>
              )}

              <FormGroup check>
                <Label check>
                  <Input
                    type="checkbox"
                    name="randomDelay"
                    checked={values.randomDelay}
                    onChange={handleChange}
                  />{' '}
                  실행 시 무작위 지연 추가
                </Label>
              </FormGroup>

              <FormGroup check>
                <Label check>
                  <Input
                    type="checkbox"
                    name="isActive"
                    checked={values.isActive}
                    onChange={handleChange}
                  />{' '}
                  활성화
                </Label>
              </FormGroup>
            </CardBody>
          </Card>

          <div className="d-flex justify-content-end">
            <Button type="submit" color="primary">
              배치 저장
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};