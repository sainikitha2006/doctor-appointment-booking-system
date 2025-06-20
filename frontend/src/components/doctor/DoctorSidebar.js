import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';

const DoctorSidebar = () => {
  const location = useLocation();

  return (
    <Nav className="flex-column bg-dark text-white p-3" style={{ width: '250px', minHeight: '100vh' }}>
      <Nav.Item className="mb-4">
        <h4 className="text-white">Doctor Panel</h4>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link 
          as={Link} 
          to="/doctor/appointments" 
          active={location.pathname.startsWith('/doctor/appointments')}
          className="text-white"
        >
          My Appointments
        </Nav.Link>
      </Nav.Item>
    </Nav>
  );
};

export default DoctorSidebar; 