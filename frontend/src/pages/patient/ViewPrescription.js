import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Spinner, Button, ListGroup } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';

const ViewPrescription = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/v1/appointments/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (res.data.success) {
          setAppointment(res.data.data);
        } else {
          throw new Error(res.data.message || 'Failed to fetch appointment');
        }
      } catch (err) {
        console.error('Error fetching appointment:', err);
        toast.error(err.response?.data?.message || 'Error fetching prescription');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [id]);

  if (loading) {
    return (
      <div className="text-center p-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading prescription...</p>
      </div>
    );
  }

  if (!appointment || !appointment.prescription) {
    return (
      <div className="text-center p-5">
        <h4>No Prescription Found</h4>
        <p>The prescription for this appointment is not available yet.</p>
        <Button variant="primary" onClick={() => navigate('/patient/appointments')}>
          Back to Appointments
        </Button>
      </div>
    );
  }

  const renderMedications = () => {
    if (!appointment.prescription.medications) {
      return <p>No medications prescribed</p>;
    }

    if (Array.isArray(appointment.prescription.medications)) {
      return (
        <ListGroup>
          {appointment.prescription.medications.map((medication, index) => (
            <ListGroup.Item key={index}>
              <strong>{medication.name}</strong> - {medication.dosage}
              <br />
              <small className="text-muted">{medication.instructions}</small>
            </ListGroup.Item>
          ))}
        </ListGroup>
      );
    }

    // If medications is a string
    return <p>{appointment.prescription.medications}</p>;
  };

  return (
    <div className="container py-4">
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Prescription Details</h4>
          <Button variant="outline-primary" onClick={() => navigate('/patient/appointments')}>
            Back to Appointments
          </Button>
        </Card.Header>
        <Card.Body>
          <div className="mb-4">
            <h5>Appointment Details</h5>
            <ListGroup>
              <ListGroup.Item>
                <strong>Doctor:</strong> {appointment.doctor?.user?.name}
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Specialization:</strong> {appointment.doctor?.specialization}
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Date:</strong> {new Date(appointment.date).toLocaleDateString()}
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Time:</strong> {appointment.time}
              </ListGroup.Item>
            </ListGroup>
          </div>

          <div className="mb-4">
            <h5>Diagnosis</h5>
            <Card>
              <Card.Body>
                {appointment.prescription.diagnosis || 'No diagnosis provided'}
              </Card.Body>
            </Card>
          </div>

          <div className="mb-4">
            <h5>Medications</h5>
            {renderMedications()}
          </div>

          <div className="mb-4">
            <h5>Instructions</h5>
            <Card>
              <Card.Body>
                {appointment.prescription.instructions || 'No additional instructions provided'}
              </Card.Body>
            </Card>
          </div>

          {appointment.prescription.followUpDate && (
            <div>
              <h5>Follow-up Date</h5>
              <p>{new Date(appointment.prescription.followUpDate).toLocaleDateString()}</p>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default ViewPrescription; 