// frontend/src/components/Header.js
import { Navbar, Container, Nav, Button, Image } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Navbar bg="primary" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">
          Doctor Appointment
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            {isAuthenticated() && user?.role === 'patient' && (
              <Nav.Link as={Link} to="/patient/dashboard">Dashboard</Nav.Link>
            )}
            {isAuthenticated() && user?.role === 'doctor' && (
              <Nav.Link as={Link} to="/doctor/dashboard">Dashboard</Nav.Link>
            )}
            {isAuthenticated() && user?.role === 'admin' && (
              <Nav.Link as={Link} to="/admin/dashboard">Dashboard</Nav.Link>
            )}
          </Nav>
          <Nav>
            {isAuthenticated() ? (
              <>
                <Navbar.Text className="me-3">
                  <Image
                    src={user?.avatar?.url || '/images/default-avatar.png'}
                    roundedCircle
                    width="30"
                    height="30"
                    className="me-2"
                  />
                  {user?.name}
                </Navbar.Text>
                <Button variant="outline-light" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="outline-light" 
                  className="me-2" 
                  as={Link} 
                  to="/login"
                >
                  Login
                </Button>
                <Button variant="light" as={Link} to="/register">
                  Register
                </Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;