import React from 'react';
import { Input, FormGroup, Label, FormFeedback } from 'reactstrap';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  name: string;
  label?: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  touched?: boolean;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

const Select: React.FC<SelectProps> = ({
  name,
  label,
  value,
  options,
  onChange,
  placeholder = 'Select...',
  error,
  touched,
  disabled = false,
  required = false,
  className,
}) => {
  return (
    <FormGroup className={className}>
      {label && (
        <Label for={name}>
          {label}
          {required && <span className="text-danger ms-1">*</span>}
        </Label>
      )}
      <Input
        type="select"
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        invalid={touched && !!error}
        disabled={disabled}
      >
        {placeholder && (
          <option value="">{placeholder}</option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Input>
      {touched && error && (
        <FormFeedback>{error}</FormFeedback>
      )}
    </FormGroup>
  );
};

export default Select;