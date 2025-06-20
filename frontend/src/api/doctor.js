// frontend/src/api/doctor.js
import axios from './axios';

// Get all doctors
const getDoctors = async (filters = {}) => {
  const response = await axios.get('/doctors', { params: filters });
  return response.data;
};

// Get doctor by ID
const getDoctorById = async (doctorId) => {
  const response = await axios.get(`/doctors/${doctorId}`);
  return response.data;
};

// Get doctor availability
const getDoctorAvailability = async (doctorId, date) => {
  const response = await axios.get(`/doctors/${doctorId}/availability`, {
    params: { date }
  });
  return response.data;
};

// Update doctor profile
const updateDoctorProfile = async (doctorData) => {
  const response = await axios.put('/doctors/me', doctorData);
  return response.data;
};

const doctorService = {
  getDoctors,
  getDoctorById,
  getDoctorAvailability,
  updateDoctorProfile
};

export default doctorService;