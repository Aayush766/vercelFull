const express = require('express');
const router = express.Router();
const { login, loginAdmin, logout } = require('../controllers/authController'); // Import both

router.post('/login', login); // Existing student login route
router.post('/admin/login', loginAdmin); // NEW: Dedicated admin login route
router.post('/logout', logout);

module.exports = router;
