// controllers/schoolController.js
const School = require('../models/School');
const User = require('../models/User'); // Assuming User model is needed for populating

// Add a new School
exports.addSchool = async (req, res) => {
    try {
        const {
            schoolName,
            schoolCode,
            address,
            city,
            schoolCoordinatorName,
            schoolCoordinatorContact,
            schoolPrincipalName,
            schoolPrincipalContact
        } = req.body;

        // Basic validation
        if (!schoolName || !schoolCode || !address || !city || !schoolCoordinatorName || !schoolCoordinatorContact || !schoolPrincipalName || !schoolPrincipalContact) {
            return res.status(400).json({ msg: 'All school fields are required.' });
        }

        // Check if school already exists by name or code
        let school = await School.findOne({ $or: [{ schoolName }, { schoolCode }] });
        if (school) {
            return res.status(400).json({ msg: 'School with this name or code already exists.' });
        }

        school = new School({
            schoolName,
            schoolCode,
            address,
            city,
            schoolCoordinatorName,
            schoolCoordinatorContact,
            schoolPrincipalName,
            schoolPrincipalContact
        });

        await school.save();
        res.status(201).json({ msg: 'School added successfully', school });

    } catch (err) {
        console.error('Error adding school:', err);
        // Handle duplicate key errors specifically for unique fields
        if (err.code === 11000) {
            if (err.keyPattern && err.keyPattern.schoolName) {
                return res.status(400).json({ msg: 'A school with this name already exists.' });
            }
            if (err.keyPattern && err.keyPattern.schoolCode) {
                return res.status(400).json({ msg: 'A school with this code already exists.' });
            }
        }
        // Handle Mongoose validation errors
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ msg: `Validation error: ${messages.join(', ')}` });
        }
        res.status(500).json({ msg: 'Server error adding school', error: err.message });
    }
};

// Get all schools
exports.getAllSchools = async (req, res) => {
    try {
        const schools = await School.find({});
        res.json(schools); // Send array directly as frontend expects it for dropdown
    } catch (err) {
        console.error('Error fetching all schools:', err);
        res.status(500).json({ msg: 'Server error fetching schools', error: err.message });
    }
};

// Get a single school by ID with details
exports.getSchoolDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const school = await School.findById(id);

        if (!school) {
            return res.status(404).json({ msg: 'School not found.' });
        }

        res.json({ school });
    } catch (err) {
        console.error('Error fetching school details:', err);
        res.status(500).json({ msg: 'Server error fetching school details', error: err.message });
    }
};


// Update a school by ID
exports.updateSchool = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            schoolName,
            schoolCode,
            address,
            city,
            schoolCoordinatorName,
            schoolCoordinatorContact,
            schoolPrincipalName,
            schoolPrincipalContact
        } = req.body;

        const school = await School.findById(id);

        if (!school) {
            return res.status(404).json({ msg: 'School not found.' });
        }

        // Update fields if provided
        school.schoolName = schoolName || school.schoolName;
        school.schoolCode = schoolCode || school.schoolCode;
        school.address = address || school.address;
        school.city = city || school.city;
        school.schoolCoordinatorName = schoolCoordinatorName || school.schoolCoordinatorName;
        school.schoolCoordinatorContact = schoolCoordinatorContact || school.schoolCoordinatorContact;
        school.schoolPrincipalName = schoolPrincipalName || school.schoolPrincipalName;
        school.schoolPrincipalContact = schoolPrincipalContact || school.schoolPrincipalContact;

        await school.save(); // This will trigger Mongoose validation

        res.json({ msg: 'School updated successfully', school });

    } catch (err) {
        console.error('Error updating school:', err);
        if (err.code === 11000) {
            return res.status(400).json({ msg: 'Error updating school: Duplicate school name or code.' });
        }
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ msg: `Validation error: ${messages.join(', ')}` });
        }
        res.status(500).json({ msg: 'Server error updating school', error: err.message });
    }
};

