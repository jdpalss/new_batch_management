import React from 'react';
import { useRouter } from 'next/router';
import { Container } from 'reactstrap';
import { useQuery, useMutation } from '@tanstack/react-query';
import { BatchForm } from '../../components/batch/BatchForm';
import { PageHeader } from '../../components/common/PageHeader';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useToasts } from '../../hooks/useToasts';
import { TemplateService, DatasetService, BatchService } from '../../services/api';

export default function NewBatchPage() {
  const router = useRouter();
  const toasts = useToasts();

  // 템플릿 목록 조회
  const { data: templates = [], isLoading: templatesLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: TemplateService.list,
    onError: (error: Error) => {
      toasts.addToast({
        type: 'error',
        title: '템플릿 로딩 실패',
        message: error.message
      });
    }
  });

  // 데이터셋 목록 조회
  const { data: datasets = [], isLoading: datasetsLoading } = useQuery({
    queryKey: ['datasets'],
    queryFn: DatasetService.list,
    onError: (error: Error) => {
      toasts.addToast({
        type: 'error',
        title: '데이터셋 로딩 실패',
        message: error.message
      });
    }
  });

  // 배치 생성 mutation
  const { mutateAsync: createBatch } = useMutation({
    mutationFn: BatchService.create,
    onSuccess: () => {
      toasts.addToast({
        type: 'success',
        title: '배치 생성 성공',
        message: '새로운 배치가 생성되었습니다.'
      });
      router.push('/batch');
    },
    onError: (error: any) => {
      const errorMessage = error.message || error.error || '배치 생성 중 오류가 발생했습니다.';
      toasts.addToast({
        type: 'error',
        title: '배치 생성 실패',
        message: errorMessage
      });
      throw error;
    }
  });

  if (templatesLoading || datasetsLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Container>
      <PageHeader 
        title="새 배치 생성" 
        subtitle="새로운 배치 작업을 생성합니다."
        breadcrumbs={[
          { text: '홈', href: '/' },
          { text: '배치 관리', href: '/batch' },
          { text: '새 배치 생성' }
        ]}
      />
      
      <BatchForm
        templates={templates}
        datasets={datasets}
        onSubmit={createBatch}
      />
    </Container>
  );
}