// frontend/src/components/Footer.js
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer className="bg-dark text-white py-4 mt-auto">
      <Container>
        <Row>
          <Col md={4}>
            <h5>About Us</h5>
            <p>
              Doctor Appointment System helps patients find and book appointments 
              with doctors easily and quickly.
            </p>
          </Col>
          <Col md={4}>
            <h5>Quick Links</h5>
            <ul className="list-unstyled">
              <li><a href="/" className="text-white">Home</a></li>
              <li><a href="/login" className="text-white">Login</a></li>
              <li><a href="/register" className="text-white">Register</a></li>
            </ul>
          </Col>
          <Col md={4}>
            <h5>Contact</h5>
            <address>
              <strong>Doctor Appointment System</strong><br />
              123 Medical Street<br />
              Health City, HC 12345<br />
              <abbr title="Phone">P:</abbr> (123) 456-7890
            </address>
          </Col>
        </Row>
        <hr />
        <Row>
          <Col className="text-center">
            <p className="mb-0">&copy; {new Date().getFullYear()} Doctor Appointment System. All rights reserved.</p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;