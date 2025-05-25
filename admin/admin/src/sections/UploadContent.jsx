// src/sections/UploadContent.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../axiosConfig'; // Use the configured apiClient

function UploadContent() {
    const [title, setTitle] = useState('');
    const [type, setType] = useState('ebook'); // Default to 'ebook'
    const [grade, setGrade] = useState('1');
    const [session, setSession] = useState('1'); // Will be updated by useEffect
    const [file, setFile] = useState(null); // For single file upload (ebook, quiz)
    const [files, setFiles] = useState([]); // For multiple file upload (presentations)
    // For video content, now we'll allow multiple video inputs
    const [videoInputs, setVideoInputs] = useState([{ url: '', title: '' }]); // Array of objects for video inputs

    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [availableSessions, setAvailableSessions] = useState([]); // State to store available sessions for a grade

    // Helper to extract YouTube video ID from various URL formats
    const getYouTubeId = (url) => {
        const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const match = url.match(regex);
        return match ? match[1] : null;
    };

    // Fetch available sessions for the selected grade
    useEffect(() => {
        const fetchSessions = async () => {
            if (!grade) {
                setAvailableSessions([]);
                setSession('');
                return;
            }

            setError('');
            setMessage('');
            setLoading(true); // Indicate loading sessions
            try {
                // Fetch sessions from the backend using the student/sessions route
                const res = await apiClient.get(`/admin/sessions?grade=${grade}`);
                const sessionsData = res.data.sessions || []; // Assuming sessions array in response

                // Sort sessions numerically
                const sortedSessions = sessionsData.sort((a, b) => a.sessionNumber - b.sessionNumber);
                setAvailableSessions(sortedSessions.map(s => s.sessionNumber));

                if (sortedSessions.length > 0) {
                    setSession(String(sortedSessions[0].sessionNumber)); // Set to first available session
                } else {
                    setSession(''); // No sessions for this grade
                }
            } catch (err) {
                console.error('Error fetching sessions:', err.response ? err.response.data : err.message);
                setError(err.response?.data?.msg || 'Failed to fetch sessions for this grade.');
                setAvailableSessions([]);
                setSession('');
            } finally {
                setLoading(false); // Stop loading sessions
            }
        };
        fetchSessions();
    }, [grade]); // Rerun when grade changes

    const handleAddSession = async () => {
        if (!grade) {
            setError('Please select a grade before adding a new session.');
            return;
        }
        setError('');
        setMessage('');
        setLoading(true);

        // Determine the next session number based on existing ones
        const nextSessionNumber = availableSessions.length > 0 ? Math.max(...availableSessions) + 1 : 1;
        const sessionName = `Session ${nextSessionNumber}`;
        const topicName = `Topic for ${sessionName}`; // Placeholder topic name

        try {
            const res = await apiClient.post('/admin/add-session', {
                grade: Number(grade),
                sessionNumber: nextSessionNumber, // Explicitly send the new session number
                name: sessionName,
                topicName: topicName
            });

            setMessage(`Session ${nextSessionNumber} added for Grade ${grade}!`);
            // Add the new session to available sessions and sort
            setAvailableSessions(prevSessions => [...prevSessions, nextSessionNumber].sort((a, b) => a - b));
            setSession(String(nextSessionNumber)); // Set to the newly added session
        } catch (err) {
            console.error('Error adding session:', err.response ? err.response.data : err.message);
            setError(err.response?.data?.msg || 'Failed to add session.');
        } finally {
            setLoading(false);
        }
    };

    // Handlers for dynamic video inputs
    const handleVideoInputChange = (index, event) => {
        const { name, value } = event.target;
        const newVideoInputs = [...videoInputs];
        newVideoInputs[index][name] = value;
        setVideoInputs(newVideoInputs);
    };

    const handleAddVideoInput = () => {
        setVideoInputs([...videoInputs, { url: '', title: '' }]);
    };

    const handleRemoveVideoInput = (index) => {
        const newVideoInputs = videoInputs.filter((_, i) => i !== index);
        setVideoInputs(newVideoInputs);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);

        // Common validation
        if (!title || !grade || !session) {
            setError('Title, Grade, and Session are required.');
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('type', type);
        formData.append('grade', Number(grade));
        formData.append('session', Number(session));

        let endpoint = '/admin/upload-content'; // Default endpoint

        if (type === 'video') {
            const validVideoEntries = videoInputs.filter(v => v.url.trim() !== '');

            if (validVideoEntries.length === 0) {
                setError('For video content, please provide at least one video URL.');
                setLoading(false);
                return;
            }

            const formattedVideoList = validVideoEntries.map(video => {
                const youtubeId = getYouTubeId(video.url); // Use the helper to extract ID
                return {
                    id: youtubeId || video.url, // Use YouTube ID or fallback to full URL/ID
                    title: video.title || `Video ${youtubeId || video.url}`,
                    thumbnail: youtubeId ? `https://img.youtube.com/vi/${youtubeId}/0.jpg` : '' // Generate thumbnail if YouTube ID exists
                };
            });

            // Append the videoList as a JSON string for easy parsing on backend
            // Or, you can append each field individually if backend expects formData like videoList[0][id]
            // Let's stick to the individual field approach for FormData
            formattedVideoList.forEach((video, index) => {
                formData.append(`videoList[${index}][id]`, video.id);
                formData.append(`videoList[${index}][title]`, video.title);
                if (video.thumbnail) formData.append(`videoList[${index}][thumbnail]`, video.thumbnail);
            });

            setFile(null); // Clear single file input
            setFiles([]); // Clear multiple files input
        } else if (type === 'presentation_multiple') { // Multiple presentations upload
            endpoint = '/admin/upload-presentations'; // New endpoint for multiple files
            if (files.length === 0) {
                setError('Please select at least one file for multiple presentations.');
                setLoading(false);
                return;
            }
            files.forEach(f => formData.append('files', f)); // 'files' is the key expected by upload.array('files')
            setFile(null); // Clear single file input
        } else { // Single file upload (ebook or quiz)
            if (!file) {
                setError(`Please select a file for ${type} content.`);
                setLoading(false);
                return;
            }
            formData.append('file', file); // 'file' is the key expected by upload.single('file')
            setFiles([]); // Clear multiple files input
            setVideoInputs([{ url: '', title: '' }]); // Clear video inputs
        }

        try {
            await apiClient.post(endpoint, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setMessage('Content uploaded successfully!');
            // Reset form
            setTitle('');
            setType('ebook');
            setGrade('1');
            // This will trigger useEffect to fetch sessions for Grade 1 and setSession(1)
            setSession('1');
            setFile(null);
            setFiles([]);
            setVideoInputs([{ url: '', title: '' }]); // Reset video inputs
            // Manually clear file input elements
            document.getElementById('singleFileInput').value = '';
            document.getElementById('multipleFilesInput').value = '';

        } catch (err) {
            console.error('Upload failed:', err.response ? err.response.data : err.message);
            setError(err.response?.data?.msg || 'Content upload failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="bg-white p-6 rounded shadow-md max-w-md mx-auto" onSubmit={handleSubmit}>
            <h2 className="text-xl font-bold mb-4 text-center">Upload Content</h2>
            {message && <p className="text-green-500 text-center mb-3">{message}</p>}
            {error && <p className="text-red-500 text-center mb-3">{error}</p>}

            <input
                type="text"
                placeholder="Title"
                className="block w-full p-2 mb-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
            />

            <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">Content Type</label>
                <select
                    name="type"
                    id="type"
                    className="block w-full p-2 mb-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={type}
                    onChange={(e) => {
                        setType(e.target.value);
                        setFile(null);
                        setFiles([]);
                        setVideoInputs([{ url: '', title: '' }]); // Reset video inputs when type changes
                        // Manually clear file input elements
                        document.getElementById('singleFileInput').value = '';
                        document.getElementById('multipleFilesInput').value = '';
                    }}
                >
                    <option value="ebook">Ebook (Single File)</option>
                    <option value="presentation_multiple">Presentation (Multiple Files)</option>
                    <option value="video">Video (URLs & Titles)</option>
                    <option value="quiz">Quiz (Single File)</option>
                </select>
            </div>

            <select
                className="block w-full p-2 mb-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
            >
                {[...Array(12)].map((_, i) => <option key={i + 1} value={i + 1}>Grade {i + 1}</option>)}
            </select>

            <div className="flex items-center gap-2 mb-3">
                <select
                    className="block w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={session}
                    onChange={(e) => setSession(e.target.value)}
                    disabled={availableSessions.length === 0} // Disable if no sessions are available
                >
                    {availableSessions.length > 0 ? (
                        availableSessions.map((s) => <option key={s} value={s}>Session {s}</option>)
                    ) : (
                        <option value="">No sessions available for this grade</option>
                    )}
                </select>
                <button
                    type="button"
                    onClick={handleAddSession}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-2 rounded text-sm transition-colors duration-300"
                    disabled={loading}
                >
                    Add New Session
                </button>
            </div>

            {/* Conditionally render file input(s) or video URL input based on type */}
            {(type === 'ebook' || type === 'quiz') && (
                <div>
                    <label htmlFor="singleFileInput" className="block text-sm font-medium text-gray-700">
                        Upload File ({type === 'ebook' ? 'PPT/PDF/DOCX' : 'PDF/DOCX'})
                    </label>
                    <input
                        type="file"
                        id="singleFileInput"
                        accept={type === 'ebook' ? '.ppt,.pptx,.pdf,.doc,.docx' : '.pdf,.doc,.docx'}
                        className="block w-full p-2 mb-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={(e) => setFile(e.target.files[0])}
                    />
                </div>
            )}

            {type === 'presentation_multiple' && (
                <div>
                    <label htmlFor="multipleFilesInput" className="block text-sm font-medium text-gray-700">
                        Upload Multiple Presentations (PPT/PPTX/PDF/DOC/DOCX)
                    </label>
                    <input
                        type="file"
                        id="multipleFilesInput"
                        accept=".ppt,.pptx,.pdf,.doc,.docx"
                        multiple // Allow multiple file selection
                        className="block w-full p-2 mb-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={(e) => setFiles(Array.from(e.target.files))} // Store selected files as an array
                    />
                </div>
            )}

            {type === 'video' && (
                <div className="border p-4 rounded-md mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Video URLs & Titles</label>
                    {videoInputs.map((input, index) => (
                        <div key={index} className="flex items-center gap-2 mb-2">
                            <input
                                type="text"
                                name="url"
                                placeholder="YouTube URL or Video ID"
                                value={input.url}
                                onChange={(e) => handleVideoInputChange(index, e)}
                                className="block w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                required // URL is required for video entries
                            />
                            <input
                                type="text"
                                name="title"
                                placeholder="Video Title (Optional)"
                                value={input.title}
                                onChange={(e) => handleVideoInputChange(index, e)}
                                className="block w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                            {videoInputs.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => handleRemoveVideoInput(index)}
                                    className="text-red-500 hover:text-red-700 p-1 rounded"
                                >
                                    ✕ {/* X mark */}
                                </button>
                            )}
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={handleAddVideoInput}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm mt-2"
                    >
                        Add Another Video
                    </button>
                </div>
            )}

            <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors duration-300"
                disabled={loading}
            >
                {loading ? 'Uploading...' : 'Upload Content'}
            </button>
        </form>
    );
}

export default UploadContent;