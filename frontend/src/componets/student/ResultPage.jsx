import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#10B981', '#EF4444']; // Tailwind green and red

const ResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { score, total, questions, answers, startedAt, completedAt } = location.state || {};

  if (score === undefined) {
    return <p className="text-center text-lg mt-10">No result data found. Please take the quiz first.</p>;
  }

  const incorrectCount = total - score;
  const duration = new Date(completedAt) - new Date(startedAt);

  const formatTime = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}m ${seconds}s`;
  };

  const data = [
    { name: 'Correct', value: score },
    { name: 'Incorrect', value: incorrectCount },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-gray-800 text-gray-800 dark:text-gray-100 rounded-3xl shadow-2xl">
      
      <h2 className="text-4xl font-extrabold mb-10 text-center text-purple-700 dark:text-purple-400 tracking-wide">
        Quiz Summary
      </h2>

      {/* Metadata */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-md mb-10 border border-gray-200 dark:border-gray-700">
        <Stat title="Status" value="Completed" />
        <Stat title="Started" value={new Date(startedAt).toLocaleString()} />
        <Stat title="Completed" value={new Date(completedAt).toLocaleString()} />
        <Stat title="Duration" value={formatTime(duration)} />
        <Stat title="Grade" value={`${score} / ${total} (${((score / total) * 100).toFixed(2)}%)`} />
      </div>

      {/* Chart */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md p-6 mb-10 border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-semibold mb-4 text-center">Performance Overview</h3>
        <div className="flex justify-center">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                dataKey="value"
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Mistakes Section */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <h4 className="text-2xl font-semibold mb-6 text-red-600 dark:text-red-400">Mistakes Review</h4>
        {questions.filter(q => answers[q.id] !== q.answer).length === 0 ? (
          <p className="text-green-600 font-medium">Congratulations! All answers are correct 🎉</p>
        ) : (
          questions.map((q, index) => {
            const userAnswer = answers[q.id];
            const isCorrect = userAnswer === q.answer;
            if (isCorrect) return null;

            return (
              <div
                key={q.id}
                className="mb-6 bg-red-50 dark:bg-red-900/40 p-5 rounded-xl border border-red-200 dark:border-red-600"
              >
                <p className="font-semibold mb-2 text-lg">{index + 1}. {q.question}</p>
                <div className="space-y-1">
                  <p>
                    <span className="font-medium text-red-600">Your Answer: </span>
                    <span className="inline-block px-2 py-1 rounded bg-red-200 dark:bg-red-800 text-red-900 dark:text-red-100">
                      {userAnswer || 'No answer selected'}
                    </span>
                  </p>
                  <p>
                    <span className="font-medium text-green-600">Correct Answer: </span>
                    <span className="inline-block px-2 py-1 rounded bg-green-200 dark:bg-green-800 text-green-900 dark:text-green-100">
                      {q.answer}
                    </span>
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Action Button */}
      <div className="text-center mt-12">
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl text-lg shadow-lg transition-all duration-300"
        >
          Go Back to Dashboard
        </button>
      </div>
    </div>
  );
};

const Stat = ({ title, value }) => (
  <div className="text-center">
    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{title}</p>
    <p className="text-lg font-bold">{value}</p>
  </div>
);

export default ResultPage;
