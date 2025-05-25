// 🔥 UPDATED AskADoubt Component
import React, { useState, useRef, useEffect } from 'react';
import { Paperclip, SendHorizonal, User, ArrowLeft } from 'lucide-react';
import { useNotifications } from './context/NotificationContext'; // Import useNotifications

const AskADoubt = () => {
    const { addNotification } = useNotifications(); // Use the hook

    const student = {
        id: 'stu1',
        name: 'Riya Sharma',
        school: 'Green Valley High School',
    };

    const teachers = [
        { id: 't1', name: 'Mr. Ankit Mehra', school: 'Green Valley High School' },
        { id: 't2', name: 'Ms. Priya Nair', school: 'Sunrise International School' },
        { id: 't3', name: 'Mrs. Kavita Joshi', school: 'Green Valley High School' },
    ];

    const [step, setStep] = useState(0);
    const [open, setOpen] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [selectedSession, setSelectedSession] = useState(null);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [file, setFile] = useState(null);
    const [typing, setTyping] = useState(false);

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, typing]);

    useEffect(() => {
        if (step === 2 && selectedTeacher && selectedSession) {
            const welcomeMsg = {
                from: 'teacher',
                text: `Hello ${student.name}, how can I help you?`,
                timestamp: new Date().toLocaleTimeString(),
            };
            setMessages([welcomeMsg]);
        }
    }, [step, selectedTeacher, selectedSession, student.name]); // Added student.name to dependency array

    const handleSendMessage = () => {
        if (!message.trim() && !file) return;
        const doubtText = message.trim(); // Store the actual doubt text

        const newMsg = {
            from: 'student',
            text: doubtText,
            file,
            timestamp: new Date().toLocaleTimeString(),
        };
        setMessages((prev) => [...prev, newMsg]);
        setMessage('');
        setFile(null);

        // Simulate teacher typing and reply
        setTyping(true);
        setTimeout(() => {
            setTyping(false);
            const reply = {
                from: 'teacher',
                text: `Thanks for your doubt, ${student.name}. I'll get back to you shortly!`,
                timestamp: new Date().toLocaleTimeString(),
            };
            setMessages((prev) => [...prev, reply]);
            // showNotification(`${selectedTeacher.name} has answered your doubt`); // Remove old notification

            // Add notification using context
            addNotification(
                `Your doubt on Session ${selectedSession} has been sent to ${selectedTeacher.name}.`,
                doubtText, // Pass the student's question
                new Date().toLocaleString()
            );

            // Simulate teacher's reply notification after a delay
            setTimeout(() => {
                addNotification(
                    `${selectedTeacher.name} has replied to your doubt on Session ${selectedSession}.`,
                    doubtText, // Referencing the original question
                    new Date().toLocaleString()
                );
            }, 1000); // Small delay for reply notification
        }, 2000);
    };

    const handleGoBack = () => {
        if (step === 2) {
            setStep(1);
            setSelectedTeacher(null);
            setSelectedSession(null);
            setMessages([]);
        } else if (step === 1) {
            setStep(0);
        }
    };

    // Removed the old showNotification as it's replaced by context
    // const showNotification = (text) => { ... };

    const filteredTeachers = teachers.filter(
        (teacher) => teacher.school === student.school
    );

    return (
        <>
            {/* Floating Button */}
            <div className="fixed bottom-6 right-6 z-40">
                <button
                    onClick={() => {
                        setOpen(true);
                        if (Notification.permission !== 'granted') {
                            Notification.requestPermission();
                        }
                    }}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:scale-105 transition"
                >
                    Ask A Doubt?
                </button>
            </div>

            {/* Modal */}
            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl w-full max-w-3xl shadow-xl border border-gray-200 dark:border-gray-700 relative">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Ask A Doubt</h2>
                            <button
                                onClick={() => {
                                    setOpen(false);
                                    setStep(0);
                                    setSelectedTeacher(null);
                                    setSelectedSession(null);
                                    setMessages([]);
                                }}
                                className="text-gray-600 dark:text-gray-300 hover:text-red-600 text-2xl font-bold"
                                aria-label="Close modal"
                            >
                                ×
                            </button>
                        </div>

                        {/* Step 0: Choose AI or Trainer */}
                        {step === 0 && (
                            <div className="flex flex-col gap-4">
                                <button
                                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                    onClick={() => alert('Coming Soon!')}
                                >
                                    Ask with AI 🤖
                                </button>
                                <button
                                    className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-md font-semibold hover:scale-105 transition"
                                    onClick={() => setStep(1)}
                                >
                                    Ask With Trainer 👨‍🏫
                                </button>
                            </div>
                        )}

                        {/* Step 1: Select Trainer */}
                        {step === 1 && (
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <button
                                        onClick={handleGoBack}
                                        className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                        Back
                                    </button>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                                    Select a Trainer from {student.school}
                                </h3>
                                <div className="grid sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                                    {filteredTeachers.map((teacher) => (
                                        <div
                                            key={teacher.id}
                                            onClick={() => setSelectedTeacher(teacher)}
                                            className="flex items-center gap-4 p-4 border border-gray-300 dark:border-gray-700 rounded-xl shadow-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
                                        >
                                            <User className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">{teacher.name}</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">{teacher.school}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Step 1.5: Select Session */}
                        {step === 1 && selectedTeacher && (
                            <div className="mt-4">
                                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Select your session (1-34)
                                </h4>
                                <select
                                    className="w-full border rounded-lg p-2 dark:bg-gray-800 dark:text-white"
                                    onChange={(e) => {
                                        setSelectedSession(e.target.value);
                                        setStep(2);
                                    }}
                                    defaultValue=""
                                >
                                    <option value="" disabled>Select Session</option>
                                    {[...Array(34)].map((_, i) => (
                                        <option key={i + 1} value={i + 1}>
                                            Session {i + 1}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Step 2: Chat UI */}
                        {step === 2 && selectedTeacher && selectedSession && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleGoBack}
                                        className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                        Back
                                    </button>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 ml-1">
                                        Chatting with <strong>{selectedTeacher.name}</strong> | Session {selectedSession}
                                    </p>
                                </div>

                                <div className="h-72 overflow-y-auto border border-gray-300 dark:border-gray-700 rounded-xl p-4 bg-gray-50 dark:bg-gray-800 shadow-inner scroll-smooth">
                                    {messages.map((msg, idx) => (
                                        <div
                                            key={idx}
                                            className={`mb-3 flex flex-col ${msg.from === 'student' ? 'items-end' : 'items-start'}`}
                                        >
                                            {msg.file && (
                                                <a
                                                    href={URL.createObjectURL(msg.file)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm text-blue-500 underline mb-1"
                                                >
                                                    📎 {msg.file.name}
                                                </a>
                                            )}
                                            <div
                                                className={`px-4 py-2 rounded-xl max-w-xs shadow ${
                                                    msg.from === 'student'
                                                        ? 'bg-blue-600 text-white rounded-br-none'
                                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none'
                                                }`}
                                            >
                                                {msg.text}
                                            </div>
                                            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">{msg.timestamp}</span>
                                        </div>
                                    ))}
                                    {typing && (
                                        <div className="text-sm italic text-gray-500 dark:text-gray-400">typing...</div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input */}
                                <div className="flex items-center gap-2 mt-2">
                                    <label className="cursor-pointer flex items-center text-gray-500 dark:text-gray-300">
                                        <Paperclip className="w-5 h-5" />
                                        <input
                                            type="file"
                                            onChange={(e) => setFile(e.target.files[0])}
                                            className="hidden"
                                        />
                                    </label>
                                    <input
                                        type="text"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Type your doubt..."
                                        className="flex-1 px-4 py-2 border rounded-xl dark:bg-gray-800 dark:text-white"
                                    />
                                    <button
                                        onClick={handleSendMessage}
                                        className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition"
                                    >
                                        <SendHorizonal className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default AskADoubt;