import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Badge, Spinner, Button, Table } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchDoctorProfile = async () => {
      try {
        setLoading(true);
        setError('');
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('Please login to access dashboard');
          setLoading(false);
          return;
        }

        // Fetch doctor profile
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/v1/users/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (response.data && response.data.success) {
          const userData = response.data.data;
          if (userData.doctor) {
            setDoctor({
              ...userData.doctor,
              name: userData.name,
              email: userData.email,
              phone: userData.phone
            });
          } else {
            setError('Welcome to Doctor Dashboard');
          }
        } else {
          throw new Error('Failed to fetch doctor profile');
        }
      } catch (err) {
        console.error('Error fetching doctor profile:', err);
        setError(err.response?.data?.message || 'Error fetching doctor profile');
        if (err.response?.status === 401) {
          toast.error('Please login to access dashboard');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorProfile();
  }, [user]);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!doctor) return;
      
      try {
        setLoadingAppointments(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/v1/appointments/doctor/${doctor._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (response.data && response.data.success) {
          setAppointments(response.data.data);
        } else {
          throw new Error('Failed to fetch appointments');
        }
      } catch (err) {
        console.error('Error fetching appointments:', err);
        toast.error(err.response?.data?.message || 'Error fetching appointments');
      } finally {
        setLoadingAppointments(false);
      }
    };

    fetchAppointments();
  }, [doctor]);

  const handleStatusChange = async (id, status) => {
    try {
      setUpdating(true);
      const token = localStorage.getItem('token');
      const res = await axios.put(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/v1/appointments/${id}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (res.data.success) {
        setAppointments(appointments.map(appt => 
          appt._id === id ? res.data.data : appt
        ));
        toast.success(`Appointment ${status} successfully`);
      } else {
        toast.error(res.data.message || 'Failed to update appointment');
      }
    } catch (err) {
      console.error('Error updating appointment:', err);
      toast.error(err.response?.data?.message || 'Error updating appointment');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center p-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Card>
          <Card.Body className="text-center">
            <h4>{error}</h4>
            {error === 'Please login to access dashboard' && (
              <Button variant="primary" href="/login">
                Login
              </Button>
            )}
          </Card.Body>
        </Card>
      </Container>
    );
  }

  if (!doctor) {
    return (
      <Container className="mt-5">
        <Card>
          <Card.Body className="text-center">
            <h4>Welcome to Doctor Dashboard</h4>
            <p>Please complete your profile setup to get started</p>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row>
        <Col md={4}>
          <Card className="mb-4">
            <Card.Body className="text-center">
              <img
                src={doctor.avatar?.url || '/default_avatar.jpg'}
                alt={doctor.name}
                className="rounded-circle mb-3"
                style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                onError={(e) => {
                  e.target.src = '/default_avatar.jpg';
                }}
              />
              <h4>Dr. {doctor.name}</h4>
              <p className="text-muted">{doctor.specialization}</p>
              <div className="mb-3">
                <Badge bg="info" className="me-2">
                  {doctor.experience} yrs exp
                </Badge>
                <Badge bg="success">
                  ₹{doctor.fees} fee
                </Badge>
              </div>
              <div className="text-start">
                <p><strong>Email:</strong> {doctor.email}</p>
                <p><strong>Phone:</strong> {doctor.phone}</p>
                <p><strong>Address:</strong> {doctor.address}</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={8}>
          <Card>
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <h4 className="mb-0">Dashboard</h4>
              </div>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5>Your Appointments</h5>
                <Badge bg="primary" pill>
                  {appointments.length} Total
                </Badge>
              </div>
              {loadingAppointments ? (
                <div className="text-center">
                  <Spinner animation="border" />
                  <p className="mt-2">Loading appointments...</p>
                </div>
              ) : appointments.length > 0 ? (
                <div className="table-responsive">
                  <Table striped hover>
                    <thead>
                      <tr>
                        <th>Patient</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Symptoms</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map((appointment) => (
                        <tr key={appointment._id}>
                          <td>{appointment.patient?.name || 'Unknown Patient'}</td>
                          <td>{new Date(appointment.date).toLocaleDateString()}</td>
                          <td>{appointment.time}</td>
                          <td>{appointment.symptoms}</td>
                          <td>
                            <Badge bg={
                              appointment.status === 'pending' ? 'warning' :
                              appointment.status === 'confirmed' ? 'success' :
                              appointment.status === 'cancelled' ? 'danger' : 'secondary'
                            }>
                              {appointment.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <div className="text-center">
                  <p>No appointments found</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default DoctorDashboard;