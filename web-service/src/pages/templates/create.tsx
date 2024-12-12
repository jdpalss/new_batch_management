import React from 'react';
import { useRouter } from 'next/router';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { Template } from '../../types/template';
import { TemplateForm } from '../../components/templates/TemplateForm';
import { PageHeader } from '../../components/common/PageHeader';
import { useToasts } from '../../hooks/useToasts';

export default function CreateTemplatePage() {
  const router = useRouter();
  const { addToast } = useToasts();

  const createTemplate = useMutation({
    mutationFn: async (template: Partial<Template>) => {
      const response = await axios.post('/api/template', template);
      return response.data;
    },
    onSuccess: () => {
      addToast({
        type: 'success',
        message: 'Template created successfully'
      });
      router.push('/templates');
    },
    onError: (error) => {
      addToast({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to create template'
      });
    }
  });

  return (
    <div>
      <PageHeader
        title="Create Template"
        description="Create a new template with custom fields and script"
      />

      <TemplateForm
        onSubmit={async (values) => {
          await createTemplate.mutateAsync(values);
        }}
      />
    </div>
  );
}