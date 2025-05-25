// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'trainer', 'student'], required: true },
  profilePicture: { type: String, default: '' },

  // Conditional required fields for student role
  grade: {
    type: Number,
    required: function() { return this.role === 'student'; },
    min: 1, // Example: add min/max for grade
    max: 12
  },
  session: { // This might represent a session number, or could be an array of session IDs
    type: Number,
    required: false // Keep as false if optional
  },
  class: { // Matches frontend's 'name="class"'
    type: String,
    required: function() { return this.role === 'student'; }
  },
  rollNumber: {
    type: String,
    // Add unique constraint only if roll numbers are globally unique.
    // If unique per class/grade, you'd need a compound index in Mongoose.
    // For now, let's keep it simple.
    // unique: true, // Uncomment if roll numbers are unique across all students
    required: function() { return this.role === 'student'; }
  },
  school: {
    type: String,
    required: function() { return this.role === 'student'; }
  },
  dob: {
    type: Date, // Mongoose will attempt to parse valid date strings (e.g., YYYY-MM-DD)
    required: function() { return this.role === 'student'; }
  },
  fatherName: {
    type: String,
    required: function() { return this.role === 'student'; }
  },
  attendanceToday: { type: String, required: false }, // Consider Date or Boolean if actual attendance
  attendanceMonth: { type: String, required: false }, // Consider Number or array if actual attendance count/records
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);