import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import LoadingSpinner from '../LoadingSpinner';

// Generate lesson cards with random demo image URLs
const generateLessonCards = () => {
  return Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    grade: `${i + 1}`,
    image: `https://picsum.photos/200/300?random=${i + 1}`,
    progress: [100, 90, 70, 40, 50, 60, 30, 20, 80, 90][i],
  }));
};

const LessonPlan = () => {
  const [lessons] = useState(generateLessonCards());
  const [loading] = useState(false);
  const [filter, setFilter] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
    // You can implement actual filter logic here
  };

  const toggleDarkMode = (checked) => {
    setDarkMode(checked);
    document.documentElement.classList.toggle('dark', checked);
  };

  const handleLessonClick = (lesson) => {
    navigate(`/lesson/${lesson.id}`, { state: { grade: lesson.grade } });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Greeting Header */}
        <h1 className="text-3xl font-bold mb-4">Hi, Arun</h1>

        {/* Filter Options */}
        <div className="flex space-x-4 mb-8">
          <select
            value={filter}
            onChange={handleFilterChange}
            className="p-2 border rounded-md"
          >
            <option value="">Filter by Grade</option>
            <option value="inProgress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Course Overview */}
        <h2 className="text-2xl font-semibold mb-6">Course Overview</h2>

        {/* Lesson Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lessons.map((lesson) => (
            <div
              key={lesson.id}
              onClick={() => handleLessonClick(lesson)}
              className={`cursor-pointer transition-transform hover:scale-105 rounded-lg overflow-hidden shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
            >
              <div className="relative">
                <img src={lesson.image} alt={`Lesson ${lesson.grade}`} className="h-52 w-full object-cover" />
                <div className="absolute top-0 right-0 bottom-0 left-0 flex flex-col justify-center px-8">
                  <div className={`bg-gradient-to-r ${darkMode ? 'from-gray-700 to-gray-900' : 'from-blue-900/90 to-blue-900/80'} p-6 rounded-r-xl border-l-4 border-yellow-400`}>
                    <h3 className="text-yellow-400 font-bold text-lg">Grade {lesson.grade}</h3>
                    <h4 className="text-white text-lg font-semibold">Course Lesson</h4>
                  </div>
                </div>
              </div>

              {/* Lesson Details */}
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Lesson {lesson.grade}</h3>
                </div>

                {/* Progress Bar */}
                {lesson.progress > 0 && (
                  <div className="mt-2">
                    <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full"
                        style={{ width: `${lesson.progress}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {lesson.progress}% completed
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LessonPlan;
