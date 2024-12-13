import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { Container } from 'reactstrap';
import { useQuery } from '@tanstack/react-query';
import { BatchDetails } from '../../components/batch/BatchDetails';
import { BatchHistory } from '../../components/batch/BatchHistory';
import { BatchLogs } from '../../components/batch/BatchLogs';
import { BatchStats } from '../../components/batch/BatchStats';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { PageHeader } from '../../components/common/PageHeader';
import { useToasts } from '../../hooks/useToasts';
import { BatchService, TemplateService, DatasetService } from '../../services/api';

export default function BatchDetailPage() {
  const router = useRouter();
  const toasts = useToasts();
  const { id } = router.query;

  // 라우터 준비 체크
  useEffect(() => {
    if (router.isReady && !id) {
      router.replace('/batch').catch(console.error);
    }
  }, [router.isReady, id]);

  // 배치 정보 조회
  const { data: batch, isLoading: batchLoading, error: batchError } = useQuery({
    queryKey: ['batch', id],
    queryFn: () => BatchService.get(id as string),
    enabled: Boolean(id),
    retry: false
  });

  // 연관 템플릿 조회
  const { data: template, isLoading: templateLoading } = useQuery({
    queryKey: ['template', batch?.templateId],
    queryFn: () => TemplateService.get(batch!.templateId),
    enabled: Boolean(batch?.templateId),
    retry: false,
    onError: (error: Error) => {
      toasts.addToast({
        type: 'error',
        title: '템플릿 로딩 실패',
        message: error.message
      });
    }
  });

  // 연관 데이터셋 조회
  const { data: dataset, isLoading: datasetLoading } = useQuery({
    queryKey: ['dataset', batch?.datasetId],
    queryFn: () => DatasetService.get(batch!.datasetId),
    enabled: Boolean(batch?.datasetId),
    retry: false,
    onError: (error: Error) => {
      toasts.addToast({
        type: 'error',
        title: '데이터셋 로딩 실패',
        message: error.message
      });
    }
  });

  // 로딩 중이거나 라우터가 준비되지 않은 경우
  if (!router.isReady || batchLoading || templateLoading || datasetLoading) {
    return (
      <Container>
        <LoadingSpinner />
      </Container>
    );
  }

  // 배치를 찾을 수 없는 경우
  if (batchError) {
    return (
      <Container>
        <div className="text-center mt-5">
          <h3>배치를 찾을 수 없습니다.</h3>
          <p className="text-muted">{batchError.message}</p>
          <button 
            className="btn btn-primary mt-3"
            onClick={() => router.replace('/batch').catch(console.error)}
          >
            목록으로 돌아가기
          </button>
        </div>
      </Container>
    );
  }

  // 데이터가 없는 경우
  if (!batch) {
    return (
      <Container>
        <div className="text-center mt-5">
          <h3>배치 정보를 불러올 수 없습니다.</h3>
          <button 
            className="btn btn-primary mt-3"
            onClick={() => router.replace('/batch').catch(console.error)}
          >
            목록으로 돌아가기
          </button>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <PageHeader
        title={batch.title}
        subtitle={batch.description}
        breadcrumbs={[
          { text: '홈', href: '/' },
          { text: '배치 관리', href: '/batch' },
          { text: batch.title }
        ]}
      />

      <div className="row">
        <div className="col-md-8">
          <BatchDetails
            batch={batch}
            template={template}
            dataset={dataset}
          />
          <BatchHistory batchId={id as string} />
          <BatchLogs batchId={id as string} />
        </div>
        <div className="col-md-4">
          <BatchStats batchId={id as string} />
        </div>
      </div>
    </Container>
  );
}