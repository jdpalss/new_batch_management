import React from 'react';
import { Formik, Form, FieldArray } from 'formik';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  FormGroup,
  Label,
  Input,
  Row,
  Col,
  ListGroup,
  ListGroupItem,
} from 'reactstrap';
import * as Yup from 'yup';
import { Template, TemplateField, FieldType } from '../../types/template';
import { ScriptEditor } from './ScriptEditor';
import { FieldOptionsModal } from './FieldOptionsModal';
import { useModal } from '../../hooks/useModal';

interface TemplateFormProps {
  initialValues?: Partial<Template>;
  onSubmit: (values: Partial<Template>) => Promise<void>;
}

const fieldTypes: FieldType[] = [
  'text',
  'number',
  'email',
  'json',
  'radio',
  'textarea',
  'checkbox',
  'combo',
  'file',
  'date',
  'datetime',
  'code'
];

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Template name is required'),
  fields: Yup.array().of(
    Yup.object().shape({
      name: Yup.string()
        .required('Field name is required')
        .matches(/^[a-zA-Z][a-zA-Z0-9_]*$/, 'Invalid field name format'),
      type: Yup.string().required('Field type is required'),
      label: Yup.string().required('Field label is required'),
      required: Yup.boolean()
    })
  ),
  script: Yup.string().required('Script is required')
});

const defaultField: TemplateField = {
  name: '',
  type: 'text',
  label: '',
  required: false,
  options: []
};

export const TemplateForm: React.FC<TemplateFormProps> = ({
  initialValues,
  onSubmit
}) => {
  const { isOpen: isOptionsModalOpen, selectedItem: selectedField, openModal, closeModal } = 
    useModal<{index: number, field: TemplateField}>();

  const defaultValues: Partial<Template> = {
    name: '',
    description: '',
    fields: [],
    script: '',
    ...initialValues
  };

  const needsOptions = (type: FieldType): boolean => {
    return ['radio', 'checkbox', 'combo'].includes(type);
  };

  return (
    <Formik
      initialValues={defaultValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {({ values, setFieldValue, errors, touched, isSubmitting }) => (
        <Form>
          <Card className="mb-4">
            <CardHeader>Template Information</CardHeader>
            <CardBody>
              <FormGroup>
                <Label for="name">Template Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={values.name}
                  onChange={(e) => setFieldValue('name', e.target.value)}
                  invalid={touched.name && !!errors.name}
                />
              </FormGroup>

              <FormGroup>
                <Label for="description">Description</Label>
                <Input
                  type="textarea"
                  id="description"
                  name="description"
                  value={values.description}
                  onChange={(e) => setFieldValue('description', e.target.value)}
                />
              </FormGroup>
            </CardBody>
          </Card>

          <Card className="mb-4">
            <CardHeader className="d-flex justify-content-between align-items-center">
              <span>Fields</span>
              <FieldArray name="fields">
                {({ push }) => (
                  <Button
                    color="primary"
                    size="sm"
                    onClick={() => push({ ...defaultField })}
                  >
                    Add Field
                  </Button>
                )}
              </FieldArray>
            </CardHeader>
            <CardBody>
              <FieldArray name="fields">
                {({ remove }) => (
                  <>
                    {values.fields?.map((field: TemplateField, index: number) => (
                      <Row key={index} className="mb-4 pb-4 border-bottom">
                        <Col md={3}>
                          <FormGroup>
                            <Label>Field Name</Label>
                            <Input
                              name={`fields.${index}.name`}
                              value={field.name}
                              onChange={(e) =>
                                setFieldValue(`fields.${index}.name`, e.target.value)
                              }
                              placeholder="e.g., userName"
                            />
                            {touched.fields?.[index]?.name && errors.fields?.[index]?.name && (
                              <div className="text-danger small mt-1">
                                {errors.fields[index].name}
                              </div>
                            )}
                          </FormGroup>
                        </Col>

                        <Col md={3}>
                          <FormGroup>
                            <Label>Label</Label>
                            <Input
                              name={`fields.${index}.label`}
                              value={field.label}
                              onChange={(e) =>
                                setFieldValue(`fields.${index}.label`, e.target.value)
                              }
                              placeholder="e.g., User Name"
                            />
                          </FormGroup>
                        </Col>

                        <Col md={3}>
                          <FormGroup>
                            <Label>Type</Label>
                            <Input
                              type="select"
                              name={`fields.${index}.type`}
                              value={field.type}
                              onChange={(e) => {
                                const newType = e.target.value as FieldType;
                                setFieldValue(`fields.${index}.type`, newType);
                                if (!needsOptions(newType)) {
                                  setFieldValue(`fields.${index}.options`, undefined);
                                }
                              }}
                            >
                              {fieldTypes.map((type) => (
                                <option key={type} value={type}>
                                  {type}
                                </option>
                              ))}
                            </Input>
                          </FormGroup>
                        </Col>

                        <Col md={3} className="d-flex align-items-center gap-3">
                          <FormGroup check className="mb-0">
                            <Label check>
                              <Input
                                type="checkbox"
                                name={`fields.${index}.required`}
                                checked={field.required}
                                onChange={(e) =>
                                  setFieldValue(
                                    `fields.${index}.required`,
                                    e.target.checked
                                  )
                                }
                              />{' '}
                              Required
                            </Label>
                          </FormGroup>

                          <div className="d-flex gap-2 align-items-center">
                            {needsOptions(field.type) && (
                              <Button
                                color="info"
                                outline
                                size="sm"
                                onClick={() => openModal({ index, field })}
                              >
                                Options ({field.options?.length || 0})
                              </Button>
                            )}
                            <Button
                              color="danger"
                              outline
                              size="sm"
                              onClick={() => remove(index)}
                            >
                              Remove
                            </Button>
                          </div>
                        </Col>

                        {needsOptions(field.type) && field.options && field.options.length > 0 && (
                          <Col md={12} className="mt-3">
                            <div className="border rounded p-2 bg-light">
                              <small className="text-muted d-block mb-2">Options:</small>
                              <ListGroup horizontal>
                                {field.options.map((option, optIdx) => (
                                  <ListGroupItem key={optIdx} className="d-flex align-items-center py-1 px-3">
                                    <span className="me-2">{option.label}</span>
                                    <code className="small text-muted">({option.value})</code>
                                  </ListGroupItem>
                                ))}
                              </ListGroup>
                            </div>
                          </Col>
                        )}
                      </Row>
                    ))}

                    {values.fields?.length === 0 && (
                      <div className="text-center py-5 text-muted">
                        No fields added yet. Click "Add Field" to start.
                      </div>
                    )}
                  </>
                )}
              </FieldArray>
            </CardBody>
          </Card>

          <Card className="mb-4">
            <CardHeader>Playwright Script</CardHeader>
            <CardBody>
              <ScriptEditor
                value={values.script || ''}
                onChange={(value) => setFieldValue('script', value)}
              />
            </CardBody>
          </Card>

          <div className="d-flex justify-content-end">
            <Button type="submit" color="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Template'}
            </Button>
          </div>

          {selectedField && (
            <FieldOptionsModal
              isOpen={isOptionsModalOpen}
              onClose={closeModal}
              field={selectedField.field}
              onSave={(options) => {
                setFieldValue(`fields.${selectedField.index}.options`, options);
                closeModal();
              }}
            />
          )}
        </Form>
      )}
    </Formik>
  );
};