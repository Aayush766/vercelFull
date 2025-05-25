// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

exports.auth = (req, res, next) => {
    const accessToken = req.cookies.accessToken; // Read from cookie

    if (!accessToken) {
        // If no access token, try to get a new one using the refresh token
        // This is a common pattern, but for simplicity here, we'll let the specific
        // /api/auth/refresh endpoint handle that. This middleware just checks the access token.
        return res.status(401).json({ msg: 'No access token provided.' });
    }

    try {
        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
        req.user = decoded; // Contains user ID and role
        next();
    } catch (err) {
        // If access token is invalid or expired, do not clear cookies here.
        // The frontend should be responsible for calling the /api/auth/refresh endpoint
        // when it detects a 401 on an authenticated request.
        res.status(401).json({ msg: 'Access token is not valid or expired.' });
    }
};

exports.isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ msg: 'Admin role required' });
    }
    next();
};

exports.isStudent = (req, res, next) => {
    if (req.user.role !== 'student') {
        return res.status(403).json({ msg: 'Student role required' });
    }
    next();
};

exports.isTrainerOrAdmin = (req, res, next) => {
    if (req.user.role !== 'trainer' && req.user.role !== 'admin') {
        return res.status(403).json({ msg: 'Trainer or Admin role required' });
    }
    next();
};