import React, { useState } from 'react';
import { motion } from 'framer-motion';

const timetableData = {
  Monday: ['Science - 9:00 AM', 'Math - 10:30 AM', 'Engineering - 12:00 PM'],
  Tuesday: ['AI - 9:00 AM', 'Technology - 10:30 AM', 'Math - 12:00 PM'],
  Wednesday: ['Engineering - 9:00 AM', 'Science - 10:30 AM', 'AI - 12:00 PM'],
  Thursday: ['Math - 9:00 AM', 'Technology - 10:30 AM', 'Science - 12:00 PM'],
  Friday: ['AI - 9:00 AM', 'Engineering - 10:30 AM', 'Technology - 12:00 PM'],
  Saturday: ['Technology - 9:00 AM', 'AI - 10:30 AM'],
};

const times = ['9:00 AM', '10:30 AM', '12:00 PM'];

const Timetable = ({ darkMode }) => {
  const days = Object.keys(timetableData);

  // Create a lookup map for quick access
  const subjectMap = {};
  days.forEach(day => {
    subjectMap[day] = {};
    timetableData[day].forEach(entry => {
      const [subject, time] = entry.split(' - ');
      subjectMap[day][time] = subject;
    });
  });

  return (
    <motion.div
      className={`overflow-x-auto rounded-3xl shadow-2xl mx-4 my-6 md:mx-10 md:my-10 p-6
        ${darkMode
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white border border-gray-700'
          : 'bg-gradient-to-br from-blue-50 via-white to-blue-100 text-gray-900 border border-gray-200'}`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <h2 className="text-3xl font-bold text-center mb-8">📅 Weekly Timetable</h2>

      <motion.div
        className="grid grid-cols-[120px_repeat(6,minmax(120px,1fr))] gap-px text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {/* Day Headers */}
        <div className="bg-transparent" />
        {days.map(day => (
          <div
            key={day}
            className={`py-3 font-bold uppercase 
              ${darkMode ? 'bg-gray-700' : 'bg-blue-200'}`}
          >
            {day}
          </div>
        ))}

        {/* Timetable Body */}
        {times.map((time, idx) => (
          <React.Fragment key={idx}>
            <div className={`py-4 font-semibold 
              ${darkMode ? 'bg-gray-700' : 'bg-blue-100'}`}>
              {time}
            </div>

            {days.map(day => {
              const subject = subjectMap[day][time] || '—';
              return (
                <motion.div
                  key={day + time}
                  whileHover={{ scale: 1.05 }}
                  className={`py-4 cursor-default rounded transition-all duration-300 text-sm font-medium
                    ${darkMode
                      ? 'bg-gray-800 hover:bg-gray-700'
                      : 'bg-white hover:bg-blue-100 shadow-md'}`}
                >
                  {subject}
                </motion.div>
              );
            })}
          </React.Fragment>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default Timetable;
