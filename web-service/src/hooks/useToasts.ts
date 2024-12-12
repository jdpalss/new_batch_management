import { useCallback } from 'react';
import { useToastStore, Toast } from '../store/toast';

type ToastType = Toast['type'];

export function useToasts() {
  const { addToast, removeToast } = useToastStore();

  const showToast = useCallback((type: ToastType, message: string, duration?: number) => {
    addToast({ type, message, duration });
  }, [addToast]);

  const success = useCallback((message: string, duration?: number) => {
    showToast('success', message, duration);
  }, [showToast]);

  const error = useCallback((message: string, duration?: number) => {
    showToast('error', message, duration);
  }, [showToast]);

  const info = useCallback((message: string, duration?: number) => {
    showToast('info', message, duration);
  }, [showToast]);

  const warning = useCallback((message: string, duration?: number) => {
    showToast('warning', message, duration);
  }, [showToast]);

  return {
    success,
    error,
    info,
    warning,
    removeToast
  };
}