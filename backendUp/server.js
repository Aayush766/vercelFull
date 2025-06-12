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
app.use(cors({
    origin: [process.env.FRONTEND_URL || 'http://localhost:5175', 'http://localhost:5176','http://localhost:5174','http://localhost:5173','https://lmsgkai.netlify.app'], // Allow your frontend origin
    credentials: true // Allow cookies to be sent
}));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static('uploads')); // Keep this for any legacy local uploads or profile pictures for now

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
