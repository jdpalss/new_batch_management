import * as Yup from 'yup';
import { InputType } from '@/types/template';

// Option validation schema
const optionSchema = Yup.object().shape({
  label: Yup.string().required('Option label is required'),
  value: Yup.string().required('Option value is required'),
});

// Field validation schema
const fieldSchema = Yup.object().shape({
  name: Yup.string()
    .required('Field name is required')
    .matches(/^[a-zA-Z][a-zA-Z0-9_]*$/, 'Field name must start with a letter and contain only letters, numbers, and underscores'),
  type: Yup.string().required('Field type is required'),
  label: Yup.string().required('Field label is required'),
  required: Yup.boolean(),
  options: Yup.array()
    .of(optionSchema)
    .when('type', {
      is: (type: InputType) => ['checkbox', 'radio', 'combo'].includes(type),
      then: (schema) => schema.min(1, 'At least one option is required'),
      otherwise: (schema) => schema.nullable(),
    }),
});

// Template validation schema
export const templateSchema = Yup.object().shape({
  name: Yup.string()
    .required('Template name is required')
    .min(2, 'Template name must be at least 2 characters')
    .max(50, 'Template name must be at most 50 characters'),
  description: Yup.string(),
  fields: Yup.array()
    .of(fieldSchema)
    .min(1, 'Template must have at least one field'),
  playwrightScript: Yup.string()
    .required('Playwright script is required')
    .test('is-valid-script', 'Invalid script syntax', (value) => {
      try {
        if (!value) return false;
        new Function('context', value);
        return true;
      } catch {
        return false;
      }
    }),
});