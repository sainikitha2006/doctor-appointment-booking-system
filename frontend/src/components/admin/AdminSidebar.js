// src/components/admin/AdminSidebar.js
import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';

const AdminSidebar = () => {
  const location = useLocation();

  return (
    <Nav className="flex-column bg-dark text-white p-3" style={{ width: '250px', minHeight: '100vh' }}>
      <Nav.Item className="mb-4">
        <h4 className="text-white">Admin Panel</h4>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link 
          as={Link} 
          to="/admin/dashboard" 
          active={location.pathname === '/admin/dashboard'}
          className="text-white"
        >
          Dashboard
        </Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link 
          as={Link} 
          to="/admin/users" 
          active={location.pathname.startsWith('/admin/users')}
          className="text-white"
        >
          Manage Users
        </Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link 
          as={Link} 
          to="/admin/doctors" 
          active={location.pathname.startsWith('/admin/doctors')}
          className="text-white"
        >
          Manage Doctors
        </Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link 
          as={Link} 
          to="/admin/appointments" 
          active={location.pathname.startsWith('/admin/appointments')}
          className="text-white"
        >
          View Appointments
        </Nav.Link>
      </Nav.Item>
    </Nav>
  );
};

export default AdminSidebar;