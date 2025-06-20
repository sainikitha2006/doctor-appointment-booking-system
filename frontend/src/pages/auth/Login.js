// frontend/src/pages/auth/Login.js
import { useState } from 'react';
import { Form, Button, Card, Container, Row, Col, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'patient'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      console.log('Attempting to login with:', {
        email: formData.email,
        role: formData.role,
        apiUrl: `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/v1/auth/login`
      });
      
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/v1/auth/login`,
        {
          email: formData.email,
          password: formData.password,
          role: formData.role
        },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Login response:', response.data);
      
      if (response.data && response.data.token) {
        // Store token in localStorage
        localStorage.setItem('token', response.data.token);
        
        // Set auth state
        await login(response.data.token);
        
        toast.success('Login successful!');
        
        // Navigate based on role
        if (formData.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (formData.role === 'doctor') {
          navigate('/doctor/dashboard');
        } else {
          navigate('/patient/dashboard');
        }
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Login error details:', {
        message: err.message,
        response: err.response,
        isAxiosError: err.isAxiosError,
        status: err.response?.status
      });

      let errorMessage = 'Login failed. ';
      
      if (err.message === 'Network Error') {
        errorMessage += 'Cannot connect to server. Please check if the server is running.';
      } else if (err.response?.data?.message) {
        errorMessage += err.response.data.message;
      } else {
        errorMessage += 'Please try again.';
      }

      setError(errorMessage);
      toast.error(errorMessage);
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

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card>
            <Card.Body>
              <h2 className="text-center mb-4">Login</h2>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={handleSubmit}>
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
                  <Form.Label>Login as</Form.Label>
                  <Form.Select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                  >
                    <option value="patient">Patient</option>
                    <option value="doctor">Doctor</option>
                    <option value="admin">Admin</option>
                  </Form.Select>
                </Form.Group>
                <Button
                  type="submit"
                  className="w-100 mt-3"
                  disabled={loading}
                >
                  {loading ? 'Logging in...' : 'Login'}
                </Button>
              </Form>
              <div className="text-center mt-3">
                <Link to="/register">Don't have an account? Register</Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;