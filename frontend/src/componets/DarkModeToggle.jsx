// DarkModeToggle.js
import React from 'react';
import { DarkModeSwitch } from 'react-toggle-dark-mode';

const DarkModeToggle = ({ darkMode, toggleDarkMode }) => {
  return (
    <DarkModeSwitch
      checked={darkMode}
      onChange={toggleDarkMode}
      size={30}
    />
  );
};

export default DarkModeToggle;
