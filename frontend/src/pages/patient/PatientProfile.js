import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const PatientProfile = () => {
  const { user, token } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    gender: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user || !token) {
        toast.error('Please login to view your profile');
        return;
      }

      try {
        setLoading(true);
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
          setFormData({
            name: userData.name || '',
            email: userData.email || '',
            phone: userData.phone || '',
            address: userData.address || '',
            dateOfBirth: userData.dateOfBirth || '',
            gender: userData.gender || '',
          });
        } else {
          toast.error(response.data.message || 'Failed to fetch profile data');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        if (error.response) {
          toast.error(error.response.data.message || 'Failed to fetch profile data');
        } else {
          toast.error('Failed to fetch profile data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, token]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user || !token) {
      toast.error('Please login to update your profile');
      return;
    }

    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/v1/users/me`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data && response.data.success) {
        toast.success('Profile updated successfully');
      } else {
        toast.error(response.data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error.response) {
        toast.error(error.response.data.message || 'Failed to update profile');
      } else {
        toast.error('Failed to update profile');
      }
    }
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="d-flex justify-content-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2>Profile Settings</h2>
      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">Full Name</label>
              <input
                type="text"
                className="form-control"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="phone" className="form-label">Phone Number</label>
              <input
                type="tel"
                className="form-control"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="address" className="form-label">Address</label>
              <textarea
                className="form-control"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="dateOfBirth" className="form-label">Date of Birth</label>
              <input
                type="date"
                className="form-control"
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="gender" className="form-label">Gender</label>
              <select
                className="form-select"
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary">Update Profile</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PatientProfile; 