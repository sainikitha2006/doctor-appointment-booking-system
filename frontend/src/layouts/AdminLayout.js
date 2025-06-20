// frontend/src/layouts/AdminLayout.js
import React from 'react';
import { Container, Navbar, Nav, Button } from 'react-bootstrap';
import { Outlet, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const AdminLayout = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    navigate('/admin/login');
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand href="/admin/dashboard">Admin Dashboard</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link href="/admin/dashboard">Dashboard</Nav.Link>
            </Nav>
            <Nav>
              <Navbar.Text className="me-3">
                Welcome, {user?.name}
              </Navbar.Text>
              <Button variant="outline-light" onClick={handleLogout}>
                Logout
              </Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <main className="flex-grow-1 py-4">
        <Container>
          <Outlet />
        </Container>
      </main>

      <footer className="bg-dark text-white py-3">
        <Container>
          <p className="text-center mb-0">© 2024 Doctor Appointment System</p>
        </Container>
      </footer>
    </div>
  );
};

export default AdminLayout;