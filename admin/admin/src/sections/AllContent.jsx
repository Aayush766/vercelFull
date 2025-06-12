// src/sections/AllContent.jsx
import React, { useEffect, useState } from 'react';
import apiClient from '../axiosConfig'; // Import the configured apiClient
import { confirmAlert } from 'react-confirm-alert'; // Import for confirmation dialog
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import confirm alert CSS

function AllContent() {
    const [contentList, setContentList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    // NEW: Filter states
    const [contentTypeFilter, setContentTypeFilter] = useState('all'); // 'all', 'ebook', 'presentation_multiple', 'video', 'quiz'
    const [gradeFilter, setGradeFilter] = useState('all'); // 'all', '1', '2', ..., '12'

    const fetchAllContent = async () => {
        setError('');
        setMessage(''); // Clear previous messages
        setLoading(true);
        try {
            // Fetch materials (ebooks, presentations, videos)
            const materialsResponse = await apiClient.get('/admin/content');
            const materials = materialsResponse.data.map(content => ({
                ...content,
                type: content.type || 'unknown' // Ensure type is always present for filtering
            }));

            // Fetch quizzes from their dedicated endpoint
            const quizzesResponse = await apiClient.get('/admin/quizzes');
            const quizzes = quizzesResponse.data.map(quiz => ({
                ...quiz,
                type: 'quiz', // Explicitly set type to 'quiz'
                fileUrl: null, // Quizzes are not file-based, so no fileUrl
                // Ensure description is included for display
                description: quiz.description,
            }));

            // Combine both lists and sort them by creation date (newest first)
            const combinedContent = [...materials, ...quizzes].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setContentList(combinedContent);

        } catch (err) {
            console.error('Error fetching all content:', err.response ? err.response.data : err.message);
            setError(err.response?.data?.msg || 'Failed to fetch content.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllContent();
    }, []); // Empty dependency array to run once on mount

    const handleDelete = async (id, type) => { // Modified: Now accepts 'type'
        confirmAlert({
            title: 'Confirm Delete',
            message: 'Are you sure you want to delete this content?',
            buttons: [
                {
                    label: 'Yes',
                    onClick: async () => {
                        setLoading(true); // Start loading
                        setError(''); // Clear any previous errors
                        setMessage(''); // Clear any previous messages
                        try {
                            // Determine the correct deletion endpoint based on content type
                            const deleteEndpoint = type === 'quiz' ? `/admin/quizzes/${id}` : `/admin/content/${id}`;
                            await apiClient.delete(deleteEndpoint);

                            // Update the content list by filtering out the deleted item
                            setContentList(currentContent => currentContent.filter(content => content._id !== id));
                            setMessage('Content deleted successfully!'); // Add a success message
                        } catch (err) {
                            console.error('Error deleting content:', err.response ? err.response.data : err.message);
                            setError(err.response?.data?.msg || 'Failed to delete content.');
                        } finally {
                            setLoading(false); // Stop loading
                        }
                    }
                },
                {
                    label: 'No',
                }
            ]
        });
    };

    // NEW: Client-side filtering logic
    const filteredContent = contentList.filter(content => {
        const matchesContentType = contentTypeFilter === 'all' || content.type === contentTypeFilter;
        const matchesGrade = gradeFilter === 'all' || String(content.grade) === gradeFilter; // Convert grade to string for comparison

        return matchesContentType && matchesGrade;
    });

    if (loading) return <div className="text-center text-gray-600 p-4">Loading content...</div>;
    if (error) return <div className="text-center text-red-500 p-4">Error: {error}</div>;

    return (
        <div className="bg-white p-6 rounded shadow-md max-w-4xl mx-auto my-8">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">All Uploaded Content</h2>

            {message && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <span className="block sm:inline">{message}</span>
                </div>
            )}

            {/* NEW: Filter Section */}
            <div className="mb-6 flex flex-wrap gap-4 items-center justify-center">
                <div>
                    <label htmlFor="contentTypeFilter" className="block text-sm font-medium text-gray-700 mb-1">Filter by Type</label>
                    <select
                        id="contentTypeFilter"
                        className="block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={contentTypeFilter}
                        onChange={(e) => setContentTypeFilter(e.target.value)}
                    >
                        <option value="all">All Types</option>
                        <option value="ebook">Ebook</option>
                        <option value="presentation_multiple">Presentation</option>
                        <option value="video">Video</option>
                        <option value="quiz">Quiz</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="gradeFilter" className="block text-sm font-medium text-gray-700 mb-1">Filter by Grade</label>
                    <select
                        id="gradeFilter"
                        className="block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={gradeFilter}
                        onChange={(e) => setGradeFilter(e.target.value)}
                    >
                        <option value="all">All Grades</option>
                        {[...Array(12)].map((_, i) => (
                            <option key={i + 1} value={String(i + 1)}>
                                Grade {i + 1}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Display message if no content matches filters */}
            {filteredContent.length === 0 ? (
                <div className="text-center text-gray-500 p-4">No content found matching your filters.</div>
            ) : (
                <ul className="space-y-6">
                    {filteredContent.map(content => (
                        <li key={content._id} className="border border-gray-200 rounded-lg p-6 bg-gray-50 hover:bg-gray-100 transition-colors duration-200 relative shadow-sm">
                            <h3 className="text-xl font-semibold text-blue-700 mb-2">{content.title}</h3>
                            <p className="text-gray-700 text-sm mb-1">
                                <strong>Type:</strong> <span className="font-medium capitalize">{content.type || 'Unknown'}</span>
                            </p>
                            <p className="text-gray-700 text-sm mb-3"><strong>Grade:</strong> {content.grade}, <strong>Session:</strong> {content.session}</p>

                            {/* Conditional rendering based on content type */}
                            {(content.type === 'ebook' || content.type === 'presentation_multiple') && content.fileUrl && (
                                <a
                                    href={content.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:underline inline-block text-base"
                                >
                                    View Document
                                </a>
                            )}

                            {content.type === 'video' && content.fileUrl && (
                                <a
                                    href={content.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:underline inline-block text-base"
                                >
                                    View Direct Video
                                </a>
                            )}

                            {content.type === 'video' && content.videoList && content.videoList.length > 0 && (
                                <div className="mt-3">
                                    <p className="font-semibold text-gray-800 text-sm mb-1">Associated Videos:</p>
                                    <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                                        {content.videoList.map((video, index) => (
                                            <li key={video.id || `video-${index}`}>
                                                <a
                                                    href={video.embedUrl || video.videoUrl || `https://www.youtube.com/watch?v=${video.id}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-500 hover:underline"
                                                >
                                                    {video.title || `Video ${index + 1}`}
                                                </a>
                                                {video.thumbnail && (
                                                    <img
                                                        src={video.thumbnail}
                                                        alt={video.title || 'Video thumbnail'}
                                                        className="inline-block ml-2 w-12 h-auto object-cover rounded"
                                                    />
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Display Quiz Content details */}
                            {content.type === 'quiz' && (
                                <div className="mt-3">
                                    <p className="text-gray-600 text-sm italic mb-1">
                                        Description: {content.description || 'No description provided.'}
                                    </p>
                                    <p className="text-gray-600 text-sm italic mb-1">
                                        Questions: {content.questions ? content.questions.length : 0}
                                    </p>
                                    {/* Link to view/edit quiz details (optional, requires a new route and component) */}
                                    {/* <Link to={`/admin/quiz-details/${content._id}`} className="text-green-500 hover:underline text-sm">
                                        View/Edit Quiz Details
                                    </Link> */}
                                </div>
                            )}

                            {/* Handle unknown content types if they appear */}
                            {content.type === 'unknown' && (
                                    <p className="text-red-500 italic text-sm mt-2">
                                        (Unknown content type - please check backend data)
                                    </p>
                            )}

                            <p className="text-gray-700 text-xs mt-3">Uploaded by: {content.uploadedBy ? content.uploadedBy.name : 'Unknown'}</p>
                            <p className="text-gray-700 text-xs">Uploaded on: {new Date(content.createdAt).toLocaleDateString()}</p>

                            {/* Delete Button */}
                            <button
                                onClick={() => handleDelete(content._id, content.type)}
                                className="absolute top-3 right-3 bg-red-500 hover:bg-red-700 text-white px-3 py-1 rounded text-xs transition-colors duration-300"
                            >
                                Delete
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default AllContent;