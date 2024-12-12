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
import { FIELD_TYPES } from '../../constants';

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

  // 템플릿 필드를 기반으로 validation schema 생성
  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Dataset name is required'),
    data: Yup.object().shape(
      template.fields.reduce((acc, field) => {
        let fieldSchema;

        switch (field.type) {
          case FIELD_TYPES.NUMBER:
            fieldSchema = Yup.number()
              .typeError('Must be a number')
              .nullable();
            if (field.validation?.min !== undefined) {
              fieldSchema = fieldSchema.min(field.validation.min);
            }
            if (field.validation?.max !== undefined) {
              fieldSchema = fieldSchema.max(field.validation.max);
            }
            break;

          case FIELD_TYPES.EMAIL:
            fieldSchema = Yup.string()
              .email('Must be a valid email')
              .nullable();
            break;

          case FIELD_TYPES.DATE:
            fieldSchema = Yup.date()
              .typeError('Must be a valid date')
              .nullable();
            break;

          case FIELD_TYPES.JSON:
            fieldSchema = Yup.string()
              .test('is-json', 'Must be valid JSON', value => {
                if (!value) return true;
                try {
                  JSON.parse(value);
                  return true;
                } catch {
                  return false;
                }
              })
              .nullable();
            break;

          default:
            fieldSchema = Yup.string().nullable();
        }

        if (field.required) {
          fieldSchema = fieldSchema.required(`${field.label} is required`);
        }

        if (field.validation?.pattern) {
          fieldSchema = fieldSchema.matches(
            new RegExp(field.validation.pattern),
            field.validation.message || 'Invalid format'
          );
        }

        return {
          ...acc,
          [field.name]: fieldSchema
        };
      }, {})
    )
  });

  // 데이터셋 초기값 설정
  const defaultValues: Partial<Dataset> = {
    name: '',
    description: '',
    templateId: template.id,
    data: template.fields.reduce(
      (acc, field) => ({
        ...acc,
        [field.name]: field.defaultValue ?? null
      }),
      {}
    ),
    ...initialValues
  };

  return (
    <Formik
      initialValues={defaultValues}
      validationSchema={validationSchema}
      onSubmit={async (values, { setSubmitting }) => {
        try {
          // 커스텀 유효성 검사 수행
          const fieldErrors: string[] = [];
          for (const field of template.fields) {
            const value = values.data[field.name];
            const validationError = validateFieldValue(value, field.type);
            if (validationError) {
              fieldErrors.push(`${field.label}: ${validationError}`);
            }
          }

          if (fieldErrors.length > 0) {
            error(fieldErrors.join('\n'));
            return;
          }

          await onSubmit(values);
        } catch (err) {
          error(err instanceof Error ? err.message : 'Failed to save dataset');
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ values, errors, touched, isSubmitting }) => (
        <Form>
          <Card className="mb-4">
            <CardHeader>Dataset Information</CardHeader>
            <CardBody>
              <FormGroup>
                <Label for="name">Dataset Name</Label>
                <Input
                  id="name"
                  name="name"
                  invalid={touched.name && !!errors.name}
                />
                {touched.name && errors.name && (
                  <Alert color="danger" className="mt-2">
                    {errors.name}
                  </Alert>
                )}
              </FormGroup>

              <FormGroup>
                <Label for="description">Description</Label>
                <Input
                  type="textarea"
                  id="description"
                  name="description"
                />
              </FormGroup>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>Field Values</CardHeader>
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
                    placeholder={field.placeholder}
                  />
                </FormGroup>
              ))}
            </CardBody>
          </Card>

          <div className="d-flex justify-content-end mt-4">
            <Button type="submit" color="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Dataset'}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};