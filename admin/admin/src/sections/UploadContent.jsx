import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../axiosConfig'; // Use the configured apiClient

function UploadContent() {
    const [title, setTitle] = useState('');
    const [type, setType] = useState('ebook'); // Default to 'ebook'
    const [grade, setGrade] = useState('1');
    const [session, setSession] = useState(''); // Will be updated by useEffect
    const [file, setFile] = useState(null); // For single file upload (ebook)
    const [files, setFiles] = useState([]); // For multiple file upload (presentations)

    // For video content
    const [videoFile, setVideoFile] = useState(null);

    // NEW: State for Quiz Properties and Questions
    const [quizDescription, setQuizDescription] = useState('');
    const [timeLimit, setTimeLimit] = useState(60); // Default to 60 minutes
    const [attemptsAllowed, setAttemptsAllowed] = useState(1); // Default to 1 attempt
    const [difficulty, setDifficulty] = useState('Medium'); // Default to Medium
    const [quizQuestions, setQuizQuestions] = useState([
        { questionText: '', options: ['', ''], correctAnswer: '' } // Initial empty question
    ]);

    const [uploadProgress, setUploadProgress] = useState(0); // Progress for file upload

    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [availableSessions, setAvailableSessions] = useState([]); // State to store available sessions for a grade

    const videoFileInputRef = useRef(null); // Ref to clear video file input
    const singleFileInputRef = useRef(null); // Ref to clear single file input
    const multipleFilesInputRef = useRef(null); // Ref to clear multiple files input


    // Max video size for Cloudinary Free Tier (still a good client-side warning)
    const MAX_VIDEO_UPLOAD_SIZE_MB = 99;

    // --- Session Fetching Logic (remains the same) ---
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
                const res = await apiClient.get(`/admin/sessions?grade=${grade}`);
                const sessionsData = res.data.sessions || []; // Assuming sessions array in response

                const sortedSessions = sessionsData.sort((a, b) => a.sessionNumber - b.sessionNumber);
                setAvailableSessions(sortedSessions.map((s) => s.sessionNumber));

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

    // --- Add New Session Logic (remains the same) ---
    const handleAddSession = async () => {
        if (!grade) {
            setError('Please select a grade before adding a new session.');
            return;
        }
        setError('');
        setMessage('');
        setLoading(true);

        const nextSessionNumber = availableSessions.length > 0 ? Math.max(...availableSessions) + 1 : 1;
        const sessionName = `Session ${nextSessionNumber}`;
        const topicName = `Topic for ${sessionName}`; // Placeholder topic name

        try {
            await apiClient.post('/admin/add-session', {
                grade: Number(grade),
                sessionNumber: nextSessionNumber, // Explicitly send the new session number
                name: sessionName,
                topicName: topicName,
            });

            setMessage(`Session ${nextSessionNumber} added for Grade ${grade}!`);
            setAvailableSessions((prevSessions) =>
                [...prevSessions, nextSessionNumber].sort((a, b) => a - b)
            );
            setSession(String(nextSessionNumber)); // Set to the newly added session
        } catch (err) {
            console.error('Error adding session:', err.response ? err.response.data : err.message);
            setError(err.response?.data?.msg || 'Failed to add session.');
        } finally {
            setLoading(false);
        }
    };

    // --- Video File Change (Simplified) ---
    const handleVideoFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setVideoFile(file);
            setError('');
            setMessage('');

            // Just a warning, no client-side compression trigger
            if (file.size > MAX_VIDEO_UPLOAD_SIZE_MB * 1024 * 1024) {
                setMessage(
                    `Video file size (${(file.size / (1024 * 1024)).toFixed(2)} MB) is large. Compression will occur on the server.`
                );
            } else {
                setMessage(`Video file selected: ${(file.size / (1024 * 1024)).toFixed(2)} MB.`);
            }
        }
    };

    // NEW: Quiz Question Handlers (unchanged)
    const handleQuestionChange = (index, field, value) => {
        const newQuestions = [...quizQuestions];
        newQuestions[index][field] = value;
        setQuizQuestions(newQuestions);
    };

    const handleOptionChange = (qIndex, oIndex, value) => {
        const newQuestions = [...quizQuestions];
        newQuestions[qIndex].options[oIndex] = value;
        setQuizQuestions(newQuestions);
    };

    const handleAddOption = (qIndex) => {
        const newQuestions = [...quizQuestions];
        newQuestions[qIndex].options.push('');
        setQuizQuestions(newQuestions);
    };

    const handleRemoveOption = (qIndex, oIndex) => {
        const newQuestions = [...quizQuestions];
        newQuestions[qIndex].options.splice(oIndex, 1);
        // If the removed option was the correct answer, reset correctAnswer
        if (newQuestions[qIndex].correctAnswer === newQuestions[qIndex].options[oIndex]) {
            newQuestions[qIndex].correctAnswer = '';
        }
        setQuizQuestions(newQuestions);
    };

    const handleAddQuestion = () => {
        setQuizQuestions([...quizQuestions, { questionText: '', options: ['', ''], correctAnswer: '' }]);
    };

    const handleRemoveQuestion = (index) => {
        const newQuestions = quizQuestions.filter((_, i) => i !== index);
        setQuizQuestions(newQuestions);
    };

    const handleCorrectAnswerChange = (qIndex, value) => {
        const newQuestions = [...quizQuestions];
        newQuestions[qIndex].correctAnswer = value;
        setQuizQuestions(newQuestions);
    };

    // --- Main Form Submission Logic (Adjusted for quiz creation with new fields) ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setUploadProgress(0); // Reset upload progress
        setLoading(true);

        if (!title || !grade || !session) {
            setError('Title, Grade, and Session are required.');
            setLoading(false);
            return;
        }

        let endpoint = '';
        let payload = {};
        let isMultipart = false; // Flag to determine if it's a multipart form data request

        if (type === 'quiz') {
            endpoint = '/admin/quizzes'; // New endpoint for quizzes
            // Validate quiz specific fields
            if (!quizDescription.trim()) {
                setError('Quiz description is required.');
                setLoading(false);
                return;
            }
            if (quizQuestions.length === 0) {
                setError('At least one question is required for a quiz.');
                setLoading(false);
                return;
            }
            if (timeLimit < 1) {
                setError('Time limit must be at least 1 minute.');
                setLoading(false);
                return;
            }
            if (attemptsAllowed < 1) {
                setError('Attempts allowed must be at least 1.');
                setLoading(false);
                return;
            }

            for (const q of quizQuestions) {
                if (!q.questionText.trim() || q.options.some(opt => !opt.trim()) || q.options.length < 2 || !q.correctAnswer.trim()) {
                    setError('Each quiz question must have text, at least two non-empty options, and a correct answer selected.');
                    setLoading(false);
                    return;
                }
                if (!q.options.includes(q.correctAnswer)) {
                    setError(`Correct answer "${q.correctAnswer}" for question "${q.questionText}" is not among the provided options.`);
                    setLoading(false);
                    return;
                }
            }

            payload = {
                title,
                description: quizDescription,
                grade: Number(grade),
                session: Number(session),
                timeLimit: Number(timeLimit), // Add timeLimit
                attemptsAllowed: Number(attemptsAllowed), // Add attemptsAllowed
                difficulty: difficulty, // Add difficulty
                questions: quizQuestions,
            };
            // No file upload, so isMultipart remains false
        } else {
            // Existing file upload logic for ebook, video, presentation_multiple
            const formData = new FormData();
            formData.append('title', title);
            formData.append('type', type);
            formData.append('grade', Number(grade));
            formData.append('session', Number(session));

            if (type === 'video') {
                if (!videoFile) {
                    setError('For video content, please select a video file.');
                    setLoading(false);
                    return;
                }
                if (videoFile.size > MAX_VIDEO_UPLOAD_SIZE_MB * 1024 * 1024) {
                    setMessage(`Video file is large. Uploading for server-side compression...`);
                }
                formData.append('file', videoFile);
                endpoint = '/admin/upload-content';
                isMultipart = true;
            } else if (type === 'presentation_multiple') {
                if (files.length === 0) {
                    setError('Please select at least one file for multiple presentations.');
                    setLoading(false);
                    return;
                }
                files.forEach((f) => formData.append('files', f));
                endpoint = '/admin/upload-multiple-content';
                isMultipart = true;
            } else { // ebook
                if (!file) {
                    setError(`Please select a file for ${type} content.`);
                    setLoading(false);
                    return;
                }
                formData.append('file', file);
                endpoint = '/admin/upload-content';
                isMultipart = true;
            }
            payload = formData;
        }


        try {
            if (isMultipart) {
                await apiClient.post(endpoint, payload, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    onUploadProgress: (progressEvent) => {
                        const percentCompleted = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        setUploadProgress(percentCompleted);
                    },
                });
            } else {
                // For quiz, send as application/json
                await apiClient.post(endpoint, payload);
            }

            setMessage('Content uploaded successfully!');
            // Reset form fields and files
            setTitle('');
            setType('ebook');
            setGrade('1'); // This will trigger useEffect to fetch sessions for Grade 1
            setSession(''); // Let useEffect set the default session
            setFile(null);
            setFiles([]);
            setVideoFile(null);
            setQuizDescription(''); // Reset quiz specific fields
            setTimeLimit(60); // Reset timeLimit
            setAttemptsAllowed(1); // Reset attemptsAllowed
            setDifficulty('Medium'); // Reset difficulty
            setQuizQuestions([{ questionText: '', options: ['', ''], correctAnswer: '' }]);
            setUploadProgress(0);

            // Manually clear file input elements using refs or direct DOM access
            if (singleFileInputRef.current) singleFileInputRef.current.value = '';
            if (multipleFilesInputRef.current) multipleFilesInputRef.current.value = '';
            if (videoFileInputRef.current) videoFileInputRef.current.value = '';

        } catch (err) {
            console.error('Upload failed:', err.response ? err.response.data : err.message);
            setError(err.response?.data?.msg || 'Content upload failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="bg-white p-6 rounded shadow-md max-w-lg mx-auto my-8" onSubmit={handleSubmit}>
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Upload Content</h2>
            {message && <p className="text-green-600 text-center mb-4 text-md">{message}</p>}
            {error && <p className="text-red-600 text-center mb-4 text-md">{error}</p>}

            <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                    type="text"
                    id="title"
                    placeholder="Content Title"
                    className="block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
            </div>

            <div className="mb-4">
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Content Type</label>
                <select
                    name="type"
                    id="type"
                    className="block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={type}
                    onChange={(e) => {
                        setType(e.target.value);
                        // Reset all file-related states when type changes
                        setFile(null);
                        setFiles([]);
                        setVideoFile(null);
                        setQuizDescription(''); // Reset quiz specific fields
                        setTimeLimit(60); // Reset timeLimit
                        setAttemptsAllowed(1); // Reset attemptsAllowed
                        setDifficulty('Medium'); // Reset difficulty
                        setQuizQuestions([{ questionText: '', options: ['', ''], correctAnswer: '' }]);
                        setUploadProgress(0);

                        // Manually clear file input elements
                        if (singleFileInputRef.current) singleFileInputRef.current.value = '';
                        if (multipleFilesInputRef.current) multipleFilesInputRef.current.value = '';
                        if (videoFileInputRef.current) videoFileInputRef.current.value = '';
                    }}
                >
                    <option value="ebook">Ebook (Single File)</option>
                    <option value="presentation_multiple">Presentation (Multiple Files)</option>
                    <option value="video">Video (File Upload)</option>
                    <option value="quiz">Quiz (MCQ)</option>
                </select>
            </div>

            <div className="mb-4">
                <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
                <select
                    id="grade"
                    className="block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                >
                    {[...Array(12)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                            Grade {i + 1}
                        </option>
                    ))}
                </select>
            </div>

            <div className="flex items-center gap-2 mb-4">
                <div className="flex-grow">
                    <label htmlFor="session" className="block text-sm font-medium text-gray-700 mb-1">Session</label>
                    <select
                        id="session"
                        className="block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={session}
                        onChange={(e) => setSession(e.target.value)}
                        disabled={availableSessions.length === 0 || loading}
                    >
                        {availableSessions.length > 0 ? (
                            availableSessions.map((s) => (
                                <option key={s} value={s}>
                                    Session {s}
                                </option>
                            ))
                        ) : (
                            <option value="">No sessions available for this grade</option>
                        )}
                    </select>
                </div>
                <button
                    type="button"
                    onClick={handleAddSession}
                    className="mt-6 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm transition-colors duration-300 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    disabled={loading}
                >
                    Add New Session
                </button>
            </div>

            {/* Conditionally render file input(s) or quiz creation interface based on type */}
            {type === 'ebook' && (
                <div className="mb-4">
                    <label htmlFor="singleFileInput" className="block text-sm font-medium text-gray-700 mb-1">
                        Upload File (PPT/PDF/DOCX)
                    </label>
                    <input
                        type="file"
                        id="singleFileInput"
                        accept=".ppt,.pptx,.pdf,.doc,.docx"
                        className="block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={(e) => setFile(e.target.files[0])}
                        ref={singleFileInputRef}
                    />
                </div>
            )}

            {type === 'presentation_multiple' && (
                <div className="mb-4">
                    <label htmlFor="multipleFilesInput" className="block text-sm font-medium text-gray-700 mb-1">
                        Upload Multiple Presentations (PPT/PPTX/PDF/DOC/DOCX)
                    </label>
                    <input
                        type="file"
                        id="multipleFilesInput"
                        accept=".ppt,.pptx,.pdf,.doc,.docx"
                        multiple // Allow multiple file selection
                        className="block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={(e) => setFiles(Array.from(e.target.files))} // Store selected files as an array
                        ref={multipleFilesInputRef}
                    />
                </div>
            )}

            {type === 'video' && (
                <div className="mb-4">
                    <label htmlFor="videoFileInput" className="block text-sm font-medium text-gray-700 mb-1">
                        Upload Video File (MP4, WEBM, OGG)
                    </label>
                    <input
                        type="file"
                        id="videoFileInput"
                        accept="video/mp4, video/webm, video/ogg"
                        className="block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={handleVideoFileChange}
                        ref={videoFileInputRef} // Attach ref to clear input
                    />

                    {videoFile && (
                        <div className="mt-2 p-3 border border-gray-200 rounded-md bg-gray-50 text-gray-700 text-sm">
                            <p>Selected: <span className="font-semibold">{videoFile.name}</span></p>
                            <p>Original Size: <span className="font-semibold">{(videoFile.size / (1024 * 1024)).toFixed(2)} MB</span></p>
                        </div>
                    )}

                    {videoFile && videoFile.size > MAX_VIDEO_UPLOAD_SIZE_MB * 1024 * 1024 && (
                        <p className="text-orange-600 text-sm mt-2">
                            This video is large ({ (videoFile.size / (1024 * 1024)).toFixed(2) } MB). It will be processed on the server.
                        </p>
                    )}
                </div>
            )}

            {/* NEW: Quiz Creation Interface */}
            {type === 'quiz' && (
                <div className="mb-4 border border-blue-200 p-4 rounded-md bg-blue-50">
                    <h3 className="text-lg font-semibold mb-3 text-blue-800">Create Quiz</h3>
                    <div className="mb-3">
                        <label htmlFor="quizDescription" className="block text-sm font-medium text-gray-700 mb-1">Quiz Description</label>
                        <textarea
                            id="quizDescription"
                            placeholder="A brief description of the quiz..."
                            className="block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows="3"
                            value={quizDescription}
                            onChange={(e) => setQuizDescription(e.target.value)}
                            required
                        ></textarea>
                    </div>

                    {/* New Quiz Settings: Time Limit, Attempts Allowed, Difficulty */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label htmlFor="timeLimit" className="block text-sm font-medium text-gray-700 mb-1">Time Limit (minutes)</label>
                            <input
                                type="number"
                                id="timeLimit"
                                min="1"
                                placeholder="e.g., 60"
                                className="block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={timeLimit}
                                onChange={(e) => setTimeLimit(Number(e.target.value))}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="attemptsAllowed" className="block text-sm font-medium text-gray-700 mb-1">Attempts Allowed</label>
                            <input
                                type="number"
                                id="attemptsAllowed"
                                min="1"
                                placeholder="e.g., 1"
                                className="block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={attemptsAllowed}
                                onChange={(e) => setAttemptsAllowed(Number(e.target.value))}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                            <select
                                id="difficulty"
                                className="block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={difficulty}
                                onChange={(e) => setDifficulty(e.target.value)}
                                required
                            >
                                <option value="Easy">Easy</option>
                                <option value="Medium">Medium</option>
                                <option value="Hard">Hard</option>
                            </select>
                        </div>
                    </div>
                    {/* End New Quiz Settings */}

                    {quizQuestions.map((q, qIndex) => (
                        <div key={qIndex} className="mb-6 p-4 border border-gray-300 rounded-md bg-white shadow-sm">
                            <div className="flex justify-between items-center mb-3">
                                <h4 className="font-medium text-gray-800">Question {qIndex + 1}</h4>
                                {quizQuestions.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveQuestion(qIndex)}
                                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                                    >
                                        Remove Question
                                    </button>
                                )}
                            </div>
                            <div className="mb-3">
                                <label htmlFor={`questionText-${qIndex}`} className="block text-sm font-medium text-gray-700 mb-1">Question Text</label>
                                <input
                                    type="text"
                                    id={`questionText-${qIndex}`}
                                    placeholder="Enter question text"
                                    className="block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={q.questionText}
                                    onChange={(e) => handleQuestionChange(qIndex, 'questionText', e.target.value)}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
                                {q.options.map((option, oIndex) => (
                                    <div key={oIndex} className="flex items-center mb-2">
                                        <input
                                            type="radio"
                                            name={`correctAnswer-${qIndex}`}
                                            value={option}
                                            checked={q.correctAnswer === option}
                                            onChange={() => handleCorrectAnswerChange(qIndex, option)}
                                            className="mr-2 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                        />
                                        <input
                                            type="text"
                                            placeholder={`Option ${oIndex + 1}`}
                                            className="flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={option}
                                            onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                                            required
                                        />
                                        {q.options.length > 2 && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveOption(qIndex, oIndex)}
                                                className="ml-2 text-red-500 hover:text-red-700 text-xl"
                                            >
                                                &times;
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => handleAddOption(qIndex)}
                                    className="mt-2 bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-sm transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                                >
                                    Add Option
                                </button>
                            </div>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={handleAddQuestion}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Add New Question
                    </button>
                </div>
            )}

            {/* Upload Progress Bar */}
            {loading && uploadProgress > 0 && uploadProgress < 100 && (type !== 'quiz') && (
                <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-1">Uploading...</p>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                        <div
                            className="bg-blue-600 h-4 rounded-full text-center text-white text-xs font-bold"
                            style={{ width: `${uploadProgress}%` }}
                        >
                            {uploadProgress}%
                        </div>
                    </div>
                </div>
            )}

            {/* Loading indicator for quiz submission (no file upload progress) */}
            {loading && type === 'quiz' && (
                <p className="text-center text-blue-600 mt-4">Creating Quiz...</p>
            )}

            <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-300 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
            >
                {loading ? 'Processing...' : (type === 'quiz' ? 'Create Quiz' : 'Upload Content')}
            </button>
        </form>
    );
}

export default UploadContent;