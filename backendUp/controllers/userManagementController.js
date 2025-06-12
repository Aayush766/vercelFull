// controllers/userManagementController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cloudinary = require('../config/cloudinary'); // Add this import
const fs = require('fs'); // Add this import for file system operations

// Create User (Admin, Trainer, or Student)
exports.createUser = async (req, res) => {
    try {
        const {
            name, email, password, role,
            // Student specific fields
            grade, session, class: studentClass, rollNumber, school, dob, fatherName,
            // Trainer specific fields
            subject, trainerSchool, classesTaught, experience, contact, trainerDob
        } = req.body;
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
            userData.session = session;
            userData.class = studentClass;
            userData.rollNumber = rollNumber;
            userData.school = school;
            userData.dob = dob;
            userData.fatherName = fatherName;
        } else if (role === 'trainer') {
            // Validate all required trainer-specific fields
            if (!subject || !trainerSchool || !classesTaught || !experience || !contact || !trainerDob) {
                return res.status(400).json({ msg: 'Trainer details (subject, school, classes taught, experience, contact, DOB) are required for trainer role.' });
            }
            userData.subject = subject;
            userData.trainerSchool = trainerSchool;
            userData.classesTaught = classesTaught;
            userData.experience = experience;
            userData.contact = contact;
            userData.trainerDob = trainerDob;
        }

        const user = new User(userData);
        await user.save(); // This will trigger Mongoose schema validation

        res.status(201).json({ msg: `${role} created successfully`, user });
    } catch (err) {
        // Handle duplicate key errors (e.g., unique email)
        if (err.code === 11000) {
            if (err.keyPattern && err.keyPattern.email) {
                return res.status(400).json({ msg: 'Error creating user: Email already exists.' });
            }
            // Add other unique key patterns if applicable, e.g., for student rollNumber
            if (err.keyPattern && err.keyPattern.rollNumber && req.body.role === 'student') {
                return res.status(400).json({ msg: 'Error creating user: Roll number already exists for this grade/class.' });
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

// NEW: Update User Profile Picture
exports.updateProfilePicture = async (req, res) => {
    try {
        const userId = req.user.id; // User ID from the authenticated token
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ msg: 'User not found.' });
        }

        if (!req.file) {
            return res.status(400).json({ msg: 'No file uploaded.' });
        }

        // Upload new image to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'profile_pictures', // Optional: folder in Cloudinary
            width: 150,
            height: 150,
            crop: 'fill'
        });

        // Delete old profile picture from Cloudinary if it exists
        // Extract public_id from the old URL to delete it from Cloudinary
        if (user.profilePicture) {
            // Regex to extract public ID from Cloudinary URL (e.g., .../profile_pictures/public_id.png)
            const publicIdMatch = user.profilePicture.match(/\/profile_pictures\/([^/.]+)\./);
            if (publicIdMatch && publicIdMatch[1]) {
                const publicId = `profile_pictures/${publicIdMatch[1]}`;
                await cloudinary.uploader.destroy(publicId);
            }
        }

        // Update user's profilePicture URL in DB
        user.profilePicture = result.secure_url;
        await user.save({ validateBeforeSave: false }); // Avoid re-validating all schema fields, especially for student/trainer conditional fields

        // Delete the locally saved file after upload
        fs.unlink(req.file.path, (err) => {
            if (err) console.error('Error deleting local file:', err);
        });

        res.status(200).json({ msg: 'Profile picture updated successfully', profilePicture: user.profilePicture });

    } catch (err) {
        console.error('Error updating profile picture:', err);
        // Clean up local file if an error occurred after upload but before response
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlink(req.file.path, (unlinkErr) => {
                if (unlinkErr) console.error('Error deleting local file after upload failure:', unlinkErr);
            });
        }
        res.status(500).json({ msg: 'Server error during profile picture update' });
    }
};


// controllers/userManagementController.js
// ... existing imports ...

// NEW: Get all Trainers
exports.getAllTrainers = async (req, res) => {
  try {
      const users = await User.find({ role: 'trainer' }).select('-password');
      res.json({ users });
  } catch (err) {
      console.error('Error fetching trainers:', err);
      res.status(500).json({ msg: 'Server error fetching trainers' });
  }
};

