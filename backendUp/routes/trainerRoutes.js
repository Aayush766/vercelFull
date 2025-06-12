// routes/trainerRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { auth, isTrainerOrAdmin } = require('../middleware/authMiddleware');
const Content = require('../models/Content');
const { updateProfilePicture } = require('../controllers/userManagementController');
const User = require('../models/User'); // Import your User model
const { getSessionsByGrade } = require('../controllers/sessionController'); 

// Multer configuration for profile picture upload (keep as is)
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
        cb(null, uniqueName);
    }
});

const fileFilter = (req, file, cb) => {
    const mime = file.mimetype;
    const allowedImageMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];

    if (allowedImageMimeTypes.includes(mime)) {
        cb(null, true);
    } else {
        cb(new Error('Only image files (JPEG, PNG, GIF) are allowed for profile pictures.'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB for profile pictures
    }
});

// --- NEW ROUTE FOR TRAINER PROFILE ---
router.get('/profile', auth, isTrainerOrAdmin, async (req, res) => {
    try {
        // req.user.id is set by the auth middleware based on the JWT token
        const trainer = await User.findById(req.user.id).select('-password'); // Fetch user without password
        if (!trainer) {
            return res.status(404).json({ msg: 'Trainer profile not found.' });
        }
        // Ensure the fetched user is indeed a trainer (optional, as isTrainerOrAdmin already checks role)
        if (trainer.role !== 'trainer') {
            return res.status(403).json({ msg: 'Access denied. Not a trainer.' });
        }
        res.json({ user: trainer });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});
// --- END NEW ROUTE ---


// Trainer Routes (existing)
router.get('/my-uploaded-content', auth, isTrainerOrAdmin, async (req, res) => {
    try {
        const trainerId = req.user.id;
        const content = await Content.find({ uploadedBy: trainerId }).populate('uploadedBy', 'name');
        res.json(content);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Trainer can update their profile picture (existing)
router.post('/update-profile-picture', auth, isTrainerOrAdmin, upload.single('profilePic'), updateProfilePicture);

// NEW: Endpoint to fetch grades for which sessions exist
router.get('/grades', auth, isTrainerOrAdmin, async (req, res) => {
  try {
      const Session = require('../models/Session'); // Make sure to import Session model
      const availableGrades = await Session.distinct('grade');
      res.json({ grades: availableGrades.sort((a,b) => a-b) });
  } catch (err) {
      console.error('Error fetching distinct grades:', err);
      res.status(500).json({ msg: 'Server error fetching grades.' });
  }
});

// NEW: Endpoint to fetch sessions for a specific grade
// This route already exists and uses the getSessionsByGrade controller
router.get('/sessions', auth, isTrainerOrAdmin, getSessionsByGrade); // This line is already there and correctly implemented

// NEW: Endpoint to fetch content for a specific grade
router.get('/content', auth, isTrainerOrAdmin, async (req, res) => {
  try {
      const { grade } = req.query;
      if (!grade) {
          return res.status(400).json({ msg: 'Grade parameter is required.' });
      }
      // Fetch content for the specified grade
      const content = await Content.find({ grade: parseInt(grade) });
      res.json({ content });
  } catch (err) {
      console.error('Error fetching content by grade:', err);
      res.status(500).json({ msg: 'Server error fetching content.' });
  }
});

module.exports = router;