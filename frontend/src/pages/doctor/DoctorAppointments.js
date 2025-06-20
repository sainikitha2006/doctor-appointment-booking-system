import React, { useState } from 'react';
import { Card, Spinner, Table, Badge, Modal, Form, Button } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [prescriptionForm, setPrescriptionForm] = useState({
    diagnosis: '',
    medications: '',
    instructions: '',
    followUpDate: ''
  });

  React.useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/v1/appointments/doctor`, 
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        if (res.data.success && Array.isArray(res.data.data)) {
          setAppointments(res.data.data);
        } else {
          toast.error('Invalid response format from server');
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Error fetching appointments');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const handleUpdateStatus = async (appointmentId, status) => {
    try {
      console.log('Updating appointment status:', { appointmentId, status });
      const token = localStorage.getItem('token');
      console.log('Using token:', token ? 'Token exists' : 'No token found');

      const res = await axios.put(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/v1/appointments/${appointmentId}`,
        { status },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      console.log('Update response:', res.data);
      
      if (res.data.success) {
        toast.success(`Appointment ${status} successfully`);
        setAppointments(appointments.map(appt => 
          appt._id === appointmentId ? { ...appt, status } : appt
        ));
      } else {
        console.error('Update failed:', res.data);
        toast.error(res.data.message || 'Failed to update appointment status');
      }
    } catch (err) {
      console.error('Error updating appointment:', err);
      console.error('Error response:', err.response?.data);
      toast.error(err.response?.data?.message || 'Error updating appointment status');
    }
  };

  const handlePrescriptionClick = (appointment) => {
    setSelectedAppointment(appointment);
    setShowPrescriptionModal(true);
  };

  const handlePrescriptionSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Submitting prescription with data:', {
        appointmentId: selectedAppointment._id,
        prescription: prescriptionForm
      });
      
      const token = localStorage.getItem('token');
      console.log('Using token:', token ? 'Token exists' : 'No token found');
      
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/v1/appointments/${selectedAppointment._id}/prescription`,
        {
          prescription: {
            diagnosis: prescriptionForm.diagnosis,
            medications: prescriptionForm.medications,
            instructions: prescriptionForm.instructions,
            followUpDate: prescriptionForm.followUpDate
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      console.log('Prescription submission response:', res.data);

      if (res.data.success) {
        toast.success('Prescription added successfully');
        setShowPrescriptionModal(false);
        setPrescriptionForm({
          diagnosis: '',
          medications: '',
          instructions: '',
          followUpDate: ''
        });
        // Update appointment status to completed
        handleUpdateStatus(selectedAppointment._id, 'completed');
      }
    } catch (err) {
      console.error('Error adding prescription:', {
        error: err,
        response: err.response?.data,
        status: err.response?.status,
        message: err.message
      });
      toast.error(err.response?.data?.message || 'Error adding prescription');
    }
  };

  const handlePrescriptionChange = (e) => {
    setPrescriptionForm({
      ...prescriptionForm,
      [e.target.name]: e.target.value
    });
  };

  return (
    <>
      <Card>
        <Card.Header>
          <h4>My Appointments</h4>
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
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center">No appointments found</td>
                  </tr>
                ) : (
                  appointments.map(appt => (
                    <tr key={appt._id}>
                      <td>{appt.patient?.name || 'Unknown'}</td>
                      <td>{new Date(appt.date).toLocaleDateString()}</td>
                      <td>{appt.time}</td>
                      <td>
                        <Badge bg={
                          appt.status === 'completed' ? 'success' :
                          appt.status === 'cancelled' ? 'danger' :
                          appt.status === 'confirmed' ? 'info' :
                          appt.status === 'pending' ? 'warning' : 'secondary'
                        }>
                          {appt.status}
                        </Badge>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          {appt.status === 'pending' && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleUpdateStatus(appt._id, 'confirmed')}
                            >
                              Accept
                            </Button>
                          )}
                          {appt.status === 'confirmed' && (
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => handlePrescriptionClick(appt)}
                            >
                              Add Prescription
                            </Button>
                          )}
                          {(appt.status === 'pending' || appt.status === 'confirmed') && (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleUpdateStatus(appt._id, 'cancelled')}
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      <Modal show={showPrescriptionModal} onHide={() => setShowPrescriptionModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Prescription</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handlePrescriptionSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Diagnosis</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="diagnosis"
                value={prescriptionForm.diagnosis}
                onChange={handlePrescriptionChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Medications</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="medications"
                value={prescriptionForm.medications}
                onChange={handlePrescriptionChange}
                required
                placeholder="Enter medications with dosage and frequency"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Instructions</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="instructions"
                value={prescriptionForm.instructions}
                onChange={handlePrescriptionChange}
                required
                placeholder="Enter any special instructions"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Follow-up Date</Form.Label>
              <Form.Control
                type="date"
                name="followUpDate"
                value={prescriptionForm.followUpDate}
                onChange={handlePrescriptionChange}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              Submit Prescription
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default DoctorAppointments; 