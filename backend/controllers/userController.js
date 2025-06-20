const catchAsync = require('../utils/catchAsync');
const User = require('../models/User');
const Doctor = require('../models/Doctor');

// Get all users (admin only)
exports.getUsers = catchAsync(async (req, res) => {
  const users = await User.find().select('-password');
  res.status(200).json({
    success: true,
    count: users.length,
    data: users
  });
});

// Get single user (admin only)
exports.getUser = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
  res.status(200).json({
    success: true,
    data: user
  });
});

// Create user (admin only)
exports.createUser = catchAsync(async (req, res) => {
  const user = await User.create(req.body);
  res.status(201).json({
    success: true,
    data: user
  });
});

// Update user (admin only)
exports.updateUser = catchAsync(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).select('-password');
  res.status(200).json({
    success: true,
    data: user
  });
});

// Delete user (admin only)
exports.deleteUser = catchAsync(async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.status(200).json({
    success: true,
    data: {}
  });
});

// Get current user profile
exports.getMe = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  
  if (user.role === 'doctor') {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (doctor) {
      user.doctor = doctor._id;
    }
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// Update current user profile
exports.updateProfile = catchAsync(async (req, res) => {
  const { name, email, phone, address, specialization, qualifications, experience, fees, bio } = req.body;
  
  // Update basic user information
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, email, phone, address },
    { new: true, runValidators: true }
  ).select('-password');

  // If user is a doctor, update doctor-specific fields
  if (req.user.role === 'doctor') {
    await Doctor.findOneAndUpdate(
      { user: req.user._id },
      { 
        specialization,
        qualifications: Array.isArray(qualifications) ? qualifications : qualifications.split(',').map(q => q.trim()),
        experience,
        fees: parseInt(fees),
        bio,
        address
      },
      { new: true, runValidators: true }
    );
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// Get all doctors (public)
exports.getAllDoctors = catchAsync(async (req, res) => {
  try {
    const { name, specialization, availableDay } = req.query;
    
    // Build query
    let query = {};
    
    // If name is provided, search in user's name
    if (name) {
      const users = await User.find({ 
        name: { $regex: name, $options: 'i' },
        role: 'doctor',
        isApproved: true
      });
      const userIds = users.map(user => user._id);
      query.user = { $in: userIds };
    }
    
    // If specialization is provided
    if (specialization) {
      query.specialization = { $regex: specialization, $options: 'i' };
    }
    
    // If availableDay is provided
    if (availableDay) {
      query.availableDays = availableDay;
    }

    // Add approved doctors filter
    const approvedDoctors = await User.find({ 
      role: 'doctor',
      isApproved: true
    }).select('_id');
    
    const approvedDoctorIds = approvedDoctors.map(doc => doc._id);
    if (!query.user) {
      query.user = { $in: approvedDoctorIds };
    } else {
      // Intersect with approved doctors
      query.user.$in = query.user.$in.filter(id => 
        approvedDoctorIds.some(approvedId => approvedId.toString() === id.toString())
      );
    }

    const doctors = await Doctor.find(query)
      .populate({
        path: 'user',
        select: 'name email phone isApproved'
      })
      .select('-__v');

    // Transform the data to match frontend expectations
    const transformedDoctors = doctors.map(doctor => ({
      _id: doctor._id,
      name: doctor.user?.name || 'Unknown Doctor',
      email: doctor.user?.email,
      phone: doctor.user?.phone,
      specialization: doctor.specialization,
      experience: doctor.experience,
      fees: doctor.fees,
      bio: doctor.bio,
      availableDays: doctor.availableDays,
      availableSlots: doctor.availableSlots,
      address: doctor.address,
      isApproved: doctor.user?.isApproved
    }));

    res.status(200).json({
      success: true,
      count: transformedDoctors.length,
      data: transformedDoctors
    });
  } catch (error) {
    console.error('Error in getAllDoctors:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching doctors',
      error: error.message
    });
  }
});

// Get single doctor by ID (public)
exports.getDoctorById = catchAsync(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id)
    .populate('user', 'name email phone')
    .select('-__v');
  if (!doctor) {
    return res.status(404).json({
      success: false,
      message: 'Doctor not found'
    });
  }
  res.status(200).json({
    success: true,
    data: doctor
  });
});

// Approve doctor (admin only)
exports.approveDoctor = catchAsync(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isApproved: true },
    { new: true }
  ).select('-password');
  res.status(200).json({
    success: true,
    data: user
  });
});

// Block user (admin only)
exports.blockUser = catchAsync(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isBlocked: true },
    { new: true }
  ).select('-password');
  res.status(200).json({
    success: true,
    data: user
  });
}); 