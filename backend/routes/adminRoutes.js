const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// Admin login
router.post('/login', adminController.adminLogin);

// Protected routes
router.use(protect);
router.use(authorize('admin'));

// Doctor management routes
router.get('/doctors', adminController.getAllDoctors);
router.post('/doctors', adminController.createDoctor);
router.put('/doctors/:id', adminController.updateDoctor);
router.delete('/doctors/:id', adminController.deleteDoctor);

// Appointment management routes
router.get('/appointments', adminController.getAllAppointments);

// Dashboard statistics
router.get('/stats', adminController.getDashboardStats);

module.exports = router; 