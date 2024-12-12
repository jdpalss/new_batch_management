import React from 'react';
import { Spinner } from 'reactstrap';

interface LoadingSpinnerProps {
  text?: string;
  size?: string;
  centered?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  text = 'Loading...',
  size = 'sm',
  centered = true
}) => {
  const style = centered ? {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '2rem'
  } : {};

  return (
    <div style={style}>
      <Spinner size={size} color="primary" className="me-2" />
      {text}
    </div>
  );
};