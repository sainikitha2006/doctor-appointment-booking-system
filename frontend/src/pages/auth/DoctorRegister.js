// src/pages/auth/DoctorRegister.js
import { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const DoctorRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    specialization: '',
    qualifications: '',
    experience: '',
    fees: '',
    clinicAddress: '',
    availableDays: [],
    availableSlots: []
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    if (formData.availableDays.length === 0) {
      setError("Please select at least one available day");
      return;
    }
    if (formData.availableSlots.length === 0) {
      setError("Please select at least one available time slot");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/v1/auth/register`,
        {
          ...formData,
          role: 'doctor'
        }
      );
      
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        if (login) {
          await login(response.data.token);
        }
        toast.success('Registration successful!');
        navigate('/doctor/dashboard');
      } else {
        setError(response.data.message || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCheckboxChange = (e) => {
    const { name, value, checked } = e.target;
    if (name === 'availableDays') {
      setFormData(prev => ({
        ...prev,
        availableDays: checked
          ? [...prev.availableDays, value]
          : prev.availableDays.filter(day => day !== value)
      }));
    } else if (name === 'availableSlots') {
      setFormData(prev => ({
        ...prev,
        availableSlots: checked
          ? [...prev.availableSlots, value]
          : prev.availableSlots.filter(slot => slot !== value)
      }));
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card>
            <Card.Body>
              <h2 className="text-center mb-4">Doctor Registration</h2>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Specialization</Form.Label>
                  <Form.Control
                    type="text"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Qualifications (comma separated)</Form.Label>
                  <Form.Control
                    type="text"
                    name="qualifications"
                    value={formData.qualifications}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Years of Experience</Form.Label>
                  <Form.Control
                    type="number"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Consultation Fees (₹)</Form.Label>
                  <Form.Control
                    type="number"
                    name="fees"
                    value={formData.fees}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Clinic Address</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="clinicAddress"
                    value={formData.clinicAddress}
                    onChange={handleChange}
                    required
                    placeholder="Enter your clinic's complete address"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Available Days</Form.Label>
                  <div className="d-flex flex-wrap gap-2">
                    {days.map(day => (
                      <Form.Check
                        key={day}
                        type="checkbox"
                        id={`day-${day}`}
                        label={day}
                        name="availableDays"
                        value={day}
                        checked={formData.availableDays.includes(day)}
                        onChange={handleCheckboxChange}
                      />
                    ))}
                  </div>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Available Time Slots</Form.Label>
                  <div className="d-flex flex-wrap gap-2">
                    {timeSlots.map(slot => (
                      <Form.Check
                        key={slot}
                        type="checkbox"
                        id={`slot-${slot}`}
                        label={slot}
                        name="availableSlots"
                        value={slot}
                        checked={formData.availableSlots.includes(slot)}
                        onChange={handleCheckboxChange}
                      />
                    ))}
                  </div>
                </Form.Group>

                <Button
                  type="submit"
                  className="w-100 mt-3"
                  disabled={loading}
                >
                  {loading ? 'Registering...' : 'Register'}
                </Button>
              </Form>
              <div className="text-center mt-3">
                Already have an account? <Link to="/login">Login</Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default DoctorRegister;