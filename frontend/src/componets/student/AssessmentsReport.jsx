import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import apiClient from '../../axiosConfig'; // Your API client

const AssessmentReport = ({ darkMode }) => {
    const navigate = useNavigate();
    // State to track which quiz's attempts are expanded.
    // Keys are quiz IDs, values are booleans (true if expanded, false otherwise).
    const [expandedQuizzes, setExpandedQuizzes] = useState({});
    const [quizAttempts, setQuizAttempts] = useState([]); // Stores fetched quiz attempts from backend
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- Data Fetching from Backend ---
    useEffect(() => {
        const fetchQuizAttempts = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await apiClient.get('/student/quizzes/my-attempts');
                setQuizAttempts(response.data);
            } catch (err) {
                console.error('Error fetching quiz attempts from backend:', err);
                setError(err.response?.data?.msg || 'Failed to load assessment data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        fetchQuizAttempts();
    }, []);

    // --- Data Grouping for UI Display (First Level: "Session" / Quiz Group) ---
    const groupedAttempts = useMemo(() => {
        const groups = quizAttempts.reduce((acc, attempt) => {
            const quizIdentifier = attempt.quizId;
            if (!quizIdentifier) {
                console.warn('Attempt is missing quizId, skipping grouping:', attempt);
                return acc;
            }

            if (!acc[quizIdentifier]) {
                acc[quizIdentifier] = {
                    quizTitle: attempt.quizTitle || 'Unnamed Quiz',
                    quizId: attempt.quizId,
                    attempts: [],
                };
            }
            acc[quizIdentifier].attempts.push(attempt);
            return acc;
        }, {});
        return Object.values(groups);
    }, [quizAttempts]);

    // State to manage the "Show All Sessions" / "Show Less" for the *overall list* of quiz groups.
    const [showAllQuizGroups, setShowAllQuizGroups] = useState(false);
    // Determine which quiz groups to show (first 4 or all)
    const visibleQuizGroups = showAllQuizGroups ? groupedAttempts : groupedAttempts.slice(0, 4);

    // --- Utility Function for Pass/Fail Status ---
    const getPassFailStatus = (score, totalQuestions) => {
        const passThreshold = 0.5; // 50%
        return score >= (totalQuestions * passThreshold) ? 'Passed' : 'Failed';
    };

    // --- Event Handlers ---
    const handleAttemptClick = (attempt) => {
      navigate('/quiz-final-results', {
        state: {
            quizId: attempt.quizId,
            attemptId: attempt._id,
            // Optionally pass summary data for immediate display before full fetch
            score: attempt.score,
            total: attempt.totalQuestions,
            completedAt: attempt.completedAt,
            quizTitle: attempt.quizTitle
        }
    });
    };

    const toggleQuizGroup = (quizIdentifier) => {
        setExpandedQuizzes(prev => ({
            ...prev,
            [quizIdentifier]: !prev[quizIdentifier]
        }));
    };

    const toggleShowAllQuizGroups = () => {
        setShowAllQuizGroups(prev => !prev);
    };

    return (
        <motion.div
            className={`rounded-3xl shadow-2xl mx-4 my-6 md:mx-10 md:my-10 p-6
                ${darkMode
                    ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white border border-gray-700'
                    : 'bg-gradient-to-br from-blue-50 via-white to-blue-100 text-gray-900 border border-gray-200'}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
        >
            <h2 className="text-3xl font-bold text-center mb-8 text-purple-600 dark:text-purple-400">📊 Assessment Report</h2>

            {loading ? (
                <div className="flex justify-center items-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                    <p className="ml-2 text-lg text-gray-600 dark:text-gray-300">Loading your assessment history...</p>
                </div>
            ) : error ? (
                <div className="text-center text-red-500 text-lg">
                    <p>Error: {error}</p>
                    <p>It looks like we couldn't load your assessment data. Please check your internet connection or try again later.</p>
                </div>
            ) : Object.keys(groupedAttempts).length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-400 text-lg py-10">
                    No completed quiz attempts found yet. Start a quiz to see your progress!
                </div>
            ) : (
                // --- Display Grouped Quiz Attempts (First Level UI: Quiz "Sessions" in a grid) ---
                <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" // Applied grid here!
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    {visibleQuizGroups.map((quizGroup) => (
                        <div key={quizGroup.quizId} 
                             className="mb-4 p-4 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col"> {/* Added flex-col for internal layout */}
                            {/* Button to toggle the expansion of this quiz group. This is your "Session". */}
                            <button
                                className={`w-full text-left py-2 px-3 flex justify-between items-center rounded-lg font-bold text-lg mb-2 transition-colors duration-200 flex-grow
                                    ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-blue-100 hover:bg-blue-200 text-indigo-800'}`}
                                onClick={() => toggleQuizGroup(quizGroup.quizId)}
                            >
                                <span>{quizGroup.quizTitle}</span>
                                {expandedQuizzes[quizGroup.quizId] ? (
                                    <ChevronUp size={20} className="text-purple-600 dark:text-purple-400" />
                                ) : (
                                    <ChevronDown size={20} className="text-purple-600 dark:text-purple-400" />
                                )}
                            </button>

                            {/* --- Second Level UI: Individual Attempts within a Quiz "Session" --- */}
                            {expandedQuizzes[quizGroup.quizId] && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="flex flex-col gap-2 mt-2" // Changed to flex-col for stacked attempts within a session
                                >
                                    {quizGroup.attempts.map((attempt, index) => {
                                        const status = getPassFailStatus(attempt.score, attempt.totalQuestions);
                                        const isPassed = status === 'Passed';
                                        const buttonClass = isPassed
                                            ? `${darkMode ? 'bg-green-700 hover:bg-green-600' : 'bg-green-100 text-green-800 hover:bg-green-200'}`
                                            : `${darkMode ? 'bg-red-700 hover:bg-red-600' : 'bg-red-100 text-red-800 hover:bg-red-200'}`;

                                        return (
                                            <motion.button
                                                key={attempt._id}
                                                whileHover={{ scale: 1.05 }}
                                                onClick={() => handleAttemptClick(attempt)}
                                                className={`w-full py-2 px-3 rounded-md font-semibold text-xs transition-all duration-300 shadow-sm flex flex-col items-start text-left ${buttonClass}`}
                                            >
                                                <span className="text-xs text-gray-50 dark:text-gray-200 mb-1">
                                                    Attempt {index + 1} on: {new Date(attempt.completedAt).toLocaleDateString()}
                                                </span>
                                                <span className="text-sm font-bold mb-1">
                                                    Score: {attempt.score} / {attempt.totalQuestions}
                                                </span>
                                                <span className="text-xs">
                                                    Status: {status}
                                                </span>
                                            </motion.button>
                                        );
                                    })}
                                </motion.div>
                            )}
                        </div>
                    ))}
                </motion.div>
            )}

            {/* --- "Show All Sessions" / "Show Less" Button for the main quiz groups --- */}
            {groupedAttempts.length > 4 && ( // Check total grouped attempts, not quizAttempts
                <div className="flex justify-center mt-6">
                    <button
                        onClick={toggleShowAllQuizGroups}
                        className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 transition dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                        {showAllQuizGroups ? (
                            <>
                                Show Less <ChevronUp size={18} />
                            </>
                        ) : (
                            <>
                                Show All Sessions <ChevronDown size={18} />
                            </>
                        )}
                    </button>
                </div>
            )}
        </motion.div>
    );
};

export default AssessmentReport;