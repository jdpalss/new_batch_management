import React from 'react';
import { Card, CardBody, Badge } from 'reactstrap';
import { formatDateTime } from '../../utils/dateUtils';

interface GridItem {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  version: number;
  [key: string]: any;
}

interface GridViewProps<T extends GridItem> {
  items: T[];
  onItemClick: (item: T) => void;
  renderBadge?: (item: T) => React.ReactNode;
  renderExtraInfo?: (item: T) => React.ReactNode;
}

export function GridView<T extends GridItem>({ 
  items,
  onItemClick,
  renderBadge,
  renderExtraInfo
}: GridViewProps<T>) {
  return (
    <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
      {items.map((item) => (
        <div key={item.id} className="col">
          <Card
            className="h-100 cursor-pointer hover-shadow"
            onClick={() => onItemClick(item)}
            style={{ cursor: 'pointer' }}
          >
            <CardBody>
              <div className="d-flex justify-content-between align-items-start mb-2">
                <h5 className="card-title mb-0">{item.name || 'Unnamed'}</h5>
                {renderBadge && renderBadge(item)}
              </div>
              
              {item.description && (
                <p className="text-muted mb-3">
                  {item.description}
                </p>
              )}

              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted">
                    Version {item.version}
                  </small>
                  <br />
                  <small className="text-muted">
                    Updated {formatDateTime(item.updatedAt)}
                  </small>
                </div>
                {renderExtraInfo && renderExtraInfo(item)}
              </div>
            </CardBody>
          </Card>
        </div>
      ))}
    </div>
  );
}