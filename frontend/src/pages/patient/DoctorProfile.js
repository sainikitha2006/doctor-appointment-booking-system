import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Form, Spinner, Badge, Modal, Alert } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const DoctorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [symptoms, setSymptoms] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    const fetchDoctorDetails = async () => {
      try {
        setLoading(true);
        setError('');
        const token = localStorage.getItem('token');
        
        // Fetch doctor details
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/v1/users/doctors/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (response.data && response.data.success) {
          const doctorData = response.data.data;
          setDoctor({
            ...doctorData,
            name: doctorData.user?.name || 'Unknown Doctor',
            email: doctorData.user?.email,
            phone: doctorData.user?.phone
          });
        } else {
          throw new Error('Failed to fetch doctor details');
        }
      } catch (err) {
        console.error('Error fetching doctor details:', err);
        setError(err.response?.data?.message || 'Error fetching doctor details');
        navigate('/patient/find-doctors');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorDetails();
  }, [id, navigate]);

  const fetchAvailableSlots = async (date) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/v1/doctors/${id}/availability`,
        {
          params: { date },
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data && response.data.success) {
        setAvailableSlots(response.data.data);
        if (response.data.data.length === 0) {
          toast.info('No slots available for the selected date');
        }
      } else {
        throw new Error('Failed to fetch available slots');
      }
    } catch (err) {
      console.error('Error fetching slots:', err);
      toast.error(err.response?.data?.message || 'Error fetching available slots');
      setAvailableSlots([]);
    }
  };

  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    setSelectedSlot('');
    if (date) {
      fetchAvailableSlots(date);
    }
  };

  const handleBooking = async () => {
    if (!selectedSlot || !symptoms) {
      toast.error('Please select a time slot and describe your symptoms');
      return;
    }

    try {
      setBookingLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/v1/appointments`,
        {
          doctorId: id,
          date: selectedDate,
          time: selectedSlot,
          symptoms,
          paymentAmount: doctor.fees
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data && response.data.success) {
        toast.success('Appointment booked successfully!');
        setShowBookingModal(false);
        navigate('/patient/appointments');
      } else {
        throw new Error('Failed to book appointment');
      }
    } catch (err) {
      console.error('Error booking appointment:', err);
      toast.error(err.response?.data?.message || 'Error booking appointment');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center p-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="m-3">
        {error}
      </Alert>
    );
  }

  if (!doctor) {
    return (
      <Container className="mt-5">
        <Card>
          <Card.Body className="text-center">
            <h4>Doctor not found</h4>
            <Button variant="primary" onClick={() => navigate('/patient/find-doctors')}>
              Back to Find Doctors
            </Button>
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
                src={doctor.avatar?.url || '/default-avatar.png'}
                alt={doctor.name}
                className="rounded-circle mb-3"
                style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                onError={(e) => {
                  e.target.src = '/default-avatar.png';
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
              {user?.role === 'patient' && (
                <Button
                  variant="primary"
                  onClick={() => setShowBookingModal(true)}
                  className="mt-3"
                >
                  Book Appointment
                </Button>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={8}>
          <Card>
            <Card.Header>
              <h4>About Doctor</h4>
            </Card.Header>
            <Card.Body>
              <h5>Qualifications</h5>
              <p>{Array.isArray(doctor.qualifications) ? doctor.qualifications.join(', ') : doctor.qualifications}</p>
              
              <h5>Bio</h5>
              <p>{doctor.bio || 'No bio available'}</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Booking Modal */}
      <Modal show={showBookingModal} onHide={() => setShowBookingModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Book Appointment with Dr. {doctor.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Select Date</Form.Label>
              <Form.Control
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                min={new Date().toISOString().split('T')[0]}
              />
            </Form.Group>

            {selectedDate && (
              <Form.Group className="mb-3">
                <Form.Label>Available Time Slots</Form.Label>
                <div className="d-flex flex-wrap gap-2">
                  {availableSlots.length > 0 ? (
                    availableSlots.map((slot) => (
                      <Button
                        key={slot}
                        variant={selectedSlot === slot ? 'primary' : 'outline-primary'}
                        onClick={() => setSelectedSlot(slot)}
                      >
                        {slot}
                      </Button>
                    ))
                  ) : (
                    <p className="text-muted">No slots available for this date</p>
                  )}
                </div>
              </Form.Group>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Symptoms</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Describe your symptoms..."
              />
            </Form.Group>

            <div className="alert alert-info">
              Consultation Fee: ₹{doctor.fees} (to be paid after booking)
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBookingModal(false)}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={handleBooking}
            disabled={!selectedSlot || !symptoms || bookingLoading}
          >
            {bookingLoading ? 'Booking...' : 'Book Appointment'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default DoctorProfile; 