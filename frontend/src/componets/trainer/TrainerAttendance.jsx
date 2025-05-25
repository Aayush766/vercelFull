import React, { useEffect, useState } from 'react';
import Navbar from './Navbar';

// Generate dummy data for Grades 1–12, Sections A–C
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

const TrainerAttendance = () => {
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState({});
  const [darkMode, setDarkMode] = useState(false);
  const selectedKey = `${selectedGrade}-${selectedSection}`;
  const students = dummyStudents[selectedKey] || [];

  // Load attendance from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('trainerAttendance');
    if (stored) {
      setAttendance(JSON.parse(stored));
    }
  }, []);

  // Save attendance to localStorage
  useEffect(() => {
    localStorage.setItem('trainerAttendance', JSON.stringify(attendance));
  }, [attendance]);

  const handleAttendance = (studentKey, status) => {
    setAttendance((prev) => ({
      ...prev,
      [studentKey]: {
        ...prev[studentKey],
        [selectedDate]: status,
      },
    }));
  };

  const handleSubmit = () => {
    alert(`Attendance for Grade ${selectedGrade} - ${selectedSection} on ${selectedDate} submitted.`);
  };

  return (
    <>
      <Navbar darkMode={darkMode} toggleDarkMode={setDarkMode} />
      <div className={`max-w-7xl mx-auto p-8 rounded-lg shadow-xl transition-all duration-300 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
        <h2 className="text-3xl font-bold mb-8 text-center">Attendance Panel</h2>

        <div className="flex gap-6 mb-8 flex-wrap justify-center">
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className={`p-3 rounded-lg border-2 shadow-lg focus:outline-none ${darkMode ? 'bg-gray-700 text-white border-gray-500' : 'bg-gray-200 text-gray-900 border-gray-300'}`}
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
            className={`p-3 rounded-lg border-2 shadow-lg focus:outline-none ${darkMode ? 'bg-gray-700 text-white border-gray-500' : 'bg-gray-200 text-gray-900 border-gray-300'}`}
          >
            <option value="">Select Section</option>
            {['A', 'B', 'C'].map((sec) => (
              <option key={sec} value={sec}>
                Section {sec}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className={`p-3 rounded-lg border-2 shadow-lg focus:outline-none ${darkMode ? 'bg-gray-700 text-white border-gray-500' : 'bg-gray-200 text-gray-900 border-gray-300'}`}
          />
        </div>

        {selectedGrade && selectedSection && (
          <div>
            <h3 className="text-2xl font-semibold text-center mb-6">
              Grade {selectedGrade} - Section {selectedSection} | Date: {selectedDate}
            </h3>

            {students.length > 0 ? (
              <table className="w-full table-auto border-separate border-spacing-0.5 shadow-md rounded-lg">
                <thead>
                  <tr className={`${darkMode ? 'bg-gray-700' : 'bg-gray-200'} text-white`}>
                    <th className="px-6 py-3 rounded-l-lg">Roll No</th>
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Mark Attendance</th>
                    <th className="px-6 py-3 rounded-r-lg">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(({ rollNo, name }) => {
                    const key = getStudentKey(rollNo, name);
                    const status = attendance[key]?.[selectedDate] || 'Not Marked';
                    return (
                      <tr key={key} className={`text-center ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'} rounded-lg`}>
                        <td className="px-6 py-4">{rollNo}</td>
                        <td className="px-6 py-4">{name}</td>
                        <td className="px-6 py-4">
                          <div className="space-x-4">
                            <button
                              className={`px-4 py-2 rounded-full ${darkMode ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-green-400 text-gray-900 hover:bg-green-500'} transition duration-200`}
                              onClick={() => handleAttendance(key, 'P')}
                            >
                              P
                            </button>
                            <button
                              className={`px-4 py-2 rounded-full ${darkMode ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-red-400 text-gray-900 hover:bg-red-500'} transition duration-200`}
                              onClick={() => handleAttendance(key, 'A')}
                            >
                              A
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4">{status}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <p className="text-center text-xl mt-4">No student data available for this Grade & Section.</p>
            )}

            <div className="mt-8 flex justify-center">
              <button
                onClick={handleSubmit}
                className="px-8 py-3 rounded-lg shadow-lg hover:bg-blue-700 transition duration-300 bg-blue-600 text-white"
              >
                Submit Attendance
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default TrainerAttendance;
