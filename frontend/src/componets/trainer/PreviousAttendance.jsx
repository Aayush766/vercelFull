import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from './Navbar'; // Reuse the same Navbar with darkMode toggle

// Dummy student generator
const dummyStudents = {};
for (let grade = 1; grade <= 12; grade++) {
  ['A', 'B', 'C'].forEach((section) => {
    const key = `${grade}-${section}`;
    dummyStudents[key] = Array.from({ length: 5 }, (_, i) => ({
      rollNo: i + 1,
      name: `Student ${i + 1} (G${grade}${section})`,
    }));
  });
}

const getStudentKey = (rollNo, name) => `${rollNo}-${name}`;

const PreviousAttendance = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [attendanceData, setAttendanceData] = useState({});

  useEffect(() => {
    const stored = localStorage.getItem('trainerAttendance');
    if (stored) setAttendanceData(JSON.parse(stored));
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const selectedKey = `${selectedGrade}-${selectedSection}`;
  const students = dummyStudents[selectedKey] || [];

  const getAllDates = () => {
    const dates = new Set();
    Object.values(attendanceData).forEach((dateMap) => {
      Object.keys(dateMap).forEach((date) => dates.add(date));
    });
    return [...dates].sort();
  };

  const renderTable = () => {
    const dates = getAllDates();

    return (
      <div className="overflow-auto mt-6">
        <table className="w-full table-auto border dark:border-gray-600">
          <thead>
            <tr className="bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 dark:bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 text-gray-900 dark:text-gray-100">
              <th className="border px-4 py-3 text-lg">Roll No</th>
              <th className="border px-4 py-3 text-lg">Name</th>
              {dates.map((date) => (
                <th key={date} className="border px-4 py-3 text-lg">{date}</th>
              ))}
            </tr>
          </thead>
          <tbody className="text-center text-lg">
            {students.map(({ rollNo, name }) => {
              const key = getStudentKey(rollNo, name);
              return (
                <tr key={key}>
                  <td className="border px-4 py-3">{rollNo}</td>
                  <td className="border px-4 py-3">{name}</td>
                  {dates.map((date) => (
                    <td key={date} className="border px-4 py-3">
                      {attendanceData[key]?.[date] || '-'}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <Navbar darkMode={darkMode} toggleDarkMode={setDarkMode} />

      <motion.div
        className="container mx-auto px-6 py-8"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className={`rounded-xl shadow-2xl p-8 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className="text-3xl font-bold mb-6 text-blue-600 dark:text-yellow-400">Previous Attendance (Date-wise)</h2>

          <div className="flex flex-col md:flex-row gap-6 mb-8">
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full md:w-1/3 px-6 py-3 rounded-xl border dark:border-gray-600 dark:bg-gray-700 dark:text-white text-lg transition-all duration-200 ease-in-out focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">Select Grade</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  Grade {i + 1}
                </option>
              ))}
            </select>

            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full md:w-1/3 px-6 py-3 rounded-xl border dark:border-gray-600 dark:bg-gray-700 dark:text-white text-lg transition-all duration-200 ease-in-out focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">Select Section</option>
              {['A', 'B', 'C'].map((sec) => (
                <option key={sec} value={sec}>
                  Section {sec}
                </option>
              ))}
            </select>
          </div>

          {selectedGrade && selectedSection ? (
            students.length > 0 ? (
              renderTable()
            ) : (
              <p className="text-lg text-gray-600 dark:text-gray-300">No student data available for this Grade & Section.</p>
            )
          ) : (
            <p className="text-lg text-gray-600 dark:text-gray-300">Please select a Grade and Section to view attendance.</p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default PreviousAttendance;
