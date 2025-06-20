// frontend/src/components/admin/AdminAppointments.js
import React from 'react';
import { Card, Spinner, Table, Badge } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';

const AdminAppointments = () => {
  const [appointments, setAppointments] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await axios.get('/api/v1/admin/appointments');
        setAppointments(res.data.data);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Error fetching appointments');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  return (
    <Card>
      <Card.Header>
        <h4>All Appointments</h4>
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
                <th>Patient</th>
                <th>Doctor</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Payment</th>
              </tr>
            </thead>
            <tbody>
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center">No appointments found</td>
                </tr>
              ) : (
                appointments.map(appt => (
                  <tr key={appt._id}>
                    <td>{appt.patient.name}</td>
                    <td>Dr. {appt.doctor.name}</td>
                    <td>{new Date(appt.date).toLocaleDateString()}</td>
                    <td>{appt.time}</td>
                    <td>
                      <Badge
                        bg={
                          appt.status === 'approved' ? 'success' :
                          appt.status === 'rejected' ? 'danger' :
                          appt.status === 'cancelled' ? 'secondary' :
                          appt.status === 'completed' ? 'primary' : 'warning'
                        }
                      >
                        {appt.status}
                      </Badge>
                    </td>
                    <td>
                      <Badge bg={appt.paymentStatus === 'paid' ? 'success' : 'danger'}>
                        {appt.paymentStatus}
                      </Badge>
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

export default AdminAppointments;