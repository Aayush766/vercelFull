// GradeProgress.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './Navbar';

const grades = ['Grade 1', 'Grade 5', 'Grade 6', 'Grade 10'];
const sections = ['Section A', 'Section B', 'Section C'];
const subjects = ['Maths', 'Science', 'Engineering', 'Technology'];

const GradeProgress = () => {
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [progress, setProgress] = useState({});

  const handleGradeSelect = (grade) => {
    setSelectedGrade(grade);
    setSelectedSection(null);
    setSelectedSubject(null);
  };

  const handleSectionSelect = (section) => {
    setSelectedSection(section);
    setSelectedSubject(null);
  };

  const handleSubjectSelect = (subject) => {
    setSelectedSubject(subject);
    if (!progress[subject]) {
      setProgress((prev) => ({ ...prev, [subject]: 0 }));
    }
  };

  const handleProgressChange = (e) => {
    const value = e.target.value;
    setProgress((prev) => ({ ...prev, [selectedSubject]: value }));
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar />
      <div className="flex">
        {/* Sidebar */}
        {selectedGrade && selectedSection && (
          <div className="w-1/4 p-4 bg-gray-100 border-r">
            <h2 className="text-lg font-semibold mb-2">Grades</h2>
            {grades.map((grade) => (
              <div key={grade}>
                <button
                  onClick={() => handleGradeSelect(grade)}
                  className={`block w-full text-left px-2 py-1 rounded ${
                    selectedGrade === grade ? 'bg-blue-500 text-white' : ''
                  }`}
                >
                  {grade}
                </button>
                {selectedGrade === grade && (
                  <div className="ml-4">
                    {sections.map((section) => (
                      <button
                        key={section}
                        onClick={() => handleSectionSelect(section)}
                        className={`block w-full text-left px-2 py-1 rounded ${
                          selectedSection === section ? 'bg-blue-300' : ''
                        }`}
                      >
                        {section}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 p-4">
          {/* Grade Selection */}
          {!selectedGrade && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-wrap justify-center gap-4"
            >
              {grades.map((grade) => (
                <button
                  key={grade}
                  onClick={() => handleGradeSelect(grade)}
                  className="px-4 py-2 bg-blue-500 text-white rounded shadow"
                >
                  {grade}
                </button>
              ))}
            </motion.div>
          )}

          {/* Section Selection */}
          {selectedGrade && !selectedSection && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-wrap justify-center gap-4"
            >
              {sections.map((section) => (
                <button
                  key={section}
                  onClick={() => handleSectionSelect(section)}
                  className="px-4 py-2 bg-green-500 text-white rounded shadow"
                >
                  {section}
                </button>
              ))}
            </motion.div>
          )}

          {/* Subject Selection */}
          {selectedSection && !selectedSubject && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-wrap justify-center gap-4"
            >
              {subjects.map((subject) => (
                <button
                  key={subject}
                  onClick={() => handleSubjectSelect(subject)}
                  className="px-4 py-2 bg-purple-500 text-white rounded shadow"
                >
                  {subject}
                </button>
              ))}
            </motion.div>
          )}

          {/* Progress View */}
          {selectedSubject && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4"
            >
              <h3 className="text-xl font-semibold mb-2">
                {selectedSubject} - Chapter 1
              </h3>
              <input
                type="range"
                min="0"
                max="100"
                value={progress[selectedSubject]}
                onChange={handleProgressChange}
                className="w-full"
              />
              <p>{progress[selectedSubject]}% completed</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GradeProgress;
