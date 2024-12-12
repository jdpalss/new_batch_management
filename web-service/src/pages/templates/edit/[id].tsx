import React from 'react';
import { useRouter } from 'next/router';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { Template } from '../../../types/template';
import { TemplateForm } from '../../../components/templates/TemplateForm';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { PageHeader } from '../../../components/common/PageHeader';
import { useToasts } from '../../../hooks/useToasts';

export default function EditTemplatePage() {
  const router = useRouter();
  const { id } = router.query;
  const { addToast } = useToasts();

  const { data: template, isLoading } = useQuery<Template>({
    queryKey: ['template', id],
    queryFn: async () => {
      const response = await axios.get(\`/api/template/\${id}\`);
      return response.data;
    },
    enabled: !!id
  });

  const updateTemplate = useMutation({
    mutationFn: async (updatedTemplate: Partial<Template>) => {
      const response = await axios.put(\`/api/template/\${id}\`, updatedTemplate);
      return response.data;
    },
    onSuccess: () => {
      addToast({
        type: 'success',
        message: 'Template updated successfully'
      });
      router.push('/templates');
    },
    onError: (error) => {
      addToast({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to update template'
      });
    }
  });

  if (isLoading || !template) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <PageHeader
        title={`Edit Template: ${template.name}`}
        description="Modify template fields and script"
      />

      <TemplateForm
        initialValues={template}
        onSubmit={async (values) => {
          await updateTemplate.mutateAsync(values);
        }}
      />
    </div>
  );
}