// frontend/src/components/patient/DoctorCard.js
import React, { useState } from 'react';
import { Card, Button, Badge, Modal, Form, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const DoctorCard = ({ doctor }) => {
  const { user } = useAuth();
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [symptoms, setSymptoms] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const fetchAvailableSlots = async (date) => {
    try {
      setLoadingSlots(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/v1/doctors/${doctor._id}/availability`,
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
    } finally {
      setLoadingSlots(false);
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
    if (!user) {
      toast.error('Please login to book an appointment');
      return;
    }

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
          doctorId: doctor._id,
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
        // Reset form
        setSelectedDate('');
        setSelectedSlot('');
        setSymptoms('');
        setAvailableSlots([]);
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

  return (
    <>
      <Card className="h-100">
        <Card.Body>
          <Card.Title className="text-center">
            Dr. {doctor.name || 'Unknown Doctor'}
          </Card.Title>
          <Card.Subtitle className="mb-2 text-muted text-center">
            {doctor.specialization || 'General Practitioner'}
          </Card.Subtitle>
          <div className="d-flex justify-content-center mb-3">
            <Badge bg="info" className="me-2">
              {doctor.experience || 0} yrs exp
            </Badge>
            <Badge bg="success">
              ₹{doctor.fees || 0} fee
            </Badge>
          </div>
          <Card.Text className="text-center">
            {doctor.bio ? (doctor.bio.length > 100 
              ? `${doctor.bio.substring(0, 100)}...` 
              : doctor.bio) : 'No bio available'}
          </Card.Text>
          <div className="d-grid">
            <Button 
              onClick={() => setShowBookingModal(true)}
              variant="primary"
            >
              Book Appointment
            </Button>
          </div>
        </Card.Body>
      </Card>

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
                {loadingSlots ? (
                  <div className="text-center">
                    <Spinner animation="border" size="sm" />
                    <p className="mt-2">Loading available slots...</p>
                  </div>
                ) : (
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
                )}
              </Form.Group>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Symptoms</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Describe your symptoms"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBookingModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleBooking}
            disabled={bookingLoading}
          >
            {bookingLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Booking...
              </>
            ) : (
              'Book Appointment'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default DoctorCard;