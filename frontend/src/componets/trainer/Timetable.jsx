import React, { useState } from 'react';
import { motion } from 'framer-motion';

const timetable = {
  "9:00 AM": {
    Monday: { grade: 'Grade 6' },
    Tuesday: { grade: 'Grade 7', subject: 'Physics' },
    Wednesday: { grade: 'Grade 6', subject: 'Science' },
    Thursday: { grade: 'Grade 8', subject: 'Computer' },
    Friday: { grade: 'Grade 5', subject: 'History' },
    Saturday: { grade: 'Grade 4', subject: 'Yoga' },
  },
  "10:30 AM": {
    Monday: { grade: 'Grade 7', subject: 'English' },
    Tuesday: { grade: 'Grade 9', subject: 'Chemistry' },
    Wednesday: { grade: 'Grade 8', subject: 'Biology' },
    Thursday: { grade: 'Grade 5', subject: 'English' },
    Friday: { grade: 'Grade 6', subject: 'Art' },
    Saturday: { grade: 'Grade 3', subject: 'Games' },
  },
  "12:00 PM": {
    Monday: { grade: 'Grade 9', subject: 'Science' },
    Tuesday: { grade: 'Grade 6', subject: 'History' },
    Wednesday: { grade: 'Grade 4', subject: 'Civics' },
    Thursday: { grade: 'Grade 7', subject: 'Math' },
    Friday: { grade: 'Grade 3', subject: 'Drawing' },
    Saturday: {},
  }
};

const TrainerTimetable = ({ darkMode }) => {
  const times = Object.keys(timetable);
  const days = Object.keys(timetable[times[0]]);
  const [selectedInfo, setSelectedInfo] = useState(null);

  const handleClick = (time, day) => {
    const entry = timetable[time][day];
    if (entry && entry.grade && entry.subject) {
      setSelectedInfo({
        time,
        day,
        grade: entry.grade,
        subject: entry.subject,
      });
    }
  };

  const closeModal = () => setSelectedInfo(null);

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
      <h2 className="text-3xl font-bold text-center mb-8">📘 Trainer Weekly Grade Timetable</h2>

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
              const entry = timetable[time][day];
              return (
                <motion.div
                  key={day + time}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => handleClick(time, day)}
                  className={`py-4 cursor-pointer rounded transition-all duration-300 text-sm font-medium
                    ${darkMode
                      ? 'bg-gray-800 hover:bg-gray-700'
                      : 'bg-white hover:bg-blue-100 shadow-md'}`}
                >
                  {entry?.grade || '—'}
                </motion.div>
              );
            })}
          </React.Fragment>
        ))}
      </motion.div>

    
    </motion.div>
  );
};

export default TrainerTimetable;
