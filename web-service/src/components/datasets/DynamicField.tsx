import React from 'react';
import { useField } from 'formik';
import { Input, FormFeedback, Label } from 'reactstrap';
import { FieldType, FieldOption, FieldValidation } from '../../types/template';
import MonacoEditor from '@monaco-editor/react';

interface DynamicFieldProps {
  type: FieldType;
  name: string;
  label: string;
  required?: boolean;
  options?: FieldOption[];
  validation?: FieldValidation;
  placeholder?: string;
}

export const DynamicField: React.FC<DynamicFieldProps> = ({
  type,
  name,
  label,
  required,
  options,
  validation,
  placeholder
}) => {
  const [field, meta, helpers] = useField(name);

  const renderField = () => {
    switch (type) {
      case 'text':
      case 'email':
      case 'number':
        return (
          <Input
            type={type}
            {...field}
            placeholder={placeholder}
            invalid={meta.touched && !!meta.error}
          />
        );

      case 'textarea':
        return (
          <Input
            type="textarea"
            {...field}
            placeholder={placeholder}
            invalid={meta.touched && !!meta.error}
          />
        );

      case 'checkbox':
        return options ? (
          <div>
            {options.map(option => (
              <div key={option.value} className="form-check">
                <Input
                  type="checkbox"
                  id={`${name}-${option.value}`}
                  checked={field.value?.includes(option.value)}
                  onChange={() => {
                    const values = field.value || [];
                    if (values.includes(option.value)) {
                      helpers.setValue(
                        values.filter((v: string) => v !== option.value)
                      );
                    } else {
                      helpers.setValue([...values, option.value]);
                    }
                  }}
                />
                <Label check for={`${name}-${option.value}`}>
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        ) : (
          <Input
            type="checkbox"
            {...field}
            invalid={meta.touched && !!meta.error}
          />
        );

      case 'radio':
        return options ? (
          <div>
            {options.map(option => (
              <div key={option.value} className="form-check">
                <Input
                  type="radio"
                  id={`${name}-${option.value}`}
                  {...field}
                  value={option.value}
                  invalid={meta.touched && !!meta.error}
                />
                <Label check for={`${name}-${option.value}`}>
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        ) : null;

      case 'combo':
        return (
          <Input
            type="select"
            {...field}
            invalid={meta.touched && !!meta.error}
          >
            <option value="">Select...</option>
            {options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Input>
        );

      case 'file':
        return (
          <div>
            <Input
              type="file"
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = () => {
                    helpers.setValue(reader.result);
                  };
                  reader.readAsDataURL(file);
                }
              }}
              invalid={meta.touched && !!meta.error}
            />
            {field.value && (
              <div className="mt-2">
                {field.value.startsWith('data:image') ? (
                  <img
                    src={field.value}
                    alt="Preview"
                    style={{ maxWidth: '200px' }}
                  />
                ) : (
                  <div>File uploaded</div>
                )}
              </div>
            )}
          </div>
        );

      case 'date':
      case 'datetime':
        return (
          <Input
            type={type === 'date' ? 'date' : 'datetime-local'}
            {...field}
            invalid={meta.touched && !!meta.error}
          />
        );

      case 'json':
      case 'code':
        return (
          <div style={{ border: '1px solid #ced4da', borderRadius: '0.25rem' }}>
            <MonacoEditor
              height="200px"
              language={type === 'json' ? 'json' : 'typescript'}
              value={field.value || ''}
              onChange={(value) => helpers.setValue(value)}
              options={{
                minimap: { enabled: false },
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                wordWrap: 'on'
              }}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      <Label for={name}>
        {label}
        {required && <span className="text-danger">*</span>}
      </Label>
      {renderField()}
      {meta.touched && meta.error && (
        <FormFeedback valid={false}>{meta.error}</FormFeedback>
      )}
    </div>
  );
};