const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { ErrorResponse } = require('../utils/error');

// Admin login
exports.adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log('Admin login attempt:', { email });

    // Check if admin exists
    const admin = await User.findOne({ email, role: 'admin' });
    console.log('Admin found:', admin ? 'Yes' : 'No');

    if (!admin) {
      console.log('Admin not found for email:', email);
      return next(new ErrorResponse('Admin not found', 404));
    }

    // Verify password
    const isMatch = await admin.comparePassword(password);
    console.log('Password match:', isMatch ? 'Yes' : 'No');

    if (!isMatch) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Generate token
    const token = admin.generateAuthToken();
    console.log('Token generated successfully');

    res.status(200).json({
      success: true,
      data: {
        token,
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role
        }
      }
    });
  } catch (err) {
    console.error('Admin login error:', err);
    next(err);
  }
};

// Get all doctors
exports.getAllDoctors = async (req, res, next) => {
  try {
    const doctors = await Doctor.find()
      .populate('user', 'name email')
      .select('-password');
    res.status(200).json({
      success: true,
      data: doctors
    });
  } catch (err) {
    next(err);
  }
};

// Create doctor
exports.createDoctor = async (req, res, next) => {
  try {
    const { name, email, password, specialization, experience, fees } = req.body;

    // Check if doctor already exists
    const existingDoctor = await Doctor.findOne({ email });
    if (existingDoctor) {
      return next(new ErrorResponse('Doctor already exists', 400));
    }

    // Create new doctor
    const doctor = new Doctor({
      name,
      email,
      password,
      specialization,
      experience,
      fees,
      role: 'doctor'
    });

    await doctor.save();

    res.status(201).json({
      success: true,
      data: doctor
    });
  } catch (err) {
    next(err);
  }
};

// Update doctor
exports.updateDoctor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, specialization, experience, fees } = req.body;

    const doctor = await Doctor.findByIdAndUpdate(
      id,
      { name, email, specialization, experience, fees },
      { new: true, runValidators: true }
    );

    if (!doctor) {
      return next(new ErrorResponse('Doctor not found', 404));
    }

    res.status(200).json({
      success: true,
      data: doctor
    });
  } catch (err) {
    next(err);
  }
};

// Delete doctor
exports.deleteDoctor = async (req, res, next) => {
  try {
    const { id } = req.params;

    const doctor = await Doctor.findByIdAndDelete(id);
    if (!doctor) {
      return next(new ErrorResponse('Doctor not found', 404));
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// Get all appointments
exports.getAllAppointments = async (req, res, next) => {
  try {
    const appointments = await Appointment.find()
      .populate('patient', 'name email')
      .populate({
        path: 'doctor',
        populate: {
          path: 'user',
          select: 'name email'
        }
      });

    res.status(200).json({
      success: true,
      data: appointments
    });
  } catch (err) {
    next(err);
  }
};

// Get dashboard statistics
exports.getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalAppointments,
      completedAppointments,
      pendingAppointments,
      totalRevenue
    ] = await Promise.all([
      Appointment.countDocuments(),
      Appointment.countDocuments({ status: 'completed' }),
      Appointment.countDocuments({ status: 'pending' }),
      Appointment.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$fees' } } }
      ])
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalAppointments,
        completedAppointments,
        pendingAppointments,
        totalRevenue: totalRevenue[0]?.total || 0
      }
    });
  } catch (err) {
    next(err);
  }
}; 