import React, { useState } from 'react';
import { motion } from 'framer-motion';
import FeedbackForm from './FeedbackForm'; // Ensure the path is correct
import AskADoubt from './AskADoubt';

const StudentSupport = ({ studentData,darkMode }) => {
  const [isFeedbackFormOpen, setIsFeedbackFormOpen] = useState(false);
  const [isAskDoubtFormOpen, setIsAskDoubtFormOpen] = useState(false);

  const handleFeedback = () => {
    setIsFeedbackFormOpen(true);
  };

  const closeFeedbackForm = () => {
    setIsFeedbackFormOpen(false);
  };

  const handleAskDoubt = () => {
    setIsAskDoubtFormOpen(true);
  };
  
  const closeAskDoubtForm = () => {
    setIsAskDoubtFormOpen(false);
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
      <h2 className="text-3xl font-bold text-center mb-6">🛠️ Student Support Center</h2>
      <div
        className={`flex flex-col md:flex-row justify-center items-center gap-6 p-6 rounded-xl shadow-xl ${darkMode
          ? 'bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white border border-gray-700'
          : 'bg-gradient-to-br from-blue-50 via-white to-blue-100 text-gray-800 border border-gray-200'}`}
      >
        <button
          className={`px-6 py-3 rounded-full text-white font-semibold transition-transform transform hover:scale-105 ${
            darkMode ? 'bg-blue-600' : 'bg-yellow-500'
          }`}
          onClick={handleFeedback}
        >
          Feedback Form
        </button>

        <button
          className={`px-6 py-3 rounded-full text-white font-semibold transition-transform transform hover:scale-105 ${
            darkMode ? 'bg-green-600' : 'bg-blue-600'
          }`}
          onClick={handleAskDoubt}
        >
          Ask A Doubt
        </button>
      </div>

      {/* Conditionally render the FeedbackForm */}
      {isFeedbackFormOpen && (
        <FeedbackForm darkMode={darkMode} closeForm={closeFeedbackForm} studentData={studentData} />
      )}

{isAskDoubtFormOpen && (
  <AskADoubt darkMode={darkMode} closeForm={closeAskDoubtForm}  studentData={studentData} />
)}
    </motion.div>
  );
};

export default StudentSupport;
