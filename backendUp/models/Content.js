// models/Content.js (already correct)
const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
    title: { type: String, required: true },
    type: { type: String, required: true }, // e.g., 'ebook', 'video', 'quiz'
    fileUrl: { type: String }, // Optional (for video/quiz, might be URL to external service or just file path)
    videoList: [ // Array for video resources, if applicable (e.g., YouTube video IDs)
        {
            id: { type: String },       // e.g., YouTube video ID
            title: { type: String },
            thumbnail: { type: String }, // URL to thumbnail image
        }
    ],
    grade: { type: Number, required: true },
    session: { type: Number, required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Who uploaded this content
}, {
    timestamps: true
});

module.exports = mongoose.model('Content', contentSchema);