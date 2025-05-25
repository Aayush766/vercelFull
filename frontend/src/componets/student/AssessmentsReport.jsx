import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { motion } from 'framer-motion';

const AssessmentReport = ({ darkMode }) => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const totalSessions = 34;
  const visibleSessions = expanded ? totalSessions : 4;

  const handleSessionClick = (sessionKey) => {
    const sessionData = localStorage.getItem(sessionKey);
    if (!sessionData) {
      alert('No data found for this session.');
      return;
    }

    const parsedData = JSON.parse(sessionData);
    navigate('/result', { state: parsedData });
  };

  const toggleExpand = () => {
    setExpanded((prev) => !prev);
  };

  return (
    <motion.div
      className={`rounded-3xl shadow-2xl mx-4 my-6 md:mx-10 md:my-10 p-6
        ${darkMode
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white border border-gray-700'
          : 'bg-gradient-to-br from-blue-50 via-white to-blue-100 text-gray-900 border border-gray-200'}`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <h2 className="text-3xl font-bold text-center mb-8 text-purple-600 dark:text-purple-400">📊 Assessment Report</h2>

      <motion.div
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {Array.from({ length: visibleSessions }, (_, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.05 }}
            onClick={() => handleSessionClick(`session${i + 1}`)}
            className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 shadow-md
              ${darkMode
                ? 'bg-gray-800 text-white hover:bg-gray-700'
                : 'bg-white text-indigo-700 hover:bg-blue-100'}`}
          >
            Session {i + 1}
          </motion.button>
        ))}
      </motion.div>

      <div className="flex justify-center mt-6">
        <button
          onClick={toggleExpand}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 transition"
        >
          {expanded ? (
            <>
              Show Less <ChevronUp size={18} />
            </>
          ) : (
            <>
              Show All Sessions <ChevronDown size={18} />
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
};

export default AssessmentReport;
