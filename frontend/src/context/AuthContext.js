// frontend/src/context/AuthContext.js
import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import jwt_decode from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Set auth token
  const setAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  };

  // Login user
  const login = async (token) => {
    try {
      setAuthToken(token);
      setToken(token);
      
      // Decode token to get user info
      const decoded = jwt_decode(token);
      
      // Get user details from API
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/v1/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data && response.data.data) {
        setUser(response.data.data);
        return response.data.data;
      }
      throw new Error('Failed to get user data');
    } catch (err) {
      console.error('Login error:', err);
      setAuthToken(null);
      setToken(null);
      setUser(null);
      throw err;
    }
  };

  // Register user
  const register = async (formData) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/v1/auth/register`,
        formData
      );
      
      if (response.data && response.data.token) {
        await login(response.data.token);
        return response.data;
      }
      throw new Error(response.data.message || 'Registration failed');
    } catch (err) {
      console.error('Registration error:', err);
      throw err;
    }
  };

  // Logout user
  const logout = () => {
    setAuthToken(null);
    setToken(null);
    setUser(null);
    navigate('/');
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!user;
  };

  // Check user role
  const hasRole = (role) => {
    return user?.role === role;
  };

  // Load user on app start
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        setAuthToken(token);
        try {
          const res = await axios.get(
            `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/v1/auth/me`,
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );
          if (res.data && res.data.data) {
            setUser(res.data.data);
          }
        } catch (err) {
          console.error('Error loading user:', err);
          logout();
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated,
        hasRole
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);