import React from 'react';
import {
  Card,
  CardBody,
  Row,
  Col,
  FormGroup,
  Label,
  Input,
  Button,
} from 'reactstrap';
import { Trash2 } from 'lucide-react';
import Select from '@/components/common/Select';
import { TemplateField as ITemplateField, InputType } from '@/types/template';
import { FIELD_TYPES } from '@/constants/fieldTypes';
import { validateFieldName } from '@/utils/fieldValidation';

interface TemplateFieldProps {
  field: ITemplateField;
  index: number;
  onChange: (field: ITemplateField) => void;
  onRemove: () => void;
  error?: any;
}

const TemplateField: React.FC<TemplateFieldProps> = ({
  field,
  index,
  onChange,
  onRemove,
  error,
}) => {
  const handleChange = (name: keyof ITemplateField, value: any) => {
    onChange({
      ...field,
      [name]: value,
    });
  };

  const handleTypeChange = (type: InputType) => {
    onChange({
      ...field,
      type,
      options: ['checkbox', 'radio', 'combo'].includes(type)
        ? [{ label: '', value: '' }]
        : [],
    });
  };

  const handleOptionChange = (index: number, key: 'label' | 'value', value: string) => {
    const newOptions = [...(field.options || [])];
    newOptions[index] = {
      ...newOptions[index],
      [key]: value,
    };
    handleChange('options', newOptions);
  };

  const addOption = () => {
    handleChange('options', [...(field.options || []), { label: '', value: '' }]);
  };

  const removeOption = (index: number) => {
    const newOptions = [...(field.options || [])];
    newOptions.splice(index, 1);
    handleChange('options', newOptions);
  };

  return (
    <Card className="mb-3">
      <CardBody>
        <Row>
          <Col md={4}>
            <FormGroup>
              <Label>Field Name</Label>
              <Input
                value={field.name}
                onChange={(e) => handleChange('name', e.target.value)}
                invalid={error?.name}
                placeholder="Enter field name"
              />
              {error?.name && (
                <div className="invalid-feedback">{error.name}</div>
              )}
              <small className="text-muted">
                Use letters, numbers, and underscores
              </small>
            </FormGroup>
          </Col>
          <Col md={4}>
            <Select
              name={`fields.${index}.type`}
              label="Field Type"
              value={field.type}
              options={FIELD_TYPES}
              onChange={(value) => handleTypeChange(value as InputType)}
              error={error?.type}
            />
          </Col>
          <Col md={4}>
            <FormGroup>
              <Label>Display Label</Label>
              <Input
                value={field.label}
                onChange={(e) => handleChange('label', e.target.value)}
                invalid={error?.label}
                placeholder="Enter display label"
              />
            </FormGroup>
          </Col>
        </Row>

        {['checkbox', 'radio', 'combo'].includes(field.type) && (
          <div className="mt-3">
            <Label>Options</Label>
            {field.options?.map((option, optIndex) => (
              <Row key={optIndex} className="mb-2">
                <Col md={5}>
                  <Input
                    value={option.label}
                    onChange={(e) => handleOptionChange(optIndex, 'label', e.target.value)}
                    placeholder="Option Label"
                  />
                </Col>
                <Col md={5}>
                  <Input
                    value={option.value}
                    onChange={(e) => handleOptionChange(optIndex, 'value', e.target.value)}
                    placeholder="Option Value"
                  />
                </Col>
                <Col md={2}>
                  <Button
                    color="danger"
                    size="sm"
                    onClick={() => removeOption(optIndex)}
                    disabled={field.options?.length === 1}
                  >
                    <Trash2 size={14} />
                  </Button>
                </Col>
              </Row>
            ))}
            <Button
              color="secondary"
              size="sm"
              onClick={addOption}
            >
              Add Option
            </Button>
          </div>
        )}

        <div className="d-flex justify-content-between align-items-center mt-3">
          <FormGroup check className="mb-0">
            <Label check>
              <Input
                type="checkbox"
                checked={field.required}
                onChange={(e) => handleChange('required', e.target.checked)}
              />{' '}
                Required Field
            </Label>
          </FormGroup>
          <Button
            color="danger"
            size="sm"
            onClick={onRemove}
          >
            Remove Field
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};

export default TemplateField;