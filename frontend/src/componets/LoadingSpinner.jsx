import React from 'react';
import { PulseLoader } from 'react-spinners';

const LoadingSpinner = ({ color = "#4B89FF", size = 15 }) => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <PulseLoader color={color} size={size} />
    </div>
  );
};

export default LoadingSpinner;
