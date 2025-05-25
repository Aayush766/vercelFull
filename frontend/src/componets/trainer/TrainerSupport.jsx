import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom'; // ✅ Updated hook for navigation
import TrainerFeedbackForm from './TrainerFeedbackForm';
import SeeStudentDoubts from './SeeStudentDoubts';

const TrainerSupport = ({trainerData, darkMode }) => {
  const [isFeedbackFormOpen, setIsFeedbackFormOpen] = useState(false);
  const [isSeeStudentDoubtsOpen, setIsSeeStudentDoubtsOpen] = useState(false);

  const navigate = useNavigate(); // ✅ useNavigate instead of useHistory

  const handleFeedback = () => {
    setIsFeedbackFormOpen(true);
  };

  const closeFeedbackForm = () => {
    setIsFeedbackFormOpen(false);
  };

  const handleSeeStudentDoubts = () => {
    setIsSeeStudentDoubtsOpen(true);
  };

  const closeSeeStudentDoubts = () => {
    setIsSeeStudentDoubtsOpen(false);
  };

  const handleGradeDetails = () => {
    navigate('/trainer/grade-details'); // ✅ Navigate using useNavigate
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
      <h2 className="text-3xl font-bold text-center mb-6">🛠️ Trainer Support Center</h2>
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
          Trainer Feedback Form
        </button>

        <button
          className={`px-6 py-3 rounded-full text-white font-semibold transition-transform transform hover:scale-105 ${
            darkMode ? 'bg-green-600' : 'bg-blue-600'
          }`}
          onClick={handleSeeStudentDoubts}
        >
          See Student Doubts
        </button>

        <button
          className={`px-6 py-3 rounded-full text-white font-semibold transition-transform transform hover:scale-105 ${
            darkMode ? 'bg-purple-600' : 'bg-indigo-600'
          }`}
          onClick={handleGradeDetails}
        >
          Daily Report
        </button>
      </div>

      {isFeedbackFormOpen && (
        <TrainerFeedbackForm darkMode={darkMode} closeForm={closeFeedbackForm} trainerData={trainerData}/>
      )}

      {isSeeStudentDoubtsOpen && (
        <SeeStudentDoubts darkMode={darkMode} closeForm={closeSeeStudentDoubts} />
      )}
    </motion.div>
  );
};

export default TrainerSupport;
