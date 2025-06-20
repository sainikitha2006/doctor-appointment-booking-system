const express = require('express');
const { getDoctorAvailability, getDoctorProfile } = require('../controllers/doctorController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/:id/availability', getDoctorAvailability);
router.get('/:id', getDoctorProfile);

module.exports = router; 