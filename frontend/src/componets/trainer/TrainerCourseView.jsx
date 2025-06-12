import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaFileAlt, FaPlayCircle, FaQuestionCircle } from 'react-icons/fa';

// Assuming these are in a 'components' directory one level up from 'sections'
import Navbar from './Navbar'; // Adjust path if needed, e.g., '../../components/Navbar'
import LoadingSpinner from '../LoadingSpinner'; // Adjust path if needed
import Sidebar from '../../componets/Sidebar'; // Assuming Sidebar is a direct child of components
import VideoPlayer from '../../componets/VideoPlayer'; // Assuming VideoPlayer is a direct child of components

// Adjust path based on where your axiosConfig.js is located relative to TrainerCourseView.jsx
import apiClient from '../../axiosConfig';

const TrainerCourseView = () => {
    // Get the grade from the URL parameters (e.g., /trainer/grade/5 -> grade = '5')
    const { grade } = useParams();
    const navigate = useNavigate();

    // State variables
    const [sessions, setSessions] = useState([]);
    const [gradeContent, setGradeContent] = useState({
        ebooks: [],
        videos: [],
        quizzes: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [darkMode, setDarkMode] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedSessionId, setExpandedSessionId] = useState(null);
    const [selectedVideo, setSelectedVideo] = useState(null); // State to hold the video URL/details for playback

    // Effect hook to fetch data for the specific grade
    useEffect(() => {
        const fetchTrainerGradeContent = async () => {
            setLoading(true);
            setError(null);
            try {
                // 1. Fetch all sessions for the specific grade (from URL param)
                const sessionsResponse = await apiClient.get(`/trainer/sessions?grade=${grade}`);
                const fetchedSessions = sessionsResponse.data.sessions.map((session) => ({
                    id: session._id,
                    name: session.name,
                    sessionNumber: session.sessionNumber,
                    topicName: session.topicName,
                    progress: session.progress || 0, // Trainers might not have progress, default to 0 or remove if irrelevant
                }));
                setSessions(fetchedSessions);

                // 2. Fetch ALL content for the specific grade (from URL param)
                const contentResponse = await apiClient.get(`/trainer/content?grade=${grade}`);
                // Assuming contentResponse.data is an array of content items, or { content: [...] }
                const allContent = contentResponse.data.content || contentResponse.data;

                const categorizedContent = {
                    ebooks: [],
                    videos: [],
                    quizzes: []
                };

                // Categorize content based on type
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
                console.error(`Error fetching trainer course data for grade ${grade}:`, err.response ? err.response.data : err.message);
                if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                    setError(err.response?.data?.msg || 'Session expired or unauthorized. Please log in again.');
                    navigate('/trainer-login'); // Redirect to trainer login page
                } else {
                    setError(err.response?.data?.msg || `Failed to load content for Grade ${grade}.`);
                }
            } finally {
                setLoading(false);
            }
        };

        // Only fetch data if a grade is provided in the URL
        if (grade) {
            fetchTrainerGradeContent();
        } else {
            setLoading(false);
            setError("No grade specified in the URL. Please navigate from the dashboard.");
        }
    }, [grade, navigate]); // Re-run effect when 'grade' or 'navigate' changes

    // Effect hook for applying dark mode class to the document element
    useEffect(() => {
        document.documentElement.classList.toggle('dark', darkMode);
    }, [darkMode]);

    // Callback for toggling dark mode state
    const toggleDarkMode = useCallback(() => setDarkMode(prevMode => !prevMode), []);

    // Memoized filtered sessions for efficient search functionality
    const filteredSessions = useMemo(() => {
        // Defensive coding: Ensure session properties are strings before calling toLowerCase()
        return sessions.filter(
            (session) => {
                const sessionName = session.name ?? ''; // Use nullish coalescing for safety
                const topicName = session.topicName ?? ''; // Use nullish coalescing for safety

                return (
                    sessionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    topicName.toLowerCase().includes(searchTerm.toLowerCase())
                );
            }
        );
    }, [sessions, searchTerm]);

    // Callback for toggling session expansion
    const toggleSession = useCallback((id) => {
        setExpandedSessionId(prevId => prevId === id ? null : id);
    }, []);

    // Helper function to get content for a specific session and type
    const getContentForSession = useCallback((sessionId, type) => {
        const session = sessions.find(s => s.id === sessionId);
        if (!session) return []; // If session not found, return empty array

        let contentArray;
        if (type === 'ebook') {
            contentArray = gradeContent.ebooks;
        } else if (type === 'video') {
            contentArray = gradeContent.videos;
        } else if (type === 'quiz') {
            contentArray = gradeContent.quizzes;
        } else {
            return []; // Invalid type
        }

        // Filter content based on sessionNumber.
        // Ensure content.session matches the session.sessionNumber.
        return contentArray.filter(content => content.session === session.sessionNumber);
    }, [gradeContent.ebooks, gradeContent.videos, gradeContent.quizzes, sessions]);

    // Callback to handle session selection from sidebar (expands and scrolls)
    const handleSelectSession = useCallback((sessionId) => {
        setExpandedSessionId(sessionId);
        // Small timeout to allow the DOM to update after state change before scrolling
        setTimeout(() => {
            document.getElementById(`session-detail-${sessionId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 0);
    }, []);

    // Callback to handle content selection from sidebar (navigates or plays video)
    const handleSelectContent = useCallback((sessionId, type, contentId) => {
        setExpandedSessionId(sessionId); // Ensure the session is expanded first

        // Small delay to allow session to expand before attempting to scroll or navigate
        setTimeout(() => {
            const contentSection = document.getElementById(`session-detail-${sessionId}`);

            if (type === 'ebook') {
                const sessionEbooks = getContentForSession(sessionId, 'ebook');
                // Find the specific ebook or default to the first one if contentId is not provided
                const targetEbook = contentId ? sessionEbooks.find(e => e._id === contentId) : sessionEbooks[0];
                if (targetEbook) {
                    // Navigate to the trainer-specific document viewer
                    navigate(`/trainer/document/${targetEbook._id}`, {
                        state: {
                            fileUrl: targetEbook.fileUrl,
                            title: targetEbook.title,
                        },
                    });
                    // Scroll to the ebooks section within the expanded session view
                    contentSection?.querySelector('h4 > span:contains("Ebooks")')?.parentElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else {
                    console.warn(`No ebooks found for session ${sessionId} or contentId ${contentId}`);
                }
            } else if (type === 'video') {
                const sessionVideos = getContentForSession(sessionId, 'video');
                // Flatten all video items (from direct uploads or videoLists) for easy searching
                const allVideoItems = sessionVideos.flatMap(v => {
                    // If it's a direct upload, treat it as a single video item
                    if (v.fileUrl) {
                        return [{ id: v._id, title: v.title, videoUrl: v.fileUrl, thumbnail: v.thumbnail || null }];
                    }
                    // Otherwise, return its videoList (e.g., YouTube links)
                    return v.videoList || [];
                });

                // Find the target video using its ID
                const targetVideo = contentId ? allVideoItems.find(item => item.id === contentId) :
                                                (allVideoItems.length > 0 ? allVideoItems[0] : null);

                if (targetVideo) {
                    setSelectedVideo(targetVideo); // Set the video for the modal
                    contentSection?.querySelector('h4 > span:contains("Videos")')?.parentElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else {
                    console.warn(`No videos found for session ${sessionId} or contentId ${contentId}`);
                }
            } else if (type === 'quiz') {
                const sessionQuizzes = getContentForSession(sessionId, 'quiz');
                const targetQuiz = contentId ? sessionQuizzes.find(q => q._id === contentId) : sessionQuizzes[0];
                if (targetQuiz && targetQuiz.fileUrl) {
                    // If the quiz has a direct file URL (e.g., PDF quiz), open it in a new tab
                    window.open(targetQuiz.fileUrl, '_blank', 'noopener,noreferrer');
                    contentSection?.querySelector('h4 > span:contains("Quizzes")')?.parentElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else {
                    console.warn(`No direct quiz file found for session ${sessionId} or contentId ${contentId}, navigating to general trainer quiz page.`);
                    // Navigate to a generic trainer quiz page for this session
                    navigate(`/trainer/course/${sessionId}/quiz`);
                }
            }
        }, 100); // A small delay to ensure the session expands visually before attempting to scroll/navigate
    }, [getContentForSession, navigate]);


    // Callback to close the video playback modal
    const handleCloseVideoModal = useCallback(() => {
        setSelectedVideo(null);
    }, []);

    // Conditional rendering for loading, error, and no content states
    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return (
            <div className={`min-h-screen flex flex-col justify-center items-center transition-all duration-500 ${darkMode ? 'bg-gray-900 text-red-400' : 'bg-gray-100 text-red-600'} p-4 text-center`}>
                <h2 className="text-xl font-bold mb-4">Error Loading Course Content</h2>
                <p className="mb-6">{error}</p>
                <button
                    onClick={() => navigate('/trainer-login')}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition"
                >
                    Go to Trainer Login
                </button>
            </div>
        );
    }

    if (sessions.length === 0 && !loading) {
        return (
            <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} flex flex-col items-center justify-center`}>
                <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
                <p className="text-2xl font-medium mt-20">No course content available for Grade {grade} yet.</p>
                <p className="text-lg text-gray-500 dark:text-gray-400">Please ensure content has been uploaded for this grade.</p>
                <button
                    onClick={() => navigate('/trainer/dashboard')}
                    className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition"
                >
                    Back to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
            <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

            <div className="flex max-w-7xl mx-auto px-6 py-10 sm:px-8 lg:px-12 gap-10">
                {/* Sidebar - Displays sessions for the current grade */}
                <div className="w-64 sticky top-24 self-start rounded-lg shadow-xl bg-white dark:bg-gray-900 border border-indigo-300 dark:border-indigo-700">
                    <Sidebar
                        darkMode={darkMode}
                        sessions={sessions}
                        onSelectSession={handleSelectSession}
                        onSelectContent={handleSelectContent}
                        getContentForSession={getContentForSession} // Pass the helper function
                    />
                </div>

                {/* Main Content Area */}
                <div className="flex-grow max-w-4xl">
                    {/* Search Input for Sessions */}
                    <div className="mb-8 relative max-w-md mx-auto">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder={`Search sessions or topics for Grade ${grade}...`}
                            className={`pl-5 pr-5 py-3 rounded-2xl shadow-lg w-full text-lg font-medium focus:outline-none focus:ring-4 transition-colors duration-300 ${
                                darkMode
                                    ? 'bg-gray-800 text-white placeholder-gray-400 focus:ring-indigo-600'
                                    : 'bg-white text-gray-900 placeholder-gray-600 focus:ring-indigo-400'
                            }`}
                        />
                    </div>

                    {/* Course Description/Grade Overview */}
                    <div
                        className={`rounded-3xl shadow-2xl p-10 mb-12 transition-colors duration-500 ${
                            darkMode
                                ? 'bg-gradient-to-r from-indigo-900 via-purple-900 to-black text-white'
                                : 'bg-gradient-to-r from-pink-200 via-purple-300 to-indigo-400 text-gray-900'
                        }`}
                    >
                        <h2 className="text-4xl font-extrabold mb-5 tracking-wide drop-shadow-lg">Content for Grade {grade}</h2>
                        <p className="text-xl leading-relaxed max-w-3xl">
                            Here you can manage and view the educational content for{' '}
                            <span className="font-extrabold text-indigo-300 dark:text-indigo-400">
                                Grade {grade} in STEM, Robotics, AI & ML
                            </span>. This comprehensive view allows trainers to review and access all materials.
                        </p>
                    </div>

                    {/* Announcements and Feedback Sections (Can be adapted for trainer perspective) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                        <div
                            className={`rounded-2xl shadow-lg p-8 ${
                                darkMode ? 'bg-indigo-900 text-indigo-200' : 'bg-white text-indigo-900'
                            }`}
                        >
                            <h3 className="text-3xl font-semibold mb-4 border-b border-indigo-400 pb-3">Grade Announcements</h3>
                            <p className="italic text-indigo-300 dark:text-indigo-400">No new announcements specific to Grade {grade} at this time.</p>
                        </div>
                        <div
                            className={`rounded-2xl shadow-lg p-8 ${
                                darkMode ? 'bg-purple-900 text-purple-200' : 'bg-white text-purple-900'
                            }`}
                        >
                            <h3 className="text-3xl font-semibold mb-4 border-b border-purple-400 pb-3">Feedback for Grade {grade}</h3>
                            <p className="italic text-purple-300 dark:text-purple-400">
                                This section can display aggregated feedback or common questions related to Grade {grade} content.
                            </p>
                        </div>
                    </div>

                    {/* Sessions List - Main Content Display */}
                    <div className="space-y-8">
                        {filteredSessions.length === 0 && (
                            <p className="text-center text-gray-600 dark:text-gray-400 mt-12 text-xl font-medium">
                                No sessions found for your search criteria in Grade {grade}.
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
                                    {/* Session Header (Clickable to expand/collapse) */}
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
                                                    {session.topicName}
                                                </span>
                                            </div>
                                            {/* Progress Bar (Optional for trainers, remove if not relevant) */}
                                            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden mt-2">
                                                <div
                                                    className="h-full bg-gradient-to-r from-blue-600 to-gray-800 rounded-full"
                                                    style={{ width: `${session.progress}%` }} // Consider if trainer view needs progress
                                                />
                                            </div>
                                        </div>
                                        {/* Expand/Collapse Icon */}
                                        <button
                                            className={`ml-8 transform transition-transform duration-300 text-indigo-600 dark:text-indigo-400 text-2xl ${
                                                isExpanded ? 'rotate-180' : 'rotate-0'
                                            }`}
                                            aria-label={isExpanded ? 'Collapse session details' : 'Expand session details'}
                                            tabIndex={-1} // Not directly tabbable, controlled by parent div
                                        >
                                            ▼
                                        </button>
                                    </div>

                                    {/* Session Details - Collapsible Content */}
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
                                                                        navigate(`/trainer/document/${ebook._id}`, { // Navigates to trainer document viewer
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
                                                        {/* Iterate over each video content item fetched */}
                                                        {sessionVideos.map(videoContentItem => (
                                                            <li key={videoContentItem._id}>
                                                                {/* Check if it's a direct file upload */}
                                                                {videoContentItem.fileUrl ? (
                                                                    <button
                                                                        onClick={() => setSelectedVideo({
                                                                            id: videoContentItem._id, // Use _id for direct upload content
                                                                            title: videoContentItem.title,
                                                                            videoUrl: videoContentItem.fileUrl,
                                                                            thumbnail: videoContentItem.thumbnail || null
                                                                        })}
                                                                        className="text-blue-500 hover:underline dark:text-blue-300 text-lg text-left"
                                                                    >
                                                                        {videoContentItem.title} (Direct Upload)
                                                                    </button>
                                                                ) : videoContentItem.videoList && videoContentItem.videoList.length > 0 ? (
                                                                    // If it has a videoList (e.g., for YouTube videos)
                                                                    videoContentItem.videoList.map((item, index) => (
                                                                        <button
                                                                            key={item.id || `external-video-${videoContentItem._id}-${index}`}
                                                                            onClick={() => setSelectedVideo({
                                                                                id: item.id, // Use 'id' for items within videoList
                                                                                title: item.title,
                                                                                videoUrl: item.videoUrl,
                                                                                thumbnail: item.thumbnail || null
                                                                            })}
                                                                            className="text-blue-500 hover:underline dark:text-blue-300 text-lg text-left block"
                                                                        >
                                                                            {item.title || `External Video ${index + 1}`}
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
                                                                {/* If quiz has a fileUrl, open it in a new tab */}
                                                                {quiz.fileUrl ? (
                                                                    <a
                                                                        href={quiz.fileUrl}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-blue-500 hover:underline dark:text-blue-300 text-lg"
                                                                    >
                                                                        {quiz.title}
                                                                    </a>
                                                                ) : (
                                                                    // Otherwise, navigate to a trainer-specific quiz attempt/view page
                                                                    <button
                                                                        onClick={() => navigate(`/quiz-preview/:{sessionId}`)}
                                                                        className="text-blue-500 hover:underline dark:text-blue-300 text-lg text-left"
                                                                    >
                                                                        {quiz.title} (Click to View/Manage Quiz)
                                                                    </button>
                                                                )}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <p className="italic text-gray-600 dark:text-gray-400">
                                                        No quizzes available for this session.
                                                        {/* Option to navigate to a general quiz creation/management page */}
                                                        <button
                                                            className='text-blue-300 text-xl ml-2'
                                                            onClick={() => {
                                                                // This would typically lead to a page where trainers can create/manage quizzes for the session
                                                                navigate(`/quiz-preview/:{sessionId}`);
                                                            }}>
                                                            Manage Quizzes
                                                        </button>
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

            {/* VideoPlayer Modal - Rendered conditionally when a video is selected */}
            {selectedVideo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
                    <div className="relative w-full max-w-4xl max-h-full bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden">
                        <button
                            onClick={handleCloseVideoModal}
                            className="absolute top-3 right-3 text-white text-3xl z-50 hover:text-gray-300 transition-colors"
                            aria-label="Close video player"
                        >
                            ×
                        </button>
                        <div className="p-4">
                            <h3 className="text-2xl font-semibold mb-3 text-gray-800 dark:text-white">
                                {selectedVideo.title}
                            </h3>
                            <VideoPlayer
                                videoUrl={selectedVideo.videoUrl}
                                thumbnail={selectedVideo.thumbnail}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrainerCourseView;