// frontend/src/pages/admin/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Tab, Nav, Table, Button, Modal, Form, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import AdminUsers from '../../components/admin/AdminUsers';
import AdminDoctors from '../../components/admin/AdminDoctors';
import AdminAppointments from '../../components/admin/AdminAppointments';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    specialization: '',
    experience: '',
    fees: '',
    availableDays: [],
    availableSlots: []
  });
  const [stats, setStats] = useState({
    totalAppointments: 0,
    totalRevenue: 0,
    pendingAppointments: 0,
    completedAppointments: 0
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch doctors
      const doctorsRes = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/v1/admin/doctors`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Fetch appointments
      const appointmentsRes = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/v1/admin/appointments`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Fetch stats
      const statsRes = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/v1/admin/stats`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setDoctors(doctorsRes.data.data || []);
      setAppointments(appointmentsRes.data.data || []);
      setStats(statsRes.data.data || {});
    } catch (err) {
      console.error('Error fetching data:', err);
      toast.error('Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorModal = (doctor = null) => {
    if (doctor) {
      setSelectedDoctor(doctor);
      setFormData({
        name: doctor.name,
        email: doctor.email,
        specialization: doctor.specialization,
        experience: doctor.experience,
        fees: doctor.fees,
        availableDays: doctor.availableDays || [],
        availableSlots: doctor.availableSlots || []
      });
    } else {
      setSelectedDoctor(null);
      setFormData({
        name: '',
        email: '',
        specialization: '',
        experience: '',
        fees: '',
        availableDays: [],
        availableSlots: []
      });
    }
    setShowDoctorModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (selectedDoctor) {
        // Update doctor
        await axios.put(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/v1/admin/doctors/${selectedDoctor._id}`,
          formData,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        toast.success('Doctor updated successfully');
      } else {
        // Create doctor
        await axios.post(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/v1/admin/doctors`,
          formData,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        toast.success('Doctor added successfully');
      }
      setShowDoctorModal(false);
      fetchData();
    } catch (err) {
      console.error('Error saving doctor:', err);
      toast.error(err.response?.data?.message || 'Error saving doctor');
    }
  };

  const handleDeleteDoctor = async (doctorId) => {
    if (window.confirm('Are you sure you want to delete this doctor?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/v1/admin/doctors/${doctorId}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        toast.success('Doctor deleted successfully');
        fetchData();
      } catch (err) {
        console.error('Error deleting doctor:', err);
        toast.error(err.response?.data?.message || 'Error deleting doctor');
      }
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <h2 className="mb-4">Admin Dashboard</h2>

      {/* Stats Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card>
            <Card.Body>
              <h5>Total Appointments</h5>
              <h3>{stats.totalAppointments}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card>
            <Card.Body>
              <h5>Total Revenue</h5>
              <h3>₹{stats.totalRevenue}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card>
            <Card.Body>
              <h5>Pending Appointments</h5>
              <h3>{stats.pendingAppointments}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card>
            <Card.Body>
              <h5>Completed Appointments</h5>
              <h3>{stats.completedAppointments}</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Doctors Section */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h4>Doctors</h4>
            </Card.Header>
            <Card.Body>
              <Table responsive>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Specialization</th>
                    <th>Experience</th>
                    <th>Fees</th>
                  </tr>
                </thead>
                <tbody>
                  {doctors.map(doctor => (
                    <tr key={doctor._id}>
                      <td>{doctor.user?.name || 'N/A'}</td>
                      <td>{doctor.specialization}</td>
                      <td>{doctor.experience} years</td>
                      <td>₹{doctor.fees}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Appointments Section */}
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h4>Appointments</h4>
            </Card.Header>
            <Card.Body>
              <Table responsive>
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map(appointment => (
                    <tr key={appointment._id}>
                      <td>{appointment.patient?.name || 'N/A'}</td>
                      <td>{appointment.doctor?.user?.name || 'N/A'}</td>
                      <td>{new Date(appointment.date).toLocaleDateString()}</td>
                      <td>{appointment.time}</td>
                      <td>{appointment.status}</td>
                      <td>{appointment.paymentStatus}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Doctor Modal */}
      <Modal show={showDoctorModal} onHide={() => setShowDoctorModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{selectedDoctor ? 'Edit Doctor' : 'Add Doctor'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Specialization</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Experience (years)</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Fees</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.fees}
                    onChange={(e) => setFormData({ ...formData, fees: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Button variant="primary" type="submit">
              {selectedDoctor ? 'Update Doctor' : 'Add Doctor'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default AdminDashboard;