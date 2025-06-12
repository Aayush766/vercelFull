// src/components/admin/ManageStudents.jsx
import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig'; // Ensure this is your configured axios instance
import { FaEdit, FaTrash, FaPlus, FaUserTie, FaSpinner, FaClipboardList } from 'react-icons/fa';
import ViewFeedbackModal from './ViewFeedbackModal'; // Import the new feedback display modal

// Student Card component - Defined OUTSIDE of ManageStudents
const StudentCard = ({ student, handleAssignTrainerClick, handleEditClick, handleDeleteStudent, handleShowFeedback }) => (
    <div className="p-6 rounded-lg shadow-md flex flex-col justify-between bg-white text-gray-800 border border-gray-200">
        <h3 className="text-xl font-bold mb-2">{student.name}</h3>
        <p className="text-sm mb-1">Email: {student.email}</p>
        {/* Ensure student.school is a string here, typically from the backend */}
        <p className="text-sm mb-1">School: {student.school}</p>
        <p className="text-sm mb-1">Grade: {student.grade} - Class: {student.class}</p>
        <p className="text-sm mb-1">Roll No: {student.rollNumber}</p>
        <p className="text-sm mb-1">Father's Name: {student.fatherName}</p>
        <p className="text-sm mb-4">Assigned Trainer: {student.assignedTrainer?.name || 'N/A'}</p>

        <div className="flex flex-wrap gap-2 justify-end">
            <button
                onClick={() => handleAssignTrainerClick(student)}
                className="flex items-center gap-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-md text-sm transition-colors"
                title="Assign Trainer"
            >
                <FaUserTie /> Assign Trainer
            </button>
            <button
                onClick={() => handleEditClick(student)}
                className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm transition-colors"
                title="Edit Student Details"
            >
                <FaEdit /> Edit
            </button>
            <button
                onClick={() => handleDeleteStudent(student._id)}
                className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm transition-colors"
                title="Delete Student"
            >
                <FaTrash /> Delete
            </button>
            <button
                onClick={() => handleShowFeedback(student)}
                className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm transition-colors"
                title="View Feedback"
            >
                <FaClipboardList /> Feedback
            </button>
        </div>
    </div>
);


