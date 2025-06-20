const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getPatientAppointments,
  getDoctorAppointments,
  createAppointment,
  updateAppointment,
  addPrescription,
  getSingleAppointment
} = require('../controllers/appointmentController');

const router = express.Router();

// Protected routes
router.use(protect);

// Patient routes
router.get('/patient', getPatientAppointments);
router.post('/', createAppointment);

// Doctor routes
router.get('/doctor', getDoctorAppointments);
router.put('/:id', updateAppointment);
router.post('/:id/prescription', addPrescription);

// Shared routes
router.get('/:id', getSingleAppointment);

module.exports = router; 