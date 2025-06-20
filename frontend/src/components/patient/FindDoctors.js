// frontend/src/components/patient/FindDoctors.js
import { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Form, Spinner, Alert, Button, Card } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import DoctorCard from './DoctorCard';

const FindDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [availableDay, setAvailableDay] = useState('');

  const fetchDoctors = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Please login to view doctors');
      }

      const params = new URLSearchParams();
      if (searchTerm) params.append('name', searchTerm);
      if (specialization) params.append('specialization', specialization);
      if (availableDay) params.append('availableDay', availableDay);
      
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/v1/users/doctors?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data && response.data.success) {
        setDoctors(response.data.data || []);
        if (response.data.data.length === 0) {
          toast.info('No doctors found matching your criteria');
        }
      } else {
        throw new Error(response.data.message || 'Failed to fetch doctors');
      }
    } catch (err) {
      console.error('Error fetching doctors:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Error fetching doctors. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, specialization, availableDay]);

  // Initial load
  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const handleSearch = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    fetchDoctors();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    switch (name) {
      case 'searchTerm':
        setSearchTerm(value);
        break;
      case 'specialization':
        setSpecialization(value);
        break;
      case 'availableDay':
        setAvailableDay(value);
        break;
      default:
        break;
    }
  };

  const specializations = [
    'Cardiologist',
    'Dermatologist',
    'Neurologist',
    'Pediatrician',
    'Orthopedist',
    'Gynecologist',
    'Ophthalmologist',
    'ENT Specialist',
    'General Practitioner'
  ];

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <Container className="py-4" style={{ minHeight: 'calc(100vh - 200px)' }}>
      <Card className="mb-4">
        <Card.Body>
          <h2 className="mb-4">Find Doctors</h2>
          
          <Form onSubmit={handleSearch}>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Control
                    type="text"
                    name="searchTerm"
                    placeholder="Search by name"
                    value={searchTerm}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Select
                    name="specialization"
                    value={specialization}
                    onChange={handleInputChange}
                  >
                    <option value="">All Specializations</option>
                    {specializations.map(spec => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Select
                    name="availableDay"
                    value={availableDay}
                    onChange={handleInputChange}
                  >
                    <option value="">All Days</option>
                    {days.map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={2}>
                <Button 
                  variant="primary" 
                  type="submit"
                  className="w-100"
                >
                  Search
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      <div style={{ minHeight: '400px' }}>
        {loading ? (
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
            <div className="text-center">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
              <p className="mt-2">Loading doctors...</p>
            </div>
          </div>
        ) : error ? (
          <Alert variant="danger" className="text-center">{error}</Alert>
        ) : doctors.length === 0 ? (
          <Alert variant="info" className="text-center">No doctors found matching your criteria</Alert>
        ) : (
          <Row xs={1} md={2} lg={3} className="g-4">
            {doctors.map(doctor => (
              <Col key={doctor._id}>
                <DoctorCard doctor={doctor} />
              </Col>
            ))}
          </Row>
        )}
      </div>
    </Container>
  );
};

export default FindDoctors;