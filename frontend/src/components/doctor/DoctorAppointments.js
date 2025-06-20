// frontend/src/components/doctor/DoctorAppointments.js
import { useState, useEffect } from 'react';
import { Table, Badge, Button, Card, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        console.log('Fetching appointments with token:', token ? 'Token exists' : 'No token');
        
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/v1/appointments/doctor`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        console.log('Appointments API response:', res.data);
        
        if (res.data.success) {
          setAppointments(res.data.data);
        } else {
          console.error('API returned error:', res.data.message);
          toast.error(res.data.message || 'Failed to fetch appointments');
        }
      } catch (err) {
        console.error('Error fetching appointments:', err.response?.data || err);
        toast.error(err.response?.data?.message || 'Error fetching appointments. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      setUpdating(true);
      const token = localStorage.getItem('token');
      const res = await axios.put(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/v1/appointments/${id}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (res.data.success) {
        setAppointments(appointments.map(appt => 
          appt._id === id ? res.data.data : appt
        ));
        toast.success(`Appointment ${status} successfully`);
      } else {
        toast.error(res.data.message || 'Failed to update appointment');
      }
    } catch (err) {
      console.error('Error updating appointment:', err);
      toast.error(err.response?.data?.message || 'Error updating appointment. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center p-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading appointments...</p>
      </div>
    );
  }

  return (
    <Card>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h4 className="mb-0">My Appointments</h4>
        <Badge bg="primary" pill>{appointments.length} appointments</Badge>
      </Card.Header>
      <Card.Body>
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Patient</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-4">
                  <p className="mb-0">No appointments found</p>
                  <small className="text-muted">You don't have any appointments yet.</small>
                </td>
              </tr>
            ) : (
              appointments.map(appt => (
                <tr key={appt._id}>
                  <td>{appt.patient?.name || 'N/A'}</td>
                  <td>{new Date(appt.date).toLocaleDateString()}</td>
                  <td>{appt.time}</td>
                  <td>
                    <Badge
                      bg={
                        appt.status === 'approved' ? 'success' :
                        appt.status === 'rejected' ? 'danger' :
                        appt.status === 'completed' ? 'primary' : 'warning'
                      }
                    >
                      {appt.status}
                    </Badge>
                  </td>
                  <td>
                    {appt.status === 'pending' && (
                      <div className="d-flex gap-2">
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleStatusChange(appt._id, 'approved')}
                          disabled={updating}
                        >
                          {updating ? 'Updating...' : 'Approve'}
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleStatusChange(appt._id, 'rejected')}
                          disabled={updating}
                        >
                          {updating ? 'Updating...' : 'Reject'}
                        </Button>
                      </div>
                    )}
                    {appt.status === 'approved' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleStatusChange(appt._id, 'completed')}
                        disabled={updating}
                      >
                        {updating ? 'Updating...' : 'Mark Complete'}
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
};

export default DoctorAppointments;