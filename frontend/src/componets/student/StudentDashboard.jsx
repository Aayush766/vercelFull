import React, { useState, useEffect } from 'react';
import { PulseLoader } from 'react-spinners';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar';
// import Timetable from './Timetable'; // Uncomment if you want to include Timetable
import apiClient from '../../axiosConfig'; // Correctly imported apiClient

import defaultImg from '../../assets/img.jpeg'; // Ensure this path is correct
import AssessmentsReport from './AssessmentsReport';
import StudentSupport from './StudentSupport';
import BadgeSection from './BadgeSection';
import AskADoubt from './AskADoubt';
import FeedbackForm from './FeedbackForm';

const StudentDashboard = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState(null);
  const [error, setError] = useState(null);
  const [studentProgress, setStudentProgress] = useState(0); // State for dynamic progress
  const navigate = useNavigate();

  useEffect(() => {
    // Check user's system preference for dark mode
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(prefersDark);
    document.documentElement.classList.toggle('dark', prefersDark);
  }, []);

  const toggleDarkMode = (checked) => {
    setDarkMode(checked);
    document.documentElement.classList.toggle('dark', checked);
  };

  // FIXED: Using apiClient to fetch student data and progress
  useEffect(() => {
    const fetchStudentData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch student profile data using apiClient
        const profileResponse = await apiClient.get('/student/profile');
        setStudentData(profileResponse.data.user);

        // Fetch student progress data using apiClient
        const progressResponse = await apiClient.get('/student/progress');
        // Ensure progress is a number, default to 0 if null/undefined
        setStudentProgress(progressResponse.data.progress || 0);

      } catch (err) {
        console.error('Error fetching student data:', err.response ? err.response.data : err.message);

        // apiClient's interceptor should handle 401/403 redirection automatically.
        // This local error handling is mostly for displaying a message if the interceptor
        // somehow didn't redirect or if other non-auth errors occur.
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          localStorage.removeItem('user'); // Clear local user data
          // navigate('/student-login'); // This might be redundant if interceptor handles it
          setError(err.response?.data?.msg || 'Session expired or unauthorized. Please log in again.');
        } else {
          setError(err.response?.data?.msg || 'Failed to load student data. Please check your connection.');
        }
      } finally {
        setTimeout(() => setLoading(false), 500); // Simulate loading time
      }
    };

    fetchStudentData();
  }, [navigate]); // navigate is a dependency

  // Loading state UI
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <PulseLoader color="#4B89FF" size={15} />
      </div>
    );
  }

  // Error state UI
  if (error) {
    return (
      <div className={`min-h-screen flex flex-col justify-center items-center transition-all duration-500 ${darkMode ? 'bg-gray-900 text-red-400' : 'bg-gray-100 text-red-600'} p-4 text-center`}>
        <h2 className="text-xl font-bold mb-4">Error Loading Dashboard</h2>
        <p className="mb-6">{error}</p>
        <button
          onClick={() => navigate('/student-login')}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition"
        >
          Go to Login
        </button>
      </div>
    );
  }

  // No student data (should ideally be caught by error handling, but as a fallback)
  if (!studentData) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-700 dark:text-gray-300">No student data available. Please log in.</p>
      </div>
    );
  }

  const { name, grade, school, profilePicture } = studentData;

  return (
    <div className={`min-h-screen transition-all duration-500 ${darkMode ? 'bg-gradient-to-r from-gray-700 to-black' : 'bg-gradient-to-r from-gray-200 to-gray-50'}`}>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <motion.div
        className="container mx-auto p-4"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <div
          className={`flex flex-col md:flex-row gap-6 p-6 rounded-xl shadow-xl ${
            darkMode
              ? 'bg-gradient-to-r from-blue-200 to-blue-300'
              : 'bg-gradient-to-r from-gray-700 to-gray-400'
          }`}
        >
          <div className="flex-1 space-y-8">
            <motion.div
              className="flex flex-col sm:flex-row items-center sm:items-start"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <img
                src={profilePicture || defaultImg}
                alt={name}
                className="w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52 lg:w-60 lg:h-60 border-[6px] border-blue-500 rounded-full object-cover shadow-lg hover:scale-105 transition-transform duration-300"
              />
              <div className="mt-6 sm:mt-0 sm:ml-6 text-center sm:text-left space-y-2">
                <h3 className={`text-3xl md:text-4xl font-extrabold ${darkMode ? 'text-black' : 'text-yellow-300'}`}>
                  {name}
                </h3>
                <p className={`text-xl md:text-2xl font-semibold ${darkMode ? 'text-black' : 'text-yellow-200'}`}>
                  Grade: {grade}
                </p>
                <p className={`text-lg md:text-xl font-medium ${darkMode ? 'text-black' : 'text-white'}`}>
                  School: {school}
                </p>
              </div>
            </motion.div>
          </div>

          <motion.div
            className="flex-1 space-y-4"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome, {name}!</h3>
            <p className={`${darkMode ? 'text-black' : 'text-yellow-400'}`}>
              Here you can see your course progress and manage your courses. Stay consistent to achieve your goals.
            </p>
            <h4 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Course Progress Tracker</h4>
            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-gray-800 rounded-full"
                style={{ width: `${studentProgress}%` }} // Use dynamic studentProgress
              ></div>
            </div>
            <p className={` font-bold ${darkMode ? 'text-red-500' : 'text-yellow-400'}`}>
              {studentProgress.toFixed(2)}% Complete {/* Display with 2 decimal places */}
            </p>
          </motion.div>
        </div>
      </motion.div>

      {studentData && (
        <>
          <BadgeSection darkMode={darkMode} />
          <AssessmentsReport darkMode={darkMode} />
          <AskADoubt />
          <FeedbackForm darkMode={darkMode} studentData={studentData} />
          {/* <Timetable /> Uncomment if you want to include Timetable */}
          {/* <StudentSupport darkMode={darkMode} /> Uncomment if you want to include StudentSupport */}
        </>
      )}
    </div>
  );
};

export default StudentDashboard;
