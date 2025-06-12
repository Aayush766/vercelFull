// QuizSummary.jsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle } from 'lucide-react';

const QuizSummary = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Receive necessary data from STEMQuiz. Crucially, we now expect quizId and attemptId.
    const {
        questions = [], // Basic questions array without correct answers (for count)
        answers = {},   // Student's answers (for count)
        score,
        totalQuestions,
        startedAt,
        completedAt,
        quizTitle,
        quizId,         // <--- IMPORTANT: Receive quizId
        attemptId       // <--- IMPORTANT: Receive attemptId from STEMQuiz submission response
    } = location.state || {};

    const answeredCount = Object.keys(answers).length;
    const unansweredCount = questions.length - answeredCount;

    const handleFinish = () => {
        // Pass only the necessary IDs to the ResultPage (now `/quiz-final-results`).
        // ResultPage will then fetch the full details including correct answers.
        navigate('/quiz-final-results', {
            state: {
                quizId: quizId,
                attemptId: attemptId,
                // You can still pass these for immediate display on ResultPage if needed
                // before the API call completes, but they are not strictly necessary
                // for the "Mistakes Review" functionality which relies on the new fetch.
                score: score,
                total: totalQuestions,
                startedAt: startedAt,
                completedAt: completedAt,
                quizTitle: quizTitle
            }
        });
    };

    if (!questions || questions.length === 0) {
        return <div className="text-center py-10 text-xl text-gray-700">No quiz data available for summary.</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white px-4 py-10">
            <div className="max-w-5xl mx-auto bg-white text-gray-900 rounded-3xl shadow-2xl p-10 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100/20 via-blue-200/10 to-transparent rounded-3xl pointer-events-none" />

                <div className="relative z-10">
                    <h2 className="text-3xl font-extrabold text-gray-800 mb-2 tracking-tight">🧠 {quizTitle || 'Quiz Summary'}</h2>
                    <h3 className="text-lg text-gray-500 mb-8 font-medium">Summary of Attempt</h3>

                    {/* Stats */}
                    <div className="flex flex-wrap gap-4 mb-8">
                        <div className="flex-1 bg-blue-50 p-5 rounded-xl shadow-sm border border-blue-200">
                            <p className="text-sm text-blue-700">Questions Attempted</p>
                            <h4 className="text-2xl font-bold">{answeredCount}</h4>
                        </div>
                        <div className="flex-1 bg-yellow-50 p-5 rounded-xl shadow-sm border border-yellow-200">
                            <p className="text-sm text-yellow-700">Unanswered Questions</p>
                            <h4 className="text-2xl font-bold">{unansweredCount}</h4>
                        </div>
                        <div className="flex-1 bg-green-50 p-5 rounded-xl shadow-sm border border-green-200">
                            <p className="text-sm text-green-700">Total Questions</p>
                            <h4 className="text-2xl font-bold">{questions.length}</h4>
                        </div>
                        {/* Displaying preliminary score here as well, derived from STEMQuiz's calculation */}
                        <div className="flex-1 bg-purple-50 p-5 rounded-xl shadow-sm border border-purple-200">
                            <p className="text-sm text-purple-700">Preliminary Score</p>
                            <h4 className="text-2xl font-bold">{score || 0} / {totalQuestions || 0}</h4>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                        <table className="min-w-full text-sm text-left text-gray-700">
                            <thead className="bg-gray-100 uppercase text-xs text-gray-600">
                                <tr>
                                    <th className="px-6 py-4 font-bold">Question #</th>
                                    <th className="px-6 py-4 font-bold">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {questions.map((q, index) => (
                                    <tr key={q._id} className="hover:bg-blue-50 transition-colors">
                                        <td className="px-6 py-4 font-semibold text-blue-600">Q{index + 1}</td>
                                        <td className="px-6 py-4">
                                            {answers[q._id] ? ( // Use q._id here
                                                <span className="inline-flex items-center gap-2 text-green-600 font-medium">
                                                    <CheckCircle className="w-5 h-5" /> Answer saved
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-2 text-red-500 font-medium">
                                                    <XCircle className="w-5 h-5" /> Not answered
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Button to proceed to detailed results */}
                    <div className="mt-10 text-right">
                        <button
                            onClick={handleFinish}
                            className="bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-800 transition-all shadow-lg"
                        >
                            View Detailed Results &rarr;
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuizSummary;