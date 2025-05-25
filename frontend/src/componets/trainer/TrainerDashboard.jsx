import React, { useState, useEffect } from 'react';
import { PulseLoader } from 'react-spinners';
import { motion } from 'framer-motion';
import Navbar from './Navbar'; // Assuming you already have a Navbar
import img from '../../assets/img.jpeg'; // Replace with actual trainer image path
import GradesProgress from './GradeProgress';
import Timetable from './Timetable';
import TrainerFeedbackForm from './TrainerFeedbackForm';
import TrainerSupport from './TrainerSupport';

const TrainerDashboard = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedGrade, setSelectedGrade] = useState('Grade 1');

  const[trainerData] = useState({
    trainerName:" Mr. Arjun Mehra",
    trainerSchool:"Sunrise Public School",
    trainerSubject:" Mathematics",
    trainerGrade:"1 to 10"
  });

  const {trainerName,trainerSchool,trainerSubject,trainerGrade} =trainerData;

  useEffect(() => {
    setTimeout(() => setLoading(false), 2000);
  }, []);

  const toggleDarkMode = (checked) => {
    setDarkMode(checked);
    document.documentElement.classList.toggle('dark', checked);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <PulseLoader color="#4B89FF" size={15} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-all duration-500 ${darkMode ? 'bg-gradient-to-r from-gray-700 to-black' : 'bg-gradient-to-r from-gray-200 to-gray-50'}`}>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      <motion.div
        className="container mx-auto p-4"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <div className={`flex flex-col md:flex-row gap-6 p-6 rounded-xl shadow-xl ${darkMode ? 'bg-gradient-to-r from-blue-200 to-blue-300' : 'bg-gradient-to-r from-gray-700 to-gray-400'}`}>

          {/* Left Section - Trainer Info */}
          <div className="flex-1 space-y-6 flex flex-col sm:flex-row items-center sm:items-start">
            <img
              src={img}
              alt="Trainer"
              className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 border-4 border-blue-500 rounded-full object-cover cursor-pointer hover:scale-105 transition-transform shadow-md"
            />
            <div className="mt-4 sm:mt-0 sm:ml-4 text-center sm:text-left">
              <h3 className={`text-xl font-bold ${darkMode ? 'text-black' : 'text-yellow-400'}`}>Name:{trainerName}</h3>
              <p className={`${darkMode ? 'text-black' : 'text-yellow-300'}`}>School:{trainerSchool} </p>
              <p className={`${darkMode ? 'text-black' : 'text-yellow-300'}`}>For Grades: {trainerGrade}</p>
              <p className={`${darkMode ? 'text-black' : 'text-yellow-300'}`}>Subject: {trainerSubject}</p>
            </div>
          </div>

          {/* Right Section - Curriculum */}
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Curriculum</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 text-white dark:text-gray-200">
                Select Grade:
              </label>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="w-full px-4 py-2 rounded border dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              >
                {Array.from({ length: 10 }, (_, i) => (
                  <option key={i} value={`Grade ${i + 1}`}>Grade {i + 1}</option>
                ))}
              </select>
            </div>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded shadow-md transition"
              onClick={() => alert(`Downloading curriculum for ${selectedGrade}`)}
            >
              Download
            </button>
          </div>
        </div>
      </motion.div>
      {/* <GradesProgress/> */}
      <TrainerSupport darkMode={darkMode} trainerData={trainerData}/>
      <Timetable darkMode={darkMode}/>
     
      
    </div>
  );
};

export default TrainerDashboard;
