const express = require('express');
const router = express.Router();
const { auth, isStudent } = require('../middleware/authMiddleware');
const Content = require('../models/Content'); // Assuming you have this model
const User = require('../models/User'); // Assuming you use User model here
const Quiz = require('../models/Quiz'); // IMPORT THE QUIZ MODEL

// Import relevant controllers
const { getMe } = require('../controllers/userManagementController');
const { uploadProfilePicture, uploadMiddleware } = require('../controllers/uploadController');
const { getSessionsByGrade } = require('../controllers/sessionController');
const { getContentBySessionAndGrade } = require('../controllers/materialController');
const { submitStudentFeedback } = require('../controllers/feedBackController');
const { getAllTrainers } = require('../controllers/userManagementController');

// Import quiz controller functions (ensure you import the new one)
const {
    getQuizDetailsForStudent,
    getQuizForStudentToTake, // <--- IMPORT THE NEW CONTROLLER FUNCTION
    submitQuiz,
    getQuizResultsForStudent,
    getStudentQuizAttempts
     // Assuming you have this function defined for submission
} = require('../controllers/quizController');

const { getStudentProgress } = require('../controllers/studentProgressController');

// Get all content relevant to the student's grade across all sessions
// This route now fetches both generic content AND quizzes
router.get('/my-content', auth, isStudent, async (req, res) => {
    try {
        const studentId = req.user.id;
        const student = await User.findById(studentId).select('grade');

        if (!student) {
            return res.status(404).json({ msg: 'Student not found' });
        }

        // Fetch generic content (ebooks, videos, etc.)
        const genericContent = await Content.find({
            grade: student.grade
        }).populate('uploadedBy', 'name');

        // Fetch quizzes for the student's grade
        // We select specific fields, and importantly, exclude correct answers
        const quizzes = await Quiz.find({
            grade: student.grade
        }).select('_id title description grade session attemptsAllowed timeLimit difficulty category dueDate instructions');

        // Transform quiz objects to match the 'content' structure expected by the frontend
        // This ensures they have a 'type' property set to 'quiz'
        const transformedQuizzes = quizzes.map(quiz => ({
            ...quiz.toObject(), // Convert Mongoose document to a plain JavaScript object
            type: 'quiz' // Add the type field for frontend filtering
        }));

        // Combine all content types
        const allContent = [...genericContent, ...transformedQuizzes];

        res.json(allContent);

    } catch (err) {
        console.error('Error fetching student content (including quizzes):', err);
        res.status(500).json({ msg: 'Server error fetching content', error: err.message });
    }
});

// Route to get sessions for a specific grade (used by MyCourse.jsx)
router.get('/sessions', auth, isStudent, getSessionsByGrade);

// Route to get content for a specific session and grade (used by SessionDetails.jsx, if applicable)
router.get('/content', auth, isStudent, getContentBySessionAndGrade);

// Profile Management
router.get('/profile', auth, isStudent, getMe);
router.post('/upload-profile-picture', auth, isStudent, uploadMiddleware.single('profilePicture'), uploadProfilePicture);

// Feedback
router.post('/feedback/submit', auth, isStudent, submitStudentFeedback);

// Get Trainers list for students
router.get('/trainers', auth, isStudent, async (req, res) => {
    try {
        const trainers = await User.find({ role: 'trainer' }).select('_id name');
        res.json(trainers);
    } catch (error) {
        console.error('Error fetching trainers for students:', error);
        res.status(500).json({ msg: 'Server error fetching trainers.' });
    }
});

// --- NEW ROUTE FOR STUDENT QUIZ DETAILS (overview) ---
// This is the route that QuizStart.jsx will hit for general info.
router.get('/quizzes/:quizId/details', auth, isStudent, getQuizDetailsForStudent);

// --- NEW ROUTE FOR STUDENT TO TAKE A QUIZ (provides questions) ---
// This is the route that STEMQuiz.jsx will hit to get questions.
router.get('/quizzes/:quizId/take', auth, isStudent, getQuizForStudentToTake);

// --- ROUTE FOR SUBMITTING A QUIZ ATTEMPT ---
router.post('/quizzes/:quizId/submit', auth, isStudent, submitQuiz); // Ensure submitQuiz is implemented

// --- NEW ROUTE FOR STUDENT TO GET QUIZ RESULTS (includes correct answers for review) ---
router.get('/quizzes/:quizId/attempts/:attemptId/results', auth, isStudent, getQuizResultsForStudent);

router.get('/quizzes/my-attempts', auth, isStudent, getStudentQuizAttempts);

router.get('/progress', auth, isStudent, getStudentProgress);


module.exports = router;