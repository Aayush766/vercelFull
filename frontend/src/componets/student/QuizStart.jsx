// src/components/student/QuizStart.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../../axiosConfig'; // Adjust path as per your project structure

const QuizStart = () => {
    const navigate = useNavigate();
    const { courseId, quizId } = useParams(); // Get these from the URL

    const [quizDetails, setQuizDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [acceptedInstructions, setAcceptedInstructions] = useState(false);

    useEffect(() => {
        const fetchQuizDetails = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch quiz details from your backend based on quizId
                // The URL is now correctly formed: /student/quizzes/ACTUAL_QUIZ_ID/details
                const response = await apiClient.get(`/student/quizzes/${quizId}/details`);
                // Assuming your API sends quiz details nested under a 'quiz' key
                setQuizDetails(response.data.quiz);
            } catch (err) {
                console.error('Error fetching quiz details:', err.response ? err.response.data : err.message);
                setError(err.response?.data?.msg || 'Failed to load quiz details. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        if (quizId) {
            fetchQuizDetails();
        } else {
            setError("Quiz ID is missing from the URL.");
            setLoading(false);
        }
    }, [quizId]); // Re-fetch if quizId changes

    const handleStartQuiz = () => {
        if (!acceptedInstructions) {
            alert("Please read and accept the instructions to start the quiz.");
            return;
        }
        if (quizDetails.attemptsLeft <= 0) {
            alert("You have no attempts left for this quiz.");
            return;
        }
        // Navigate to the actual quiz taking component, passing courseId and quizId
        navigate(`/course/${courseId}/quiz/${quizId}`);
    };

    if (loading) return <div className="text-center py-10 text-xl text-gray-700 dark:text-gray-300">Loading quiz details...</div>;
    if (error) return <div className="text-center py-10 text-red-600 dark:text-red-400 font-bold">{error}</div>;
    if (!quizDetails) return <div className="text-center py-10 text-gray-500 dark:text-gray-400">No quiz details found.</div>;

    // Use actual data from quizDetails
    const { attemptsAllowed, userAttempts, difficulty, category, timeLimit, dueDate, title, instructions } = quizDetails;
    const attemptsLeft = attemptsAllowed - (userAttempts || 0); // Handle userAttempts potentially being null/undefined

    return (
        <div className="max-w-2xl mx-auto mt-10 px-6 py-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg text-gray-800 dark:text-gray-100">
            <h1 className="text-3xl font-bold mb-6 text-purple-700 dark:text-purple-400 text-center">📘 {title || 'Quiz'} Overview</h1>

            <div className="bg-gray-100 dark:bg-gray-700 p-5 rounded-lg mb-6 shadow-inner">
                <p className="text-lg mb-2"><strong>🔄 Attempts Allowed:</strong> {attemptsAllowed}</p>
                <p className="text-lg mb-2"><strong>✅ Attempts Used:</strong> {userAttempts || 0}</p>
                <p className="text-lg"><strong>🕒 Attempts Left:</strong> <span className={attemptsLeft <= 0 ? "text-red-500 font-semibold" : "text-green-600 font-semibold"}>{attemptsLeft}</span></p>
                {/* You might add 'Total Attempts by All Students' here if your API provides it */}
            </div>

            <div className="flex flex-wrap gap-3 mb-6 justify-center">
                <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100 px-4 py-2 rounded-full text-md font-medium shadow-sm">🧠 Difficulty: {difficulty}</span>
                <span className="bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-100 px-4 py-2 rounded-full text-md font-medium shadow-sm">📂 Category: {category}</span>
                <span className="bg-pink-100 text-pink-800 dark:bg-pink-700 dark:text-pink-100 px-4 py-2 rounded-full text-md font-medium shadow-sm">⏱️ Timer: {timeLimit} mins</span>
                <span className="bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100 px-4 py-2 rounded-full text-md font-medium shadow-sm">📅 Due: {dueDate ? new Date(dueDate).toLocaleString() : 'N/A'}</span>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900 p-5 rounded-lg border border-yellow-300 dark:border-yellow-700 text-yellow-900 dark:text-yellow-100 mb-6 shadow-md">
                <p className="font-bold text-xl mb-3">📄 Instructions:</p>
                {instructions ? (
                    <ul className="list-disc pl-8 text-base leading-relaxed">
                        {instructions.split('\n').map((line, index) => <li key={index}>{line}</li>)}
                    </ul>
                ) : (
                    <ul className="list-disc pl-8 text-base leading-relaxed">
                        <li>You have <strong>{attemptsAllowed} attempt{attemptsAllowed !== 1 ? 's' : ''}</strong> for this quiz.</li>
                        <li>Once started, <strong>you cannot restart</strong> or go back.</li>
                        <li><strong>The timer starts immediately</strong> when you begin the quiz.</li>
                        <li>Answer all questions carefully within the allocated time limit ({timeLimit} minutes).</li>
                        <li>Ensure a stable internet connection.</li>
                        <li>Your answers will be automatically submitted if the timer runs out.</li>
                    </ul>
                )}
                <div className="mt-5 flex items-center">
                    <input
                        type="checkbox"
                        checked={acceptedInstructions}
                        onChange={(e) => setAcceptedInstructions(e.target.checked)}
                        className="form-checkbox h-5 w-5 text-purple-600 dark:text-purple-400 rounded focus:ring-purple-500"
                        id="acceptInstructions"
                    />
                    <label htmlFor="acceptInstructions" className="ml-3 text-base select-none">I have read and understood the instructions</label>
                </div>
            </div>

            <div className="flex justify-center gap-6">
                <button
                    onClick={handleStartQuiz}
                    disabled={!acceptedInstructions || attemptsLeft <= 0}
                    className={`px-8 py-3 rounded-xl font-semibold text-lg transition duration-300 transform hover:scale-105 shadow-lg
                        ${acceptedInstructions && attemptsLeft > 0
                            ? 'bg-purple-600 text-white hover:bg-purple-700 focus:ring-4 focus:ring-purple-300'
                            : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                        }`}
                >
                    🚀 Start Quiz
                </button>

                <button
                    className="bg-green-500 text-white px-8 py-3 rounded-xl font-semibold text-lg hover:bg-green-600 transition duration-300 transform hover:scale-105 shadow-lg focus:ring-4 focus:ring-green-300"
                    onClick={() => alert('Leaderboard feature coming soon!')}
                >
                    🏆 Leaderboard
                </button>
            </div>
        </div>
    );
};

export default QuizStart;