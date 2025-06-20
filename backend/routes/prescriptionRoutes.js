const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createPrescription,
  getPrescriptionByAppointment,
  getPatientPrescriptions,
  getDoctorPrescriptions
} = require('../controllers/prescriptionController');

// All routes are protected
router.use(protect);

// Doctor routes
router.post('/', authorize('doctor'), createPrescription);
router.get('/doctor', authorize('doctor'), getDoctorPrescriptions);

// Patient routes
router.get('/patient', authorize('patient'), getPatientPrescriptions);

// Shared routes
router.get('/appointment/:appointmentId', getPrescriptionByAppointment);

module.exports = router; 