import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from './Navbar';

const TrainerActions = ({  }) => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);

  const handleNavigate = (path) => {
    navigate(path);
  };
  const toggleDarkMode = (checked) => {
    setDarkMode(checked);
    document.documentElement.classList.toggle('dark', checked);
  };


  return (
    <>
    <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
    <motion.div
      className={`p-6 rounded-3xl shadow-2xl mx-4 my-6 md:mx-10 md:my-10 transition-all duration-500
        ${darkMode
          ? 'bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white border border-gray-700'
          : 'bg-gradient-to-br from-blue-50 via-white to-blue-100 text-gray-800 border border-gray-200'}`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <h2 className="text-3xl font-bold text-center mb-6">👨‍🏫 Trainer Actions</h2>
      <div
        className={`flex flex-col md:flex-row justify-center items-center gap-6 p-6 rounded-xl shadow-xl ${darkMode
          ? 'bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white border border-gray-700'
          : 'bg-gradient-to-br from-blue-50 via-white to-blue-100 text-gray-800 border border-gray-200'}`}
      >
        {/* Button to Navigate to Add Student Attendance */}
        <button
          onClick={() => handleNavigate('/trainer/attendance')}
          className={`px-6 py-3 rounded-full text-white font-semibold transition-transform transform hover:scale-105 ${
            darkMode ? 'bg-blue-600' : 'bg-yellow-500'
          }`}
        >
          Add Student Attendance
        </button>

        {/* Button to Navigate to Check Student Attendance */}
        <button
          onClick={() => handleNavigate('/trainer/previous-attendance')}
          className={`px-6 py-3 rounded-full text-white font-semibold transition-transform transform hover:scale-105 ${
            darkMode ? 'bg-green-600' : 'bg-blue-600'
          }`}
        >
          Check Student Attendance
        </button>

        {/* Button to Navigate to Enroll Student */}
        <button
          onClick={() => handleNavigate('/trainer/addStudent')}
          className={`px-6 py-3 rounded-full text-white font-semibold transition-transform transform hover:scale-105 ${
            darkMode ? 'bg-purple-600' : 'bg-indigo-600'
          }`}
        >
          Enroll Student
        </button>
      </div>
    </motion.div>
    </>
  );
};

export default TrainerActions;
