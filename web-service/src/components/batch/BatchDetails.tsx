import React from 'react';
import { useRouter } from 'next/router';
import { Card, CardBody, CardHeader, Badge, Button } from 'reactstrap';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToasts } from '@/hooks/useToasts';
import { apiService } from '@/services/api';
import { BatchConfig } from '@/types/batch';
import { Template } from '@/types/template';
import { Dataset } from '@/types/dataset';
import { formatDateTime } from '@/utils/date';

interface BatchDetailsProps {
  batch: BatchConfig;
  template: Template;
  dataset: Dataset;
}

export const BatchDetails: React.FC<BatchDetailsProps> = ({
  batch,
  template,
  dataset
}) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const toasts = useToasts();

  // 배치 삭제
  const deleteMutation = useMutation({
    mutationFn: () => apiService.batch.delete(batch.id),
    onSuccess: () => {
      toasts.addToast({
        type: 'success',
        title: '배치 삭제',
        message: '배치가 삭제되었습니다.'
      });
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      router.push('/batch');
    },
    onError: (error: Error) => {
      toasts.addToast({
        type: 'error',
        title: '배치 삭제 실패',
        message: error.message
      });
    }
  });

  // 배치 활성화/비활성화
  const toggleMutation = useMutation({
    mutationFn: () => apiService.batch.update(batch.id, { 
      isActive: !batch.isActive 
    }),
    onSuccess: (updatedBatch) => {
      queryClient.setQueryData(['batch', batch.id], updatedBatch);
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      toasts.addToast({
        type: 'success',
        title: '배치 상태 변경',
        message: `배치가 ${updatedBatch.isActive ? '활성화' : '비활성화'} 되었습니다.`
      });
    },
    onError: (error: Error) => {
      toasts.addToast({
        type: 'error',
        title: '배치 상태 변경 실패',
        message: error.message
      });
    }
  });

  // 배치 실행
  const executeMutation = useMutation({
    mutationFn: () => apiService.batch.execute(batch.id),
    onSuccess: () => {
      toasts.addToast({
        type: 'success',
        title: '배치 실행',
        message: '배치가 실행되었습니다.'
      });
      queryClient.invalidateQueries({ 
        queryKey: ['batch', batch.id]
      });
      queryClient.invalidateQueries({
        queryKey: ['batches'],
        exact: false
      });
    },
    onError: (error: Error) => {
      toasts.addToast({
        type: 'error',
        title: '배치 실행 실패',
        message: error.message
      });
    }
  });

  const isLoading = deleteMutation.isPending || toggleMutation.isPending || executeMutation.isPending;

  return (
    <Card className="mb-4">
      <CardHeader className="d-flex justify-content-between align-items-center">
        <h4 className="mb-0">배치 상세</h4>
        <div>
          <Button
            color="primary"
            size="sm"
            className="me-2"
            onClick={() => router.push(`/batch/edit/${batch.id}`)}
            disabled={isLoading}
          >
            수정
          </Button>
          <Button
            color={batch.isActive ? "warning" : "success"}
            size="sm"
            className="me-2"
            onClick={() => toggleMutation.mutate()}
            disabled={isLoading}
          >
            {batch.isActive ? '비활성화' : '활성화'}
          </Button>
          <Button
            color="danger"
            size="sm"
            onClick={() => {
              if (window.confirm('이 배치를 삭제하시겠습니까?')) {
                deleteMutation.mutate();
              }
            }}
            disabled={isLoading}
          >
            삭제
          </Button>
        </div>
      </CardHeader>
      <CardBody>
        <dl className="row mb-0">
          <dt className="col-sm-3">상태</dt>
          <dd className="col-sm-9">
            <Badge color={batch.isActive ? 'success' : 'warning'}>
              {batch.isActive ? '활성' : '비활성'}
            </Badge>
          </dd>

          <dt className="col-sm-3">템플릿</dt>
          <dd className="col-sm-9">{template?.name}</dd>

          <dt className="col-sm-3">데이터셋</dt>
          <dd className="col-sm-9">{dataset?.name}</dd>

          <dt className="col-sm-3">스케줄</dt>
          <dd className="col-sm-9">
            {batch.schedule.type === 'periodic' ? (
              <>
                주기 실행: {batch.schedule.cronExpression}
                {batch.schedule.randomDelay && <span className="text-muted"> (무작위 지연 적용)</span>}
              </>
            ) : (
              <>
                특정 일시 실행:
                <ul className="list-unstyled mb-0">
                  {batch.schedule.executionDates?.map((date, index) => (
                    <li key={index}>{formatDateTime(new Date(date))}</li>
                  ))}
                </ul>
              </>
            )}
          </dd>

          {batch.lastExecutedAt && (
            <>
              <dt className="col-sm-3">마지막 실행</dt>
              <dd className="col-sm-9">
                {formatDateTime(new Date(batch.lastExecutedAt))}
              </dd>
            </>
          )}

          {batch.nextExecutionAt && (
            <>
              <dt className="col-sm-3">다음 실행</dt>
              <dd className="col-sm-9">
                {formatDateTime(new Date(batch.nextExecutionAt))}
              </dd>
            </>
          )}

          <dt className="col-sm-3">생성일</dt>
          <dd className="col-sm-9">
            {formatDateTime(new Date(batch.createdAt))}
          </dd>
        </dl>

        <div className="mt-3">
          <Button
            color="primary"
            onClick={() => executeMutation.mutate()}
            disabled={!batch.isActive || isLoading}
          >
            {executeMutation.isPending ? '실행 중...' : '지금 실행'}
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};