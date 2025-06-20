// frontend/src/components/doctor/DoctorAvailability.js
import { useState, useEffect } from 'react';
import { Card, Button, Form, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';

const DoctorAvailability = ({ doctor }) => {
  const [days, setDays] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const allSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
  ];

  useEffect(() => {
    if (doctor) {
      setDays(doctor.availableDays || []);
      setSlots(doctor.availableSlots || []);
    }
  }, [doctor]);

  const toggleDay = (day) => {
    if (days.includes(day)) {
      setDays(days.filter(d => d !== day));
    } else {
      setDays([...days, day]);
    }
  };

  const toggleSlot = (slot) => {
    if (slots.includes(slot)) {
      setSlots(slots.filter(s => s !== slot));
    } else {
      setSlots([...slots, slot]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put('/api/v1/doctors/me/availability', {
        availableDays: days,
        availableSlots: slots
      });
      toast.success('Availability updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error updating availability');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <Card.Header>
        <h4>Availability Settings</h4>
      </Card.Header>
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-4">
            <Form.Label>Available Days</Form.Label>
            <Row>
              {allDays.map(day => (
                <Col key={day} xs={6} sm={4} md={3} className="mb-2">
                  <Button
                    variant={days.includes(day) ? 'primary' : 'outline-primary'}
                    onClick={() => toggleDay(day)}
                    className="w-100"
                  >
                    {day}
                  </Button>
                </Col>
              ))}
            </Row>
          </Form.Group>
          <Form.Group className="mb-4">
            <Form.Label>Available Time Slots</Form.Label>
            <Row>
              {allSlots.map(slot => (
                <Col key={slot} xs={6} sm={4} md={3} className="mb-2">
                  <Button
                    variant={slots.includes(slot) ? 'primary' : 'outline-primary'}
                    onClick={() => toggleSlot(slot)}
                    className="w-100"
                  >
                    {slot}
                  </Button>
                </Col>
              ))}
            </Row>
          </Form.Group>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Availability'}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default DoctorAvailability;