const ManageStudents = () => {
    const [students, setStudents] = useState([]);
    const [schools, setSchools] = useState([]);
    const [grades, setGrades] = useState([]);
    const [trainers, setTrainers] = useState([]);
    const [selectedSchool, setSelectedSchool] = useState('');
    const [selectedGrade, setSelectedGrade] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false); // For Add/Edit student
    const [showAssignTrainerForm, setShowAssignTrainerForm] = useState(false);
    const [showFeedbackDisplayModal, setShowFeedbackDisplayModal] = useState(false); // For displaying student feedback
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', role: 'student',
        grade: '', session: '', class: '', rollNumber: '', school: '', dob: '', fatherName: '',
        assignedTrainer: '' // Trainer ID
    });

    // Effect to fetch initial data: schools and trainers
    useEffect(() => {
        fetchSchools();
        fetchTrainersList();
    }, []);

    // Effect to fetch grades when selectedSchool changes
    useEffect(() => {
        if (selectedSchool) {
            fetchGradesBySchool(selectedSchool);
        } else {
            setGrades([]); // Clear grades if no school selected
            setSelectedGrade(''); // Clear selected grade
        }
    }, [selectedSchool]);

    // Effect to fetch students when selectedSchool or selectedGrade changes
    useEffect(() => {
        if (selectedSchool && selectedGrade) {
            fetchStudentsBySchoolAndGrade();
        } else {
            setStudents([]); // Clear students if no school/grade selected
        }
    }, [selectedSchool, selectedGrade]);

    // Fetches list of schools from the backend
    const fetchSchools = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/admin/schools');
            // FIX: Use optional chaining to safely access 'schools' property,
            // assuming backend returns { schools: [...] } OR directly the array.
            setSchools(response.data?.schools || response.data || []);
            console.log("Fetched schools data (processed):", response.data?.schools || response.data);
        } catch (err) {
            console.error('Error fetching schools:', err);
            setError('Failed to fetch schools.');
            setSchools([]); // Ensure state is an empty array on error
        } finally {
            setLoading(false);
        }
    };

    // Fetches grades for a specific school from the backend
    const fetchGradesBySchool = async (schoolName) => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get(`/admin/schools/${schoolName}/grades`);
            // FIX: Use optional chaining to safely access 'grades' property,
            // assuming backend returns { grades: [...] } OR directly the array.
            setGrades(response.data?.grades || response.data || []);
            console.log("Fetched grades data (processed):", response.data?.grades || response.data);
            setSelectedGrade(''); // Reset grade selection when school changes
        } catch (err) {
            console.error('Error fetching grades for school:', err.response?.data || err.message);
            setError('Failed to fetch grades for the selected school.');
            setGrades([]); // Ensure state is an empty array on error
        } finally {
            setLoading(false);
        }
    };

    // Fetches students based on selected school and grade
    const fetchStudentsBySchoolAndGrade = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get(`/admin/students`, {
                params: { school: selectedSchool, grade: selectedGrade }
            });
            // FIX: Use optional chaining to safely access 'users' property,
            // assuming backend returns { users: [...] } for students (or students array directly)
            setStudents(response.data?.users || response.data?.students || []);
            console.log("Fetched students data (processed):", response.data?.users || response.data?.students);
        } catch (err) {
            console.error('Error fetching students:', err);
            setError(err.response?.data?.msg || 'Failed to fetch students. Please try again.');
            setStudents([]); // Ensure state is an empty array on error
        } finally {
            setLoading(false);
        }
    };

    // Fetches list of trainers
    const fetchTrainersList = async () => {
        try {
            const response = await axios.get('/admin/trainers');
            // FIX: Use optional chaining to safely access 'users' property,
            // assuming backend returns { users: [...] } for trainers (or trainers array directly)
            setTrainers(response.data?.users || response.data?.trainers || []);
            console.log("Fetched trainers data (processed):", response.data?.users || response.data?.trainers);
        } catch (err) {
            console.error('Error fetching trainers list:', err);
            setTrainers([]); // Ensure state is an empty array on error
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleOpenCreateForm = () => {
        setFormData({
            name: '', email: '', password: '', role: 'student',
            grade: '', session: '', class: '', rollNumber: '', school: '', dob: '', fatherName: '',
            assignedTrainer: ''
        });
        setSelectedStudent(null); // Clear selected student for new creation
        setShowForm(true); // Open the form modal
    };

    const handleCreateStudent = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const payload = { ...formData, role: 'student' };
            await axios.post('/admin/create-user', payload);
            alert('Student created successfully!');
            setShowForm(false);
            // Refresh student list if filters are active, otherwise fetch all schools again
            if (selectedSchool && selectedGrade) {
                fetchStudentsBySchoolAndGrade();
            }
            fetchSchools(); // Re-fetch schools in case a new school was added via student creation
        } catch (err) {
            console.error('Error creating student:', err);
            setError(err.response?.data?.msg || 'Failed to create student.');
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (student) => {
        setSelectedStudent(student);
        setFormData({
            name: student.name,
            email: student.email,
            password: '', // Password should not be pre-filled for security
            grade: student.grade,
            session: student.session,
            class: student.class,
            rollNumber: student.rollNumber,
            school: student.school,
            dob: student.dob ? student.dob.split('T')[0] : '', // Format DOB for date input
            fatherName: student.fatherName,
            assignedTrainer: student.assignedTrainer?._id || '', // Safely access trainer ID
        });
        setShowForm(true); // Open the form modal for editing
    };

    const handleUpdateStudent = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const payload = { ...formData };
            if (payload.password === '') {
                delete payload.password; // Don't send empty password if not changed
            }
            await axios.put(`/admin/students/${selectedStudent._id}`, payload);
            alert('Student updated successfully!');
            setShowForm(false);
            setSelectedStudent(null); // Clear selected student
            fetchStudentsBySchoolAndGrade(); // Refresh list
            fetchSchools(); // Re-fetch schools in case school name was changed
        } catch (err) {
            console.error('Error updating student:', err);
            setError(err.response?.data?.msg || 'Failed to update student.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteStudent = async (studentId) => {
        if (window.confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
            setLoading(true);
            setError('');
            try {
                await axios.delete(`/admin/students/${studentId}`);
                alert('Student deleted successfully!');
                fetchStudentsBySchoolAndGrade(); // Refresh list
            } catch (err) {
                console.error('Error deleting student:', err);
                setError(err.response?.data?.msg || 'Failed to delete student.');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleAssignTrainerClick = (student) => {
        setSelectedStudent(student);
        setFormData(prev => ({ ...prev, assignedTrainer: student.assignedTrainer?._id || '' }));
        setShowAssignTrainerForm(true);
    };

    const handleAssignTrainer = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await axios.put(`/admin/students/${selectedStudent._id}/assign-trainer`, {
                trainerId: formData.assignedTrainer
            });
            alert('Trainer assigned successfully!');
            setShowAssignTrainerForm(false);
            setSelectedStudent(null);
            fetchStudentsBySchoolAndGrade(); // Refresh list to show updated trainer
        } catch (err) {
            console.error('Error assigning trainer:', err);
            setError(err.response?.data?.msg || 'Failed to assign trainer.');
        } finally {
            setLoading(false);
        }
    };

    const handleShowFeedback = (student) => {
        setSelectedStudent(student);
        setShowFeedbackDisplayModal(true);
    };

    return (
        <div className="p-6 rounded-lg bg-gray-50 min-h-screen">
            <h1 className="text-2xl font-bold mb-4">Manage Students</h1>

            {loading && (
                <div className="flex items-center justify-center text-lg text-purple-600">
                    <FaSpinner className="animate-spin mr-2" /> Loading...
                </div>
            )}

            {error && (
                <div className="text-red-600 mb-4 font-semibold">{error}</div>
            )}

            <div className="flex gap-4 mb-6">
                <select
                    value={selectedSchool}
                    onChange={(e) => setSelectedSchool(e.target.value)}
                    className="p-2 border rounded"
                >
                    <option value="">Select School</option>
                    {/* `schools` is guaranteed to be an array here due to initial state and fetch logic */}
                    {schools.map((school) => (
                        <option key={school._id} value={school.schoolName}>
                            {school.schoolName}
                        </option>
                    ))}
                </select>

                <select
                    value={selectedGrade}
                    onChange={(e) => setSelectedGrade(e.target.value)}
                    className="p-2 border rounded"
                    disabled={!grades.length} // Disable if grades array is empty
                >
                    <option value="">Select Grade</option>
                    {/* `grades` is now correctly handled to be an array (even if empty) by fetchGradesBySchool */}
                    {grades.map((grade) => (
                        <option key={grade} value={grade}>{grade}</option>
                    ))}
                </select>

                <button
                    onClick={handleOpenCreateForm}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                >
                    <FaPlus /> Add Student
                </button>
            </div>

            {/* Students List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Conditional rendering for messages if no students or filters not applied */}
                {students.length === 0 && !loading && !error && selectedSchool && selectedGrade ? (
                    <p className="col-span-full text-center text-gray-600">No students found for the selected school and grade.</p>
                ) : students.length === 0 && !loading && !error && (!selectedSchool || !selectedGrade) ? (
                    <p className="col-span-full text-center text-gray-600">Please select a school and grade to view students.</p>
                ) : (
                    // `students` is guaranteed to be an array here due to initial state and fetch logic
                    students.map((student) => {
                        return (
                            <StudentCard
                                key={student._id}
                                student={student}
                                handleAssignTrainerClick={handleAssignTrainerClick}
                                handleEditClick={handleEditClick}
                                handleDeleteStudent={handleDeleteStudent}
                                handleShowFeedback={handleShowFeedback}
                            />
                        );
                    })
                )}
            </div>

            {/* Modals */}
            {showFeedbackDisplayModal && selectedStudent && (
                <ViewFeedbackModal
                    student={selectedStudent}
                    onClose={() => {
                        setShowFeedbackDisplayModal(false);
                        setSelectedStudent(null);
                    }}
                />
            )}

            {/* Trainer Assignment Form Modal */}
            {showAssignTrainerForm && selectedStudent && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                    <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
                        <h2 className="text-xl font-semibold mb-4">Assign Trainer to {selectedStudent.name}</h2>
                        <form onSubmit={handleAssignTrainer}>
                            <select
                                name="assignedTrainer"
                                value={formData.assignedTrainer}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded mb-4"
                            >
                                <option value="">Select Trainer</option>
                                {/* `trainers` is guaranteed to be an array here */}
                                {trainers.map((trainer) => (
                                    <option key={trainer._id} value={trainer._id}>
                                        {trainer.name}
                                    </option>
                                ))}
                            </select>
                            <div className="flex justify-end gap-2">
                                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Assign</button>
                                <button type="button" className="bg-gray-400 text-white px-4 py-2 rounded" onClick={() => setShowAssignTrainerForm(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add/Edit Student Form Modal */}
            {showForm && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                    <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg overflow-y-auto max-h-[90vh]"> {/* Added overflow for long forms */}
                        <h2 className="text-xl font-semibold mb-4">{selectedStudent ? 'Edit Student' : 'Add New Student'}</h2>
                        <form onSubmit={selectedStudent ? handleUpdateStudent : handleCreateStudent}>
                            {/* Input fields for student data */}
                            <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleInputChange} required className="w-full p-2 border mb-2 rounded" />
                            <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleInputChange} required className="w-full p-2 border mb-2 rounded" />
                            {!selectedStudent && ( // Only show password field for new student creation
                                <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleInputChange} required className="w-full p-2 border mb-2 rounded" />
                            )}
                            <input type="text" name="school" placeholder="School" value={formData.school} onChange={handleInputChange} required className="w-full p-2 border mb-2 rounded" />
                            <input type="text" name="grade" placeholder="Grade" value={formData.grade} onChange={handleInputChange} required className="w-full p-2 border mb-2 rounded" />
                            <input type="text" name="class" placeholder="Class" value={formData.class} onChange={handleInputChange} required className="w-full p-2 border mb-2 rounded" />
                            <input type="text" name="rollNumber" placeholder="Roll Number" value={formData.rollNumber} onChange={handleInputChange} className="w-full p-2 border mb-2 rounded" />
                            <input type="text" name="fatherName" placeholder="Father's Name" value={formData.fatherName} onChange={handleInputChange} className="w-full p-2 border mb-2 rounded" />
                            <input type="date" name="dob" placeholder="Date of Birth" value={formData.dob} onChange={handleInputChange} className="w-full p-2 border mb-2 rounded" />
                            <input type="text" name="session" placeholder="Session" value={formData.session} onChange={handleInputChange} className="w-full p-2 border mb-2 rounded" />

                            <div className="flex justify-end gap-2 mt-4">
                                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                                    {selectedStudent ? 'Update' : 'Create'}
                                </button>
                                <button type="button" onClick={() => { setShowForm(false); setSelectedStudent(null); }} className="bg-gray-400 text-white px-4 py-2 rounded">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ManageStudents;