// Delete a school by ID
exports.deleteSchool = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedSchool = await School.findByIdAndDelete(id);

        if (!deletedSchool) {
            return res.status(404).json({ success: false, message: 'School not found' });
        }

        res.status(200).json({ success: true, message: 'School deleted successfully' });
    } catch (error) {
        console.error('Error deleting school:', error);
        res.status(500).json({ success: false, message: 'Server error during school deletion' });
    }
};

// Get assigned trainers for a specific school
exports.getAssignedTrainersBySchool = async (req, res) => {
    try {
        const { schoolName } = req.params; // Use schoolName from params

        const trainers = await User.find({
            role: 'trainer',
            // Check if schoolName exists in either trainerSchool (single string) or assignedSchools (array)
            $or: [
                { trainerSchool: schoolName },
                { assignedSchools: schoolName }
            ]
        }).select('_id name email'); // Exclude sensitive fields, select only necessary for frontend dropdown

        res.json({ trainers });
    } catch (err) {
        console.error('Error fetching assigned trainers for school:', err);
        res.status(500).json({ msg: 'Server error fetching assigned trainers', error: err.message });
    }
};

// Get students for a specific school (grade-wise or all)
exports.getStudentsBySchool = async (req, res) => {
    try {
        const { schoolName } = req.params;
        const { grade } = req.query; // Optional: filter by grade

        let query = { role: 'student', school: schoolName };
        if (grade) {
            query.grade = parseInt(grade);
        }

        // Populate assignedTrainer to show trainer name and email
        const students = await User.find(query)
            .select('-password -resetPasswordToken -resetPasswordExpire')
            .populate('assignedTrainer', 'name email');

        res.json({ students });
    } catch (err) {
        console.error('Error fetching students for school:', err);
        res.status(500).json({ msg: 'Server error fetching students', error: err.message });
    }
};

// Get timetable for a specific school and grade
// NOTE: This assumes you have a Timetable model. If not, this is a placeholder.
// For now, it will return a placeholder response.
exports.getTimetableBySchoolAndGrade = async (req, res) => {
    try {
        const { schoolName, grade } = req.params;

        // --- PLACEHOLDER LOGIC ---
        // In a real application, you would query your Timetable model here.
        // Example: const timetable = await Timetable.findOne({ school: schoolName, grade: parseInt(grade) });
        // If you don't have a Timetable model yet, you'll need to create one.
        // For now, we'll return mock data.
        const mockTimetable = {
            school: schoolName,
            grade: parseInt(grade),
            schedule: [
                { day: 'Monday', time: '9:00 AM', subject: 'Math', trainer: 'John Doe' },
                { day: 'Monday', time: '10:00 AM', subject: 'Science', trainer: 'Jane Smith' },
                // ... more entries
            ],
            lastUpdated: new Date()
        };

        // You might need to check if a timetable exists
        // if (!timetable) return res.status(404).json({ msg: 'Timetable not found for this school and grade.' });

        res.json({ timetable: mockTimetable });

    } catch (err) {
        console.error('Error fetching timetable:', err);
        res.status(500).json({ msg: 'Server error fetching timetable', error: err.message });
    }
};

// Edit timetable for a specific school and grade
// NOTE: This is also a placeholder assuming a Timetable model for future implementation.
exports.editTimetableBySchoolAndGrade = async (req, res) => {
    try {
        const { schoolName, grade } = req.params;
        const { schedule } = req.body; // Expecting an array of schedule objects

        // --- PLACEHOLDER LOGIC ---
        // In a real application, you would find and update your Timetable model here.
        // Example:
        // let timetable = await Timetable.findOne({ school: schoolName, grade: parseInt(grade) });
        // if (!timetable) {
        //      timetable = new Timetable({ school: schoolName, grade: parseInt(grade), schedule });
        // } else {
        //      timetable.schedule = schedule;
        // }
        // await timetable.save();

        res.json({ msg: `Timetable for ${schoolName}, Grade ${grade} updated successfully (mock update).`, updatedSchedule: schedule });

    } catch (err) {
        console.error('Error editing timetable:', err);
        res.status(500).json({ msg: 'Server error editing timetable', error: err.message });
    }
};