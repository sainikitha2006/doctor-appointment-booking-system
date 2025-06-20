// frontend/src/components/admin/AdminDoctors.js
import React from 'react';
import { Card, Spinner } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { Table, Button, Badge } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';

const AdminDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await axios.get('/api/v1/admin/doctors');
        setDoctors(res.data.data);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Error fetching doctors');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const handleApprove = async (id) => {
    try {
      await axios.put(`/api/v1/admin/doctors/${id}/approve`);
      setDoctors(doctors.map(doctor => 
        doctor._id === id ? { ...doctor, isApproved: true } : doctor
      ));
      toast.success('Doctor approved successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error approving doctor');
    }
  };

  return (
    <Card>
      <Card.Header>
        <h4>Manage Doctors</h4>
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
                <th>Specialization</th>
                <th>Experience</th>
                <th>Fees</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {doctors.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center">No doctors found</td>
                </tr>
              ) : (
                doctors.map(doctor => (
                  <tr key={doctor._id}>
                    <td>Dr. {doctor.user.name}</td>
                    <td>{doctor.specialization}</td>
                    <td>{doctor.experience} years</td>
                    <td>₹{doctor.fees}</td>
                    <td>
                      <Badge bg={doctor.user.isApproved ? 'success' : 'warning'}>
                        {doctor.user.isApproved ? 'Approved' : 'Pending'}
                      </Badge>
                    </td>
                    <td>
                      {!doctor.user.isApproved && (
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleApprove(doctor._id)}
                        >
                          Approve
                        </Button>
                      )}
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

export default AdminDoctors;