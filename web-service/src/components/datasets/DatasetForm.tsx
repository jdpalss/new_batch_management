import React from 'react';
import { Formik, Form } from 'formik';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  FormGroup,
  Label,
  Input,
  Alert
} from 'reactstrap';
import * as Yup from 'yup';
import { Template } from '../../types/template';
import { Dataset } from '../../types/dataset';
import { DynamicField } from './DynamicField';
import { validateFieldValue } from '../../utils/field';
import { useToasts } from '../../hooks/useToasts';

interface DatasetFormProps {
  template: Template;
  initialValues?: Partial<Dataset>;
  onSubmit: (values: Partial<Dataset>) => Promise<void>;
}

export const DatasetForm: React.FC<DatasetFormProps> = ({
  template,
  initialValues,
  onSubmit
}) => {
  const { error } = useToasts();

  // 데이터셋 초기값 설정
  const defaultValues: Partial<Dataset> = {
    name: '',
    description: '',
    templateId: template.id,
    data: {},
    ...initialValues
  };

  // 동적으로 데이터 초기값 설정
  if (!initialValues?.data) {
    defaultValues.data = template.fields.reduce(
      (acc, field) => ({
        ...acc,
        [field.name]: field.defaultValue ?? null
      }),
      {}
    );
  }

  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .trim()
      .required('이름을 입력해주세요'),
    data: Yup.object().shape(
      template.fields.reduce((acc, field) => {
        let fieldSchema = Yup.mixed();
        
        if (field.required) {
          fieldSchema = fieldSchema.required(`${field.label}은(는) 필수 항목입니다`);
        }

        return {
          ...acc,
          [field.name]: fieldSchema
        };
      }, {})
    )
  });

  return (
    <Formik
      initialValues={defaultValues}
      validationSchema={validationSchema}
      onSubmit={async (values, { setSubmitting }) => {
        try {
          await onSubmit(values);
        } catch (err) {
          error(err instanceof Error ? err.message : '데이터셋 저장에 실패했습니다');
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ values, setFieldValue, errors, touched, isSubmitting, handleChange }) => (
        <Form>
          <Card className="mb-4">
            <CardHeader>데이터셋 정보</CardHeader>
            <CardBody>
              <FormGroup>
                <Label for="name">이름</Label>
                <Input
                  id="name"
                  name="name"
                  value={values.name}
                  onChange={handleChange}
                  invalid={touched.name && !!errors.name}
                />
                {touched.name && errors.name && (
                  <Alert color="danger" className="mt-2">{errors.name}</Alert>
                )}
              </FormGroup>

              <FormGroup>
                <Label for="description">설명</Label>
                <Input
                  type="textarea"
                  id="description"
                  name="description"
                  value={values.description || ''}
                  onChange={handleChange}
                />
              </FormGroup>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>필드 값</CardHeader>
            <CardBody>
              {template.fields.map(field => (
                <FormGroup key={field.name}>
                  <Label>
                    {field.label}
                    {field.required && <span className="text-danger">*</span>}
                  </Label>
                  <DynamicField
                    type={field.type}
                    name={`data.${field.name}`}
                    field={field}
                    value={values.data[field.name]}
                    onChange={(value) => setFieldValue(`data.${field.name}`, value)}
                  />
                  {touched.data?.[field.name] && errors.data?.[field.name] && (
                    <Alert color="danger" className="mt-2">
                      {errors.data[field.name] as string}
                    </Alert>
                  )}
                </FormGroup>
              ))}
            </CardBody>
          </Card>

          <div className="d-flex justify-content-end mt-4">
            <Button type="submit" color="primary" disabled={isSubmitting}>
              {isSubmitting ? '저장 중...' : '데이터셋 저장'}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};