import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from './Navbar';
import UploadGallery from './UploadGallery'; // Make sure this component exists and is implemented properly

const sessionData = {
  1: {
    title: 'STEM & Robotics',
    outcomes: [
      'Understand what STEM is and how it helps in learning science and technology.',
      'Introduction to Robotics',
      'Working with Real Robots (ASIMO, NAO Videos)',
    ],
  },
  2: {
    title: 'Mechanics',
    outcomes: [
      'Understanding Mechanics and its applications.',
      'Theory and Concepts behind mechanical systems.',
      'Hands-on experience with mechanics.',
    ],
  },
  3: {
    title: 'Mechatron',
    outcomes: [
      'Understanding Gear Mechanisms (Table Fan Bot)',
      'Wheel and Axle (Robo Car)',
      'Pulley Mechanism (Robo Crane)',
      'Force Mechanism (Robo Soccer)',
    ],
  },
  4: {
    title: 'Tinker Orbits',
    outcomes: [
      'Introduction to Tinkering and its benefits.',
      'Working of a Switch (Control LED using Switch)',
      'Working of Potentiometer (Light Dimmer)',
      'Working of LDR Sensor (Smart Morning Alarm)',
      'Working of Laser Module (Activate the Laser Beam)',
      'LED Blinking',
      'Smart Street Light',
    ],
  },
  5: {
    title: 'Tinker PBL',
    outcomes: ['Building Scribble Bot'],
  },
};

const AddClassDetails = () => {
  const [grade, setGrade] = useState('');
  const [session, setSession] = useState('');
  const [sessionTitle, setSessionTitle] = useState('');
  const [studentsCount, setStudentsCount] = useState('');
  const [learningOutcome, setLearningOutcome] = useState('');
  const [remarks, setRemarks] = useState('');
  const [learningOutcomesList, setLearningOutcomesList] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // ✅ FIXED missing state

  const handleGradeChange = (e) => {
    const selectedGrade = e.target.value;
    setGrade(selectedGrade);
    setSession('');
    setSessionTitle('');
    setLearningOutcomesList([]);
  };

  const toggleDarkMode = (checked) => {
    setDarkMode(checked);
    document.documentElement.classList.toggle('dark', checked);
  };

  const handleSessionChange = (e) => {
    const selectedSession = e.target.value;
    setSession(selectedSession);
    const title = sessionData[selectedSession]?.title || '';
    setSessionTitle(title);
    const outcomes = sessionData[selectedSession]?.outcomes || [];
    setLearningOutcomesList(outcomes);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Form submitted!');
  };

  return (
    <>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <motion.div
        className={`p-8 rounded-3xl shadow-2xl mx-4 my-6 md:mx-10 md:my-10 transition-all duration-500
          ${darkMode
            ? 'bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white border border-gray-700'
            : 'bg-gradient-to-br from-blue-50 via-white to-blue-100 text-gray-800 border border-gray-200'}`}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-3xl font-bold text-center mb-8">📚 Class Details</h2>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-2xl mx-auto">
          {/* Grade */}
          <div>
            <label className="block mb-1 font-semibold" htmlFor="grade">Grade</label>
            <select
              id="grade"
              value={grade}
              onChange={handleGradeChange}
              className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            >
              <option value="">Select Grade</option>
              {[...Array(10).keys()].map(i => (
                <option key={i + 1} value={i + 1}>Grade {i + 1}</option>
              ))}
            </select>
          </div>

          {/* Session */}
          <div>
            <label className="block mb-1 font-semibold" htmlFor="session">Session Number</label>
            <select
              id="session"
              value={session}
              onChange={handleSessionChange}
              className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
              disabled={!grade}
            >
              <option value="">Select Session</option>
              {grade &&
                [...Array(34).keys()].map(i => (
                  <option key={i + 1} value={i + 1}>Session {i + 1}</option>
                ))}
            </select>
          </div>

          {/* Session Title */}
          <div>
            <label className="block mb-1 font-semibold" htmlFor="sessionTitle">Session Title</label>
            <input
              id="sessionTitle"
              type="text"
              value={sessionTitle}
              readOnly
              className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Learning Outcome */}
          <div>
            <label className="block mb-1 font-semibold" htmlFor="learningOutcome">Learning Outcome</label>
            <select
              id="learningOutcome"
              value={learningOutcome}
              onChange={(e) => setLearningOutcome(e.target.value)}
              className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
              disabled={!learningOutcomesList.length}
            >
              <option value="">Select Learning Outcome</option>
              {learningOutcomesList.map((outcome, index) => (
                <option key={index} value={outcome}>{outcome}</option>
              ))}
            </select>
          </div>

          {/* Students Count */}
          <div>
            <label className="block mb-1 font-semibold" htmlFor="studentsCount">Students Count</label>
            <input
              id="studentsCount"
              type="number"
              value={studentsCount}
              onChange={(e) => setStudentsCount(e.target.value)}
              className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          {/* Remarks */}
          <div>
            <label className="block mb-1 font-semibold" htmlFor="remarks">Remarks</label>
            <textarea
              id="remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
              rows="3"
            />
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Attach File
            </button>
          </div>

          {/* Upload Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-lg shadow-lg w-full max-w-xl p-4 relative">
                <UploadGallery onClose={() => setIsModalOpen(false)} />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all"
          >
            Submit
          </motion.button>
        </form>
      </motion.div>
    </>
  );
};

export default AddClassDetails;
