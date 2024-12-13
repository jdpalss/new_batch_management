import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import {
  Button,
  Container,
  Badge,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter
} from 'reactstrap';
import { Template } from '../../types/template';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { PageHeader } from '../../components/common/PageHeader';
import { GridView } from '../../components/common/GridView';
import { EmptyState } from '../../components/common/EmptyState';
import { useToasts } from '../../hooks/useToasts';
import { useState } from 'react';

const TemplatesPage: NextPage = () => {
  const router = useRouter();
  const { success, error } = useToasts();
  const [deleteTarget, setDeleteTarget] = useState<Template | null>(null);

  const { data: templates, isLoading, refetch } = useQuery<Template[]>({
    queryKey: ['templates'],
    queryFn: async () => {
      const { data } = await axios.get('/api/template');
      return data;
    }
  });

  const deleteTemplate = useMutation({
    mutationFn: async (templateId: string) => {
      await axios.delete(`/api/template/${templateId}`);
    },
    onSuccess: () => {
      success('템플릿이 삭제되었습니다');
      setDeleteTarget(null);
      refetch();
    },
    onError: (err) => {
      error(err instanceof Error ? err.message : '템플릿 삭제 중 오류가 발생했습니다');
    }
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!templates?.length) {
    return (
      <Container className="py-4">
        <EmptyState
          title="템플릿이 없습니다"
          description="배치 작업을 위한 새로운 템플릿을 생성해보세요."
          action={{
            label: '템플릿 생성',
            onClick: () => router.push('/templates/create')
          }}
        />
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <PageHeader
        title="템플릿"
        description="배치 작업을 위한 템플릿을 관리합니다"
        action={
          <Button
            color="primary"
            onClick={() => router.push('/templates/create')}
          >
            템플릿 생성
          </Button>
        }
      />

      <GridView
        items={templates}
        onItemClick={(template) => router.push(`/templates/edit/${template.id}`)}
        renderBadge={(template) => (
          <Badge color="info">
            {template.fields.length}개 필드
          </Badge>
        )}
        renderExtraInfo={(template) => (
          <Button
            color="danger"
            size="sm"
            outline
            onClick={(e) => {
              e.stopPropagation();
              setDeleteTarget(template);
            }}
          >
            삭제
          </Button>
        )}
      />

      <Modal isOpen={!!deleteTarget} toggle={() => setDeleteTarget(null)}>
        <ModalHeader toggle={() => setDeleteTarget(null)}>
          템플릿 삭제 확인
        </ModalHeader>
        <ModalBody>
          {deleteTarget?.name || 'Unnamed'} 템플릿을 삭제하시겠습니까?
          <br />
          <small className="text-danger">
            * 이 작업은 되돌릴 수 없습니다.
          </small>
        </ModalBody>
        <ModalFooter>
          <Button 
            color="danger"
            onClick={() => deleteTarget && deleteTemplate.mutate(deleteTarget.id)}
            disabled={deleteTemplate.isPending}
          >
            {deleteTemplate.isPending ? '삭제 중...' : '삭제'}
          </Button>
          <Button 
            color="secondary" 
            onClick={() => setDeleteTarget(null)}
          >
            취소
          </Button>
        </ModalFooter>
      </Modal>
    </Container>
  );
};

export default TemplatesPage;