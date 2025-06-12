import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import { DarkModeSwitch } from 'react-toggle-dark-mode';
import { motion } from 'framer-motion';
import logo from '../../assets/Logo.png';
import apiClient from '../../axiosConfig'; // Import apiClient

const TrainerNavbar = ({ darkMode, toggleDarkMode }) => {
    const navigate = useNavigate(); // Initialize useNavigate for redirection

    // Logout handler function
    const handleLogout = async () => {
        try {
            // Call the backend logout endpoint
            await apiClient.post('/auth/logout');

            // Clear any local storage or session storage data related to the user
            localStorage.removeItem('user'); // Assuming you store user data here
            sessionStorage.clear(); // Clear all session storage if used

            // Redirect to the trainer login page
            navigate('/trainer-login');
            
            // Optional: Provide user feedback
            alert('Logged out successfully!'); 

        } catch (error) {
            console.error('Logout failed:', error);
            // Even if the backend logout fails (e.g., network issue),
            // it's generally safer to clear client-side state and redirect.
            localStorage.removeItem('user');
            sessionStorage.clear();
            navigate('/trainer-login');
            alert('Logout failed, but you have been redirected. Please try logging in again.');
        }
    };

    return (
        <motion.nav
            className={`p-4 flex flex-col md:flex-row md:justify-between md:items-center gap-4 ${darkMode ? 'bg-gray-800' : 'bg-gray-600'} text-white`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
        >
            {/* Logo and Title */}
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <img src={logo} alt="Logo" className="h-16 md:h-20" />
                    <span className="text-xl font-semibold ml-2">Trainer Dashboard</span>
                </div>
            </div>

            {/* Navigation Links and Logout Button */}
            <div className="flex flex-wrap gap-4 justify-center md:justify-end items-center">
                <Link to="/trainer/profile" className="hover:text-blue-200">Profile</Link>
                <Link to="/trainer/lesson-plan" className="hover:text-blue-200">Lesson Plan</Link>
                <Link to="/trainer/dashboard" className="hover:text-blue-200">Dashboard</Link>
                <Link to="/trainer/students" className="hover:text-blue-200">Students</Link>

                {/* Logout Button */}
                <button
                    onClick={handleLogout} // Attach the logout handler
                    className="ml-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-white font-semibold transition-colors duration-200"
                >
                    Logout
                </button>

                {/* Dark Mode Toggle */}
                <DarkModeSwitch
                    checked={darkMode}
                    onChange={toggleDarkMode}
                    size={30}
                />
            </div>
        </motion.nav>
    );
};

export default TrainerNavbar;