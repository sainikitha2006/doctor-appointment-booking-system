// frontend/src/components/patient/PatientAppointments.js
import { useState, useEffect } from 'react';
import { Table, Badge, Button, Card, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const PatientAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/v1/appointments/patient`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        if (res.data && res.data.success) {
          // Ensure doctor information is populated
          const appointmentsWithDoctorInfo = await Promise.all(
            res.data.data.map(async (appointment) => {
              try {
                // Make sure we're using the doctor ID string, not the object
                const doctorId = appointment.doctor?._id || appointment.doctor;
                if (!doctorId) {
                  console.error('No doctor ID found for appointment:', appointment._id);
                  return appointment;
                }
                
                const doctorInfo = await fetchDoctorInfo(doctorId);
                return {
                  ...appointment,
                  doctorInfo: doctorInfo
                };
              } catch (err) {
                console.error('Error fetching doctor info:', err);
                return appointment;
              }
            })
          );
          setAppointments(appointmentsWithDoctorInfo);
        } else {
          toast.error(res.data.message || 'Failed to fetch appointments');
        }
      } catch (err) {
        console.error('Error fetching appointments:', err);
        toast.error(err.response?.data?.message || 'Error fetching appointments. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchAppointments();
    }
  }, [user]);

  const fetchDoctorInfo = async (doctorId) => {
    try {
      if (!doctorId) {
        throw new Error('No doctor ID provided');
      }

      // Ensure doctorId is a string
      const id = typeof doctorId === 'object' ? doctorId._id : doctorId;
      
      const token = localStorage.getItem('token');
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/v1/users/doctors/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (res.data.success) {
        return res.data.data;
      } else {
        throw new Error(res.data.message || 'Failed to fetch doctor info');
      }
    } catch (err) {
      console.error('Error fetching doctor info:', err);
      return null;
    }
  };

  const handleCancel = async (id) => {
    try {
      setUpdating(true);
      const token = localStorage.getItem('token');
      const res = await axios.put(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/v1/appointments/${id}`,
        { status: 'cancelled' },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (res.data && res.data.success) {
        setAppointments(appointments.map(appt => 
          appt._id === id ? res.data.data : appt
        ));
        toast.success('Appointment cancelled successfully');
      } else {
        toast.error(res.data.message || 'Failed to cancel appointment');
      }
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      toast.error(err.response?.data?.message || 'Error cancelling appointment. Please try again.');
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
              <th>Doctor</th>
              <th>Specialization</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointment) => (
              <tr key={appointment._id}>
                <td>
                  {appointment.doctorInfo?.name || 'Loading...'}
                </td>
                <td>
                  {appointment.doctorInfo?.specialization || 'Loading...'}
                </td>
                <td>{new Date(appointment.date).toLocaleDateString()}</td>
                <td>{appointment.time}</td>
                <td>
                  <Badge
                    bg={
                      appointment.status === 'approved'
                        ? 'success'
                        : appointment.status === 'pending'
                        ? 'warning'
                        : appointment.status === 'cancelled'
                        ? 'danger'
                        : 'secondary'
                    }
                  >
                    {appointment.status}
                  </Badge>
                </td>
                <td>
                  {appointment.status === 'pending' && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleCancel(appointment._id)}
                      disabled={updating}
                    >
                      Cancel
                    </Button>
                  )}
                  {appointment.status === 'completed' && (
                    <Link to={`/patient/prescription/${appointment._id}`}>
                      <Button variant="info" size="sm">
                        View Prescription
                      </Button>
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
};

export default PatientAppointments;