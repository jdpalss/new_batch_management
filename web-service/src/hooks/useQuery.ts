import { useQuery as useReactQuery, UseQueryOptions } from '@tanstack/react-query';
import { useToasts } from './useToasts';

export function useQuery<T>(
  key: string[],
  fetcher: () => Promise<T>,
  options?: Omit<UseQueryOptions<T, Error>, 'queryKey' | 'queryFn'>
) {
  const { error } = useToasts();

  return useReactQuery({
    queryKey: key,
    queryFn: fetcher,
    onError: (err) => {
      error(err.message);
    },
    ...options
  });
}