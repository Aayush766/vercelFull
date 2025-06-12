// models/Timetable.js (Example)
const mongoose = require('mongoose');

const timetableEntrySchema = new mongoose.Schema({
    day: { type: String, required: true },
    time: { type: String, required: true },
    subject: { type: String, required: true },
    trainer: { type: String, required: true } // Could be ref to User later
});

const timetableSchema = new mongoose.Schema({
    schoolName: { type: String, required: true, ref: 'School' }, // Reference by name for now
    grade: { type: Number, required: true },
    schedule: [timetableEntrySchema]
}, {
    timestamps: true
});

timetableSchema.index({ schoolName: 1, grade: 1 }, { unique: true }); // Ensure unique timetable per school-grade combo

module.exports = mongoose.model('Timetable', timetableSchema);