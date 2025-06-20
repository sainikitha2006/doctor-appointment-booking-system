const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const catchAsync = require('../utils/catchAsync');

// Get doctor availability for a specific date
exports.getDoctorAvailability = catchAsync(async (req, res) => {
  try {
    const { date } = req.query;
    const doctorId = req.params.id;

    console.log('Fetching availability for doctor:', doctorId, 'on date:', date);

    // Get doctor's available slots
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      console.log('Doctor not found with ID:', doctorId);
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    console.log('Found doctor:', doctor._id);
    console.log('Available slots:', doctor.availableSlots);

    // Get booked appointments for the date
    const bookedAppointments = await Appointment.find({
      doctor: doctorId,
      date: new Date(date),
      status: { $ne: 'cancelled' }
    }).select('time');

    console.log('Booked appointments:', bookedAppointments);

    // Filter out booked slots
    const availableSlots = doctor.availableSlots.filter(slot => 
      !bookedAppointments.some(appointment => appointment.time === slot)
    );

    console.log('Available slots after filtering:', availableSlots);

    res.status(200).json({
      success: true,
      data: availableSlots
    });
  } catch (error) {
    console.error('Error in getDoctorAvailability:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching doctor availability',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get doctor profile
exports.getDoctorProfile = catchAsync(async (req, res) => {
  try {
    const doctorId = req.params.id;

    const doctor = await Doctor.findById(doctorId)
      .select('-password') // Exclude password from the response
      .populate('specialization', 'name');

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
  } catch (error) {
    console.error('Error in getDoctorProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching doctor profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}); 