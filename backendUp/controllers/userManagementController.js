// controllers/userManagementController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // Assuming jwt is used for auth middleware within this file

// Create User (Admin, Trainer, or Student)
exports.createUser = async (req, res) => {
  try {
    // Destructure 'class' as 'studentClass' to avoid keyword conflict, then use it.
    const { name, email, password, role, grade, session, class: studentClass, rollNumber, school, dob, fatherName } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    // Basic validation for common fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({ msg: 'Name, email, password, and role are required.' });
    }

    // Role-specific validation and data assignment
    const userData = {
      name,
      email,
      password: hashedPassword,
      role,
    };

    if (role === 'student') {
      // Validate all required student-specific fields
      if (!grade || !studentClass || !rollNumber || !school || !dob || !fatherName) {
        return res.status(400).json({ msg: 'Student details (grade, class, roll number, school, DOB, father\'s name) are required for student role.' });
      }
      userData.grade = grade;
      userData.session = session; // Optional, so no explicit check here
      userData.class = studentClass; // Assign the value from 'studentClass' to the 'class' property
      userData.rollNumber = rollNumber;
      userData.school = school;
      userData.dob = dob;
      userData.fatherName = fatherName;
    }

    const user = new User(userData);
    await user.save(); // This will trigger Mongoose schema validation

    res.status(201).json({ msg: `${role} created successfully`, user });
  } catch (err) {
    // Handle duplicate key errors (e.g., unique email or roll number)
    if (err.code === 11000) {
      if (err.keyPattern && err.keyPattern.email) {
        return res.status(400).json({ msg: 'Error creating user: Email already exists.' });
      }
      if (err.keyPattern && err.keyPattern.rollNumber) {
        return res.status(400).json({ msg: 'Error creating user: Roll number already exists for this grade/class.' }); // Refine message based on unique scope
      }
    }
    // Handle Mongoose validation errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ msg: `Validation error: ${messages.join(', ')}` });
    }

    console.error('Error creating user:', err);
    res.status(500).json({ msg: 'Server error during user creation', error: err.message });
  }
};

// Get current logged-in user's data
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password'); // Exclude password
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json({ user });
  } catch (err) {
    console.error('Error fetching user data:', err);
    res.status(500).json({ msg: 'Server error fetching user data' });
  }
};

// --- Middleware (typically in a separate authMiddleware.js file, but included here as per your snippet) ---
exports.auth = (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader) return res.status(401).json({ msg: 'No token, authorization denied' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ msg: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Contains user ID and role
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

exports.isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Admin role required' });
  }
  next();
};

exports.isStudent = (req, res, next) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ msg: 'Student role required' });
  }
  next();
};

exports.isTrainerOrAdmin = (req, res, next) => {
  if (req.user.role !== 'trainer' && req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Trainer or Admin role required' });
  }
  next();
};