const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { auth, isAdmin } = require('../middleware/authMiddleware');
const { createUser } = require('../controllers/userManagementController');
const { uploadContent, getAllContent } = require('../controllers/materialController');
const { addSession } = require('../controllers/sessionController'); // Import the updated addSession
const { getSessionsByGrade} = require('../controllers/sessionController'); // Import the updated getSessionsByGrade
// Multer configuration (temporary disk storage for Cloudinary upload)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
    cb(null, uniqueName);
  }
});

// Filter for PPT, PPTX, PDF, DOC, DOCX
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = ['.ppt', '.pptx', '.pdf', '.doc', '.docx']; // Now allows more types
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Only ${allowedExtensions.join(', ')} files are allowed`), false);
  }
};

const upload = multer({ storage, fileFilter });

// Admin Routes (all require auth and isAdmin)
router.post('/create-user', auth, isAdmin, createUser);
// Admin can upload content (PPT/PDF/DOCX) or specify video content via body
router.post('/upload-content', auth, isAdmin, upload.single('file'), uploadContent);
router.get('/content', auth, isAdmin, getAllContent);
// Admin adds structured sessions (grade, name, topicName)
router.post('/add-session', auth, isAdmin, addSession);
router.get('/sessions', auth, isAdmin, getSessionsByGrade);

module.exports = router;