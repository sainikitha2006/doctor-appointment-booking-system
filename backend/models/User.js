// backend/models/User.js
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter your name'],
    maxLength: [30, 'Name cannot exceed 30 characters'],
    minLength: [3, 'Name should have more than 3 characters'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please enter your email'],
    unique: true,
    validate: [validator.isEmail, 'Please enter a valid email'],
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'Please enter your password'],
    minLength: [6, 'Password should be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['patient', 'doctor', 'admin'],
    default: 'patient'
  },
  isApproved: {
    type: Boolean,
    default: true // Set to true by default for patients
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  avatar: {
    public_id: {
      type: String,
      default: 'avatars/default_avatar'
    },
    url: {
      type: String,
      default: 'https://res.cloudinary.com/your-cloud-name/image/upload/v1600000000/avatars/default_avatar.jpg'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Encrypt password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    console.log('Hashing password...');
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    console.log('Password hashed successfully');
    next();
  } catch (error) {
    console.error('Password hashing error:', error);
    next(error);
  }
});

// JWT token
userSchema.methods.getJwtToken = function() {
  try {
    console.log('Generating JWT token...');
    const token = jwt.sign(
      { id: this._id, role: this.role },
      process.env.JWT_SECRET || 'default-secret-key',
      { expiresIn: process.env.JWT_EXPIRES_TIME || '30d' }
    );
    console.log('JWT token generated successfully');
    return token;
  } catch (error) {
    console.error('JWT token generation error:', error);
    throw error;
  }
};

// Compare password
userSchema.methods.comparePassword = async function(enteredPassword) {
  try {
    console.log('Comparing passwords...');
    const isMatch = await bcrypt.compare(enteredPassword, this.password);
    console.log('Password comparison result:', isMatch);
    return isMatch;
  } catch (error) {
    console.error('Password comparison error:', error);
    throw error;
  }
};

module.exports = mongoose.model('User', userSchema);