// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config(); // Ensure dotenv is loaded first

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const studentRoutes = require('./routes/studentRoutes');
const trainerRoutes = require('./routes/trainerRoutes');

const app = express();

// --- FIX 1: Ensure FRONTEND_URL environment variable is CORRECT and present on Render ---
// Get your Netlify frontend URL. Example: https://lmsgk.netlify.app
// Set an environment variable named FRONTEND_URL in your Render backend service.
// Its value MUST be the exact Netlify URL (e.g., https://lmsgk.netlify.app).
app.use(cors({
    origin: process.env.FRONTEND_URL, // Allow your frontend origin
    credentials: true, // ABSOLUTELY ESSENTIAL for cookies to be sent and received
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // Explicitly list all methods your frontend uses
    optionsSuccessStatus: 204 // Good practice for preflight requests
}));

app.use(express.json());
app.use(cookieParser());

// --- FIX 2 (Optional but Recommended for Cookies): Adjust SameSite if needed ---
// This change goes into your authController.js (where generateTokensAndSetCookies is)
// (This is not in server.js, but crucial for cookies)
// If you continue to get 401 on refreshToken after other fixes, try this.
// In controllers/authController.js, in generateTokensAndSetCookies function:
// res.cookie('refreshToken', refreshToken, {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === 'production',
//     sameSite: 'Lax', // Changed from 'Strict' to 'Lax'
//     maxAge: parseInt(process.env.REFRESH_TOKEN_COOKIE_MAXAGE || 604800000)
// });
// Make the same change for accessToken cookie too.

app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/trainer', trainerRoutes);

const PORT = process.env.PORT || 5004;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('MongoDB connected');
        app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
    })
    .catch(err => console.log(err));
