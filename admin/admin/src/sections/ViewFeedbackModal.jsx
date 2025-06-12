// src/components/admin/ViewFeedbackModal.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from '../axiosConfig';
import { FaSpinner, FaStar } from 'react-icons/fa'; // Added FaStar for student ratings

const ViewFeedbackModal = ({ darkMode, closeForm, userId, userRole }) => {
    const [feedback, setFeedback] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUserFeedback = async () => {
            setLoading(true);
            setError('');
            try {
                const endpoint = userRole === 'trainer'
                    ? `/api/admin/trainers/${userId}/student-feedback`
                    : `/api/admin/students/${userId}/feedback`;
                const response = await axios.get(endpoint);
                setFeedback(response.data.feedback);
            } catch (err) {
                console.error(`Error fetching ${userRole} feedback:`, err);
                setError(`Failed to fetch ${userRole} feedback.`);
            } finally {
                setLoading(false);
            }
        };

        if (userId && userRole) {
            fetchUserFeedback();
        }
    }, [userId, userRole]);

    return (
        <motion.div
            className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                className={`p-8 rounded-2xl shadow-lg w-full max-w-2xl overflow-y-auto max-h-[90vh]
                    ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
            >
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold">Feedback for {userRole === 'trainer' ? 'Trainer' : 'Student'}</h3>
                    <button
                        onClick={closeForm}
                        className="text-red-500 font-semibold hover:underline text-lg"
                    >
                        ✖ Close
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-40">
                        <FaSpinner className="animate-spin text-4xl text-blue-500" />
                    </div>
                ) : error ? (
                    <p className="text-red-500 text-center">{error}</p>
                ) : feedback.length === 0 ? (
                    <p className="text-center text-lg text-gray-500">No feedback available.</p>
                ) : (
                    <div className="space-y-6">
                        {feedback.map((item, index) => (
                            <div key={index} className={`p-4 rounded-lg border ${darkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
                                <p className="text-sm text-gray-500 mb-2">
                                    Submitted: {new Date(item.submittedAt).toLocaleDateString()} at {new Date(item.submittedAt).toLocaleTimeString()}
                                </p>
                                {userRole === 'trainer' ? (
                                    <>
                                        <p><strong className="font-semibold">Lesson Plan:</strong> {item.lessonPlan || 'N/A'}</p>
                                        <p><strong className="font-semibold">Logbook:</strong> {item.logbook || 'N/A'}</p>
                                        <p><strong className="font-semibold">Other Suggestion:</strong> {item.otherSuggestion || 'N/A'}</p>
                                    </>
                                ) : (
                                    <>
                                        <p><strong className="font-semibold">Feedback:</strong> {item.feedback || 'N/A'}</p>
                                        <div className="mt-2">
                                            <strong className="font-semibold">Ratings:</strong>
                                            {item.ratings && Object.entries(item.ratings).map(([param, rating]) => (
                                                <p key={param} className="text-sm ml-4 flex items-center gap-1">
                                                    {param}: {rating} / 5
                                                    {[1, 2, 3, 4, 5].map(star => (
                                                        <FaStar
                                                            key={star}
                                                            className={`${rating >= star ? 'text-yellow-400' : 'text-gray-400'} ml-1`}
                                                        />
                                                    ))}
                                                </p>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
};

export default ViewFeedbackModal;