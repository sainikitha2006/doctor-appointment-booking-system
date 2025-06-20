// frontend/src/api/auth.js
import axios from 'axios';

const API_URL = '/api/v1/auth';

// Register user
const register = async (userData, role) => {
  const response = await axios.post(API_URL + '/register', { ...userData, role });
  
  if (response.data) {
    localStorage.setItem('token', response.data.token);
  }
  
  return response.data;
};

// Login user
const login = async (email, password, role) => {
  const response = await axios.post(API_URL + '/login', { email, password, role });
  
  if (response.data) {
    localStorage.setItem('token', response.data.token);
  }
  
  return response.data;
};

// Logout user
const logout = () => {
  localStorage.removeItem('token');
};

// Get current user
const getMe = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  
  const response = await axios.get(API_URL + '/me', config);
  return response.data;
};

const authService = {
  register,
  login,
  logout,
  getMe,
};

export default authService;