// frontend/src/components/patient/PatientSidebar.js
import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';

const PatientSidebar = () => {
  const location = useLocation();

  return (
    <Nav className="flex-column bg-dark text-white p-3" style={{ width: '250px', minHeight: '100vh' }}>
      <Nav.Item className="mb-4">
        <h4 className="text-white">Patient Panel</h4>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link 
          as={Link} 
          to="/patient/dashboard" 
          active={location.pathname === '/patient/dashboard'}
          className="text-white"
        >
          Dashboard
        </Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link 
          as={Link} 
          to="/patient/appointments" 
          active={location.pathname.startsWith('/patient/appointments')}
          className="text-white"
        >
          My Appointments
        </Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link 
          as={Link} 
          to="/patient/find-doctors" 
          active={location.pathname.startsWith('/patient/find-doctors')}
          className="text-white"
        >
          Find Doctors
        </Nav.Link>
      </Nav.Item>
    </Nav>
  );
};

export default PatientSidebar;