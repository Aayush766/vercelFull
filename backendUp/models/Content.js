// models/Content.js
const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
    title: { type: String, required: true },
    type: { type: String, required: true }, // e.g., 'ebook', 'video', 'quiz'
    fileUrl: { type: String }, // For 'ebook', 'video'
    videoList: [ // Array for external video resources
        {
            id: { type: String },
            title: { type: String },
            thumbnail: { type: String },
        }
    ],
    quiz: { // New field: Reference to a Quiz document
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
        required: function() { return this.type === 'quiz'; } // Required if type is 'quiz'
    },
    grade: { type: Number, required: true },
    session: { type: Number, required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, {
    timestamps: true
});

module.exports = mongoose.model('Content', contentSchema);