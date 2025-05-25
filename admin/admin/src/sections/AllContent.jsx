// src/sections/AllContent.jsx
import React, { useEffect, useState } from 'react';
import apiClient from '../axiosConfig'; // Import the configured apiClient
import { confirmAlert } from 'react-confirm-alert'; // Import for confirmation dialog
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import confirm alert CSS

function AllContent() {
    const [contentList, setContentList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchAllContent = async () => {
        setError('');
        setLoading(true);
        try {
            const response = await apiClient.get('/admin/content');
            setContentList(response.data);
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

    const handleDelete = async (id) => {
        confirmAlert({
            title: 'Confirm Delete',
            message: 'Are you sure you want to delete this content?',
            buttons: [
                {
                    label: 'Yes',
                    onClick: async () => {
                        setLoading(true); // Start loading
                        setError(''); // Clear any previous errors
                        try {
                            await apiClient.delete(`/admin/delete-content/${id}`);
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

    if (loading) return <div className="text-center text-gray-600">Loading content...</div>;
    if (error) return <div className="text-center text-red-500">Error: {error}</div>;
    if (contentList.length === 0) return <div className="text-center text-gray-500">No content uploaded yet.</div>;

    return (
        <div className="bg-white p-6 rounded shadow-md max-w-2xl mx-auto">
            <h2 className="text-xl font-bold mb-4 text-center">All Uploaded Content</h2>
            {message && <p className="text-green-500 text-center mb-3">{message}</p>} {/* Display success message */}
            <ul className="space-y-4">
                {contentList.map(content => (
                    <li key={content._id} className="border border-gray-200 rounded-lg p-4 bg-gray-50 relative"> {/* Added relative positioning */}
                        <h3 className="text-lg font-semibold text-blue-700">{content.title}</h3>
                        <p className="text-gray-700">Type: {content.type}</p>
                        <p className="text-gray-700">Grade: {content.grade}, Session: {content.session}</p>
                        {content.fileUrl && (
                            <a
                                href={content.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline mt-2 inline-block"
                            >
                                View File
                            </a>
                        )}
                        {content.videoList && content.videoList.length > 0 && (
                            <div className="mt-2">
                                <p className="font-semibold">Videos:</p>
                                <ul className="list-disc list-inside text-gray-600">
                                    {content.videoList.map((video, index) => (
                                        <li key={index}>
                                            {/* Use embedUrl provided by backend or construct a view URL */}
                                            <a
                                                href={video.embedUrl || `https://www.youtube.com/watch?v=${video.id}`}
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
                                                    className="inline-block ml-2 w-16 h-auto"
                                                />
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        <p className="text-gray-700 text-sm">Uploaded by: {content.uploadedBy ? content.uploadedBy.name : 'Unknown'}</p>
                        <p className="text-gray-700 text-sm">Uploaded on: {new Date(content.createdAt).toLocaleDateString()}</p>
                        {/* Delete Button */}
                        <button
                            onClick={() => handleDelete(content._id)}
                            className="absolute top-2 right-2 bg-red-500 hover:bg-red-700 text-white px-2 py-1 rounded text-xs transition-colors duration-300"
                        >
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default AllContent;