import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const QuizStart = () => {
  const navigate = useNavigate();

  // Dummy data – replace with props or DB fetch
  const attemptsAllowed = 1;
  const userAttempts = 0;
  const totalAttempts = 255;
  const difficulty = 'Medium';
  const category = 'STEM';
  const timeLimit = 5; // in minutes
  const dueDate = 'April 30, 2025 – 11:59 PM';

  const [acceptedInstructions, setAcceptedInstructions] = useState(false);

  const handleStartQuiz = () => {
    if (!acceptedInstructions) return;
    const courseId = 1;
    const quizId = 1;
    navigate(`/course/${courseId}/quiz/${quizId}`);
  };

  const attemptsLeft = attemptsAllowed - userAttempts;

  return (
    <div className="max-w-2xl mx-auto mt-10 px-6 py-8 bg-white dark:bg-gray-900 rounded-xl shadow-lg text-gray-800 dark:text-gray-100">
      <h1 className="text-2xl font-bold mb-4 text-purple-600 dark:text-purple-400">📘 STEM Quiz Overview</h1>

      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-4">
        <p><strong>🔄 Attempts Allowed:</strong> {attemptsAllowed}</p>
        <p><strong>✅ Attempts Used:</strong> {userAttempts}</p>
        <p><strong>🕒 Attempts Left:</strong> {attemptsLeft}</p>
        <p><strong>🌍 Total Attempts by All Students:</strong> {totalAttempts}</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <span className="bg-yellow-200 text-yellow-800 px-3 py-1 rounded-full text-sm">🧠 Difficulty: {difficulty}</span>
        <span className="bg-blue-200 text-blue-800 px-3 py-1 rounded-full text-sm">📂 Category: {category}</span>
        <span className="bg-pink-200 text-pink-800 px-3 py-1 rounded-full text-sm">⏱️ Timer: {timeLimit} mins</span>
        <span className="bg-red-200 text-red-800 px-3 py-1 rounded-full text-sm">📅 Due: {dueDate}</span>
      </div>

      <div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded-lg border border-yellow-300 dark:border-yellow-700 text-yellow-900 dark:text-yellow-100 mb-4">
        <p className="font-semibold mb-2">📄 Instructions:</p>
        <ul className="list-disc pl-6 text-sm">
          <li>You only have <strong>one attempt</strong> for this quiz.</li>
          <li>Once started, <strong>you cannot restart</strong> or go back.</li>
          <li><strong>Timer starts immediately</strong> when you begin.</li>
          <li>Answer all questions within the time limit.</li>
        </ul>
        <div className="mt-3">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={acceptedInstructions}
              onChange={(e) => setAcceptedInstructions(e.target.checked)}
              className="form-checkbox h-4 w-4 text-purple-600"
            />
            <span className="ml-2 text-sm">I have read and understood the instructions</span>
          </label>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={handleStartQuiz}
          disabled={!acceptedInstructions || attemptsLeft <= 0}
          className={`px-6 py-2 rounded-lg transition ${
            acceptedInstructions && attemptsLeft > 0
              ? 'bg-purple-600 text-white hover:bg-purple-700'
              : 'bg-purple-300 text-white cursor-not-allowed'
          }`}
        >
          🚀 Start Quiz
        </button>

        <button
          className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition"
          onClick={() => alert('Leaderboard feature coming soon!')}
        >
          🏆 Leaderboard
        </button>
      </div>
    </div>
  );
};

export default QuizStart;
