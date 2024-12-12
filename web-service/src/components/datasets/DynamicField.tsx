import React from 'react';
import { Input, FormGroup, Label } from 'reactstrap';
import { TemplateField } from '../../types/template';
import { FIELD_TYPES } from '../../constants';
import MonacoEditor from '@monaco-editor/react';

interface DynamicFieldProps {
  type: string;
  name: string;
  field: TemplateField;
  value: any;
  onChange: (value: any) => void;
}

export const DynamicField: React.FC<DynamicFieldProps> = ({
  type,
  name,
  field,
  value,
  onChange
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    switch (type) {
      case FIELD_TYPES.NUMBER:
        onChange(e.target.value ? Number(e.target.value) : null);
        break;
      case FIELD_TYPES.CHECKBOX:
        onChange(e.target.checked);
        break;
      default:
        onChange(e.target.value);
    }
  };

  switch (type) {
    case FIELD_TYPES.TEXT:
    case FIELD_TYPES.EMAIL:
    case FIELD_TYPES.NUMBER:
      return (
        <Input
          type={type}
          name={name}
          value={value || ''}
          onChange={handleChange}
          placeholder={field.placeholder}
        />
      );

    case FIELD_TYPES.TEXTAREA:
      return (
        <Input
          type="textarea"
          name={name}
          value={value || ''}
          onChange={handleChange}
          placeholder={field.placeholder}
        />
      );

    case FIELD_TYPES.CHECKBOX:
      return field.options ? (
        <div>
          {field.options.map(option => (
            <FormGroup check key={option.value}>
              <Label check>
                <Input
                  type="checkbox"
                  name={name}
                  value={option.value}
                  checked={Array.isArray(value) ? value.includes(option.value) : false}
                  onChange={(e) => {
                    const currentValues = Array.isArray(value) ? value : [];
                    if (e.target.checked) {
                      onChange([...currentValues, option.value]);
                    } else {
                      onChange(currentValues.filter(v => v !== option.value));
                    }
                  }}
                />{' '}
                {option.label}
              </Label>
            </FormGroup>
          ))}
        </div>
      ) : (
        <Input
          type="checkbox"
          name={name}
          checked={value || false}
          onChange={handleChange}
        />
      );

    case FIELD_TYPES.RADIO:
      return (
        <div>
          {field.options?.map(option => (
            <FormGroup check key={option.value}>
              <Label check>
                <Input
                  type="radio"
                  name={name}
                  value={option.value}
                  checked={value === option.value}
                  onChange={handleChange}
                />{' '}
                {option.label}
              </Label>
            </FormGroup>
          ))}
        </div>
      );

    case FIELD_TYPES.COMBO:
      return (
        <Input
          type="select"
          name={name}
          value={value || ''}
          onChange={handleChange}
        >
          <option value="">선택하세요</option>
          {field.options?.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Input>
      );

    case FIELD_TYPES.FILE:
      return (
        <div>
          <Input
            type="file"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = () => {
                  onChange(reader.result);
                };
                reader.readAsDataURL(file);
              }
            }}
          />
          {value && (
            <div className="mt-2">
              {value.startsWith('data:image') ? (
                <img src={value} alt="Preview" style={{ maxWidth: '200px' }} />
              ) : (
                <div>파일이 업로드됨</div>
              )}
            </div>
          )}
        </div>
      );

    case FIELD_TYPES.DATE:
      return (
        <Input
          type="date"
          name={name}
          value={value || ''}
          onChange={handleChange}
        />
      );

    case FIELD_TYPES.DATETIME:
      return (
        <Input
          type="datetime-local"
          name={name}
          value={value || ''}
          onChange={handleChange}
        />
      );

    case FIELD_TYPES.JSON:
    case FIELD_TYPES.CODE:
      return (
        <MonacoEditor
          height="200px"
          language={type === FIELD_TYPES.JSON ? 'json' : 'typescript'}
          value={value || ''}
          onChange={value => onChange(value)}
          options={{
            minimap: { enabled: false },
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on'
          }}
        />
      );

    default:
      return null;
  }
};