import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FaFileAlt, FaPlayCircle, FaQuestionCircle } from 'react-icons/fa';
import Navbar from '../Navbar';
import Sidebar from './Sidebar'; // Assuming Sidebar now lists sessions from MyCourse or all sessions
import LoadingSpinner from '../LoadingSpinner';
import axios from 'axios';
import queryString from 'query-string';
import ResourceViewer from './ResourceViewer'; // Import the unified viewer

const SessionDetails = () => {
    const { id: sessionId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [darkMode, setDarkMode] = useState(false);
    const [resources, setResources] = useState([]); // This will hold the content for the specific session
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);
    const [studentGrade, setStudentGrade] = useState(null);
    const [sessionDetails, setSessionDetails] = useState(null); // To store session name, topic, etc.

    // Store current resource for unified viewing (as before)
    const [currentResource, setCurrentResource] = useState(null);
    const [currentResourceType, setCurrentResourceType] = useState(null);

    const toggleDarkMode = () => setDarkMode(!darkMode);

    const fetchStudentProfile = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/student-login');
                return null;
            }
            const config = {
                headers: { Authorization: `Bearer ${token}` },
            };
            const res = await axios.get('/api/student/profile', config);
            if (res.data?.user?.grade !== undefined) {
                return res.data.user.grade;
            }
            return null;
        } catch (err) {
            if (err.response?.status === 401) navigate('/student-login');
            return null;
        }
    }, [navigate]);

    useEffect(() => {
        const loadSessionContent = async () => {
            setLoading(true);
            setFetchError(null);

            let currentGrade = studentGrade;

            // Prioritize grade from URL, then state, then fetch profile
            const parsed = queryString.parse(location.search);
            const gradeFromUrl = parseInt(parsed.grade);
            if (!isNaN(gradeFromUrl)) {
                currentGrade = gradeFromUrl;
            }

            if (currentGrade === null) {
                const profileGrade = await fetchStudentProfile();
                if (profileGrade !== null) {
                    currentGrade = profileGrade;
                } else {
                    setFetchError('Student grade could not be determined. Please log in again.');
                    setLoading(false);
                    return;
                }
            }

            setStudentGrade(currentGrade); // Update state with the determined grade

            if (sessionId && currentGrade !== null) {
                try {
                    const token = localStorage.getItem('token');
                    if (!token) {
                        navigate('/student-login');
                        return;
                    }
                    const config = { headers: { Authorization: `Bearer ${token}` } };

                    // Fetch the specific session details (if your backend supports it)
                    // This is an assumption that your backend can return single session details
                    // You might need a new API endpoint like `/api/student/session/:id?grade=X`
                    const sessionRes = await axios.get(`/api/student/session/${sessionId}?grade=${currentGrade}`, config);
                    setSessionDetails(sessionRes.data); // Assuming sessionRes.data contains name, topicName, etc.

                    // Fetch content for the session
                    const contentRes = await axios.get(`/api/student/content?session=${sessionId}&grade=${currentGrade}`, config);

                    if (Array.isArray(contentRes.data)) {
                        setResources(contentRes.data);
                    } else {
                        setResources([]);
                    }
                } catch (error) {
                    console.error("Error loading session content:", error);
                    setFetchError('Failed to load session content. Please try again later.');
                    setResources([]);
                    setSessionDetails(null);
                }
            } else {
                setFetchError('Missing session ID or student grade to load content.');
            }
            setLoading(false);
        };

        loadSessionContent();
    }, [sessionId, location.search, navigate, fetchStudentProfile, studentGrade]); // studentGrade added to dependency array

    const handleResourceClick = (res) => {
        // Determine the type and resource object to pass to ResourceViewer
        if (res.type === 'ebook' && res.fileUrl) {
            setCurrentResource({ url: res.fileUrl, name: res.title });
            setCurrentResourceType('pdf'); // Assuming all 'ebook' types are PDFs for the viewer
        } else if (res.type === 'ppt' && res.fileUrl) {
            setCurrentResource({ url: res.fileUrl, name: res.title });
            setCurrentResourceType('ppt'); // For PPT viewer
        } else if (res.type === 'video' && Array.isArray(res.videoList) && res.videoList.length > 0) {
            // For videoList, let's assume we want to show the first video for simplicity
            setCurrentResource({ url: res.videoList[0].url, name: res.title });
            setCurrentResourceType('video');
        } else if (res.type === 'quiz') {
            // For quizzes, navigate to the quiz start page for this session
            navigate(`/course/${sessionId}/quiz`);
        } else {
            alert(`Resource type "${res.type}" not supported or content not available.`);
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (fetchError) {
        return (
            <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
                <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
                <div className="flex max-w-7xl mx-auto px-6 py-10 sm:px-8 lg:px-12">
                    <div className="flex-grow max-w-4xl mx-auto">
                        <div className="text-center text-red-500 mt-10 text-xl font-medium p-8 rounded-lg shadow-xl bg-white dark:bg-gray-800">
                            {fetchError}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Default session name if details aren't loaded or available
    const sessionName = sessionDetails?.name || `Session ${sessionId}`;
    const sessionTopic = sessionDetails?.topicName || 'Details not available';
    const sessionDescription = sessionDetails?.description || 'Explore the content and activities for this session.'; // Assuming description field

    return (
        <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
            <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
            <div className="flex max-w-7xl mx-auto px-6 py-10 sm:px-8 lg:px-12 gap-10">
                {/* Sidebar (as in MyCourse) - it should list all sessions generally */}
                <div className="w-64 sticky top-24 self-start rounded-lg shadow-xl bg-white dark:bg-gray-900 border border-indigo-300 dark:border-indigo-700">
                    {/* Sidebar will likely need to fetch sessions to display, or be passed them from a parent context */}
                    <Sidebar darkMode={darkMode} /* sessions={allSessionsForSidebar} */ />
                </div>

                <div className="flex-grow max-w-4xl">
                    {/* Course Description - adapted for Session Details */}
                    <div className={`rounded-3xl shadow-2xl p-10 mb-12 transition-colors duration-500 ${
                        darkMode
                            ? 'bg-gradient-to-r from-indigo-900 via-purple-900 to-black text-white'
                            : 'bg-gradient-to-r from-pink-200 via-purple-300 to-indigo-400 text-gray-900'
                    }`}>
                        <h2 className="text-4xl font-extrabold mb-5 tracking-wide drop-shadow-lg">
                            {sessionName}: <span className="font-semibold text-indigo-200 dark:text-indigo-400">{sessionTopic}</span>
                        </h2>
                        <p className="text-xl leading-relaxed max-w-3xl">
                            {sessionDescription}
                        </p>
                    </div>

                    {/* Announcements and Feedback sections (optional, but for consistency) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                        <div className={`rounded-2xl shadow-lg p-8 ${darkMode ? 'bg-indigo-900 text-indigo-200' : 'bg-white text-indigo-900'}`}>
                            <h3 className="text-3xl font-semibold mb-4 border-b border-indigo-400 pb-3">Session Notes</h3>
                            <p className="italic text-indigo-300 dark:text-indigo-400">
                                {/* Replace with actual session notes from backend if available */}
                                Key takeaways and important points for this session.
                            </p>
                        </div>
                        <div className={`rounded-2xl shadow-lg p-8 ${darkMode ? 'bg-purple-900 text-purple-200' : 'bg-white text-purple-900'}`}>
                            <h3 className="text-3xl font-semibold mb-4 border-b border-purple-400 pb-3">Activity & Practice</h3>
                            <p className="italic text-purple-300 dark:text-purple-400">
                                {/* Replace with actual activity details */}
                                Get hands-on with the practical exercises for this session.
                            </p>
                        </div>
                    </div>

                    {/* Content Section (replaces the session list from MyCourse) */}
                    <div className="space-y-8">
                        <h3 className="text-3xl font-semibold mb-4 text-center">Session Content</h3>
                        {Array.isArray(resources) && resources.length === 0 ? (
                            <div className="text-center text-gray-600 dark:text-gray-400 mt-12 text-xl font-medium p-8 rounded-lg shadow-xl bg-white dark:bg-gray-800">
                                No learning materials available for this session yet. Please check back soon!
                            </div>
                        ) : (
                            resources.map((res) => (
                                <div
                                    key={res._id || res.id} // Use _id from MongoDB or fallback to id
                                    className={`flex items-center justify-between p-8 cursor-pointer select-none rounded-3xl shadow-xl overflow-hidden ${
                                        darkMode ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' : 'bg-white text-black hover:bg-blue-100'
                                    }`}
                                    onClick={() => handleResourceClick(res)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') handleResourceClick(res);
                                    }}
                                >
                                    <div className="flex items-center space-x-5 flex-grow">
                                        {res.type === 'ebook' || res.type === 'ppt' ? (
                                            <FaFileAlt className="text-3xl text-indigo-600 dark:text-indigo-400" />
                                        ) : res.type === 'video' ? (
                                            <FaPlayCircle className="text-3xl text-teal-500 dark:text-teal-300" />
                                        ) : res.type === 'quiz' ? (
                                            <FaQuestionCircle className="text-3xl text-purple-600 dark:text-purple-400" />
                                        ) : null}
                                        <h4 className="text-2xl font-extrabold tracking-wide">
                                            {res.title || 'Untitled Resource'}
                                        </h4>
                                    </div>
                                    <span className="text-xl font-semibold text-gray-500 dark:text-gray-400">
                                        {res.type?.toUpperCase()}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Render ResourceViewer if resource selected */}
            {currentResource && (
                <ResourceViewer
                    type={currentResourceType}
                    resource={currentResource}
                    onClose={() => setCurrentResource(null)} // Add an onClose prop to close the viewer
                />
            )}
        </div>
    );
};

export default SessionDetails;