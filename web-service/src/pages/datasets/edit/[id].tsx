import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { Dataset } from '../../../types/dataset';
import { Template } from '../../../types/template';
import { Container } from 'reactstrap';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { PageHeader } from '../../../components/common/PageHeader';
import { DatasetForm } from '../../../components/datasets/DatasetForm';
import { useToasts } from '../../../hooks/useToasts';

const EditDatasetPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { success, error } = useToasts();

  const { data: dataset, isLoading: isLoadingDataset } = useQuery<Dataset>({
    queryKey: ['dataset', id],
    queryFn: async () => {
      const { data } = await axios.get(`/api/dataset/${id}`);
      return data;
    },
    enabled: !!id
  });

  const { data: template, isLoading: isLoadingTemplate } = useQuery<Template>({
    queryKey: ['template', dataset?.templateId],
    queryFn: async () => {
      const { data } = await axios.get(`/api/template/${dataset?.templateId}`);
      return data;
    },
    enabled: !!dataset?.templateId
  });

  const updateDataset = useMutation({
    mutationFn: async (updatedDataset: Partial<Dataset>) => {
      const { data } = await axios.put(`/api/dataset/${id}`, updatedDataset);
      return data;
    },
    onSuccess: () => {
      success('데이터셋이 성공적으로 수정되었습니다');
      router.push('/datasets');
    },
    onError: (err) => {
      error(err instanceof Error ? err.message : '데이터셋 수정 중 오류가 발생했습니다');
    }
  });

  if (isLoadingDataset || isLoadingTemplate) {
    return <LoadingSpinner />;
  }

  if (!dataset || !template) {
    return (
      <Container className="py-4">
        <div className="text-center">
          <h3>데이터셋을 찾을 수 없습니다</h3>
          <p className="text-muted">
            요청하신 데이터셋을 찾을 수 없습니다. 목록으로 돌아가서 다시 시도해주세요.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => router.push('/datasets')}
          >
            데이터셋 목록으로
          </button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <PageHeader
        title={`데이터셋 수정: ${dataset.name || '이름 없음'}`}
        description="데이터셋의 필드 값을 수정합니다"
      />

      <DatasetForm
        template={template}
        initialValues={dataset}
        onSubmit={async (values) => {
          await updateDataset.mutateAsync({
            ...values,
            templateId: template.id
          });
        }}
      />
    </Container>
  );
};

export default EditDatasetPage;