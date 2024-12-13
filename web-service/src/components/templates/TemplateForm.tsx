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
import { Template, TemplateField } from '../../types/template';
import { ScriptEditor } from './ScriptEditor';
import { FieldOptionsModal } from './FieldOptionsModal';
import { useModal } from '../../hooks/useModal';
import { FIELD_TYPES } from '../../constants';

const validationSchema = Yup.object().shape({
  name: Yup.string().required('템플릿 이름을 입력해주세요'),
  fields: Yup.array().of(
    Yup.object().shape({
      name: Yup.string()
        .required('필드 이름을 입력해주세요')
        .matches(/^[가-힣a-zA-Z][가-힣a-zA-Z0-9_]*$/, '필드 이름은 한글/영문자로 시작하고 한글/영문자/숫자/밑줄만 사용할 수 있습니다'),
      type: Yup.string().required('필드 타입을 선택해주세요'),
      label: Yup.string().required('필드 라벨을 입력해주세요')
    })
  ),
  script: Yup.string().required('스크립트를 입력해주세요')
});

interface TemplateFormProps {
  initialValues?: Partial<Template>;
  onSubmit: (values: Partial<Template>) => Promise<void>;
}

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

  return (
    <Formik
      initialValues={defaultValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {({ values, setFieldValue, errors, touched, isSubmitting }) => (
        <Form>
          <Card className="mb-4">
            <CardHeader>템플릿 정보</CardHeader>
            <CardBody>
              <FormGroup>
                <Label for="name">템플릿 이름</Label>
                <Input
                  id="name"
                  name="name"
                  value={values.name}
                  onChange={(e) => setFieldValue('name', e.target.value)}
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
                  value={values.description}
                  onChange={(e) => setFieldValue('description', e.target.value)}
                />
              </FormGroup>
            </CardBody>
          </Card>

          <Card className="mb-4">
            <CardHeader className="d-flex justify-content-between align-items-center">
              <span>필드</span>
              <Button
                color="primary"
                size="sm"
                onClick={() => {
                  setFieldValue('fields', [
                    ...values.fields,
                    {
                      name: '',
                      type: FIELD_TYPES.TEXT,
                      label: '',
                      required: false
                    }
                  ]);
                }}
              >
                필드 추가
              </Button>
            </CardHeader>
            <CardBody>
              {values.fields.map((field, index) => (
                <div key={index} className="border rounded p-3 mb-3">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h6 className="mb-0">필드 #{index + 1}</h6>
                    <Button
                      color="danger"
                      size="sm"
                      outline
                      onClick={() => {
                        const newFields = [...values.fields];
                        newFields.splice(index, 1);
                        setFieldValue('fields', newFields);
                      }}
                    >
                      삭제
                    </Button>
                  </div>

                  <FormGroup>
                    <Label>필드 이름</Label>
                    <Input
                      value={field.name}
                      onChange={e => {
                        const newFields = [...values.fields];
                        newFields[index] = {
                          ...field,
                          name: e.target.value
                        };
                        setFieldValue('fields', newFields);
                      }}
                      placeholder="예: userName"
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>라벨</Label>
                    <Input
                      value={field.label}
                      onChange={e => {
                        const newFields = [...values.fields];
                        newFields[index] = {
                          ...field,
                          label: e.target.value
                        };
                        setFieldValue('fields', newFields);
                      }}
                      placeholder="예: 사용자 이름"
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>타입</Label>
                    <div className="d-flex gap-2">
                      <Input
                        type="select"
                        value={field.type}
                        onChange={e => {
                          const newType = e.target.value as keyof typeof FIELD_TYPES;
                          const newFields = [...values.fields];
                          newFields[index] = {
                            ...field,
                            type: newType,
                            options: []
                          };
                          setFieldValue('fields', newFields);
                        }}
                        className="flex-grow-1"
                      >
                        {Object.entries(FIELD_TYPES).map(([key, value]) => (
                          <option key={key} value={value}>
                            {value}
                          </option>
                        ))}
                      </Input>
                      {['radio', 'checkbox', 'combo'].includes(field.type) && (
                        <Button
                          color="secondary"
                          outline
                          onClick={() => openModal({ index, field })}
                        >
                          옵션 ({field.options?.length || 0})
                        </Button>
                      )}
                    </div>
                  </FormGroup>

                  <FormGroup check className="mb-0">
                    <Label check>
                      <Input
                        type="checkbox"
                        checked={field.required}
                        onChange={e => {
                          const newFields = [...values.fields];
                          newFields[index] = {
                            ...field,
                            required: e.target.checked
                          };
                          setFieldValue('fields', newFields);
                        }}
                      />{' '}
                      필수 입력
                    </Label>
                  </FormGroup>
                </div>
              ))}

              {values.fields.length === 0 && (
                <div className="text-center text-muted py-4">
                  필드가 없습니다. '필드 추가' 버튼을 클릭하여 추가해주세요.
                </div>
              )}
            </CardBody>
          </Card>

          <Card className="mb-4">
            <CardHeader>Playwright 스크립트</CardHeader>
            <CardBody>
              <ScriptEditor
                value={values.script || ''}
                onChange={(value) => setFieldValue('script', value)}
              />
            </CardBody>
          </Card>

          <div className="d-flex justify-content-end">
            <Button type="submit" color="primary" disabled={isSubmitting}>
              {isSubmitting ? '저장 중...' : '템플릿 저장'}
            </Button>
          </div>

          {selectedField && (
            <FieldOptionsModal
              isOpen={isOptionsModalOpen}
              onClose={closeModal}
              field={selectedField.field}
              onSave={(options) => {
                const newFields = [...values.fields];
                newFields[selectedField.index] = {
                  ...selectedField.field,
                  options
                };
                setFieldValue('fields', newFields);
                closeModal();
              }}
            />
          )}
        </Form>
      )}
    </Formik>
  );
};