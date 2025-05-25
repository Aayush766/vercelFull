// controllers/authController.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Helper function to generate tokens and set cookies
const generateTokensAndSetCookies = (user, res) => {
    const accessToken = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRATION || '15m' } // Short-lived access token
    );

    const refreshToken = jwt.sign(
        { id: user._id, role: user.role },
        process.env.REFRESH_TOKEN_SECRET, // Use a different secret for refresh tokens
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION || '7d' } // Longer-lived refresh token
    );

    // Set access token in an HTTP-only cookie
    res.cookie('accessToken', accessToken, {
        httpOnly: true, // Prevents client-side JavaScript from accessing
        secure: process.env.NODE_ENV === 'production', // Use secure in production (HTTPS)
        sameSite: 'Strict', // Protection against CSRF attacks
        maxAge: parseInt(process.env.ACCESS_TOKEN_COOKIE_MAXAGE || 900000) // 15 minutes in milliseconds
    });

    // Set refresh token in an HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        maxAge: parseInt(process.env.REFRESH_TOKEN_COOKIE_MAXAGE || 604800000) // 7 days in milliseconds
    });

    return { accessToken, refreshToken };
};

// Existing login function (for students)
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ msg: 'Please enter both email and password.' });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ msg: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ msg: 'Invalid credentials' });

        if (user.role !== 'student') {
            return res.status(403).json({ msg: 'Access denied. This login is for students only.' });
        }

        const { accessToken } = generateTokensAndSetCookies(user, res);

        res.json({
            msg: 'Logged in successfully',
            accessToken, // Frontend might still want access token for immediate use or display
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
};

// NEW: Admin Login Function
exports.loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ msg: 'Please enter both email and password.' });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ msg: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ msg: 'Invalid credentials' });

        if (user.role !== 'admin') {
            return res.status(403).json({ msg: 'Access denied. This login is for administrators only.' });
        }

        const { accessToken } = generateTokensAndSetCookies(user, res);

        res.json({
            msg: 'Logged in successfully',
            accessToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
};

// NEW: Trainer Login Function (similar to student/admin, assuming trainers also log in)
exports.loginTrainer = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ msg: 'Please enter both email and password.' });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ msg: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ msg: 'Invalid credentials' });

        if (user.role !== 'trainer') {
            return res.status(403).json({ msg: 'Access denied. This login is for trainers only.' });
        }

        const { accessToken } = generateTokensAndSetCookies(user, res);

        res.json({
            msg: 'Logged in successfully',
            accessToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
};

// NEW: Logout Function
exports.logout = (req, res) => {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.status(200).json({ msg: 'Logged out successfully' });
};

// NEW: Refresh Token Handler
exports.refreshToken = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({ msg: 'No refresh token provided.' });
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(404).json({ msg: 'User not found for refresh token.' });
        }

        const { accessToken } = generateTokensAndSetCookies(user, res); // Generate new tokens

        res.json({
            msg: 'New access token generated',
            accessToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (err) {
        console.error('Refresh token error:', err);
        // If refresh token is invalid or expired, clear cookies and prompt re-login
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        return res.status(403).json({ msg: 'Invalid or expired refresh token. Please log in again.' });
    }
};