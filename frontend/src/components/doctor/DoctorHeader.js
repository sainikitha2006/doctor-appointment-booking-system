// frontend/src/components/doctor/DoctorHeader.js
import { Navbar, Container, Nav, Button, Image } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';

const DoctorHeader = () => {
  const { user, logout } = useAuth();

  return (
    <Navbar bg="light" expand="lg">
      <Container fluid>
        <Navbar.Brand>Doctor Dashboard</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
          <Nav>
            <Navbar.Text className="me-3">
              <Image
                src={user?.avatar?.url || '/images/default-avatar.png'}
                roundedCircle
                width="30"
                height="30"
                className="me-2"
              />
              Dr. {user?.name}
            </Navbar.Text>
            <Button variant="outline-danger" onClick={logout}>
              Logout
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default DoctorHeader;