import { useMutation as useReactMutation, UseMutationOptions } from '@tanstack/react-query';
import { useToasts } from './useToasts';

export function useMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: Omit<UseMutationOptions<TData, Error, TVariables>, 'mutationFn'>
) {
  const { success, error } = useToasts();

  return useReactMutation({
    mutationFn,
    onError: (err) => {
      error(err.message);
      options?.onError?.(err);
    },
    onSuccess: (data, variables, context) => {
      if (options?.successMessage) {
        success(options.successMessage);
      }
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
}

// Add success message to mutation options
declare module '@tanstack/react-query' {
  interface UseMutationOptions<TData, TError, TVariables> {
    successMessage?: string;
  }
}