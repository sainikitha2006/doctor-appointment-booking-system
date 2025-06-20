// frontend/src/pages/auth/Register.js
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card } from 'react-bootstrap';

const Register = () => {
  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} className="text-center">
          <h1 className="mb-4">Register</h1>
          <Row className="g-4">
            <Col md={6}>
              <Card className="h-100">
                <Card.Body>
                  <Card.Title>Patient Registration</Card.Title>
                  <Card.Text>
                    Register as patient to book appointments with doctors
                  </Card.Text>
                  <Link to="/register/patient" className="btn btn-primary">
                    Register as Patient
                  </Link>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="h-100">
                <Card.Body>
                  <Card.Title>Doctor Registration</Card.Title>
                  <Card.Text>
                    Register as doctor to manage your appointments
                  </Card.Text>
                  <Link to="/register/doctor" className="btn btn-primary">
                    Register as Doctor
                  </Link>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          <div className="mt-4">
            Already have an account? <Link to="/login">Login</Link>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;