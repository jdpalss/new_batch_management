import React, { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  action?: ReactNode;
  description?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  action,
  description
}) => {
  return (
    <div className="d-flex justify-content-between align-items-start mb-4">
      <div>
        <h1 className="h3 mb-1">{title}</h1>
        {description && (
          <p className="text-muted mb-0">{description}</p>
        )}
      </div>
      {action && (
        <div>{action}</div>
      )}
    </div>
  );
};