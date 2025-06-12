// models/School.js
const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema({
    schoolName: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    schoolCode: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true
    },
    address: {
        type: String,
        required: true,
        trim: true
    },
    city: {
        type: String,
        required: true,
        trim: true
    },
    schoolCoordinatorName: {
        type: String,
        required: true,
        trim: true
    },
    schoolCoordinatorContact: {
        type: String, // Consider validating as a phone number if strict format is needed
        required: true,
        trim: true
    },
    schoolPrincipalName: {
        type: String,
        required: true,
        trim: true
    },
    schoolPrincipalContact: {
        type: String, // Consider validating as a phone number
        required: true,
        trim: true
    }
}, {
    timestamps: true // Adds createdAt and updatedAt timestamps
});

module.exports = mongoose.model('School', schoolSchema);