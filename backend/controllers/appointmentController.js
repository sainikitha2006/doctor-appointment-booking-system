const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const catchAsync = require('../utils/catchAsync');

// Get all appointments for a patient
exports.getPatientAppointments = catchAsync(async (req, res) => {
  const appointments = await Appointment.find({ patient: req.user._id })
    .populate({
      path: 'doctor',
      select: 'specialization fees user',
      populate: {
        path: 'user',
        select: 'name email'
      }
    })
    .populate('patient', 'name email')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    data: appointments
  });
});

// Get all appointments for a doctor
exports.getDoctorAppointments = catchAsync(async (req, res) => {
  try {
    console.log('Fetching appointments for doctor user ID:', req.user._id);
    
    // First, find the doctor document associated with the user
    const doctor = await Doctor.findOne({ user: req.user._id });
    
    if (!doctor) {
      console.log('No doctor profile found for user:', req.user._id);
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    console.log('Found doctor profile:', doctor._id);

    // Find appointments using the doctor's ID
    const appointments = await Appointment.find({ doctor: doctor._id })
      .populate('patient', 'name email')
      .populate({
        path: 'doctor',
        select: 'specialization fees user',
        populate: {
          path: 'user',
          select: 'name email'
        }
      })
      .sort('-createdAt');

    console.log('Found appointments:', appointments);

    res.status(200).json({
      success: true,
      data: appointments
    });
  } catch (error) {
    console.error('Error in getDoctorAppointments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching doctor appointments',
      error: error.message
    });
  }
});

// Create a new appointment
exports.createAppointment = catchAsync(async (req, res) => {
  const { doctorId, date, time, symptoms, paymentAmount } = req.body;
  const patientId = req.user._id;

  // Find the doctor
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) {
    return res.status(404).json({
      success: false,
      message: 'Doctor not found'
    });
  }

  console.log('Found doctor:', doctor);

  // Create the appointment
  const appointment = await Appointment.create({
    patient: patientId,
    doctor: doctorId,
    date,
    time,
    status: 'pending',
    symptoms,
    paymentStatus: 'pending',
    paymentAmount
  });

  console.log('Created appointment:', appointment);

  // Populate the appointment with patient and doctor details
  const populatedAppointment = await Appointment.findById(appointment._id)
    .populate('patient', 'name email')
    .populate({
      path: 'doctor',
      select: 'specialization fees user',
      populate: {
        path: 'user',
        select: 'name email'
      }
    });

  console.log('Populated appointment:', populatedAppointment);

  res.status(201).json({
    success: true,
    data: populatedAppointment
  });
});

// Update appointment status
exports.updateAppointment = catchAsync(async (req, res) => {
  try {
    console.log('Update appointment request:', {
      appointmentId: req.params.id,
      status: req.body.status,
      userId: req.user._id,
      userRole: req.user.role
    });

    const { status } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      console.log('Appointment not found:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    console.log('Found appointment:', {
      id: appointment._id,
      doctor: appointment.doctor,
      patient: appointment.patient,
      currentStatus: appointment.status
    });

    // Check if user is authorized to update
    if (req.user.role === 'doctor') {
      // Find the doctor document associated with the user
      const doctor = await Doctor.findOne({ user: req.user._id });
      console.log('Found doctor:', doctor ? { id: doctor._id } : 'Not found');

      if (!doctor) {
        return res.status(403).json({
          success: false,
          message: 'Doctor profile not found'
        });
      }

      // Check if the appointment belongs to this doctor
      if (appointment.doctor.toString() !== doctor._id.toString()) {
        console.log('Doctor authorization failed:', {
          appointmentDoctor: appointment.doctor.toString(),
          currentDoctor: doctor._id.toString()
        });
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this appointment'
        });
      }
    }

    if (req.user.role === 'patient' && appointment.patient.toString() !== req.user._id.toString()) {
      console.log('Patient authorization failed:', {
        appointmentPatient: appointment.patient.toString(),
        currentPatient: req.user._id.toString()
      });
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this appointment'
      });
    }

    // Update appointment status
    appointment.status = status;
    await appointment.save();
    console.log('Appointment status updated successfully');

    // Populate the updated appointment
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patient', 'name email')
      .populate({
        path: 'doctor',
        select: 'specialization fees user',
        populate: {
          path: 'user',
          select: 'name email'
        }
      });

    console.log('Sending response with populated appointment');
    res.status(200).json({
      success: true,
      data: populatedAppointment
    });
  } catch (error) {
    console.error('Error in updateAppointment:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating appointment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Add prescription to appointment
exports.addPrescription = catchAsync(async (req, res) => {
  console.log('Received prescription request:', {
    params: req.params,
    body: req.body,
    user: req.user
  });

  const { prescription } = req.body;
  if (!prescription) {
    console.error('No prescription data provided');
    return res.status(400).json({
      success: false,
      message: 'Prescription data is required'
    });
  }

  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) {
    console.error('Appointment not found:', req.params.id);
    return res.status(404).json({
      success: false,
      message: 'Appointment not found'
    });
  }

  console.log('Found appointment:', appointment);

  // Check if user is authorized to add prescription
  const doctor = await Doctor.findOne({ user: req.user._id });
  if (!doctor) {
    console.error('Doctor profile not found for user:', req.user._id);
    return res.status(403).json({
      success: false,
      message: 'Doctor profile not found'
    });
  }

  if (appointment.doctor.toString() !== doctor._id.toString()) {
    console.error('Doctor authorization failed:', {
      appointmentDoctor: appointment.doctor.toString(),
      currentDoctor: doctor._id.toString()
    });
    return res.status(403).json({
      success: false,
      message: 'Not authorized to add prescription'
    });
  }

  try {
    // Update appointment with prescription details
    appointment.prescription = {
      diagnosis: prescription.diagnosis,
      medications: prescription.medications,
      instructions: prescription.instructions,
      followUpDate: new Date(prescription.followUpDate) // Convert string to Date object
    };
    
    await appointment.save();
    console.log('Prescription added successfully to appointment:', appointment._id);

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error('Error saving prescription:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving prescription',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get single appointment with prescription
exports.getSingleAppointment = catchAsync(async (req, res) => {
  try {
    console.log('Fetching single appointment:', req.params.id);
    
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'name email')
      .populate({
        path: 'doctor',
        select: 'specialization fees user',
        populate: {
          path: 'user',
          select: 'name email'
        }
      });

    if (!appointment) {
      console.log('Appointment not found:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check authorization
    if (req.user.role === 'patient' && appointment.patient._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this appointment'
      });
    }

    if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user: req.user._id });
      if (!doctor || appointment.doctor._id.toString() !== doctor._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view this appointment'
        });
      }
    }

    console.log('Found appointment:', appointment);
    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error('Error in getSingleAppointment:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching appointment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}); 