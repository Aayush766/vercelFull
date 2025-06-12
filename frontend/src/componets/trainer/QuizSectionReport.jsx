import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const dummyData = [
  { name: 'Alice Johnson', marks: 85 },
  { name: 'Bob Smith', marks: 78 },
  { name: 'Charlie Lee', marks: 92 },
  { name: 'Daisy Carter', marks: 69 },
];

const QuizSectionReport = () => {
  const { sessionId, section } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100">
      <div className="max-w-5xl mx-auto px-8 py-6">
        <button
          onClick={() => navigate(-1)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl shadow-md transition mb-6"
        >
          &larr; Back
        </button>

        <h1 className="text-3xl font-bold mb-6 text-center text-purple-700 dark:text-purple-400">
          Quiz Report - Grade 10 | Session {sessionId} | Section {section}
        </h1>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-900 rounded-xl shadow-md text-left">
            <thead>
              <tr className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-lg">
                <th className="py-4 px-6">Student Name</th>
                <th className="py-4 px-6">Quiz Marks</th>
                <th className="py-4 px-6">Action</th>
              </tr>
            </thead>
            <tbody>
              {dummyData.map((student, idx) => (
                <tr
                  key={idx}
                  className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <td className="py-4 px-6">{student.name}</td>
                  <td className="py-4 px-6">{student.marks}</td>
                  <td className="py-4 px-6">
                    <button
                      onClick={() =>
                        navigate(
                          `/student-details/${sessionId}/${section}/${encodeURIComponent(
                            student.name
                          )}`
                        )
                      }
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md shadow-sm"
                    >
                      View Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default QuizSectionReport;
