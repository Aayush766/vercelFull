import React, { useState } from 'react';

const CourseOverview = () => {
  const [descOpen, setDescOpen] = useState(true);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-8">
      <div
        onClick={() => setDescOpen(!descOpen)}
        className="flex justify-between items-center cursor-pointer mb-4"
      >
        <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-400">
          Course Description
        </h2>
        <span className="text-blue-700 dark:text-blue-400 select-none">
          {descOpen ? 'Collapse ▲' : 'Expand ▼'}
        </span>
      </div>
      {descOpen && (
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          Dive into the world of STEM, Robotics, AI & ML. Explore coding, artificial intelligence,
          and robotics comprehensively for a holistic learning experience.
        </p>
      )}

      <div className="border-t border-gray-300 dark:border-gray-700 pt-4 mb-4">
        <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200 mb-2">Announcements</h3>
        <p className="text-gray-600 dark:text-gray-400">No new announcements</p>
      </div>

      <div className="border-t border-gray-300 dark:border-gray-700 pt-4">
        <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200 mb-2">Feedback</h3>
        <p className="text-gray-600 dark:text-gray-400">Please provide your valuable feedback.</p>
      </div>
    </div>
  );
};

export default CourseOverview;
