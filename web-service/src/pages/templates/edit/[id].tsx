import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { Template } from '../../../types/template';
import { TemplateForm } from '../../../components/templates/TemplateForm';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { PageHeader } from '../../../components/common/PageHeader';
import { Container } from 'reactstrap';
import { useToasts } from '../../../hooks/useToasts';

const EditTemplatePage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { success, error } = useToasts();

  const { data: template, isLoading: isLoadingTemplate } = useQuery<Template>({
    queryKey: ['template', id],
    queryFn: async () => {
      const { data } = await axios.get(`/api/template/${id}`);
      return data;
    },
    enabled: !!id
  });

  const updateTemplate = useMutation({
    mutationFn: async (updatedTemplate: Partial<Template>) => {
      const { data } = await axios.put(`/api/template/${id}`, updatedTemplate);
      return data;
    },
    onSuccess: () => {
      success('템플릿이 성공적으로 수정되었습니다');
      router.push('/templates');
    },
    onError: (err) => {
      error(err instanceof Error ? err.message : '템플릿 수정 중 오류가 발생했습니다');
    }
  });

  if (isLoadingTemplate) {
    return <LoadingSpinner />;
  }

  if (!template) {
    return (
      <Container className="py-4">
        <div className="text-center">
          <h3>템플릿을 찾을 수 없습니다</h3>
          <p className="text-muted">
            요청하신 템플릿을 찾을 수 없습니다. 목록으로 돌아가서 다시 시도해주세요.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => router.push('/templates')}
          >
            템플릿 목록으로
          </button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <PageHeader
        title={`템플릿 수정: ${template.name}`}
        description="템플릿 정보와 필드를 수정합니다"
      />

      <TemplateForm
        initialValues={template}
        onSubmit={async (values) => {
          await updateTemplate.mutateAsync(values);
        }}
      />
    </Container>
  );
};

export default EditTemplatePage;