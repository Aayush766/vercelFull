import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from '../axiosConfig'; // Ensure this is your configured axios instance
import { FaEdit, FaTrash, FaPlus, FaSchool, FaGraduationCap, FaClipboardList, FaSpinner } from 'react-icons/fa';
import ViewFeedbackModal from './ViewFeedbackModal'; // Import the new feedback display modal

const ManageTrainers = ({ darkMode }) => {
    const [trainers, setTrainers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false); // For Add/Edit trainer
    const [showAssignForm, setShowAssignForm] = useState(false); // For assigning schools/grades
    const [showFeedbackDisplayModal, setShowFeedbackDisplayModal] = useState(false); // For displaying feedback
    const [selectedTrainer, setSelectedTrainer] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        subject: '',
        trainerSchool: '', // Main assigned school (single)
        classesTaught: [], // Classes they teach (e.g., 'Physics', 'Chemistry')
        experience: '',
        contact: '',
        trainerDob: '',
        assignedSchools: [], // Schools they are assigned to (multiple)
        assignedGrades: [], // Grades they can teach in assigned schools (multiple)
    });

    const [schools, setSchools] = useState([]); // State to hold available schools (fetched from backend)
    const availableGrades = Array.from({ length: 12 }, (_, i) => i + 1); // Grades 1 to 12

    useEffect(() => {
        fetchTrainers();
        fetchSchools();
    }, []);

    const fetchTrainers = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get('/admin/trainers');
            // Assuming response.data.users is the correct path to the trainers array
            setTrainers(response.data.users || []);
        } catch (err) {
            console.error('Error fetching trainers:', err);
            setError('Failed to fetch trainers. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const fetchSchools = async () => {
        try {
            const response = await axios.get('/admin/schools');
            // Ensure response.data.schools is the correct path to the schools array
            setSchools(response.data.schools || []);
        } catch (err) {
            console.error('Error fetching schools for assignment:', err);
            setError('Failed to fetch schools. Please try again.');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleMultiSelectChange = (e) => {
        const { name, options } = e.target;
        const value = Array.from(options)
            .filter(option => option.selected)
            .map(option => {
                // If it's assignedGrades, convert to a number
                return name === 'assignedGrades' ? parseInt(option.value, 10) : option.value;
            });
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleOpenCreateForm = () => {
        setFormData({
            name: '', email: '', password: '', subject: '', trainerSchool: '',
            classesTaught: [], experience: '', contact: '', trainerDob: '',
            assignedSchools: [], assignedGrades: []
        });
        setSelectedTrainer(null); // Ensure no trainer is selected for edit
        setShowForm(true);
    };

    const handleCreateTrainer = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const payload = { ...formData, role: 'trainer' };
            await axios.post('/admin/create-user', payload);
            alert('Trainer created successfully!');
            setShowForm(false);
            fetchTrainers();
        } catch (err) {
            console.error('Error creating trainer:', err);
            setError(err.response?.data?.msg || 'Failed to create trainer.');
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (trainer) => {
        setSelectedTrainer(trainer);
        setFormData({
            name: trainer.name,
            email: trainer.email,
            password: '', // Never pre-fill password for security
            subject: trainer.subject || '',
            trainerSchool: trainer.trainerSchool || '',
            classesTaught: trainer.classesTaught || [],
            experience: trainer.experience || '',
            contact: trainer.contact || '',
            trainerDob: trainer.trainerDob ? trainer.trainerDob.split('T')[0] : '',
            assignedSchools: trainer.assignedSchools || [],
            assignedGrades: trainer.assignedGrades || [],
        });
        setShowForm(true);
    };

    const handleUpdateTrainer = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const payload = { ...formData };
            if (payload.password === '') {
                delete payload.password; // Don't update password if empty
            }
            await axios.put(`/admin/trainers/${selectedTrainer._id}`, payload);
            alert('Trainer updated successfully!');
            setShowForm(false);
            setSelectedTrainer(null);
            fetchTrainers();
        } catch (err) {
            console.error('Error updating trainer:', err);
            setError(err.response?.data?.msg || 'Failed to update trainer.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTrainer = async (trainerId) => {
        if (window.confirm('Are you sure you want to delete this trainer? This action cannot be undone.')) {
            setLoading(true);
            setError('');
            try {
                await axios.delete(`/admin/trainers/${trainerId}`);
                alert('Trainer deleted successfully!');
                fetchTrainers();
            } catch (err) {
                console.error('Error deleting trainer:', err);
                setError(err.response?.data?.msg || 'Failed to delete trainer.');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleAssignClick = (trainer) => {
        setSelectedTrainer(trainer);
        // Pre-fill with existing assignments
        setFormData((prev) => ({
            ...prev, // Keep other form data
            assignedSchools: trainer.assignedSchools || [],
            assignedGrades: trainer.assignedGrades || [],
        }));
        setShowAssignForm(true);
    };

    const handleAssignSchoolsAndGrades = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await axios.put(`/admin/trainers/${selectedTrainer._id}/assign`, {
                assignedSchools: formData.assignedSchools,
                assignedGrades: formData.assignedGrades,
            });
            alert('Trainer assignments updated successfully!');
            setShowAssignForm(false);
            setSelectedTrainer(null);
            fetchTrainers();
        } catch (err) {
            console.error('Error assigning schools/grades:', err);
            setError(err.response?.data?.msg || 'Failed to assign schools/grades.');
        } finally {
            setLoading(false);
        }
    };

    const handleShowFeedback = (trainer) => {
        setSelectedTrainer(trainer);
        setShowFeedbackDisplayModal(true);
    };

    // Trainer Card component
    const TrainerCard = ({ trainer }) => (
        <motion.div
            className={`p-6 rounded-2xl shadow-xl flex flex-col justify-between
                ${darkMode ? 'bg-gray-800 text-white border border-gray-700' : 'bg-white text-gray-800 border border-gray-200'}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <h3 className="text-xl font-bold mb-2">{trainer.name}</h3>
            <p className="text-sm mb-1">Email: {trainer.email}</p>
            <p className="text-sm mb-1">Subject: {trainer.subject || 'N/A'}</p>
            <p className="text-sm mb-1">Main School: {trainer.trainerSchool || 'N/A'}</p>
            <p className="text-sm mb-1">Assigned Schools: {trainer.assignedSchools?.join(', ') || 'None'}</p>
            <p className="text-sm mb-1">Assigned Grades: {trainer.assignedGrades?.join(', ') || 'None'}</p>
            <p className="text-sm mb-1">Experience: {trainer.experience || 'N/A'}</p>
            <p className="text-sm mb-1">Contact: {trainer.contact || 'N/A'}</p>

            <div className="flex flex-wrap gap-2 justify-end mt-4"> {/* Added mt-4 for spacing */}
                <motion.button
                    onClick={() => handleAssignClick(trainer)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                    title="Assign Schools & Grades"
                >
                    <FaSchool /> Assign
                </motion.button>
                <motion.button
                    onClick={() => handleEditClick(trainer)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                    title="Edit Trainer Details"
                >
                    <FaEdit /> Edit
                </motion.button>
                <motion.button
                    onClick={() => handleDeleteTrainer(trainer._id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                    title="Delete Trainer"
                >
                    <FaTrash /> Delete
                </motion.button>
                <motion.button
                    onClick={() => handleShowFeedback(trainer)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                    title="View Feedback"
                >
                    <FaClipboardList /> Feedback
                </motion.button>
            </div>
        </motion.div>
    );

    return (
        <motion.div
            className={`p-6 rounded-3xl shadow-2xl ${darkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800 text-white' : 'bg-gradient-to-br from-blue-50 to-white text-gray-800'} transition-all duration-500`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <h2 className="text-3xl font-bold mb-6 text-center">Manage Trainers</h2>

            {error && <p className="text-red-500 text-center mb-4">{error}</p>}

            <motion.button
                onClick={handleOpenCreateForm}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg mb-6 mx-auto"
            >
                <FaPlus /> Add New Trainer
            </motion.button>

            {loading ? (
                <div className="flex justify-center items-center h-40">
                    <FaSpinner className="animate-spin text-4xl text-blue-500" />
                </div>
            ) : trainers.length === 0 ? (
                <p className="text-center text-lg mt-8 text-gray-500">No trainers found. Add a new trainer!</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {trainers.map((trainer) => (
                        <TrainerCard key={trainer._id} trainer={trainer} />
                    ))}
                </div>
            )}

            {/* Create/Edit Trainer Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <motion.div
                        className={`p-8 rounded-2xl shadow-lg w-full max-w-md ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                    >
                        <h3 className="text-2xl font-bold mb-4">{selectedTrainer ? 'Edit Trainer' : 'Add New Trainer'}</h3>
                        <form onSubmit={selectedTrainer ? handleUpdateTrainer : handleCreateTrainer} className="space-y-4">
                            <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleInputChange} className="w-full p-2 border rounded" required />
                            <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleInputChange} className="w-full p-2 border rounded" required />
                            {!selectedTrainer && ( // Password required only for new trainer
                                <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleInputChange} className="w-full p-2 border rounded" required />
                            )}
                            <input type="text" name="subject" placeholder="Subject (e.g., Math, Science)" value={formData.subject} onChange={handleInputChange} className="w-full p-2 border rounded" required />
                            <input type="text" name="trainerSchool" placeholder="Main Assigned School (single)" value={formData.trainerSchool} onChange={handleInputChange} className="w-full p-2 border rounded" />
                            <input type="text" name="experience" placeholder="Experience (e.g., 5 years)" value={formData.experience} onChange={handleInputChange} className="w-full p-2 border rounded" />
                            <input type="text" name="contact" placeholder="Contact Number" value={formData.contact} onChange={handleInputChange} className="w-full p-2 border rounded" />
                            <input type="date" name="trainerDob" placeholder="Date of Birth" value={formData.trainerDob} onChange={handleInputChange} className="w-full p-2 border rounded" />

                            <div className="flex justify-end gap-3 mt-4">
                                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                                    {selectedTrainer ? 'Update Trainer' : 'Add Trainer'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Assign Schools and Grades Modal */}
            {showAssignForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <motion.div
                        className={`p-8 rounded-2xl shadow-lg w-full max-w-md ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                    >
                        <h3 className="text-2xl font-bold mb-4">Assign Schools & Grades to {selectedTrainer?.name}</h3>
                        <form onSubmit={handleAssignSchoolsAndGrades} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Assign Schools:</label>
                                <select
                                    name="assignedSchools"
                                    multiple
                                    value={formData.assignedSchools}
                                    onChange={handleMultiSelectChange}
                                    className="w-full p-2 border rounded h-32 focus:ring-blue-400 focus:border-blue-400"
                                >
                                    {schools.length > 0 ? (
                                        schools.map(school => (
                                            <option key={school._id} value={school.schoolName}>{school.schoolName}</option>
                                        ))
                                    ) : (
                                        <option disabled>No schools available</option>
                                    )}
                                </select>
                                <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Assign Grades:</label>
                                <select
                                    name="assignedGrades"
                                    multiple
                                    value={formData.assignedGrades.map(String)} // Convert numbers to strings for select values
                                    onChange={handleMultiSelectChange}
                                    className="w-full p-2 border rounded h-32 focus:ring-blue-400 focus:border-blue-400"
                                >
                                    {availableGrades.map(grade => (
                                        <option key={grade} value={grade}>{`Grade ${grade}`}</option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple.</p>
                            </div>

                            <div className="flex justify-end gap-3 mt-4">
                                <button type="button" onClick={() => setShowAssignForm(false)} className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                                    Save Assignments
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Trainer Feedback Display Modal */}
            {showFeedbackDisplayModal && selectedTrainer && (
                <ViewFeedbackModal
                    darkMode={darkMode}
                    closeForm={() => { setShowFeedbackDisplayModal(false); setSelectedTrainer(null); }}
                    userId={selectedTrainer._id}
                    userRole="trainer"
                />
            )}
        </motion.div>
    );
};

export default ManageTrainers;