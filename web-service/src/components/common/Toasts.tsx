import React from 'react';
import { Toast as BSToast, ToastBody } from 'reactstrap';
import { useToastStore } from '../../store/toast';

export const Toasts: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  const getToastColor = (type: 'success' | 'error' | 'info' | 'warning') => {
    switch (type) {
      case 'success':
        return 'success';
      case 'error':
        return 'danger';
      case 'warning':
        return 'warning';
      default:
        return 'info';
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1rem',
        right: '1rem',
        zIndex: 1050
      }}
    >
      {toasts.map((toast) => (
        <BSToast
          key={toast.id}
          className="mb-2"
          color={getToastColor(toast.type)}
        >
          <ToastBody>
            <div className="d-flex justify-content-between align-items-center">
              <span>{toast.message}</span>
              <button
                type="button"
                className="btn-close"
                onClick={() => removeToast(toast.id)}
              />
            </div>
          </ToastBody>
        </BSToast>
      ))}
    </div>
  );
};