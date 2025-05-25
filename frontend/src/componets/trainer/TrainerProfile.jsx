import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import dayjs from 'dayjs';
import Navbar from './Navbar';

const TrainerProfile = () => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const trainer = {
    name: 'Mr. Arjun Mehra',
    subject: 'Mathematics',
    school: 'Sunrise Public School',
    classes: 'Grade 1 to Grade 10',
    experience: '5 years',
    dob: '1985-10-10',
    contact: '9876543210',
    email: 'arjun.mehra@example.com',
    attendanceToday: 'Present',
    attendanceMonth: '98%',
  };

  const attendanceData = {
    '2025-05-01': 'P',
    '2025-05-02': 'A',
    '2025-05-03': 'P',
    '2025-05-04': 'P',
    '2025-05-05': 'P',
  };

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const dateString = dayjs(date).format('YYYY-MM-DD');
      const status = attendanceData[dateString];
      if (status) {
        return (
          <div className={`attendance-marker ${status === 'P' ? 'bg-green-500' : 'bg-red-500'} text-white p-1 rounded`}>
            {status}
          </div>
        );
      }
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`max-w-4xl mx-auto p-6 rounded-3xl shadow-xl
        ${darkMode
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white border border-gray-700'
          : 'bg-gradient-to-br from-blue-50 via-white to-blue-100 text-gray-900 border border-gray-200'
      }`}
    >
      <Navbar darkMode={darkMode} toggleDarkMode={setDarkMode} />

      <h2 className="text-3xl font-bold mb-6 text-center text-blue-700 dark:text-blue-400">👨‍🏫 Trainer Profile</h2>

      <div className="flex justify-center mb-8">
        <img
          src="https://via.placeholder.com/150"
          alt={trainer.name}
          className="w-36 h-36 rounded-full border-4 border-blue-500 shadow-md object-cover"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-6 text-lg font-medium mb-6">
        <div><span className="text-gray-600 dark:text-gray-300">Name: </span>{trainer.name}</div>
        <div><span className="text-gray-600 dark:text-gray-300">Subject: </span>{trainer.subject}</div>
        <div><span className="text-gray-600 dark:text-gray-300">School: </span>{trainer.school}</div>
        <div><span className="text-gray-600 dark:text-gray-300">Classes: </span>{trainer.classes}</div>
        <div><span className="text-gray-600 dark:text-gray-300">Experience: </span>{trainer.experience}</div>
        <div><span className="text-gray-600 dark:text-gray-300">Date of Birth: </span>{trainer.dob}</div>
        <div><span className="text-gray-600 dark:text-gray-300">Contact: </span>{trainer.contact}</div>
        <div><span className="text-gray-600 dark:text-gray-300">Email: </span>{trainer.email}</div>
        <div><span className="text-gray-600 dark:text-gray-300">Attendance (Today): </span>{trainer.attendanceToday}</div>
        <div><span className="text-gray-600 dark:text-gray-300">Attendance (Monthly): </span>{trainer.attendanceMonth}</div>
      </div>

      <h3 className="text-2xl font-bold mb-4 text-center text-blue-700 dark:text-blue-400">📅 Attendance Calendar</h3>
      <Calendar
        tileContent={tileContent}
        className="attendance-calendar"
      />
    </motion.div>
  );
};

export default TrainerProfile;
