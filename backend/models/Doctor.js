// backend/models/Doctor.js
const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  specialization: {
    type: String,
    required: [true, 'Please enter your specialization']
  },
  qualifications: {
    type: [String],
    required: [true, 'Please enter your qualifications']
  },
  experience: {
    type: String,
    required: [true, 'Please enter your experience']
  },
  fees: {
    type: Number,
    required: [true, 'Please enter your consultation fees']
  },
  availableDays: {
    type: [String],
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true
  },
  availableSlots: {
    type: [String],
    required: true
  },
  bio: {
    type: String,
    maxLength: [500, 'Bio cannot exceed 500 characters']
  },
  address: {
    type: String,
    required: [true, 'Please enter your clinic address']
  }
});

module.exports = mongoose.model('Doctor', doctorSchema);