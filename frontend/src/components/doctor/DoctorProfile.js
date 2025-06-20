import React, { useEffect, useState } from 'react';
import { Card, Form, Button, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';

const DoctorProfile = ({ doctor }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    specialization: '',
    qualifications: '',
    experience: '',
    fees: '',
    bio: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        console.log('Fetching doctor with ID:', doctor?._id);
        const token = localStorage.getItem('token');
        console.log('Using token:', token ? 'Token exists' : 'No token found');

        if (!doctor?._id) {
          throw new Error('No doctor ID provided');
        }

        const res = await axios.get(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/v1/users/doctors/${doctor._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        console.log('Full API Response:', res);
        console.log('Response data:', res.data);

        if (res.data.success) {
          const doctorData = res.data.data;
          console.log('Doctor data received:', doctorData);
          setFormData({
            name: doctorData.name || '',
            email: doctorData.email || '',
            phone: doctorData.phone || '',
            address: doctorData.address || '',
            specialization: doctorData.specialization || '',
            qualifications: doctorData.qualifications || '',
            experience: doctorData.experience || '',
            fees: doctorData.fees || '',
            bio: doctorData.bio || ''
          });
        } else {
          throw new Error(res.data.message || 'Failed to fetch doctor profile');
        }
      } catch (err) {
        console.error('Error fetching doctor profile:', err);
        toast.error(err.response?.data?.message || 'Error fetching doctor profile');
      }
    };

    if (doctor?._id) {
      fetchDoctor();
    }
  }, [doctor]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/v1/users/doctors/${doctor._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (res.data.success) {
        toast.success('Profile updated successfully');
      } else {
        throw new Error(res.data.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error(err.response?.data?.message || 'Error updating profile');
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

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <Card>
      <Card.Header>
        <h4>Profile Settings</h4>
      </Card.Header>
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Name</Form.Label>
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
            <Form.Label>Phone</Form.Label>
            <Form.Control
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Address</Form.Label>
            <Form.Control
              type="text"
              name="address"
              value={formData.address}
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
            <Form.Label>Qualifications</Form.Label>
            <Form.Control
              type="text"
              name="qualifications"
              value={formData.qualifications}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Experience (years)</Form.Label>
            <Form.Control
              type="number"
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Fees</Form.Label>
            <Form.Control
              type="number"
              name="fees"
              value={formData.fees}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Bio</Form.Label>
            <Form.Control
              as="textarea"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={3}
            />
          </Form.Group>

          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Updating...' : 'Update Profile'}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default DoctorProfile; 