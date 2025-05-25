import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const mockMaterials = {
  Math: [
    { title: 'Algebra Basics', completed: true },
    { title: 'Quadratic Equations', completed: false },
    { title: 'Calculus Introduction', completed: false },
  ],
  Science: [
    { title: 'Newton\'s Laws', completed: true },
    { title: 'Thermodynamics', completed: true },
    { title: 'Optics', completed: false },
  ],
  History: [
    { title: 'World War I', completed: true },
    { title: 'World War II', completed: true },
    { title: 'Cold War', completed: true },
  ],
};

const StudyMaterials = ({ darkMode }) => {
  const [selectedSubject, setSelectedSubject] = useState(null);

  const subjects = Object.keys(mockMaterials);
  const materials = selectedSubject ? mockMaterials[selectedSubject] : [];

  const completedCount = materials.filter(m => m.completed).length;
  const totalCount = materials.length;

  const chartData = {
    labels: ['Completed', 'Pending'],
    datasets: [
      {
        data: [completedCount, totalCount - completedCount],
        backgroundColor: ['#4ade80', '#f87171'],
        borderColor: ['#ffffff', '#ffffff'],
        borderWidth: 2,
      },
    ],
  };

  return (
    <motion.div
      className={`p-6 rounded-3xl shadow-2xl mx-4 my-6 md:mx-10 md:my-10 transition-all duration-500
        ${darkMode
          ? 'bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white border border-gray-700'
          : 'bg-gradient-to-br from-blue-50 via-white to-blue-100 text-gray-800 border border-gray-200'}`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <h2 className="text-3xl font-bold text-center mb-8">📚 Study Materials</h2>

      <div className="flex gap-4 flex-wrap justify-center mb-6">
        {subjects.map(subject => (
          <button
            key={subject}
            onClick={() => setSelectedSubject(subject)}
            className={`px-4 py-2 rounded-full font-semibold transition-all
              ${selectedSubject === subject
                ? 'bg-blue-600 text-white'
                : 'bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white'}
            `}
          >
            {subject}
          </button>
        ))}
      </div>

      {selectedSubject && (
        <motion.div
          className={`p-6 rounded-xl shadow-md mt-4 w-full max-w-3xl mx-auto
            ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-xl font-semibold mb-4">{selectedSubject} Materials</h3>
          <ul className="list-disc list-inside mb-4">
            {materials.map((material, idx) => (
              <li key={idx} className="flex items-center justify-between">
                <span>{material.title}</span>
                <span className={`ml-2 text-sm font-medium ${material.completed ? 'text-green-500' : 'text-yellow-500'}`}>
                  {material.completed ? 'Completed' : 'Pending'}
                </span>
              </li>
            ))}
          </ul>
          <div className="max-w-xs mx-auto">
            <Pie data={chartData} />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default StudyMaterials;