// NEW: Update Trainer Details (can be merged with a more general updateUser if roles are handled carefully)
exports.updateTrainer = async (req, res) => {
  try {
      const { id } = req.params;
      const { name, email, password, subject, trainerSchool, classesTaught, experience, contact, trainerDob, assignedSchools, assignedGrades } = req.body;

      const user = await User.findById(id);
      if (!user || user.role !== 'trainer') {
          return res.status(404).json({ msg: 'Trainer not found.' });
      }

      user.name = name || user.name;
      user.email = email || user.email;
      if (password) {
          user.password = await bcrypt.hash(password, 10);
      }
      user.subject = subject || user.subject;
      user.trainerSchool = trainerSchool || user.trainerSchool;
      user.classesTaught = classesTaught || user.classesTaught;
      user.experience = experience || user.experience;
      user.contact = contact || user.contact;
      user.trainerDob = trainerDob || user.trainerDob;
      user.assignedSchools = assignedSchools || user.assignedSchools;
      user.assignedGrades = assignedGrades || user.assignedGrades;


      await user.save({ validateBeforeSave: true }); // Ensure validation runs

      res.json({ msg: 'Trainer updated successfully', user: user.toObject({ getters: true, virtuals: true }) });

  } catch (err) {
      if (err.code === 11000) {
          return res.status(400).json({ msg: 'Error updating trainer: Email already exists.' });
      }
      if (err.name === 'ValidationError') {
          const messages = Object.values(err.errors).map(val => val.message);
          return res.status(400).json({ msg: `Validation error: ${messages.join(', ')}` });
      }
      console.error('Error updating trainer:', err);
      res.status(500).json({ msg: 'Server error updating trainer', error: err.message });
  }
};

// NEW: Assign Schools and Grades to Trainer
exports.assignTrainerSchoolsAndGrades = async (req, res) => {
  try {
      const { id } = req.params;
      const { assignedSchools, assignedGrades } = req.body;

      const user = await User.findById(id);
      if (!user || user.role !== 'trainer') {
          return res.status(404).json({ msg: 'Trainer not found.' });
      }

      user.assignedSchools = assignedSchools;
      user.assignedGrades = assignedGrades;

      await user.save({ validateBeforeSave: false }); // Only updating specific fields, can skip full validation

      res.json({ msg: 'Trainer assignments updated successfully', user: user.toObject({ getters: true, virtuals: true }) });

  } catch (err) {
      console.error('Error assigning schools/grades to trainer:', err);
      res.status(500).json({ msg: 'Server error assigning schools/grades' });
  }
};

// You might already have a deleteUser function that can be reused:
// exports.deleteUser = async (req, res) => { ... }

// controllers/userManagementController.js
// ... existing imports ...

// NEW: Get all Students (with filters)
exports.getAllStudents = async (req, res) => {
  try {
      const { school, grade } = req.query;
      let query = { role: 'student' };

      if (school) {
          query.school = school;
      }
      if (grade) {
          query.grade = parseInt(grade);
      }

      // Populate assignedTrainer to show trainer name
      const users = await User.find(query).select('-password').populate('assignedTrainer', 'name email');
      res.json({ users });
  } catch (err) {
      console.error('Error fetching students:', err);
      res.status(500).json({ msg: 'Server error fetching students' });
  }
};

