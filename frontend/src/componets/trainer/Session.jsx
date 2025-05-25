import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaFileAlt, FaPlayCircle, FaQuestionCircle } from 'react-icons/fa';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import LoadingSpinner from '../LoadingSpinner';

const generateSessions = () => {
  return Array.from({ length: 34 }, (_, i) => ({
    id: i + 1,
    name: `Session ${i + 1}`,
    topicName: `Trainer Topic ${i + 1}`,
    progress: i < 5 ? [100, 80, 60, 40, 20][i] : 0,
  }));
};

const Session = () => {
  const [sessions, setSessions] = useState(generateSessions());
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSessionId, setExpandedSessionId] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();
  const grade = location.state?.grade || 'Unknown';

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const filteredSessions = useMemo(() => {
    return sessions.filter(
      (session) =>
        session.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.topicName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sessions, searchTerm]);

  const toggleSession = (id) => {
    setExpandedSessionId(expandedSessionId === id ? null : id);
  };

  const handleResourceClick = (sessionId, type) => {
    if (type === 'quiz') {
      navigate(`/trainer/session/${sessionId}/quiz`);
    } else {
      navigate(`/trainer/session/${sessionId}`, { state: { resourceType: type } });
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      <div className="flex max-w-7xl mx-auto px-6 py-10 sm:px-8 lg:px-12 gap-10">
        {/* Sidebar */}
        <div className="w-64 sticky top-24 self-start rounded-lg shadow-xl bg-white dark:bg-gray-900 border border-indigo-300 dark:border-indigo-700">
          <Sidebar darkMode={darkMode} sessions={sessions} />
        </div>

        {/* Main Content */}
        <div className="flex-grow max-w-4xl">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-3xl font-bold mb-2">Trainer Dashboard - Grade: {grade}</h1>
            <h2 className="text-xl font-semibold mb-4">Manage Your Course Sessions</h2>
          </div>

          {/* Search */}
          <div className="mb-8 relative max-w-md mx-auto">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search sessions or topics..."
              className={`pl-5 pr-5 py-3 rounded-2xl shadow-lg w-full text-lg font-medium focus:outline-none focus:ring-4 transition-colors duration-300 ${
                darkMode
                  ? 'bg-gray-800 text-white placeholder-gray-400 focus:ring-indigo-600'
                  : 'bg-white text-gray-900 placeholder-gray-600 focus:ring-indigo-400'
              }`}
            />
          </div>

          {/* Session Cards */}
          <div className="space-y-8">
            {filteredSessions.length === 0 ? (
              <p className="text-center text-gray-600 dark:text-gray-400 mt-12 text-xl font-medium">
                No sessions found.
              </p>
            ) : (
              filteredSessions.map((session) => {
                const isExpanded = expandedSessionId === session.id;

                return (
                  <div
                    key={session.id}
                    className={`rounded-3xl shadow-xl overflow-hidden ${
                      darkMode
                        ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700'
                        : 'bg-white text-black hover:bg-blue-100'
                    }`}
                  >
                    <div
                      className="flex items-center justify-between p-8 cursor-pointer select-none"
                      onClick={() => toggleSession(session.id)}
                    >
                      <div className="flex flex-col flex-grow max-w-xl">
                        <div className="flex items-center space-x-5">
                          <h3 className="text-2xl font-extrabold tracking-wide">{session.name}</h3>
                          <span className={`text-lg font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-900'}`}>
                            {session.topicName}
                          </span>
                        </div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-600 to-gray-800 rounded-full"
                            style={{ width: `${session.progress}%` }}
                          />
                        </div>
                      </div>
                      <button
                        className={`ml-8 transform transition-transform duration-300 text-indigo-600 dark:text-indigo-400 text-2xl ${
                          isExpanded ? 'rotate-180' : 'rotate-0'
                        }`}
                      >
                        ▼
                      </button>
                    </div>

                    {isExpanded && (
                      <div
                        className={`px-16 pb-12 pt-6 border-t space-y-8 rounded-b-3xl shadow-inner ${
                          darkMode
                            ? 'bg-gray-600 text-white border-white'
                            : 'bg-white text-gray-800 border-gray-200'
                        }`}
                      >
                        <div
                          onClick={() => handleResourceClick(session.id, 'ebook')}
                          className="flex items-center cursor-pointer space-x-5 group hover:text-purple-600 dark:hover:text-purple-400"
                        >
                          <FaFileAlt size={32} color="violet" />
                          <span className="font-semibold text-xl">Ebook</span>
                        </div>
                        <hr className="border-indigo-300 dark:border-indigo-700" />
                        <div
                          onClick={() => handleResourceClick(session.id, 'video')}
                          className="flex items-center cursor-pointer space-x-5 group hover:text-cyan-600 dark:hover:text-cyan-400"
                        >
                          <FaPlayCircle size={32} color="indigo" />
                          <span className="font-semibold text-xl">Video</span>
                        </div>
                        <hr className="border-indigo-300 dark:border-indigo-700" />
                        <div
                          onClick={() => handleResourceClick(session.id, 'quiz')}
                          className="flex items-center cursor-pointer space-x-5 group hover:text-emerald-600 dark:hover:text-emerald-400"
                        >
                          <FaQuestionCircle size={32} color="green" />
                          <span className="font-semibold text-xl">Quiz</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Session;
