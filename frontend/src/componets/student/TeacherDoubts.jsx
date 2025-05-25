import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Paperclip, SendHorizontal, User, XCircle, Search, Trash2, PlusCircle } from 'lucide-react';
import Navbar from '../Navbar'; // Assuming Navbar component exists and is correctly imported
import { initialSessionsData, teachersData, studentData } from '../../data/initialSessions'; // Import shared data

// Mock profile pics (can replace with real URLs) - Keep if you want separate ones, or remove if using shared teacher data's profile pics
const PROFILE_PICS = {
  t1: 'https://randomuser.me/api/portraits/men/32.jpg',
  t2: 'https://randomuser.me/api/portraits/women/44.jpg',
  t3: 'https://randomuser.me/api/portraits/women/55.jpg',
};

// Merge profile pics into teachers data for completeness in this component
const teachersWithPics = teachersData.map(teacher => ({
    ...teacher,
    profilePic: PROFILE_PICS[teacher.id],
    online: Math.random() > 0.5 // Simulate online status
}));

const TeacherDoubts = () => {
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [sessions, setSessions] = useState(() => {
    try {
      const savedSessions = localStorage.getItem('teacherSessions');
      // Use initialSessionsData as default if localStorage is empty or error
      return savedSessions ? JSON.parse(savedSessions) : initialSessionsData;
    } catch (error) {
      console.error("Failed to parse sessions from localStorage:", error);
      return initialSessionsData;
    }
  });
  const [selectedSession, setSelectedSession] = useState(null);
  const [message, setMessage] = useState('');
  const [file, setFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showFilePreview, setShowFilePreview] = useState(false); // New state for file preview

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null); // Ref for file input

  // Function to load sessions from localStorage
  const loadSessionsFromLocalStorage = useCallback(() => {
    try {
      const savedSessions = localStorage.getItem('teacherSessions');
      return savedSessions ? JSON.parse(savedSessions) : initialSessionsData;
    } catch (error) {
      console.error("Failed to load sessions from localStorage:", error);
      return initialSessionsData;
    }
  }, []);

  // Use a custom event listener to react to localStorage changes from other components
  useEffect(() => {
    const handleStorageChange = (event) => {
      // Only react if the 'teacherSessions' key changed
      if (event.key === 'teacherSessions') {
        setSessions(loadSessionsFromLocalStorage());
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Initial load when component mounts
    setSessions(loadSessionsFromLocalStorage());

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadSessionsFromLocalStorage]);

  // Scroll chat to bottom on new message or session change
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [selectedSession, sessions, scrollToBottom]);

  // Clear selected session when teacher changes
  useEffect(() => {
    setSelectedSession(null);
    // Also clear message and file when teacher changes
    setMessage('');
    setFile(null);
    setShowFilePreview(false);
  }, [selectedTeacher]);

  // Simulate teacher typing indicator for fun on sending message
  useEffect(() => {
    if (!selectedSession) return;
    if (!isTyping) return;

    const timeout = setTimeout(() => {
      setIsTyping(false);
    }, 2000); // Teacher stops typing after 2 seconds

    return () => clearTimeout(timeout);
  }, [isTyping, selectedSession]);

  // Filter teachers by search term
  const filteredTeachers = teachersWithPics.filter((t) =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = useCallback(() => {
    if (!message.trim() && !file) {
      alert('Please type a message or attach a file to send.');
      return;
    }

    if (!selectedTeacher || !selectedSession) {
      alert('Please select a teacher and a session.');
      return;
    }

    const newMsg = {
      from: 'teacher', // This component sends as teacher
      text: message.trim(),
      file: file ? { name: file.name, type: file.type, url: URL.createObjectURL(file) } : null,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setSessions((prevSessions) => {
      const teacherSessions = prevSessions[selectedTeacher.id] || [];
      const updatedSessions = teacherSessions.map((sess) => {
        if (sess.id === selectedSession.id) {
          return {
            ...sess,
            messages: [...sess.messages, newMsg],
          };
        }
        return sess;
      });
      // This part should ideally not be reached if selectedSession is valid
      // But keeping it for robustness if a new session was just created by student and not yet picked up
      if (!prevSessions[selectedTeacher.id]) {
        return {
          ...prevSessions,
          [selectedTeacher.id]: [{ ...selectedSession, messages: [newMsg] }],
        };
      }
      return {
        ...prevSessions,
        [selectedTeacher.id]: updatedSessions,
      };
    });

    // Update selectedSession locally for instant UI update
    setSelectedSession((prev) => ({
      ...prev,
      messages: [...prev.messages, newMsg],
    }));

    setMessage('');
    setFile(null);
    setShowFilePreview(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Clear file input
    }

    // No auto-reply for teacher side
  }, [message, file, selectedTeacher, selectedSession]);

  const handleClearMessages = useCallback(() => {
    if (!selectedTeacher || !selectedSession) return;

    if (!window.confirm('Are you sure you want to clear all messages in this session? This action cannot be undone.')) {
      return;
    }

    setSessions((prevSessions) => {
      const teacherSessions = prevSessions[selectedTeacher.id] || [];
      const updatedSessions = teacherSessions.map((sess) => {
        if (sess.id === selectedSession.id) {
          return { ...sess, messages: [] };
        }
        return sess;
      });
      return { ...prevSessions, [selectedTeacher.id]: updatedSessions };
    });

    setSelectedSession((prev) => ({ ...prev, messages: [] }));
  }, [selectedTeacher, selectedSession]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setShowFilePreview(true);
    } else {
      setFile(null);
      setShowFilePreview(false);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setShowFilePreview(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Clear the file input
    }
  };

  // New function to initiate a new session from the teacher's side
  const startNewSession = useCallback(() => {
    if (!selectedTeacher) return;

    const teacherSessions = sessions[selectedTeacher.id] || [];
    const newSessionId = `s${Date.now()}`;
    const newSessionNumber = teacherSessions.length > 0 ? Math.max(...teacherSessions.map(s => s.session)) + 1 : 1;

    const newSession = {
      id: newSessionId,
      session: newSessionNumber,
      date: new Date().toISOString().slice(0, 10),
      messages: [],
    };

    setSessions(prevSessions => ({
      ...prevSessions,
      [selectedTeacher.id]: [...teacherSessions, newSession],
    }));

    setSelectedSession(newSession);
    setMessage('');
    setFile(null);
    setShowFilePreview(false);
  }, [selectedTeacher, sessions]);

  return (
    <>
      <Navbar />
      <div className="flex flex-col h-[700px] max-w-6xl mx-auto border rounded-2xl shadow-2xl overflow-hidden bg-gradient-to-r from-indigo-50 via-white to-indigo-50">
        {/* Header */}
        <header className="flex items-center justify-between px-8 py-4 bg-indigo-700 text-white rounded-t-2xl shadow-lg">
          <h1 className="text-2xl font-bold tracking-wide select-none">AskADoubt - Teacher Chat</h1>
          <div className="flex items-center gap-3">
            <User className="w-6 h-6" />
            {selectedTeacher ? (
              <span className="font-medium text-lg truncate max-w-xs">{selectedTeacher.name}</span>
            ) : (
              <span className="italic text-indigo-300">Select a teacher</span>
            )}
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Left pane: Assigned Teachers */}
          <aside className="w-72 bg-white dark:bg-gray-900 border-r border-gray-300 dark:border-gray-700 p-5 flex flex-col">
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search teachers..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-800 dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-400 scrollbar-track-indigo-100 dark:scrollbar-thumb-indigo-600 dark:scrollbar-track-gray-900 space-y-3">
              {filteredTeachers.length === 0 && (
                <p className="text-gray-400 text-center mt-6">No teachers found</p>
              )}
              {filteredTeachers.map((teacher) => (
                <div
                  key={teacher.id}
                  onClick={() => setSelectedTeacher(teacher)}
                  className={`flex items-center gap-3 cursor-pointer p-3 rounded-xl transition shadow-sm ${
                    selectedTeacher?.id === teacher.id
                      ? 'bg-indigo-600 text-white shadow-indigo-500'
                      : 'hover:bg-indigo-100 dark:hover:bg-indigo-800'
                  }`}
                >
                  <div className="relative">
                    <img
                      src={teacher.profilePic}
                      alt={teacher.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-indigo-400"
                    />
                    <span
                      className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${
                        teacher.online ? 'bg-green-400' : 'bg-gray-400'
                      }`}
                      title={teacher.online ? 'Online' : 'Offline'}
                    />
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="font-semibold truncate">{teacher.name}</span>
                    <span
                      className={`text-sm ${
                        teacher.online ? 'text-green-600 dark:text-green-400' : 'text-gray-400'
                      }`}
                    >
                      {teacher.online ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </aside>

          {/* Center pane: Sessions & Chat */}
          <main className="flex-1 flex flex-col bg-white dark:bg-gray-800">
            {/* Sessions List */}
            <section className="border-b border-gray-300 dark:border-gray-700 p-5 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-400 scrollbar-track-indigo-100 dark:scrollbar-thumb-indigo-600 dark:scrollbar-track-gray-900">
              {!selectedTeacher && (
                <p className="text-gray-500 dark:text-gray-400 select-none">Select a teacher to see sessions</p>
              )}

              {selectedTeacher && (sessions[selectedTeacher.id]?.length ?? 0) === 0 && (
                <div className="flex flex-col items-center justify-center p-4 text-gray-500 dark:text-gray-400">
                  <p className="mb-3">No sessions with this teacher yet.</p>
                  <button
                    onClick={startNewSession}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition"
                  >
                    <PlusCircle className="w-5 h-5" />
                    Start New Session
                  </button>
                </div>
              )}

              {selectedTeacher && (sessions[selectedTeacher.id]?.length ?? 0) > 0 && (
                <div className="flex gap-3 overflow-x-auto scrollbar-thin scrollbar-thumb-indigo-400 scrollbar-track-indigo-100 dark:scrollbar-thumb-indigo-600 dark:scrollbar-track-gray-900">
                  {sessions[selectedTeacher.id].map((sess) => (
                    <button
                      key={sess.id}
                      onClick={() => setSelectedSession(sess)}
                      className={`px-4 py-2 rounded-lg shadow-md border border-indigo-400 text-indigo-700 hover:bg-indigo-100 dark:text-indigo-300 dark:hover:bg-indigo-700 whitespace-nowrap transition ${
                        selectedSession?.id === sess.id
                          ? 'bg-indigo-600 text-white dark:bg-indigo-500'
                          : 'bg-white dark:bg-gray-700'
                      }`}
                      title={`Session ${sess.session} - ${sess.date}`}
                    >
                      Session {sess.session} ({sess.date})
                    </button>
                  ))}
                  {/* Option to start a new session even if existing sessions are there */}
                  <button
                    onClick={startNewSession}
                    className="px-4 py-2 rounded-lg shadow-md border border-indigo-400 text-indigo-700 hover:bg-indigo-100 dark:text-indigo-300 dark:hover:bg-indigo-700 whitespace-nowrap transition bg-white dark:bg-gray-700 flex items-center gap-1"
                    title="Start a new doubt session"
                  >
                    <PlusCircle className="w-5 h-5" />
                    New
                  </button>
                </div>
              )}
            </section>

            {/* Chat Window */}
            <section className="flex-1 flex flex-col p-5 overflow-hidden">
              {!selectedSession && selectedTeacher && (sessions[selectedTeacher.id]?.length ?? 0) > 0 && (
                <div className="flex flex-col items-center justify-center flex-grow text-gray-400 select-none">
                  <User className="w-14 h-14 mb-4" />
                  <p>Select an existing session to view messages</p>
                </div>
              )}

              {!selectedSession && selectedTeacher && (sessions[selectedTeacher.id]?.length ?? 0) === 0 && (
                <div className="flex flex-col items-center justify-center flex-grow text-gray-400 select-none">
                  <PlusCircle className="w-14 h-14 mb-4" />
                  <p>Click "Start New Session" above to begin a conversation!</p>
                </div>
              )}

              {!selectedSession && !selectedTeacher && (
                 <div className="flex flex-col items-center justify-center flex-grow text-gray-400 select-none">
                   <User className="w-14 h-14 mb-4" />
                   <p>Select a teacher from the left pane to get started.</p>
                 </div>
              )}


              {selectedSession && (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="font-semibold text-indigo-700 dark:text-indigo-300">
                      Session {selectedSession.session} - {selectedSession.date}
                    </h2>
                    <button
                      onClick={handleClearMessages}
                      className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800 transition"
                      title="Clear all messages in this session"
                    >
                      <Trash2 className="w-5 h-5" />
                      Clear Chat
                    </button>
                  </div>

                  <div
                    className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-400 scrollbar-track-indigo-100 dark:scrollbar-thumb-indigo-600 dark:scrollbar-track-gray-900 px-3 py-2 space-y-4 rounded-lg border border-gray-300 dark:border-gray-700 bg-indigo-50 dark:bg-indigo-900"
                    style={{ minHeight: 0 }}
                  >
                    {selectedSession.messages.length === 0 && (
                      <p className="text-center text-gray-400 italic">No messages yet. Start the conversation!</p>
                    )}

                    {selectedSession.messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex ${msg.from === 'teacher' ? 'justify-start' : 'justify-end'}`}
                      >
                        <div
                          className={`max-w-[70%] p-3 rounded-xl whitespace-pre-wrap break-words
                          ${msg.from === 'teacher' ? 'bg-indigo-200 text-indigo-900' : 'bg-indigo-600 text-white'}
                          shadow-sm`}
                          title={msg.timestamp}
                        >
                          {msg.text}
                          {msg.file && (
                            <div className="mt-2">
                              <strong className={msg.from === 'teacher' ? 'text-indigo-800' : 'text-indigo-200'}>Attached file:</strong>{' '}
                              <a
                                href={msg.file.url}
                                download={msg.file.name}
                                className={`underline ${msg.from === 'teacher' ? 'text-indigo-800 hover:text-indigo-900' : 'text-indigo-100 hover:text-white'}`}
                                onClick={(e) => e.stopPropagation()}
                              >
                                {msg.file.name}
                              </a>
                            </div>
                          )}
                          <div className={`text-xs mt-1 text-right select-none ${msg.from === 'teacher' ? 'text-indigo-700' : 'text-indigo-200'}`}>
                            {msg.timestamp}
                          </div>
                        </div>
                      </div>
                    ))}
                    {isTyping && (
                      <p className="italic text-indigo-600 dark:text-indigo-400 select-none">Teacher is typing...</p>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input Area */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="mt-4 flex items-center gap-3"
                  >
                    <label
                      htmlFor="fileInput"
                      className="cursor-pointer p-2 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-700 transition"
                      title="Attach file"
                    >
                      <Paperclip className="w-6 h-6 text-indigo-600 dark:text-indigo-300" />
                    </label>
                    <input
                      type="file"
                      id="fileInput"
                      className="hidden"
                      ref={fileInputRef} // Assign ref to input
                      onChange={handleFileChange}
                    />

                    <input
                      type="text"
                      className="flex-1 rounded-xl border border-indigo-400 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-indigo-800 dark:text-white"
                      placeholder="Type your message here..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      disabled={!selectedSession}
                    />

                    <button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition rounded-xl p-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!selectedSession || (!message.trim() && !file)}
                      title="Send message"
                    >
                      <SendHorizontal className="w-6 h-6 text-white" />
                    </button>

                    {/* Show attached file name with option to remove */}
                    {showFilePreview && file && (
                      <div className="flex items-center gap-1 bg-indigo-300 text-indigo-900 px-3 py-1 rounded-full select-none max-w-xs truncate">
                        <span>{file.name}</span>
                        <button
                          type="button"
                          onClick={handleRemoveFile}
                          className="hover:text-indigo-900"
                          title="Remove attachment"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </form>
                </>
              )}
            </section>
          </main>
        </div>
      </div>
    </>
  );
};

export default TeacherDoubts;