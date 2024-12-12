import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Navbar,
  NavbarBrand,
  NavbarToggler,
  Collapse,
  Nav,
  NavItem,
  NavLink,
  Container
} from 'reactstrap';

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const toggle = () => setIsOpen(!isOpen);

  const isActive = (path: string) => router.pathname.startsWith(path);

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/templates', label: 'Templates' },
    { path: '/datasets', label: 'Datasets' },
    { path: '/batch', label: 'Batch Management' }
  ];

  return (
    <Navbar color="dark" dark expand="md" className="mb-4">
      <Container>
        <NavbarBrand href="/">Batch Automation</NavbarBrand>
        <NavbarToggler onClick={toggle} />
        <Collapse isOpen={isOpen} navbar>
          <Nav className="me-auto" navbar>
            {menuItems.map(item => (
              <NavItem key={item.path}>
                <Link href={item.path} passHref legacyBehavior>
                  <NavLink active={isActive(item.path)}>
                    {item.label}
                  </NavLink>
                </Link>
              </NavItem>
            ))}
          </Nav>
        </Collapse>
      </Container>
    </Navbar>
  );
};