// NEW: Update Student Details
exports.updateStudent = async (req, res) => {
  try {
      const { id } = req.params;
      const { name, email, password, grade, session, class: studentClass, rollNumber, school, dob, fatherName, assignedTrainer } = req.body;

      const user = await User.findById(id);
      if (!user || user.role !== 'student') {
          return res.status(404).json({ msg: 'Student not found.' });
      }

      user.name = name || user.name;
      user.email = email || user.email;
      if (password) {
          user.password = await bcrypt.hash(password, 10);
      }
      user.grade = grade || user.grade;
      user.session = session || user.session;
      user.class = studentClass || user.class;
      user.rollNumber = rollNumber || user.rollNumber;
      user.school = school || user.school;
      user.dob = dob || user.dob;
      user.fatherName = fatherName || user.fatherName;
      user.assignedTrainer = assignedTrainer || user.assignedTrainer;

      await user.save({ validateBeforeSave: true });

      res.json({ msg: 'Student updated successfully', user: user.toObject({ getters: true, virtuals: true }) });

  } catch (err) {
      if (err.code === 11000) {
          return res.status(400).json({ msg: 'Error updating student: Email or Roll Number already exists.' });
      }
      if (err.name === 'ValidationError') {
          const messages = Object.values(err.errors).map(val => val.message);
          return res.status(400).json({ msg: `Validation error: ${messages.join(', ')}` });
      }
      console.error('Error updating student:', err);
      res.status(500).json({ msg: 'Server error updating student', error: err.message });
  }
};

// NEW: Assign Trainer to Student
exports.assignStudentTrainer = async (req, res) => {
  try {
      const { id } = req.params;
      const { trainerId } = req.body; // Expect trainerId from frontend

      const student = await User.findById(id);
      if (!student || student.role !== 'student') {
          return res.status(404).json({ msg: 'Student not found.' });
      }

      const trainer = await User.findById(trainerId);
      if (!trainer || trainer.role !== 'trainer') {
          return res.status(400).json({ msg: 'Invalid trainer ID provided.' });
      }

      student.assignedTrainer = trainerId;
      await student.save({ validateBeforeSave: false }); // Skip full validation

      res.json({ msg: 'Trainer assigned successfully', student: student.toObject({ getters: true, virtuals: true }) });

  } catch (err) {
      console.error('Error assigning trainer to student:', err);
      res.status(500).json({ msg: 'Server error assigning trainer' });
  }
};

// NEW: Get all unique school names
exports.getAllSchools = async (req, res) => {
  try {
      // Find all unique school names from student users
      const schools = await User.distinct('school', { role: 'student' });
      res.json({ schools });
  } catch (err) {
      console.error('Error fetching all schools:', err);
      res.status(500).json({ msg: 'Server error fetching schools' });
  }
};

// NEW: Get unique grades for a specific school
exports.getGradesBySchool = async (req, res) => {
  try {
      const { schoolName } = req.params;
      const grades = await User.distinct('grade', { role: 'student', school: schoolName });
      // Sort grades numerically
      res.json({ grades: grades.sort((a, b) => a - b) });
  } catch (err) {
      console.error(`Error fetching grades for school ${schoolName}:`, err);
      res.status(500).json({ msg: `Server error fetching grades for school ${schoolName}` });
  }
};

// controllers/userManagementController.js
// ...
// NEW: Get Trainer Feedback
exports.getTrainerFeedback = async (req, res) => {
  try {
      const { id } = req.params;
      const trainer = await User.findById(id).select('trainerFeedback');
      if (!trainer) {
          return res.status(404).json({ msg: 'Trainer not found.' });
      }
      res.json({ feedback: trainer.trainerFeedback });
  } catch (err) {
      console.error('Error fetching trainer feedback:', err);
      res.status(500).json({ msg: 'Server error fetching trainer feedback' });
  }
};

// NEW: Get Student Feedback (assuming feedback about students is stored on the student model)
// If students give feedback on trainers, that would likely be on the trainer model
// or a separate Feedback model. Assuming this is feedback *about* the student.
exports.getStudentFeedback = async (req, res) => {
  try {
      const { id } = req.params;
      const student = await User.findById(id).select('studentFeedback'); // Assuming studentFeedback is on User model
      if (!student) {
          return res.status(404).json({ msg: 'Student not found.' });
      }
      res.json({ feedback: student.studentFeedback });
  } catch (err) {
      console.error('Error fetching student feedback:', err);
      res.status(500).json({ msg: 'Server error fetching student feedback' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
      const { id } = req.params; // Get user ID from URL
      // Implement your logic to delete the user from the database
      const deletedUser = await User.findByIdAndDelete(id); // Assuming 'User' is your Mongoose model

      if (!deletedUser) {
          return res.status(404).json({ success: false, message: 'User not found' });
      }

      res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ success: false, message: 'Server error during user deletion' });
  }
};
