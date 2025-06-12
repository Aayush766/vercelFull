import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../axiosConfig'; // Your API client
// import { useAuth } from '../../context/AuthContext'; // Uncomment if you have an AuthContext

const STEMQuiz = () => {
    const { courseId, quizId } = useParams(); // Get courseId and quizId from URL
    const navigate = useNavigate();
    // const { user } = useAuth(); // Uncomment and use your auth context to get user info

    const [questions, setQuestions] = useState([]); // Will store fetched questions
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [answers, setAnswers] = useState({}); // Stores student's answers {questionId: selectedOption}
    const [submitted, setSubmitted] = useState(false); // Tracks if quiz has been submitted
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // 0-based index for the questions array
    const [timeLeft, setTimeLeft] = useState(0); // Time remaining in seconds, initialized from fetched quiz details
    const [startedAt, setStartedAt] = useState(null); // Timestamp when quiz started
    const [quizTitle, setQuizTitle] = useState(""); // State to store the quiz title fetched from backend

    // Memoize handleSubmit to ensure it's stable and doesn't cause unnecessary re-renders in useEffect
    const handleSubmit = useCallback(async (timedOut = false) => {
        if (submitted) return; // Prevent multiple submissions
        setSubmitted(true); // Mark quiz as submitted to disable inputs

        const completedAt = new Date(); // Timestamp when quiz was completed

        // Transform the answers object into an array of {questionId, selectedOption}
        const transformedAnswers = Object.keys(answers).map(questionId => ({
            questionId: questionId,
            selectedOption: answers[questionId]
        }));

        const quizAttemptData = {
            quizId: quizId,
            answers: transformedAnswers, // Use the transformed array here
            startedAt: startedAt ? startedAt.toISOString() : new Date().toISOString(), // Fallback if startedAt is missing
            completedAt: completedAt.toISOString(),
            timeTaken: startedAt ? (completedAt.getTime() - startedAt.getTime()) / 1000 : null, // Time taken in seconds
            timedOut: timedOut, // Indicate if quiz was submitted due to timeout
        };

        try {
            // Send quiz attempt data to the backend
            const response = await apiClient.post(`/student/quizzes/${quizId}/submit`, quizAttemptData);
            const resultFromBackend = response.data.result; // Expect score and attemptId from backend

            // Navigate to the intermediate QuizSummary page, passing necessary data via state
            navigate('/quiz-summary', { // Navigate to the simple /quiz-summary path
                state: {
                    quizId: quizId,
                    attemptId: resultFromBackend.attemptId, // Crucial for fetching detailed results
                    score: resultFromBackend.score,
                    totalQuestions: questions.length,
                    questions: questions, // Pass full questions array for summary and results
                    answers: answers,     // Pass student's raw answers
                    startedAt: startedAt.toISOString(),
                    completedAt: completedAt.toISOString(),
                    quizTitle: quizTitle // Pass the fetched quiz title
                }
            });
        } catch (err) {
            console.error('Error submitting quiz:', err.response ? err.response.data : err.message);
            // Display error message from backend or a generic one
            alert(err.response?.data?.msg || 'Failed to submit quiz. Please try again. If the issue persists, contact support.');
            setSubmitted(false); // Re-enable submission if there was an error
        }
    }, [quizId, answers, startedAt, submitted, navigate, courseId, questions, quizTitle]); // Dependencies for useCallback

    // Effect for fetching quiz questions and initial setup
    useEffect(() => {
        const fetchQuizQuestions = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch quiz questions from the backend
                const response = await apiClient.get(`/student/quizzes/${quizId}/take`);
                const quizData = response.data.quiz;

                // Validate fetched data
                if (!quizData || !quizData.questions || quizData.questions.length === 0) {
                    setError("No questions found for this quiz.");
                    setLoading(false);
                    return;
                }

                setQuestions(quizData.questions.map(q => ({
                    ...q,
                    id: q._id // Use MongoDB's _id as the unique ID for questions
                })));
                // Initialize timeLeft (convert minutes from backend to seconds)
                setTimeLeft(quizData.timeLimit * 60);
                setStartedAt(new Date()); // Record the start time of the quiz
                setQuizTitle(quizData.title); // Set the quiz title from the backend
            } catch (err) {
                console.error('Error fetching quiz questions:', err);
                setError(err.response?.data?.msg || 'Failed to load quiz questions. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        if (quizId) {
            fetchQuizQuestions(); // Fetch questions only if quizId is available
        } else {
            setError("Quiz ID is missing from the URL.");
            setLoading(false);
        }
    }, [quizId]); // Re-run this effect if quizId changes

    // Effect for the quiz timer logic
    useEffect(() => {
        // Stop timer if time is up, quiz is submitted, or still loading
        if (timeLeft <= 0 || submitted || loading) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) { // If less than or equal to 1 second remaining
                    clearInterval(timer); // Clear the interval
                    handleSubmit(true); // Auto-submit due to timeout
                    return 0; // Set time left to 0
                }
                return prev - 1; // Decrement time
            });
        }, 1000); // Update every second

        return () => clearInterval(timer); // Cleanup function to clear interval on component unmount or dependency change
    }, [timeLeft, submitted, loading, handleSubmit]); // Dependencies for timer effect

    // Handles option selection for a specific question
    const handleOptionChange = (questionId, option) => {
        setAnswers(prevAnswers => ({ ...prevAnswers, [questionId]: option }));
    };

    // Get the current question object to display
    const currentQuestion = questions[currentQuestionIndex];

    // Helper function to format time into MM:SS format
    const formatTime = (sec) => {
        const minutes = String(Math.floor(sec / 60)).padStart(2, '0');
        const seconds = String(sec % 60).padStart(2, '0');
        return `${minutes}:${seconds}`;
    };

    // --- Conditional Rendering for different states (Loading, Error, No Questions) ---
    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-100 text-gray-700 text-2xl">Loading Quiz...</div>;
    }

    if (error) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-100 text-red-500 text-xl font-semibold">{error}</div>;
    }

    if (!currentQuestion && questions.length === 0) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-100 text-gray-500 text-xl">No quiz questions found for this quiz.</div>;
    }

    // This case handles situations where `currentQuestion` might be undefined
    // (e.g., after submission, or if index goes out of bounds unexpectedly)
    if (!currentQuestion && questions.length > 0) {
        // This scenario typically means the quiz has been submitted and navigation is about to occur
        // Or if there was an unexpected error.
        return <div className="min-h-screen flex items-center justify-center bg-gray-100 text-gray-500 text-xl">Quiz completed or no more questions to display.</div>;
    }

    // Use user.name or user.firstName (adjust based on your user model)
    const displayStudentName = "John Doe"; // Replace with user.name or user.firstName from context

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-100 text-gray-900 font-sans">
            {/* Header */}
            <div className="flex items-center justify-between p-6 bg-white shadow-md border-b">
                <div className="flex items-center gap-4">
                    <img src="/sample-logo.png" alt="logo" className="w-24 h-16 object-contain" />
                    <h1 className="text-2xl font-bold tracking-tight">Welcome, {displayStudentName}</h1> {/* Dynamic Name */}
                </div>
                <div className="text-sm text-gray-500">Course ID: {courseId}</div>
            </div>

            <div className="flex flex-col md:flex-row"> {/* Added flex-col and md:flex-row for responsiveness */}
                {/* Main Quiz Content Area (3/4 width on medium screens and up) */}
                <div className="w-full md:w-3/4 p-4 md:p-10">
                    <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 transition-all border border-gray-200">
                        <h2 className="text-xl font-semibold mb-3">Question {currentQuestionIndex + 1} of {questions.length}</h2>
                        <p className="text-lg font-medium mb-6">{currentQuestion.questionText}</p>

                        <div className="space-y-4">
                            {currentQuestion.options.map((opt, idx) => (
                                <label
                                    key={`${currentQuestion._id}-${idx}`}
                                    className={`flex items-center mb-4 p-3 border rounded-lg cursor-pointer transition hover:shadow ${
                                        answers[currentQuestion._id] === opt ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name={`q${currentQuestion._id}`}
                                        value={opt}
                                        className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500"
                                        checked={answers[currentQuestion._id] === opt}
                                        onChange={() => handleOptionChange(currentQuestion._id, opt)}
                                        disabled={submitted}
                                    />
                                    <span className="text-md"><strong>{String.fromCharCode(65 + idx)}</strong>. {opt}</span>
                                </label>
                            ))}
                        </div>

                        <div className="mt-8 flex gap-4 flex-wrap justify-between">
                            <button
                                disabled={currentQuestionIndex === 0 || submitted} // Disable if submitted
                                onClick={() => setCurrentQuestionIndex(prev => Math.max(prev - 1, 0))}
                                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors"
                            >
                                Previous
                            </button>

                            <div className="flex gap-4">
                                {!submitted && currentQuestionIndex < questions.length - 1 && (
                                    <button
                                        onClick={() => setCurrentQuestionIndex(prev => Math.min(prev + 1, questions.length - 1))}
                                        className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        Save & Next
                                    </button>
                                )}

                                {!submitted && currentQuestionIndex === questions.length - 1 && (
                                    <button
                                        onClick={() => handleSubmit(false)}
                                        className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        Final Submit
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar (1/4 width on medium screens and up) */}
                <div className="w-full md:w-1/4 p-4 md:p-6 bg-white border-l shadow-inner">
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="font-medium text-gray-600">Time Remaining:</span>
                            <span className="text-red-600 font-semibold">{formatTime(timeLeft)}</span>
                        </div>
                        <div><span className="font-medium">Quiz:</span> {quizTitle}</div> {/* Display fetched quiz title */}
                        <div><span className="font-medium">Status:</span> <span className={`${submitted ? 'text-green-600' : 'text-yellow-600'} font-medium`}>{submitted ? 'Finished' : 'Not Finished'}</span></div>
                    </div>

                    <hr className="my-4" />

                    <h3 className="text-lg font-bold mb-3">Question Map</h3>
                    <div className="flex gap-2 flex-wrap mb-4">
                        {questions.map((q, index) => (
                            <button
                                key={q._id}
                                onClick={() => setCurrentQuestionIndex(index)}
                                className={`w-10 h-10 rounded-full border font-semibold text-sm transition-all ${
                                    currentQuestionIndex === index
                                        ? 'bg-blue-600 text-white'
                                        : answers[q._id]
                                            ? 'bg-green-500 text-white'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                                disabled={submitted}
                            >
                                {index + 1}
                            </button>
                        ))}
                    </div>

                    <div className="text-xs text-gray-600 space-y-2">
                        <p><span className="inline-block w-4 h-4 mr-2 rounded bg-gray-300"></span> Not Answered</p>
                        <p><span className="inline-block w-4 h-4 mr-2 rounded bg-green-500"></span> Answered</p>
                        <p><span className="inline-block w-4 h-4 mr-2 rounded bg-blue-600"></span> Current</p>
                    </div>

                    <hr className="my-4" />
                    <div className="font-medium text-sm">
                        Un-Attempted Questions: <span className="float-right font-bold">{questions.length - Object.keys(answers).length}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default STEMQuiz;