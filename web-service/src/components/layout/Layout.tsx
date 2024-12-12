import React, { ReactNode } from 'react';
import { Container } from 'reactstrap';
import { Navigation } from './Navigation';
import { Toasts } from '../common/Toasts';

interface LayoutProps {
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-vh-100 bg-light">
      <Navigation />
      <Container className="py-4">
        {children}
      </Container>
      <Toasts />
    </div>
  );
};