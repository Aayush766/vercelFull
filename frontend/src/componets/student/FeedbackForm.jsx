import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaStar } from 'react-icons/fa';
import apiClient from '../../axiosConfig';

const ratingParameters = [
    'Teaching Quality',
    'Chapter Explanation',
    'Cleanliness',
    'Facilities',
    'Discipline',
];

// studentData is passed as a prop from the parent component (e.g., StudentDashboard)
// This prop should contain the logged-in student's full data, including assignedTrainer
const FeedbackForm = ({ darkMode, closeForm, studentData }) => {
    const [formData, setFormData] = useState({
        // Initialize with actual studentData values
        schoolName: studentData?.school || '',
        studentName: studentData?.name || '',
        grade: studentData?.grade || '', // Renamed from gradeSection to match schema
        feedback: '',
        ratings: {
            'Teaching Quality': 0,
            'Chapter Explanation': 0,
            'Cleanliness': 0,
            'Facilities': 0,
            'Discipline': 0,
        },
        // Initialize trainerId with the assigned trainer's ID, if available
        trainerId: studentData?.assignedTrainer?._id || '',
    });

    const [trainers, setTrainers] = useState([]);
    const [loadingTrainers, setLoadingTrainers] = useState(true);
    const [trainerError, setTrainerError] = useState('');
    const [submitStatus, setSubmitStatus] = useState('idle'); // 'idle', 'loading', 'success', 'error'
    const [submitError, setSubmitError] = useState(''); // Specific error for submission

    // Update formData if studentData changes
    useEffect(() => {
        if (studentData) {
            setFormData((prev) => ({
                ...prev,
                schoolName: studentData.school || '',
                studentName: studentData.name || '',
                grade: studentData.grade || '', // Renamed here
                trainerId: studentData.assignedTrainer?._id || '', // Default to assigned trainer
            }));
        }
    }, [studentData]);

    // Fetch trainers when the component mounts
    useEffect(() => {
        const fetchTrainers = async () => {
            setLoadingTrainers(true);
            setTrainerError('');
            try {
                // IMPORTANT: Fetch trainers from the NEW student-accessible endpoint
                const response = await apiClient.get('/student/trainers');
                if (Array.isArray(response.data)) {
                    setTrainers(response.data);
                } else {
                    console.warn('API response for trainers was not an array:', response.data);
                    setTrainerError('Unexpected trainers data format.');
                    setTrainers([]);
                }
            } catch (err) {
                console.error('Error fetching trainers:', err);
                setTrainerError('Failed to load trainers for selection. Please try again.');
                setTrainers([]);
            } finally {
                setLoadingTrainers(false);
            }
        };
        fetchTrainers();
    }, []); // Run once on component mount

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleRatingChange = (param, value) => {
        setFormData((prev) => ({
            ...prev,
            ratings: {
                ...prev.ratings,
                [param]: value,
            },
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitStatus('loading');
        setSubmitError('');

        // Client-side validation
        if (!formData.trainerId) {
            setSubmitError('Please select a trainer before submitting feedback.');
            setSubmitStatus('error');
            return;
        }
        if (!formData.feedback.trim()) {
            setSubmitError('Feedback text cannot be empty.');
            setSubmitStatus('error');
            return;
        }
        const allRatingsGiven = ratingParameters.every(param => formData.ratings[param] > 0);
        if (!allRatingsGiven) {
            setSubmitError('Please provide a rating for all parameters (1-5 stars).');
            setSubmitStatus('error');
            return;
        }

        try {
            // Send feedback to the backend
            await apiClient.post('/student/feedback/submit', {
                trainerId: formData.trainerId,
                // The backend will automatically get student's name, school, grade from req.user
                // No need to send schoolName, studentName, gradeSection from frontend in payload
                // if the backend is populating them from the student's logged-in session data.
                feedback: formData.feedback,
                ratings: formData.ratings,
            });

            setSubmitStatus('success');
            // Clear form after successful submission
            setFormData({
                schoolName: studentData?.school || '',
                studentName: studentData?.name || '',
                grade: studentData?.grade || '', // Renamed here
                feedback: '',
                ratings: {
                    'Teaching Quality': 0,
                    'Chapter Explanation': 0,
                    'Cleanliness': 0,
                    'Facilities': 0,
                    'Discipline': 0,
                },
                trainerId: studentData?.assignedTrainer?._id || '', // Reset to assigned trainer or empty
            });
            setTimeout(() => {
                closeForm(); // Close the form after a short delay for success message
            }, 1500); // Wait 1.5 seconds before closing
        } catch (error) {
            console.error('Error submitting feedback:', error.response?.data || error.message);
            setSubmitError(error.response?.data?.msg || 'Failed to submit feedback. An unexpected error occurred.');
            setSubmitStatus('error');
        }
    };

    return (
        <motion.div
            className={`p-6 rounded-3xl shadow-2xl mx-4 my-6 md:mx-10 md:my-10 transition-all duration-500
                ${darkMode
                    ? 'bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white border border-gray-700'
                    : 'bg-gradient-to-br from-blue-50 via-white to-blue-100 text-gray-800 border border-gray-200'}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
        >
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-3xl font-bold">📝 Feedback Form</h2>
                <button
                    onClick={closeForm}
                    className="text-red-500 font-semibold hover:underline text-lg"
                >
                    ✖ Close
                </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-2xl mx-auto">
                {/* School Name */}
                <div>
                    <label className="block mb-1 font-semibold" htmlFor="schoolName">School Name</label>
                    <input
                        type="text"
                        id="schoolName"
                        name="schoolName"
                        value={formData.schoolName}
                        readOnly
                        className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 cursor-not-allowed text-gray-700 dark:text-gray-300"
                    />
                </div>

                {/* Student Name */}
                <div>
                    <label className="block mb-1 font-semibold" htmlFor="studentName">Student Name</label>
                    <input
                        type="text"
                        id="studentName"
                        name="studentName"
                        value={formData.studentName}
                        readOnly
                        className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 cursor-not-allowed text-gray-700 dark:text-gray-300"
                    />
                </div>

                {/* Grade */}
                <div>
                    <label className="block mb-1 font-semibold" htmlFor="grade">Grade</label>
                    <input
                        type="text"
                        id="grade"
                        name="grade"
                        value={formData.grade}
                        readOnly
                        className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 cursor-not-allowed text-gray-700 dark:text-gray-300"
                    />
                </div>

                {/* Trainer Selection Dropdown */}
                <div>
                    <label className="block mb-1 font-semibold" htmlFor="trainerId">Assigned Trainer</label>
                    {loadingTrainers ? (
                        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading trainers...</p>
                    ) : trainerError ? (
                        <p className="text-red-500">{trainerError}</p>
                    ) : (
                        <select
                            id="trainerId"
                            name="trainerId"
                            value={formData.trainerId}
                            onChange={handleChange}
                            required
                            className={`w-full px-4 py-2 rounded-md border ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-800'} focus:outline-none focus:ring-2 focus:ring-blue-400`}
                        >
                            <option value="">Select a Trainer</option>
                            {trainers.length > 0 ? (
                                trainers.map((trainer) => (
                                    <option key={trainer._id} value={trainer._id}>
                                        {trainer.name}
                                    </option>
                                ))
                            ) : (
                                <option disabled>No trainers available</option>
                            )}
                        </select>
                    )}
                </div>

                {/* Ratings Section */}
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Rate the following:</h3>
                    {ratingParameters.map((param) => (
                        <div key={param}>
                            <label className="block mb-1 font-medium">{param}</label>
                            <div className="flex items-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <FaStar
                                        key={star}
                                        size={24}
                                        className={`cursor-pointer transition-colors ${
                                            formData.ratings[param] >= star
                                                ? 'text-yellow-400'
                                                : 'text-gray-400'
                                        }`}
                                        onClick={() => handleRatingChange(param, star)}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Feedback Textarea */}
                <div>
                    <label className="block mb-1 font-semibold" htmlFor="feedback">Your Feedback</label>
                    <textarea
                        id="feedback"
                        name="feedback"
                        value={formData.feedback}
                        onChange={handleChange}
                        required
                        rows="4"
                        className={`w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none
                            ${darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'}`}
                    ></textarea>
                </div>

                {/* Submit Button */}
                <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all"
                    disabled={submitStatus === 'loading'}
                >
                    {submitStatus === 'loading' ? 'Submitting...' : 'Submit Feedback'}
                </motion.button>

                {submitStatus === 'success' && <p className="text-green-500 mt-2 text-center">Feedback submitted successfully!</p>}
                {submitError && <p className="text-red-500 mt-2 text-center">{submitError}</p>}
            </form>
        </motion.div>
    );
};

export default FeedbackForm;