import React, { useState } from 'react';
import apiClient from '../axiosConfig';
import UploadContent from '../sections/UploadContent';
import CreateUser from '../sections/CreateUser';
import AllContent from '../sections/AllContent';
import ManageTrainers from '../sections/ManageTrainer';
import ManageStudents from '../sections/ManageStudents';
import ManageSchools from '../sections/ManageSchools';
import ViewTrainerFeedback from '../sections/ViewTrainerFeedback'; // NEW IMPORT

function Dashboard() {
    const [view, setView] = useState('upload'); // Default view
    const [darkMode, setDarkMode] = useState(false); // State for dark mode

    const handleLogout = async () => {
        try {
            await apiClient.post('/auth/logout');
            localStorage.removeItem('user');
            window.location.href = '/admin-login';
        } catch (error) {
            console.error('Logout failed:', error);
            localStorage.removeItem('user');
            window.location.href = '/admin-login';
        }
    };

    return (
        <div className={`min-h-screen p-4 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'} transition-colors duration-300`}>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <div className="flex items-center gap-4">
                    <label className="inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={darkMode}
                            onChange={() => setDarkMode(!darkMode)}
                        />
                        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        <span className="ms-3 text-sm font-medium">Dark Mode</span>
                    </label>
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors duration-300"
                    >
                        Logout
                    </button>
                </div>
            </div>

            <div className="flex flex-wrap gap-4 mb-4">
                <button
                    onClick={() => setView('upload')}
                    className={`px-4 py-2 rounded transition-colors duration-300 ${view === 'upload' ? (darkMode ? 'bg-blue-600 text-white' : 'bg-blue-700 text-white') : (darkMode ? 'bg-blue-800 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white')}`}
                >
                    Upload Content
                </button>
                <button
                    onClick={() => setView('user')}
                    className={`px-4 py-2 rounded transition-colors duration-300 ${view === 'user' ? (darkMode ? 'bg-green-600 text-white' : 'bg-green-700 text-white') : (darkMode ? 'bg-green-800 hover:bg-green-700 text-white' : 'bg-green-500 hover:bg-green-600 text-white')}`}
                >
                    Create User
                </button>
                <button
                    onClick={() => setView('viewContent')}
                    className={`px-4 py-2 rounded transition-colors duration-300 ${view === 'viewContent' ? (darkMode ? 'bg-purple-600 text-white' : 'bg-purple-700 text-white') : (darkMode ? 'bg-purple-800 hover:bg-purple-700 text-white' : 'bg-purple-500 hover:bg-purple-600 text-white')}`}
                >
                    View All Content
                </button>
                <button
                    onClick={() => setView('manageTrainers')}
                    className={`px-4 py-2 rounded transition-colors duration-300 ${view === 'manageTrainers' ? (darkMode ? 'bg-yellow-600 text-white' : 'bg-yellow-700 text-white') : (darkMode ? 'bg-yellow-800 hover:bg-yellow-700 text-white' : 'bg-yellow-500 hover:bg-yellow-600 text-white')}`}
                >
                    Manage Trainers
                </button>
                <button
                    onClick={() => setView('manageStudents')}
                    className={`px-4 py-2 rounded transition-colors duration-300 ${view === 'manageStudents' ? (darkMode ? 'bg-teal-600 text-white' : 'bg-teal-700 text-white') : (darkMode ? 'bg-teal-800 hover:bg-teal-700 text-white' : 'bg-teal-500 hover:bg-teal-600 text-white')}`}
                >
                    Manage Students
                </button>
                <button
                    onClick={() => setView('manageSchools')}
                    className={`px-4 py-2 rounded transition-colors duration-300 ${view === 'manageSchools' ? (darkMode ? 'bg-red-600 text-white' : 'bg-red-700 text-white') : (darkMode ? 'bg-red-800 hover:bg-red-700 text-white' : 'bg-red-500 hover:bg-red-600 text-white')}`}
                >
                    Manage Schools
                </button>
                {/* NEW BUTTON FOR TRAINER FEEDBACK */}
                <button
                    onClick={() => setView('viewTrainerFeedback')}
                    className={`px-4 py-2 rounded transition-colors duration-300 ${view === 'viewTrainerFeedback' ? (darkMode ? 'bg-indigo-600 text-white' : 'bg-indigo-700 text-white') : (darkMode ? 'bg-indigo-800 hover:bg-indigo-700 text-white' : 'bg-indigo-500 hover:bg-indigo-600 text-white')}`}
                >
                    View Trainer Feedback
                </button>
            </div>

            <div className="mt-8">
                {view === 'upload' && <UploadContent darkMode={darkMode} />}
                {view === 'user' && <CreateUser darkMode={darkMode} />}
                {view === 'viewContent' && <AllContent darkMode={darkMode} />}
                {view === 'manageTrainers' && <ManageTrainers darkMode={darkMode} />}
                {view === 'manageStudents' && <ManageStudents darkMode={darkMode} />}
                {view === 'manageSchools' && <ManageSchools darkMode={darkMode} />}
                {view === 'viewTrainerFeedback' && <ViewTrainerFeedback darkMode={darkMode} />} {/* NEW COMPONENT */}
            </div>
        </div>
    );
}

export default Dashboard;