import React, { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import {
  Button,
  Card,
  CardBody,
  FormGroup,
  Label,
  Input,
  Alert
} from 'reactstrap';
import * as Yup from 'yup';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { apiService } from '../../services/api';
import { Template } from '../../types/template';
import { Dataset } from '../../types/dataset';
import { BatchConfig } from '../../types/batch';
import { useToasts } from '../../hooks/useToasts';

interface BatchFormProps {
  templates: Template[];
  datasets: Dataset[];
  initialValues?: Partial<BatchConfig>;
  mode: 'create' | 'edit';
}

// Yup validation schema
const validationSchema = Yup.object().shape({
  title: Yup.string()
    .required('배치명을 입력해주세요')
    .max(100, '배치명은 100자를 초과할 수 없습니다'),
  description: Yup.string()
    .max(500, '설명은 500자를 초과할 수 없습니다'),
  templateId: Yup.string()
    .required('템플릿을 선택해주세요'),
  datasetId: Yup.string()
    .required('데이터셋을 선택해주세요'),
  isActive: Yup.boolean(),
  schedule: Yup.object({
    type: Yup.string()
      .oneOf(['periodic', 'specific'])
      .required('스케줄 유형을 선택해주세요'),
    cronExpression: Yup.string().when('type', {
      is: 'periodic',
      then: () => Yup.string().required('Cron 표현식을 입력해주세요')
    }),
    executionDates: Yup.array().when('type', {
      is: 'specific',
      then: () => Yup.array()
        .min(1, '최소 하나의 실행 일시를 선택해주세요')
        .max(50, '실행 일시는 최대 50개까지 설정할 수 없습니다')
    }),
    randomDelay: Yup.boolean()
  }).required('스케줄 설정은 필수입니다')
});

const defaultValues: Partial<BatchConfig> = {
  title: '',
  description: '',
  templateId: '',
  datasetId: '',
  isActive: true,
  schedule: {
    type: 'periodic',
    cronExpression: '0 0 * * *',  // 매일 자정
    executionDates: [],
    randomDelay: false
  }
};

export const BatchForm: React.FC<BatchFormProps> = ({
  templates,
  datasets,
  initialValues,
  mode
}) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const toasts = useToasts();

  // 배치 생성 mutation
  const createMutation = useMutation({
    mutationFn: (data: Partial<BatchConfig>) => apiService.batch.create(data),
    onSuccess: () => {
      toasts.addToast({
        type: 'success',
        title: '배치 생성',
        message: '새로운 배치가 생성되었습니다.'
      });
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      router.push('/batch');
    },
    onError: (error: Error) => {
      toasts.addToast({
        type: 'error',
        title: '배치 생성 실패',
        message: error.message
      });
    }
  });

  // 배치 수정 mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BatchConfig> }) => 
      apiService.batch.update(id, data),
    onSuccess: () => {
      toasts.addToast({
        type: 'success',
        title: '배치 수정',
        message: '배치가 수정되었습니다.'
      });
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      if (initialValues?.id) {
        queryClient.invalidateQueries({ 
          queryKey: ['batch', initialValues.id]
        });
      }
      router.push('/batch');
    },
    onError: (error: Error) => {
      toasts.addToast({
        type: 'error',
        title: '배치 수정 실패',
        message: error.message
      });
    }
  });

  const handleSubmit = async (values: Partial<BatchConfig>, { setSubmitting }: any) => {
    try {
      if (mode === 'create') {
        await createMutation.mutateAsync(values);
      } else {
        if (!initialValues?.id) throw new Error('배치 ID가 없습니다.');
        await updateMutation.mutateAsync({
          id: initialValues.id,
          data: values
        });
      }
    } catch (error) {
      setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={{ ...defaultValues, ...initialValues }}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ values, errors, touched, setFieldValue, isSubmitting }) => (
        <Form>
          <Card className="mb-4">
            <CardBody>
              <FormGroup>
                <Label for="title">배치명 *</Label>
                <Field
                  name="title"
                  type="text"
                  className={`form-control ${touched.title && errors.title ? 'is-invalid' : ''}`}
                  placeholder="배치 작업의 이름을 입력하세요"
                />
                {touched.title && errors.title && (
                  <div className="invalid-feedback">{errors.title}</div>
                )}
              </FormGroup>

              {/* 나머지 폼 필드들... */}

              <div className="d-flex justify-content-between align-items-center">
                <small className="text-muted">* 필수 입력 항목</small>
                <Button 
                  type="submit" 
                  color="primary" 
                  disabled={isSubmitting}
                  className="px-4"
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      저장 중...
                    </>
                  ) : mode === 'create' ? '배치 생성' : '배치 수정'}
                </Button>
              </div>
            </CardBody>
          </Card>
        </Form>
      )}
    </Formik>
  );
};
