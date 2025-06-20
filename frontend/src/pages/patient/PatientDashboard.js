// frontend/src/pages/patient/PatientDashboard.js
import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Tab, Nav } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import PatientAppointments from '../../components/patient/PatientAppointments';
import PatientProfile from '../../components/patient/PatientProfile';
import FindDoctors from '../../components/patient/FindDoctors';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('appointments');

  return (
    <Container fluid>
      <Row>
        <Col md={3}>
          <Card className="mb-4">
            <Card.Body className="text-center">
              <img
                src={user.avatar?.url || '/images/default-avatar.png'}
                alt="Profile"
                className="rounded-circle mb-3"
                width="150"
                height="150"
              />
              <h4>{user.name}</h4>
              <p className="text-muted">Patient</p>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <Nav variant="pills" className="flex-column">
                <Nav.Item>
                  <Nav.Link
                    eventKey="appointments"
                    active={activeTab === 'appointments'}
                    onClick={() => setActiveTab('appointments')}
                  >
                    My Appointments
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link
                    eventKey="find-doctors"
                    active={activeTab === 'find-doctors'}
                    onClick={() => setActiveTab('find-doctors')}
                  >
                    Find Doctors
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link
                    eventKey="profile"
                    active={activeTab === 'profile'}
                    onClick={() => setActiveTab('profile')}
                  >
                    Profile Settings
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </Card.Body>
          </Card>
        </Col>

        <Col md={9}>
          {activeTab === 'appointments' && <PatientAppointments />}
          {activeTab === 'find-doctors' && <FindDoctors />}
          {activeTab === 'profile' && <PatientProfile />}
        </Col>
      </Row>
    </Container>
  );
};

export default PatientDashboard;