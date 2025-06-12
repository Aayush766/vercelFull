import React from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';

const QuizPreview = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const handleSectionClick = (section) => {
    navigate(`/quiz-report/${sessionId}/section/${section}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100">
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

      <div className="max-w-5xl mx-auto px-8 py-6 rounded-3xl shadow-2xl bg-white dark:bg-gray-900">
        <h1 className="text-4xl font-extrabold mb-4 text-center text-purple-700 dark:text-purple-400">
          Quiz Report of Grade - 1 
        </h1>
        <h2 className="text-2xl text-center mb-8 text-gray-700 dark:text-gray-300">
          Click on section
        </h2>

        <div className="flex justify-center space-x-6 mb-12">
          {['A', 'B', 'C'].map((section) => (
            <button
              key={section}
              onClick={() => handleSectionClick(section)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl shadow-md transition text-lg"
            >
              Section {section}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuizPreview;
