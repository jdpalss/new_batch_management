import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardBody, Button } from 'reactstrap';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <Card className="border-danger">
          <CardBody className="text-center py-5">
            <h3 className="text-danger mb-4">Something went wrong</h3>
            <p className="text-muted mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <Button
              color="primary"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </Button>
          </CardBody>
        </Card>
      );
    }

    return this.props.children;
  }
}