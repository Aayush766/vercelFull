import React, { useState, useEffect } from 'react';
import { PulseLoader } from 'react-spinners';
import { motion } from 'framer-motion';
import Navbar from './Navbar';
// import GradesProgress from './GradeProgress'; // Uncomment if you add this component
import Timetable from './Timetable';
// import TrainerFeedbackForm from './TrainerFeedbackForm'; // Uncomment if you add this component
import TrainerSupport from './TrainerSupport';
import apiClient from '../../axiosConfig';
import { useNavigate } from 'react-router-dom';

const TrainerDashboard = () => {
    const [darkMode, setDarkMode] = useState(false);
    const [loading, setLoading] = useState(true);
    const [selectedGrade, setSelectedGrade] = useState('Grade 1'); // For curriculum download example
    const [trainerData, setTrainerData] = useState(null);
    const [fetchError, setFetchError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTrainerData = async () => {
            try {
                // This will hit /api/users/me
                const response = await apiClient.get('/auth/me');

                if (response.data.user.role !== 'trainer') {
                    setFetchError('Access denied: Not authorized as a trainer.');
                    // Attempt to log out from backend to clear cookies
                    await apiClient.post('/auth/logout');
                    localStorage.removeItem('user'); // Clear any local user data if stored
                    navigate('/trainer-login'); // Redirect to trainer login
                    return;
                }
                setTrainerData(response.data.user);
            } catch (err) {
                console.error('Error fetching trainer data:', err);
                // Axios interceptor handles 401 and redirects to /student-login.
                // This catch block would primarily handle other network errors or non-401 backend errors.
                if (err.response && err.response.status !== 401) { // Avoid double handling of 401
                    setFetchError(err.response?.data?.msg || 'Failed to load trainer data. Please try logging in again.');
                    // Optionally, if it's a persistent issue, force logout and redirect
                    // await apiClient.post('/auth/logout');
                    // localStorage.removeItem('user');
                    // navigate('/trainer-login');
                }
            } finally {
                setLoading(false);
            }
        };

        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setDarkMode(prefersDark);
        document.documentElement.classList.toggle('dark', prefersDark);

        fetchTrainerData();
    }, [navigate]); // Add navigate to dependency array for useEffect

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

    if (fetchError) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-red-100 text-red-700 p-4">
                <p>Error: {fetchError}</p>
                <button
                    onClick={() => navigate('/trainer-login')}
                    className="ml-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                    Go to Login
                </button>
            </div>
        );
    }

    if (!trainerData) {
        // This case should primarily be covered by fetchError or the interceptor redirect.
        // It serves as a final fallback.
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 text-gray-700 p-4">
                <p>No trainer data available. Please ensure you are logged in.</p>
                <button
                    onClick={() => navigate('/trainer-login')}
                    className="ml-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                    Go to Login
                </button>
            </div>
        );
    }

    // Destructure trainerData for easier access
    const { name, trainerSchool, subject, classesTaught, profilePicture } = trainerData;

    return (
        <div className={`min-h-screen transition-all duration-500 ${darkMode ? 'bg-gradient-to-r from-gray-700 to-black' : 'bg-gradient-to-r from-gray-200 to-gray-50'}`}>
            <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} userName={name} profilePicture={profilePicture} /> {/* Pass name and profilePicture to Navbar */}

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
                            src={profilePicture || 'https://via.placeholder.com/150'}
                            alt="Trainer"
                            className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 border-4 border-blue-500 rounded-full object-cover cursor-pointer hover:scale-105 transition-transform shadow-md"
                        />
                        <div className="mt-4 sm:mt-0 sm:ml-4 text-center sm:text-left">
                            <h3 className={`text-xl font-bold ${darkMode ? 'text-black' : 'text-yellow-400'}`}>Name: {name}</h3>
                            <p className={`${darkMode ? 'text-black' : 'text-yellow-300'}`}>School: {trainerSchool}</p>
                            <p className={`${darkMode ? 'text-black' : 'text-yellow-300'}`}>For Grades: {Array.isArray(classesTaught) ? classesTaught.join(', ') : classesTaught}</p> {/* Handle array for classesTaught */}
                            <p className={`${darkMode ? 'text-black' : 'text-yellow-300'}`}>Subject: {subject}</p>
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
            <TrainerSupport darkMode={darkMode} trainerData={trainerData} />
            <Timetable darkMode={darkMode} />
        </div>
    );
};

export default TrainerDashboard;