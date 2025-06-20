// backend/routes/users.js
const express = require('express');
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  approveDoctor,
  blockUser,
  getMe,
  updateProfile,
  getAllDoctors,
  getDoctorById
} = require('../controllers/userController');

const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/doctors', getAllDoctors);
router.get('/doctors/:id', getDoctorById);

// Protected routes
router.use(protect);

// User profile routes
router.get('/me', getMe);
router.put('/me', updateProfile);

// Admin routes
router.use(authorize('admin'));

router.route('/')
  .get(getUsers)
  .post(createUser);

router.route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

router.put('/:id/approve', approveDoctor);
router.put('/:id/block', blockUser);

module.exports = router;