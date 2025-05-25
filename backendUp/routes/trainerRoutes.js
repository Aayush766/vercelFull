const express = require('express');
const router = express.Router();
const { auth, isTrainerOrAdmin } = require('../middleware/authMiddleware');
const Content = require('../models/Content'); // Assuming trainers might upload content or manage it

// Example: Trainers can view all content they uploaded
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

// Example: Trainers can upload content (if you want them to, currently only admin can)
// If trainers are allowed to upload, you'd add similar multer setup here as in adminRoutes
// router.post('/upload-content', auth, isTrainerOrAdmin, upload.single('file'), materialController.uploadContent);

module.exports = router;