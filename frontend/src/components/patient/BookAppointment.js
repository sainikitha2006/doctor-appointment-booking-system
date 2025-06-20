// frontend/src/components/patient/BookAppointment.js
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import { toast } from 'react-toastify';

const BookAppointment = ({ doctor, show, onHide }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const { user } = useAuth();
  const [date, setDate] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [paymentModal, setPaymentModal] = useState(false);
  const [appointmentData, setAppointmentData] = useState(null);

  useEffect(() => {
    if (show && doctor) {
      fetchAvailableSlots();
    }
  }, [show, date]);

  const fetchAvailableSlots = async () => {
    try {
      const res = await axios.get(`/api/v1/doctors/${doctor._id}/availability`, {
        params: { date: date.toISOString().split('T')[0] }
      });
      setAvailableSlots(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error fetching available slots');
    }
  };

  const onSubmit = (data) => {
    setAppointmentData({
      ...data,
      date: date.toISOString().split('T')[0],
      time: selectedSlot,
      doctor: doctor._id,
      paymentAmount: doctor.fees
    });
    setPaymentModal(true);
  };

  const handlePayment = async (paymentSuccess) => {
    try {
      if (paymentSuccess) {
        const res = await axios.post('/api/v1/appointments', {
          ...appointmentData,
          paymentStatus: 'paid'
        });
        toast.success('Appointment booked successfully!');
        onHide();
        reset();
      } else {
        toast.error('Payment failed. Please try again.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error booking appointment');
    } finally {
      setPaymentModal(false);
    }
  };

  return (
    <>
      <Modal show={show} onHide={onHide} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Book Appointment with Dr. {doctor.user.name}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Modal.Body>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Date</Form.Label>
                  <DatePicker
                    selected={date}
                    onChange={(date) => setDate(date)}
                    minDate={new Date()}
                    className="form-control"
                    filterDate={(date) => {
                      const day = date.getDay();
                      const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day];
                      return doctor.availableDays.includes(dayName);
                    }}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Available Time Slots</Form.Label>
                  {availableSlots.length > 0 ? (
                    <div className="d-flex flex-wrap gap-2">
                      {availableSlots.map((slot) => (
                        <Button
                          key={slot}
                          variant={selectedSlot === slot ? 'primary' : 'outline-primary'}
                          onClick={() => setSelectedSlot(slot)}
                        >
                          {slot}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <Alert variant="info">No available slots for this date</Alert>
                  )}
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Symptoms</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                {...register('symptoms', { required: 'Symptoms are required' })}
                isInvalid={!!errors.symptoms}
              />
              <Form.Control.Feedback type="invalid">
                {errors.symptoms?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <Alert variant="info">
              Consultation Fee: ₹{doctor.fees} (to be paid after booking)
            </Alert>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={onHide}>
              Close
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={!selectedSlot || availableSlots.length === 0}
            >
              Book Appointment
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Payment Modal */}
      <Modal show={paymentModal} onHide={() => setPaymentModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Complete Payment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Doctor: Dr. {doctor.user.name}</p>
          <p>Date: {appointmentData?.date}</p>
          <p>Time: {appointmentData?.time}</p>
          <p>Amount: ₹{doctor.fees}</p>
          <div className="d-grid gap-2 mt-4">
            <Button variant="success" onClick={() => handlePayment(true)}>
              Simulate Successful Payment
            </Button>
            <Button variant="danger" onClick={() => handlePayment(false)}>
              Simulate Failed Payment
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default BookAppointment;