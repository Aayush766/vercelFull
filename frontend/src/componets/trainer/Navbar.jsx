import React from 'react';
import { Link } from 'react-router-dom';
import { DarkModeSwitch } from 'react-toggle-dark-mode';
import { motion } from 'framer-motion';
import logo from '../../assets/Logo.png';

const TrainerNavbar = ({ darkMode, toggleDarkMode }) => {
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

      {/* Navigation Links */}
      <div className="flex flex-wrap gap-4 justify-center md:justify-end items-center">
        <Link to="/trainer/profile" className="hover:text-blue-200">Profile</Link>
        <Link to="/trainer/lesson-plan" className="hover:text-blue-200">Lesson Plan</Link>
        <Link to="/trainer/dashboard" className="hover:text-blue-200">Dashboard</Link>
        
        <Link to="/trainer/students" className="hover:text-blue-200">Students</Link>

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
