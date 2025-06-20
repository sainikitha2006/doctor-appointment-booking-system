// frontend/src/pages/Home.js
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} className="text-center">
          <h1 className="mb-4">Welcome to Doctor Appointment System</h1>
          <p className="lead mb-5">
            Book appointments with your favorite doctors easily and quickly
          </p>
          
          <Row className="g-4">
            <Col md={6}>
              <Card className="h-100">
                <Card.Body>
                  <Card.Title>Patient</Card.Title>
                  <Card.Text>
                    Register as patient to book appointments with doctors
                  </Card.Text>
                  <Button as={Link} to="/register/patient" variant="primary">
                    Register as Patient
                  </Button>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="h-100">
                <Card.Body>
                  <Card.Title>Doctor</Card.Title>
                  <Card.Text>
                    Register as doctor to manage your appointments
                  </Card.Text>
                  <Button as={Link} to="/register/doctor" variant="primary">
                    Register as Doctor
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default Home;