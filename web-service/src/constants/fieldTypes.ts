import { InputType } from '@/types/template';

export const FIELD_TYPES: Array<{ value: InputType; label: string }> = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'email', label: 'Email' },
  { value: 'json', label: 'JSON Editor' },
  { value: 'radio', label: 'Radio Buttons' },
  { value: 'checkbox', label: 'Checkboxes' },
  { value: 'combo', label: 'Combo Box' },
  { value: 'textarea', label: 'Text Area' },
  { value: 'date', label: 'Date' },
  { value: 'datetime', label: 'Date & Time' },
  { value: 'code', label: 'Code Editor' }
];

export const getFieldTypeLabel = (type: InputType): string => {
  return FIELD_TYPES.find(t => t.value === type)?.label || type;
};