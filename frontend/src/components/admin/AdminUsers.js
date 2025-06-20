// frontend/src/components/admin/AdminUsers.js
import React from 'react';
import { useState, useEffect } from 'react';
import { Table, Button, Badge, Form, Card, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get('/api/v1/admin/users');
        setUsers(res.data.data);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Error fetching users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleBlock = async (id, isBlocked) => {
    try {
      await axios.put(`/api/v1/admin/users/${id}/block`, { isBlocked });
      setUsers(users.map(user => 
        user._id === id ? { ...user, isBlocked: !isBlocked } : user
      ));
      toast.success(`User ${isBlocked ? 'unblocked' : 'blocked'} successfully`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error updating user');
    }
  };

  const handleApprove = async (userId) => {
    try {
      const response = await axios.put(`/api/v1/users/${userId}/approve`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        toast.success('User approved successfully');
        // Update the users list
        setUsers(users.map(user => 
          user._id === userId ? { ...user, isApproved: true } : user
        ));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve user');
    }
  };

  const filteredUsers = users.filter(user => {
    if (filter === 'all') return true;
    if (filter === 'doctors') return user.role === 'doctor';
    if (filter === 'patients') return user.role === 'patient';
    if (filter === 'blocked') return user.isBlocked;
    return true;
  });

  return (
    <Card>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h4>Manage Users</h4>
        <Form.Select 
          style={{ width: '200px' }}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All Users</option>
          <option value="doctors">Doctors</option>
          <option value="patients">Patients</option>
          <option value="blocked">Blocked Users</option>
        </Form.Select>
      </Card.Header>
      <Card.Body>
        {loading ? (
          <div className="text-center">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        ) : (
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center">No users found</td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <Badge bg={user.role === 'admin' ? 'danger' : user.role === 'doctor' ? 'info' : 'success'}>
                        {user.role}
                      </Badge>
                      {user.role === 'doctor' && !user.isApproved && (
                        <Badge bg="warning" className="ms-2">
                          Pending
                        </Badge>
                      )}
                    </td>
                    <td>
                      <Badge bg={user.isBlocked ? 'danger' : 'success'}>
                        {user.isBlocked ? 'Blocked' : 'Active'}
                      </Badge>
                    </td>
                    <td>
                      {user.role === 'doctor' && !user.isApproved && (
                        <Button
                          variant="success"
                          size="sm"
                          className="me-2"
                          onClick={() => handleApprove(user._id)}
                        >
                          Approve
                        </Button>
                      )}
                      <Button
                        variant={user.isBlocked ? 'success' : 'danger'}
                        size="sm"
                        onClick={() => handleBlock(user._id, user.isBlocked)}
                      >
                        {user.isBlocked ? 'Unblock' : 'Block'}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        )}
      </Card.Body>
    </Card>
  );
};

export default AdminUsers;