// routes/studentRoutes.js (already mostly correct for this)
const express = require('express');
const router = express.Router();
const { auth, isStudent } = require('../middleware/authMiddleware');
const Content = require('../models/Content');
const User = require('../models/User');
const { getMe } = require('../controllers/userManagementController');
const { uploadProfilePicture, uploadMiddleware } = require('../controllers/uploadController');
const { getSessionsByGrade } = require('../controllers/sessionController');
const { getContentBySessionAndGrade } = require('../controllers/materialController');

// Get all content relevant to the student's grade across all sessions
router.get('/my-content', auth, isStudent, async (req, res) => {
    try {
        const studentId = req.user.id;
        const student = await User.findById(studentId).select('grade'); // Only need grade here

        if (!student) {
            return res.status(404).json({ msg: 'Student not found' });
        }

        // Fetch all content for the student's grade
        const content = await Content.find({
            grade: student.grade
        }).populate('uploadedBy', 'name'); // Populate who uploaded it

        res.json(content);

    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Route to get sessions for a specific grade (used by MyCourse.jsx)
router.get('/sessions', auth, isStudent, getSessionsByGrade);

// Route to get content for a specific session and grade (used by SessionDetails.jsx)
// This will fetch presentations, quizzes, and videos for a specific session and grade.
router.get('/content', auth, isStudent, getContentBySessionAndGrade);

router.get('/profile', auth, isStudent, getMe);
router.post('/upload-profile-picture', auth, isStudent, uploadMiddleware.single('profilePicture'), uploadProfilePicture);
router.get('/sessions', auth, isStudent, getSessionsByGrade);

module.exports = router;