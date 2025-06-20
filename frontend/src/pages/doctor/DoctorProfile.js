import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const DoctorProfile = () => {
  const { user, token } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    specialization: '',
    qualifications: '',
    experience: '',
    fees: '',
    bio: '',
  });
  const [loading, setLoading] = useState(true);
  const [specializations, setSpecializations] = useState([]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user || !token) {
        toast.error('Please login to view your profile');
        return;
      }

      try {
        setLoading(true);
        // Fetch doctor profile
        const profileResponse = await axios.get(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/v1/users/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        // Fetch specializations
        const specializationsResponse = await axios.get(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/v1/specializations`
        );
        
        if (profileResponse.data && profileResponse.data.success) {
          const userData = profileResponse.data.data;
          const doctorData = userData.doctor || {};
          
          setFormData({
            name: userData.name || '',
            email: userData.email || '',
            phone: userData.phone || '',
            address: userData.address || '',
            specialization: doctorData.specialization || '',
            qualifications: Array.isArray(doctorData.qualifications) 
              ? doctorData.qualifications.join(', ') 
              : doctorData.qualifications || '',
            experience: doctorData.experience || '',
            fees: doctorData.fees || '',
            bio: doctorData.bio || '',
          });
        }

        if (specializationsResponse.data && specializationsResponse.data.success) {
          setSpecializations(specializationsResponse.data.data);
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
        {
          ...formData,
          qualifications: formData.qualifications.split(',').map(q => q.trim())
        },
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
      <h2>Doctor Profile Settings</h2>
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
              <label htmlFor="specialization" className="form-label">Specialization</label>
              <select
                className="form-select"
                id="specialization"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                required
              >
                <option value="">Select Specialization</option>
                {specializations.map(spec => (
                  <option key={spec._id} value={spec._id}>{spec.name}</option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label htmlFor="qualifications" className="form-label">Qualifications (comma-separated)</label>
              <input
                type="text"
                className="form-control"
                id="qualifications"
                name="qualifications"
                value={formData.qualifications}
                onChange={handleChange}
                placeholder="e.g., MBBS, MD, DM"
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="experience" className="form-label">Experience (Years)</label>
              <input
                type="number"
                className="form-control"
                id="experience"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                required
                min="0"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="fees" className="form-label">Consultation Fee</label>
              <input
                type="number"
                className="form-control"
                id="fees"
                name="fees"
                value={formData.fees}
                onChange={handleChange}
                required
                min="0"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="bio" className="form-label">Bio</label>
              <textarea
                className="form-control"
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows="4"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary">Update Profile</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile; 