const Prescription = require('../models/Prescription');
const Appointment = require('../models/Appointment');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Create a new prescription
// @route   POST /api/v1/prescriptions
// @access  Private (Doctor only)
exports.createPrescription = asyncHandler(async (req, res, next) => {
  const { appointmentId, diagnosis, medications, instructions, followUpDate } = req.body;

  // Check if appointment exists
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) {
    return next(new ErrorResponse('Appointment not found', 404));
  }

  // Check if the doctor is authorized to create prescription for this appointment
  if (appointment.doctor.toString() !== req.user._id.toString()) {
    return next(new ErrorResponse('Not authorized to create prescription for this appointment', 403));
  }

  // Create prescription
  const prescription = await Prescription.create({
    appointment: appointmentId,
    doctor: req.user._id,
    patient: appointment.patient,
    diagnosis,
    medications,
    instructions,
    followUpDate
  });

  res.status(201).json({
    success: true,
    data: prescription
  });
});

// @desc    Get prescription by appointment ID
// @route   GET /api/v1/prescriptions/appointment/:appointmentId
// @access  Private (Doctor and Patient)
exports.getPrescriptionByAppointment = asyncHandler(async (req, res, next) => {
  const prescription = await Prescription.findOne({ appointment: req.params.appointmentId })
    .populate('doctor', 'name')
    .populate('patient', 'name');

  if (!prescription) {
    return next(new ErrorResponse('Prescription not found', 404));
  }

  // Check if the user is authorized to view this prescription
  if (prescription.doctor._id.toString() !== req.user._id.toString() && 
      prescription.patient._id.toString() !== req.user._id.toString()) {
    return next(new ErrorResponse('Not authorized to view this prescription', 403));
  }

  res.status(200).json({
    success: true,
    data: prescription
  });
});

// @desc    Get all prescriptions for a patient
// @route   GET /api/v1/prescriptions/patient
// @access  Private (Patient only)
exports.getPatientPrescriptions = asyncHandler(async (req, res, next) => {
  const prescriptions = await Prescription.find({ patient: req.user._id })
    .populate('doctor', 'name')
    .populate('appointment', 'date time')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: prescriptions.length,
    data: prescriptions
  });
});

// @desc    Get all prescriptions for a doctor
// @route   GET /api/v1/prescriptions/doctor
// @access  Private (Doctor only)
exports.getDoctorPrescriptions = asyncHandler(async (req, res, next) => {
  const prescriptions = await Prescription.find({ doctor: req.user._id })
    .populate('patient', 'name')
    .populate('appointment', 'date time')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: prescriptions.length,
    data: prescriptions
  });
}); 