import React, { useState } from 'react';

const assessmentsData = [
  {
    id: 1,
    title: 'Math Quiz 1',
    description: 'Solve the algebra problems.',
    dueDate: '2025-05-05',
  },
  {
    id: 2,
    title: 'Science Project',
    description: 'Submit your volcano model report.',
    dueDate: '2025-05-10',
  },
  {
    id: 3,
    title: 'History Assignment',
    description: 'Write an essay on World War II.',
    dueDate: '2025-05-15',
  },
];

const Assessments = () => {
  const [submitted, setSubmitted] = useState([]);

  const handleSubmit = (id) => {
    if (!submitted.includes(id)) {
      setSubmitted([...submitted, id]);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100 dark:bg-gray-900 transition-all">
      <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-8">
        📚 Assessments
      </h2>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {assessmentsData.map((assessment) => (
          <div
            key={assessment.id}
            className="rounded-xl p-5 shadow-md bg-white dark:bg-gray-800 transition-all"
          >
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
              {assessment.title}
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-300">{assessment.description}</p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Due Date: <span className="font-medium">{assessment.dueDate}</span>
            </p>

            <div className="mt-4">
              {submitted.includes(assessment.id) ? (
                <span className="inline-block px-4 py-2 rounded-md bg-green-600 text-white font-semibold">
                  ✅ Submitted
                </span>
              ) : (
                <button
                  onClick={() => handleSubmit(assessment.id)}
                  className="px-4 py-2 rounded-md font-semibold transition-all duration-300
                    bg-blue-600 text-white hover:bg-blue-700 
                    dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                >
                  Submit Assessment
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Assessments;
