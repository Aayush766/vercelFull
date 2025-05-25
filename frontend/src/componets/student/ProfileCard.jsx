import React from 'react';
import { motion } from 'framer-motion';

const ProfileCard = ({ studentName = "John Doe", studentGrade = "10-A", progress = 75, darkMode = false }) => {
  return (
    <div className="flex flex-col lg:flex-row justify-between items-center lg:items-start p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg space-y-6 lg:space-y-0 lg:space-x-6">
      
      {/* Left Section */}
      <div className="flex-1 space-y-8">
        <motion.div
          className="flex flex-col sm:flex-row items-center sm:items-start"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <img
            src="/path-to-student-image.jpg"
            alt={studentName}
            className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 border-4 border-blue-500 rounded-full object-cover cursor-pointer hover:scale-105 transition-transform shadow-md"
          />
          <div className="mt-4 sm:mt-0 sm:ml-4 text-center sm:text-left">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{studentName}</h3>
            <p className="text-gray-500 dark:text-gray-300">Grade: {studentGrade}</p>
          </div>
        </motion.div>
      </div>

      {/* Right Section */}
      <motion.div
        className="flex-1 space-y-4"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">Welcome, {studentName}!</h3>
        <p className={`text-gray-500 ${darkMode ? 'text-black' : 'text-yellow-400'}`}>
          Here you can see your course progress and manage your courses. Stay consistent to achieve your goals.
        </p>
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Course Progress Tracker</h4>
        <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-gray-800 rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{progress}% Completed</p>
      </motion.div>
    </div>
  );
};

export default ProfileCard;
