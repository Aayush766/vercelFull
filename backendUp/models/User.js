const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['admin', 'trainer', 'student'],
        default: 'student',
    },
    // Common fields
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    contactNumber: { type: String, required: true },
    address: { type: String, required: true },
    dob: { type: Date, required: true },
    profilePicture: { type: String }, // URL to profile picture

    // Admin specific fields (conditional) - if you have any, otherwise remove
    // adminSpecificField: { type: String, required: function() { return this.role === 'admin'; } },

    // Student specific fields (conditional)
    school: { type: String, required: function() { return this.role === 'student'; } },
    grade: { type: Number, required: function() { return this.role === 'student'; } },
    assignedTrainer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: function() { return this.role === 'student'; },
        // Ensure that assignedTrainer must be a 'trainer' role
        validate: {
            validator: async function(v) {
                if (this.role === 'student' && v) {
                    const trainer = await mongoose.model('User').findById(v);
                    return trainer && trainer.role === 'trainer';
                }
                return true;
            },
            message: props => `${props.value} is not a valid trainer ID!`
        }
    },
    batch: { type: String, required: function() { return this.role === 'student'; } },


    // Trainer specific fields (conditional)
    subject: { type: String, required: function() { return this.role === 'trainer'; } },
    trainerSchool: { type: String, required: function() { return this.role === 'trainer'; } },
    classesTaught: { type: [String], required: function() { return this.role === 'trainer'; } },
    experience: { type: String, required: function() { return this.role === 'trainer'; } },
    contact: { type: String, required: function() { return this.role === 'trainer'; } },
    trainerDob: { type: Date, required: function() { return this.role === 'trainer'; } },
    assignedSchools: { type: [String], default: [], required: function() { return this.role === 'trainer'; } },
    assignedGrades: { type: [Number], default: [], required: function() { return this.role === 'trainer'; } },

    // Feedback from Admin FOR Trainers (if applicable)
    trainerFeedback: [{
        submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Admin ID
        lessonPlan: String,
        logbook: String,
        otherSuggestion: String,
        submittedAt: { type: Date, default: Date.now }
    }],
    // NEW: Student feedback for THIS trainer (stored on the trainer's document)
    studentFeedback: [{
        submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Student ID
        submittedByName: { type: String, required: true }, // Store student's name for easier display
        submittedBySchool: { type: String, required: true }, // Store student's school
        submittedByGrade: { type: Number, required: true }, // Store student's grade
        ratings: {
            'Teaching Quality': { type: Number, min: 0, max: 5, default: 0 },
            'Chapter Explanation': { type: Number, min: 0, max: 5, default: 0 },
            'Cleanliness': { type: Number, min: 0, max: 5, default: 0 },
            'Facilities': { type: Number, min: 0, max: 5, default: 0 },
            'Discipline': { type: Number, min: 0, max: 5, default: 0 },
        },
        feedback: { type: String, required: true }, // General feedback text
        submittedAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

// Password hashing middleware
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method to match password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);