// src/pages/LessonPlan.jsx (Previously LessonPlan, now more like TrainerGradeDashboard)
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar'; // Adjust path if Navbar is in components
import LoadingSpinner from '../LoadingSpinner';
import apiClient from '../../axiosConfig'; // Import axios instance

const LessonPlan = () => {
    const [trainerName, setTrainerName] = useState('Trainer'); // Default name
    const [availableGrades, setAvailableGrades] = useState([]); // To store actual grades
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [darkMode, setDarkMode] = useState(false);
    const navigate = useNavigate();

    // Fetch trainer's name and available grades
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                // 1. Fetch Trainer Profile to get their name
                const trainerProfileRes = await apiClient.get('/trainer/profile'); // Assuming this endpoint exists
                setTrainerName(trainerProfileRes.data.user.username || trainerProfileRes.data.user.name || 'Trainer');

                // 2. Fetch all unique grades for which sessions exist
                // This assumes your backend has an endpoint to list grades with content
                // If not, you might need to fetch all sessions and extract unique grades.
                const gradesRes = await apiClient.get('/trainer/grades'); // Ideal endpoint
                // If no direct /trainer/grades endpoint, you'd fetch all sessions and get unique grades:
                // const sessionsRes = await apiClient.get('/trainer/sessions');
                // const uniqueGrades = [...new Set(sessionsRes.data.sessions.map(s => s.grade))].sort((a,b) => a-b);
                // setAvailableGrades(uniqueGrades);
                setAvailableGrades(gradesRes.data.grades.sort((a, b) => a - b)); // Assuming response is { grades: [...] }

            } catch (err) {
                console.error('Error fetching trainer data:', err.response?.data || err.message);
                if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                    setError('Session expired or unauthorized. Please log in again.');
                    navigate('/trainer-login');
                } else {
                    setError('Failed to load trainer dashboard data.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    const toggleDarkMode = useCallback((checked) => {
        setDarkMode(checked);
        document.documentElement.classList.toggle('dark', checked);
    }, []);

    const handleLessonClick = (grade) => {
        // Navigate to the detailed course view for this specific grade
        navigate(`/trainer/grade/${grade}`);
    };

    if (loading) return <LoadingSpinner />;
    if (error) {
        return (
            <div className={`min-h-screen flex flex-col justify-center items-center transition-all duration-500 ${darkMode ? 'bg-gray-900 text-red-400' : 'bg-gray-100 text-red-600'} p-4 text-center`}>
                <h2 className="text-xl font-bold mb-4">Error Loading Dashboard</h2>
                <p className="mb-6">{error}</p>
                <button
                    onClick={() => navigate('/trainer-login')}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition"
                >
                    Go to Login
                </button>
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
            <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} /> {/* Use your generic Navbar */}

            <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                {/* Greeting Header */}
                <h1 className="text-3xl font-bold mb-4">Hi, {trainerName}</h1>

                {/* Course Overview */}
                <h2 className="text-2xl font-semibold mb-6">Grades You Manage</h2>

                {/* Lesson Cards Grid */}
                {availableGrades.length === 0 ? (
                    <p className="text-center text-gray-600 dark:text-gray-400 mt-12 text-xl font-medium">
                        No grades assigned or content available yet.
                    </p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {availableGrades.map((grade) => (
                            <div
                                key={grade}
                                onClick={() => handleLessonClick(grade)}
                                className={`cursor-pointer transition-transform hover:scale-105 rounded-lg overflow-hidden shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
                            >
                                <div className="relative">
                                    {/* Using a static placeholder image for grade cards, as no specific image for a grade */}
                                    <img src={`https://picsum.photos/seed/${grade}/400/250`} alt={`Grade ${grade}`} className="h-52 w-full object-cover" />
                                    <div className="absolute top-0 right-0 bottom-0 left-0 flex flex-col justify-center px-8">
                                        <div className={`bg-gradient-to-r ${darkMode ? 'from-gray-700 to-gray-900' : 'from-blue-900/90 to-blue-900/80'} p-6 rounded-r-xl border-l-4 border-yellow-400`}>
                                            <h3 className="text-yellow-400 font-bold text-lg">Grade {grade}</h3>
                                            <h4 className="text-white text-lg font-semibold">Managed Content</h4>
                                        </div>
                                    </div>
                                </div>

                                {/* Lesson Details - Minimal for grade card */}
                                <div className="p-4">
                                    <h3 className="font-medium">View Content for Grade {grade}</h3>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LessonPlan;