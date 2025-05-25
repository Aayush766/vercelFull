import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaFileAlt, FaPlayCircle, FaQuestionCircle } from 'react-icons/fa';
import Navbar from '../Navbar';
import LoadingSpinner from '../LoadingSpinner';
import Sidebar from './Sidebar';
import apiClient from '../../axiosConfig';
import VideoPlayer from '../../componets/VideoPlayer'; // Import the VideoPlayer component

const MyCourse = () => {
  // State variables
  const [sessions, setSessions] = useState([]);
  const [gradeContent, setGradeContent] = useState({
    ebooks: [],
    videos: [],
    quizzes: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(false); // Consider initializing from localStorage
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSessionId, setExpandedSessionId] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null); // New state for selected video
  const navigate = useNavigate();

  // Effect hook to fetch data
  useEffect(() => {
    const fetchStudentDataAndContent = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. Fetch student's profile to get their grade
        const profileResponse = await apiClient.get('/student/profile');
        const studentGrade = profileResponse.data.user.grade;

        if (!studentGrade) {
          setError("Student grade not found. Cannot fetch course content.");
          setLoading(false);
          return;
        }

        // 2. Fetch all sessions for the student's grade
        const sessionsResponse = await apiClient.get(`/student/sessions?grade=${studentGrade}`);
        const fetchedSessions = sessionsResponse.data.sessions.map((session) => ({
          id: session._id,
          name: session.name,
          sessionNumber: session.sessionNumber,
          topicName: session.topicName,
          progress: session.progress || 0,
        }));
        setSessions(fetchedSessions);

        // 3. Fetch ALL content for the student's grade
        const contentResponse = await apiClient.get('/student/my-content');
        const allContent = contentResponse.data;

        const categorizedContent = {
          ebooks: [],
          videos: [],
          quizzes: []
        };

        allContent.forEach(content => {
          if (content.type === 'ebook') {
            categorizedContent.ebooks.push(content);
          } else if (content.type === 'video') {
            categorizedContent.videos.push(content);
          } else if (content.type === 'quiz') {
            categorizedContent.quizzes.push(content);
          }
        });
        setGradeContent(categorizedContent);

      } catch (err) {
        console.error('Error fetching course data:', err.response ? err.response.data : err.message);
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          setError(err.response?.data?.msg || 'Session expired or unauthorized. Please log in again.');
        } else {
          setError(err.response?.data?.msg || 'Failed to load course content.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStudentDataAndContent();
  }, []);

  // Effect hook for dark mode class on document element
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  // Callback for toggling dark mode
  const toggleDarkMode = useCallback(() => setDarkMode(prevMode => !prevMode), []);

  // Memoized filtered sessions for search functionality
  const filteredSessions = useMemo(() => {
    return sessions.filter(
      (session) =>
        session.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.topicName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sessions, searchTerm]);

  // Callback for toggling session expansion
  const toggleSession = useCallback((id) => {
    setExpandedSessionId(prevId => prevId === id ? null : id);
  }, []);

  // Helper function to get content for a specific session and type
  const getContentForSession = useCallback((sessionId, type) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return [];

    let contentArray;
    if (type === 'ebook') {
      contentArray = gradeContent.ebooks;
    } else if (type === 'video') {
      contentArray = gradeContent.videos;
    } else if (type === 'quiz') {
      contentArray = gradeContent.quizzes;
    } else {
      return [];
    }
    return contentArray.filter(content => content.session === session.sessionNumber);
  }, [gradeContent.ebooks, gradeContent.videos, gradeContent.quizzes, sessions]);

  // Callback to handle session selection from sidebar
  const handleSelectSession = useCallback((sessionId) => {
    setExpandedSessionId(sessionId);
    document.getElementById(`session-detail-${sessionId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  // Callback to handle content selection from sidebar
  const handleSelectContent = useCallback((sessionId, type, contentId) => {
    setExpandedSessionId(sessionId);

    // Give a moment for the session to expand before scrolling/navigating
    setTimeout(() => {
      const contentSection = document.getElementById(`session-detail-${sessionId}`);

      if (type === 'ebook') {
        const sessionEbooks = getContentForSession(sessionId, 'ebook');
        const targetEbook = contentId ? sessionEbooks.find(e => e._id === contentId) : sessionEbooks[0];
        if (targetEbook) {
          navigate(`/document/${targetEbook._id}`, {
            state: {
              fileUrl: targetEbook.fileUrl,
              title: targetEbook.title,
            },
          });
          contentSection?.querySelector('h4:contains("Ebooks")')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          console.warn(`No ebooks found for session ${sessionId} or contentId ${contentId}`);
        }
      } else if (type === 'video') {
        const sessionVideos = getContentForSession(sessionId, 'video');
        const targetVideoEntry = contentId ? sessionVideos.flatMap(v => v.videoList).find(item => item.id === contentId) :
                                            sessionVideos.length > 0 && sessionVideos[0].videoList && sessionVideos[0].videoList.length > 0 ? sessionVideos[0].videoList[0] : null;
        if (targetVideoEntry) {
          setSelectedVideo(targetVideoEntry.id);
          contentSection?.querySelector('h4:contains("Videos")')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          console.warn(`No videos found for session ${sessionId} or contentId ${contentId}`);
        }
      } else if (type === 'quiz') {
        const sessionQuizzes = getContentForSession(sessionId, 'quiz');
        const targetQuiz = contentId ? sessionQuizzes.find(q => q._id === contentId) : sessionQuizzes[0];
        if (targetQuiz && targetQuiz.fileUrl) {
          window.open(targetQuiz.fileUrl, '_blank', 'noopener,noreferrer');
          contentSection?.querySelector('h4:contains("Quizzes")')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          console.warn(`No quizzes found for session ${sessionId} or contentId ${contentId}, navigating to general quiz page.`);
          navigate(`/course/${sessionId}/quiz`);
        }
      }
    }, 100);
  }, [getContentForSession, navigate]);


  // Function to handle video click
  const handleVideoClick = (videoId) => {
    setSelectedVideo(videoId);
  };

  // Function to close the modal
  const handleCloseModal = () => {
    setSelectedVideo(null);
  };

  // Conditional rendering for loading, error, and no content states
  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className={`min-h-screen flex flex-col justify-center items-center transition-all duration-500 ${darkMode ? 'bg-gray-900 text-red-400' : 'bg-gray-100 text-red-600'} p-4 text-center`}>
        <h2 className="text-xl font-bold mb-4">Error Loading Course</h2>
        <p className="mb-6">{error}</p>
        <button
          onClick={() => navigate('/login')}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition"
        >
          Go to Login
        </button>
      </div>
    );
  }

  if (sessions.length === 0 && !loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} flex flex-col items-center justify-center`}>
        <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        <p className="text-2xl font-medium mt-20">No course content available for your grade yet.</p>
        <p className="text-lg text-gray-500 dark:text-gray-400">Please check back later or contact support.</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      <div className="flex max-w-7xl mx-auto px-6 py-10 sm:px-8 lg:px-12 gap-10">
        {/* Sidebar */}
        <div className="w-64 sticky top-24 self-start rounded-lg shadow-xl bg-white dark:bg-gray-900 border border-indigo-300 dark:border-indigo-700">
          <Sidebar
            darkMode={darkMode}
            sessions={sessions}
            onSelectSession={handleSelectSession}
            onSelectContent={handleSelectContent}
            getContentForSession={getContentForSession} // Pass the helper function
          />
        </div>

        {/* Main Content */}
        <div className="flex-grow max-w-4xl">
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

          {/* Course Description */}
          <div
            className={`rounded-3xl shadow-2xl p-10 mb-12 transition-colors duration-500 ${
              darkMode
                ? 'bg-gradient-to-r from-indigo-900 via-purple-900 to-black text-white'
                : 'bg-gradient-to-r from-pink-200 via-purple-300 to-indigo-400 text-gray-900'
            }`}
          >
            <h2 className="text-4xl font-extrabold mb-5 tracking-wide drop-shadow-lg">Course Description</h2>
            <p className="text-xl leading-relaxed max-w-3xl">
              Dive into the world of{' '}
              <span className="font-extrabold text-indigo-300 dark:text-indigo-400">
                STEM, Robotics, AI & ML
              </span>. Explore coding, artificial intelligence, and robotics comprehensively for a holistic learning experience.
            </p>
          </div>

          {/* Announcements and Feedback */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div
              className={`rounded-2xl shadow-lg p-8 ${
                darkMode ? 'bg-indigo-900 text-indigo-200' : 'bg-white text-indigo-900'
              }`}
            >
              <h3 className="text-3xl font-semibold mb-4 border-b border-indigo-400 pb-3">Announcements</h3>
              <p className="italic text-indigo-300 dark:text-indigo-400">No new announcements at this time.</p>
            </div>
            <div
              className={`rounded-2xl shadow-lg p-8 ${
                darkMode ? 'bg-purple-900 text-purple-200' : 'bg-white text-purple-900'
              }`}
            >
              <h3 className="text-3xl font-semibold mb-4 border-b border-purple-400 pb-3">Feedback</h3>
              <p className="italic text-purple-300 dark:text-purple-400">
                We value your feedback! Please share your thoughts.
              </p>
            </div>
          </div>

          {/* Sessions List */}
          <div className="space-y-8">
            {filteredSessions.length === 0 && (
              <p className="text-center text-gray-600 dark:text-gray-400 mt-12 text-xl font-medium">
                No sessions found for your search criteria.
              </p>
            )}

            {filteredSessions.map((session) => {
              const isExpanded = expandedSessionId === session.id;
              const sessionEbooks = getContentForSession(session.id, 'ebook');
              const sessionVideos = getContentForSession(session.id, 'video');
              const sessionQuizzes = getContentForSession(session.id, 'quiz');

              return (
                <div
                  key={session.id}
                  className={`rounded-3xl shadow-xl overflow-hidden ${
                    darkMode
                      ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700'
                      : 'bg-white text-black hover:bg-blue-100'
                  }`}
                >
                  {/* Session Header */}
                  <div
                    className="flex items-center justify-between p-8 cursor-pointer select-none"
                    onClick={() => toggleSession(session.id)}
                    aria-expanded={isExpanded}
                    aria-controls={`session-detail-${session.id}`}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') toggleSession(session.id);
                    }}
                  >
                    <div className="flex flex-col flex-grow max-w-xl">
                      <div className="flex items-center space-x-5">
                        <h3 className="text-2xl font-extrabold tracking-wide">{'Session ' + session.sessionNumber}</h3>
                        <span className={`text-lg font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-900'}`}>
                          {/* {session.topicName} */}
                        </span>
                      </div>
                      {/* Progress Bar */}
                      <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-600 to-gray-800 rounded-full"
                          style={{ width: `${session.progress}%` }}
                        />
                      </div>
                    </div>
                    {/* Expand/Collapse Icon */}
                    <button
                      className={`ml-8 transform transition-transform duration-300 text-indigo-600 dark:text-indigo-400 text-2xl ${
                        isExpanded ? 'rotate-180' : 'rotate-0'
                      }`}
                      aria-label={isExpanded ? 'Collapse session details' : 'Expand session details'}
                      tabIndex={-1}
                    >
                      ▼
                    </button>
                  </div>

                  {/* Session Details */}
                  {isExpanded && (
                    <div
                      id={`session-detail-${session.id}`}
                      className={`px-16 pb-12 pt-6 border-t space-y-8 rounded-b-3xl shadow-inner ${
                        darkMode
                          ? 'bg-gray-600 text-white border-white'
                          : 'bg-white text-gray-800 border-gray-200'
                      }`}
                    >
                      {/* Ebooks Section */}
                      <div>
                        <h4 className="text-2xl font-bold mb-4 flex items-center space-x-3">
                          <FaFileAlt size={28} color='violet' />
                          <span>Ebooks (Presentations/Documents)</span>
                        </h4>
                        {sessionEbooks.length > 0 ? (
                          <ul className="list-disc pl-8 space-y-2">
                            {sessionEbooks.map(ebook => (
                              <li key={ebook._id}>
                                <button
                                  onClick={() =>
                                    navigate(`/document/${ebook._id}`, {
                                      state: {
                                        fileUrl: ebook.fileUrl,
                                        title: ebook.title,
                                      },
                                    })
                                  }
                                  className="text-blue-500 hover:underline dark:text-blue-300 text-lg text-left"
                                >
                                  {ebook.title}
                                </button>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="italic text-gray-600 dark:text-gray-400">No ebooks available for this session.</p>
                        )}
                      </div>

                      <hr className="border-indigo-300 dark:border-indigo-700" />

                      {/* Videos Section */}
                      <div>
                        <h4 className="text-2xl font-bold mb-4 flex items-center space-x-3">
                          <FaPlayCircle size={28} color='indigo' />
                          <span>Videos</span>
                        </h4>
                        {sessionVideos.length > 0 ? (
                          <ul className="list-disc pl-8 space-y-2">
                            {sessionVideos.map(video => (
                              <li key={video._id}>
                                {video.videoList && video.videoList.length > 0 ? (
                                  video.videoList.map((item, index) => (
                                    <button
                                      key={item.id || index}
                                      onClick={() => handleVideoClick(item.id)}
                                      className="text-blue-500 hover:underline dark:text-blue-300 text-lg text-left"
                                    >
                                      {item.title || `Video ${index + 1}`}
                                    </button>
                                  ))
                                ) : (
                                  <p className="italic text-gray-500 dark:text-gray-300">No specific videos listed for this entry.</p>
                                )}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="italic text-gray-600 dark:text-gray-400">No videos available for this session.</p>
                        )}
                      </div>

                      <hr className="border-indigo-300 dark:border-indigo-700" />

                      {/* Quizzes Section */}
                      <div>
                        <h4 className="text-2xl font-bold mb-4 flex items-center space-x-3">
                          <FaQuestionCircle size={28} color='Green' />
                          <span>Quizzes</span>
                        </h4>

                        {sessionQuizzes.length > 0 ? (
                          <ul className="list-disc pl-8 space-y-2">
                            {sessionQuizzes.map(quiz => (
                              <li key={quiz._id}>
                                <a
                                  href={quiz.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-500 hover:underline dark:text-blue-300 text-lg"
                                >
                                  {quiz.title}
                                </a>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="italic text-gray-600 dark:text-gray-400">
                            <button
                            className='text-blue-300 text-xl'
                            onClick={()=>{
                                navigate('/course/:id/quiz')
                            }}>Take a Quiz</button>
                            </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {/* Render the VideoPlayer modal if a video is selected */}
      {selectedVideo && (
        <VideoPlayer
          videoList={gradeContent.videos.flatMap(video => video.videoList.map(item => ({
            id: item.id,
            title: item.title,
            thumbnail: item.thumbnail
          })))}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default MyCourse;