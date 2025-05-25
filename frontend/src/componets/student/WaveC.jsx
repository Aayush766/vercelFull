// WaveComponent.js
import React from 'react';

const WaveC = () => {
  return (
    <div className="w-full h-32 bg-gradient-to-r from-blue-200 to-blue-300">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 320"
        className="w-full h-full"
        preserveAspectRatio="none"
      >
        <path
          fill="currentColor"
          d="M0,128L1440,256L1440,320L0,320Z"
        ></path>
      </svg>
    </div>
  );
};

export default WaveC;
