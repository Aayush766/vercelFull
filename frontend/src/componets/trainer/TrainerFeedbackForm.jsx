import React, { useState } from 'react';
import { motion } from 'framer-motion';

const TrainerFeedbackForm = ({ darkMode, closeForm, trainerData }) => {
  const [formData, setFormData] = useState({
    trainerName: trainerData?.trainerName || '', 
    schoolName: trainerData?.trainerSchool ||'',
    lessonPlan: '',
    logbook: '',
    otherSuggestion: '',
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Feedback Submitted:', formData);
    alert('Thank you for your feedback!');
    setFormData({
      trainerName: '',
      schoolName: '',
      lessonPlan: '',
      logbook: '',
      otherSuggestion: '',
    });
    closeForm(); // Close the form after submission
  };

  return (
    <motion.div
      className={`p-6 rounded-3xl shadow-2xl mx-4 my-6 md:mx-10 md:my-10 transition-all duration-500
        ${darkMode
          ? 'bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white border border-gray-700'
          : 'bg-gradient-to-br from-blue-50 via-white to-blue-100 text-gray-800 border border-gray-200'}`}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold text-center mb-8">🧾 Trainer Feedback Form</h2>
        <button
          onClick={closeForm}
          className="text-red-500 font-semibold hover:underline text-lg"
        >
          ✖ Close
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-2xl mx-auto">
        {/* Trainer Name */}
        <div>
          <label className="block mb-1 font-semibold" htmlFor="trainerName">
            Name of Trainer
          </label>
          <input
            type="text"
            name="trainerName"
            id="trainerName"
            value={formData.trainerName}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Assigned School */}
        <div>
          <label className="block mb-1 font-semibold" htmlFor="schoolName">
            Name of Assigned School
          </label>
          <input
            type="text"
            name="schoolName"
            id="schoolName"
            value={formData.schoolName}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Lesson Plan Suggestion */}
        <div>
          <label className="block mb-1 font-semibold" htmlFor="lessonPlan">
            Lesson Plan Suggestion
          </label>
          <textarea
            name="lessonPlan"
            id="lessonPlan"
            value={formData.lessonPlan}
            onChange={handleChange}
            rows="3"
            className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
          ></textarea>
        </div>

        {/* Logbook Suggestion */}
        <div>
          <label className="block mb-1 font-semibold" htmlFor="logbook">
            Logbook Suggestion
          </label>
          <textarea
            name="logbook"
            id="logbook"
            value={formData.logbook}
            onChange={handleChange}
            rows="3"
            className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
          ></textarea>
        </div>

        {/* Other Suggestion */}
        <div>
          <label className="block mb-1 font-semibold" htmlFor="otherSuggestion">
            Any Other Suggestion
          </label>
          <textarea
            name="otherSuggestion"
            id="otherSuggestion"
            value={formData.otherSuggestion}
            onChange={handleChange}
            rows="3"
            className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
          ></textarea>
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all"
        >
          Submit Feedback
        </motion.button>
      </form>
    </motion.div>
  );
};

export default TrainerFeedbackForm;
