import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const PatientAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/v1/appointments/patient`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (res.data.success) {
        setAppointments(res.data.data || []);
      } else {
        toast.error(res.data.message || 'Failed to fetch appointments');
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
      toast.error(err.response?.data?.message || 'Error fetching appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/v1/appointments/${appointmentId}`,
        { status: 'cancelled' },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      toast.success('Appointment cancelled successfully');
      fetchAppointments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error cancelling appointment');
    }
  };

  const handleViewPrescription = (appointmentId) => {
    navigate(`/patient/prescription/${appointmentId}`);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge bg="warning">Pending</Badge>;
      case 'confirmed':
        return <Badge bg="success">Confirmed</Badge>;
      case 'completed':
        return <Badge bg="info">Completed</Badge>;
      case 'cancelled':
        return <Badge bg="danger">Cancelled</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <Container>
        <Row className="justify-content-center">
          <Col md={8}>
            <Card>
              <Card.Body className="text-center">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
                <p className="mt-2">Loading appointments...</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container>
      <Row className="justify-content-center">
        <Col md={10}>
          <Card>
            <Card.Header>
              <h4>My Appointments</h4>
            </Card.Header>
            <Card.Body>
              {appointments.length === 0 ? (
                <p className="text-center">No appointments found</p>
              ) : (
                <Table responsive>
                  <thead>
                    <tr>
                      <th>Doctor</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((appointment) => (
                      <tr key={appointment._id}>
                        <td>Dr. {appointment.doctor?.user?.name || 'N/A'}</td>
                        <td>{new Date(appointment.date).toLocaleDateString()}</td>
                        <td>{appointment.time}</td>
                        <td>{getStatusBadge(appointment.status)}</td>
                        <td>
                          <div className="d-flex gap-2">
                            {appointment.status === 'pending' && (
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleCancelAppointment(appointment._id)}
                              >
                                Cancel
                              </Button>
                            )}
                            {appointment.status === 'completed' && (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleViewPrescription(appointment._id)}
                              >
                                View Prescription
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PatientAppointments; 