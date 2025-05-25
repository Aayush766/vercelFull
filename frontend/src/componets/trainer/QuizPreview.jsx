import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getQuizDataBySessionId } from '../../utils/quizData';

const QuizPreview = () => {
  const { sessionId } = useParams();
  const questions = getQuizDataBySessionId(sessionId);
  const navigate = useNavigate();

  if (!questions || questions.length === 0) {
    return (
      <div className="max-w-3xl mx-auto mt-20 p-8 bg-red-50 dark:bg-red-900 rounded-xl shadow-md text-red-700 dark:text-red-300 text-center">
        No quiz data found for this session.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100">
      {/* Navbar */}
      <nav className="max-w-5xl mx-auto flex justify-between items-center px-8 py-6 bg-white dark:bg-gray-900 shadow-md rounded-b-3xl mb-12">
        <button
          onClick={() => navigate(-1)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl shadow-md transition"
        >
          &larr; Back
        </button>
        <Link
          to="/"
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl shadow-md transition"
        >
          Home
        </Link>
      </nav>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-8 py-6 rounded-3xl shadow-2xl bg-white dark:bg-gray-900">
        <h1 className="text-5xl font-extrabold mb-12 text-center text-purple-700 dark:text-purple-400 tracking-wide">
          Quiz Preview
        </h1>

        <div className="space-y-10">
          {questions.map((q, index) => (
            <div
              key={q.id}
              className="p-6 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700"
            >
              <p className="text-xl font-semibold mb-4">
                {index + 1}. {q.question}
              </p>

              <ul className="list-disc list-inside space-y-2">
                {q.options.map((opt, idx) => (
                  <li
                    key={idx}
                    className={`px-4 py-2 rounded-lg ${
                      q.answer === opt
                        ? 'bg-green-200 dark:bg-green-800 text-green-900 dark:text-green-100 font-semibold'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {opt}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuizPreview;
