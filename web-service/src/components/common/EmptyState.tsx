import React, { ReactNode } from 'react';
import { Card, CardBody, Button } from 'reactstrap';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  action,
  icon
}) => {
  return (
    <Card>
      <CardBody className="text-center py-5">
        {icon && <div className="mb-4">{icon}</div>}
        <h3 className="mb-2">{title}</h3>
        {description && (
          <p className="text-muted mb-4">{description}</p>
        )}
        {action && (
          <Button color="primary" onClick={action.onClick}>
            {action.label}
          </Button>
        )}
      </CardBody>
    </Card>
  );
};