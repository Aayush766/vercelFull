const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { auth, isAdmin } = require('../middleware/authMiddleware');
const { createUser } = require('../controllers/userManagementController');
const { uploadContent, getAllContent, uploadMultipleContent, deleteContent } = require('../controllers/materialController');
const { addSession, getSessionsByGrade } = require('../controllers/sessionController');
const {
    getAllTrainers,
    updateTrainer,
    deleteUser,
    assignTrainerSchoolsAndGrades,
    getAllStudents,
    updateStudent,
    assignStudentTrainer,
    getAllSchools: getAllUniqueSchoolsFromStudents,
    getGradesBySchool,
    getStudentFeedback,
} = require('../controllers/userManagementController');

// Import the new school controller functions
const {
    addSchool,
    getAllSchools,
    getSchoolDetails,
    updateSchool,
    deleteSchool,
    getAssignedTrainersBySchool,
    getStudentsBySchool,
    getTimetableBySchoolAndGrade,
    editTimetableBySchoolAndGrade
} = require('../controllers/schoolController');

const { getTrainerStudentFeedback } = require('../controllers/feedBackController'); // CRITICAL: Ensure this is imported

// --- NEW IMPORTS FOR QUIZ CONTROLLER ---
const {
    createQuiz,
    getAllQuizzes,
    getQuizById,
    updateQuiz,
    deleteQuiz,
    submitQuiz, // If admin can also submit for testing/demo
    getStudentQuizAttempts, // If admin can view a student's attempts directly
    getQuizAttemptsForQuiz // If admin can see attempts for a specific quiz
} = require('../controllers/quizController');
// --- END NEW IMPORTS ---

// Multer configuration (temporary disk storage for Cloudinary upload)
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
        cb(null, uniqueName);
    }
});

const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const mime = file.mimetype;

    const allowedDocExtensions = ['.ppt', '.pptx', '.pdf', '.doc', '.docx'];
    const allowedVideoMimeTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo', 'video/x-flv'];

    const contentType = req.body.type;

    if (contentType === 'video') {
        if (allowedVideoMimeTypes.includes(mime)) {
            cb(null, true);
        } else {
            cb(new Error(`Only video files (${allowedVideoMimeTypes.join(', ')}) are allowed for video content.`), false);
        }
    } else if (contentType === 'ebook' || contentType === 'presentation_multiple') { // REMOVED 'quiz' here
        if (allowedDocExtensions.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error(`Only document files (${allowedDocExtensions.join(', ')}) are allowed for ${contentType} content.`), false);
        }
    } else {
        cb(new Error('Invalid content type or file type.'));
    }
};


const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 500 * 1024 * 1024 // 500 MB
    }
});

console.log('Type of getAllContent:', typeof getAllContent);

// Admin Routes (all require auth and isAdmin)
router.post('/create-user', auth, isAdmin, createUser);

router.post('/upload-content', auth, isAdmin, upload.single('file'), uploadContent);
router.post('/upload-multiple-content', auth, isAdmin, upload.array('files'), uploadMultipleContent);
router.get('/content', auth, isAdmin, getAllContent);
router.delete('/content/:id', auth, isAdmin, deleteContent);

router.post('/add-session', auth, isAdmin, addSession);
router.get('/sessions', auth, isAdmin, getSessionsByGrade);

router.get('/trainers', auth, isAdmin, getAllTrainers);
router.put('/trainers/:id', auth, isAdmin, updateTrainer);
router.delete('/trainers/:id', auth, isAdmin, deleteUser); // Reuses deleteUser
router.put('/trainers/:id/assign', auth, isAdmin, assignTrainerSchoolsAndGrades);

router.get('/students', auth, isAdmin, getAllStudents);
router.put('/students/:id', auth, isAdmin, updateStudent);
router.delete('/students/:id', auth, isAdmin, deleteUser); // Reuses deleteUser
router.put('/students/:id/assign-trainer', auth, isAdmin, assignStudentTrainer);

// School-related routes (formerly from userManagement, now from School model and controller)
router.get('/schools/unique-student-schools', auth, isAdmin, getAllUniqueSchoolsFromStudents);
router.get('/schools/:schoolName/grades', auth, isAdmin, getGradesBySchool);

router.get('/trainers/:trainerId/student-feedback', auth, isAdmin, getTrainerStudentFeedback);
router.get('/students/:id/feedback', auth, isAdmin, getStudentFeedback);

// NEW SCHOOL MANAGEMENT ROUTES
router.post('/schools', auth, isAdmin, addSchool);
router.get('/schools', auth, isAdmin, getAllSchools);
router.get('/schools/:id', auth, isAdmin, getSchoolDetails);
router.put('/schools/:id', auth, isAdmin, updateSchool);
router.delete('/schools/:id', auth, isAdmin, deleteSchool);

router.get('/schools/:schoolName/trainers', auth, isAdmin, getAssignedTrainersBySchool);
router.get('/schools/:schoolName/students', auth, isAdmin, getStudentsBySchool);
router.get('/schools/:schoolName/grades/:grade/timetable', auth, isAdmin, getTimetableBySchoolAndGrade);
router.put('/schools/:schoolName/grades/:grade/timetable', auth, isAdmin, editTimetableBySchoolAndGrade);


// --- NEW QUIZ MANAGEMENT ROUTES FOR ADMIN ---
router.post('/quizzes', auth, isAdmin, createQuiz); // Admin can add a new quiz
router.get('/quizzes', auth, isAdmin, getAllQuizzes); // Admin can view all quizzes (with correct answers)
router.get('/quizzes/:id', auth, isAdmin, getQuizById); // Admin can view a specific quiz (with correct answers)
router.put('/quizzes/:id', auth, isAdmin, updateQuiz); // Admin can update a quiz
router.delete('/quizzes/:id', auth, isAdmin, deleteQuiz); // Admin can delete (soft-delete) a quiz

// // Optional: Admin can also view quiz attempts for specific quizzes or students
// router.get('/quizzes/:quizId/attempts', auth, isAdmin, getQuizAttemptsForQuiz); // View all attempts for a quiz
// router.get('/students/:studentId/quiz-attempts', auth, isAdmin, getStudentQuizAttempts); // View all attempts by a student
// // --- END NEW QUIZ MANAGEMENT ROUTES ---

module.exports = router;