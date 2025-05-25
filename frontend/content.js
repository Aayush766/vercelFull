const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const contentController = require('../backendUp/controllers/materialController');
const authenticate = require('../middleware/authenticate'); // if needed

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// Route to upload content
router.post('/upload', authenticate, upload.single('file'), contentController.uploadContent);

module.exports = router;
