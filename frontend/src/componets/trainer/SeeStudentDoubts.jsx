import React, { useState, useRef } from "react";
import { Paperclip, SendHorizonal, User, ArrowLeft } from "lucide-react";

const mockDoubts = [
  {
    id: 1,
    studentName: "Riya Patel",
    school: "Green Valley International School",
    subject: "Mathematics",
    grade: 7,
    doubt: "Can you explain quadratic equations?",
    session: "Session 12",
    teacher: "Mr. Sharma",
    messages: [
      { sender: "student", text: "Can you explain quadratic equations?", timestamp: new Date() },
    ],
  },
  {
    id: 2,
    studentName: "Aarav Mehta",
    school: "Sunrise Public School",
    subject: "Science",
    grade: 9,
    doubt: "What is Newton’s third law?",
    session: "Session 5",
    teacher: "Mr. Sharma",
    messages: [
      { sender: "student", text: "What is Newton’s third law?", timestamp: new Date() },
    ],
  },
];

const formatTimestamp = (date) =>
  new Date(date).toLocaleString([], { dateStyle: "short", timeStyle: "short" });

const SeeStudentDoubts = ({ darkMode = false, teacherName = "Mr. Sharma" }) => {
  const [selectedDoubt, setSelectedDoubt] = useState(null);
  const [reply, setReply] = useState("");
  const [file, setFile] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const messagesEndRef = useRef(null);

  const doubts = mockDoubts.filter((d) => d.teacher === teacherName);

  // Notifications can be mapped from doubts where last message sender is student (new doubt)
  // For simplicity, treat all doubts as notifications
  const notifications = doubts.map((doubt) => ({
    id: doubt.id,
    studentName: doubt.studentName,
    grade: doubt.grade,
    doubtText: doubt.doubt,
    timestamp: doubt.messages[0]?.timestamp || new Date(),
  }));

  const handleReplySend = () => {
    if (!reply.trim() && !file) return;

    const newMessages = [...selectedDoubt.messages];
    if (reply.trim()) {
      newMessages.push({
        sender: "teacher",
        text: reply.trim(),
        timestamp: new Date(),
        type: "text",
      });
    }

    if (file) {
      newMessages.push({
        sender: "teacher",
        text: file.name,
        file: URL.createObjectURL(file),
        timestamp: new Date(),
        type: "file",
      });
    }

    setSelectedDoubt({ ...selectedDoubt, messages: newMessages });
    setReply("");
    setFile(null);

    // Auto-scroll to bottom
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto relative">
      {/* Notification Bell */}
      <div className="absolute top-6 right-6">
        <button
          onClick={() => setShowNotifications((prev) => !prev)}
          className="relative text-gray-700 dark:text-gray-200 hover:text-blue-600 focus:outline-none"
          aria-label="Notifications"
        >
          <svg
            className="w-7 h-7"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            ></path>
          </svg>
          {notifications.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center font-semibold">
              {notifications.length}
            </span>
          )}
        </button>

        {/* Notifications Dropdown */}
        {showNotifications && (
          <div className="mt-2 w-80 max-h-64 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg z-50 absolute right-0">
            <h3 className="px-4 py-2 font-semibold text-gray-800 dark:text-gray-100 border-b border-gray-300 dark:border-gray-700">
              Notifications ({notifications.length})
            </h3>
            {notifications.length === 0 ? (
              <p className="p-4 text-center text-gray-500 dark:text-gray-400">
                No new notifications
              </p>
            ) : (
              notifications.map((note) => (
                <div
                  key={note.id}
                  className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                  onClick={() => {
                    setSelectedDoubt(doubts.find((d) => d.id === note.id));
                    setShowNotifications(false);
                  }}
                >
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {note.studentName} (Grade {note.grade})
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
                    📚 Doubt: {note.doubtText}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatTimestamp(note.timestamp)}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {!selectedDoubt ? (
        <>
          <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
            📚 Student Doubts
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {doubts.map((doubt) => (
              <div
                key={doubt.id}
                onClick={() => setSelectedDoubt(doubt)}
                className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                <div className="flex items-center gap-3 mb-2">
                  <User className="w-5 h-5 text-indigo-500" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    {doubt.studentName} (Grade {doubt.grade})
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <strong>Subject:</strong> {doubt.subject}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 truncate mt-1">
                  <strong>Doubt:</strong> {doubt.doubt}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  <strong>Session:</strong> {doubt.session}
                </p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div>
          <div className="flex items-center mb-4 gap-2">
            <button
              onClick={() => setSelectedDoubt(null)}
              className="text-sm text-blue-600 hover:underline flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Doubts
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-300 ml-2">
              Chatting with <strong>{selectedDoubt.studentName}</strong> (Grade{" "}
              {selectedDoubt.grade}) | {selectedDoubt.session}
            </span>
          </div>

          <div className="h-80 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800 shadow-inner scroll-smooth">
            {selectedDoubt.messages.map((msg, idx) => (
              <div
                key={idx}
                className={`mb-3 flex flex-col ${
                  msg.sender === "teacher" ? "items-end" : "items-start"
                }`}
              >
                {msg.type === "file" && (
                  <a
                    href={msg.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-500 underline mb-1"
                  >
                    📎 {msg.text}
                  </a>
                )}
                <div
                  className={`px-4 py-2 rounded-xl max-w-xs shadow ${
                    msg.sender === "teacher"
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none"
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {formatTimestamp(msg.timestamp)}
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Reply Input */}
          <div className="mt-4 flex items-center gap-2">
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
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Type your reply..."
              className="flex-1 px-4 py-2 border rounded-xl dark:bg-gray-800 dark:text-white"
            />
            <button
              onClick={handleReplySend}
              className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition"
            >
              <SendHorizonal className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeeStudentDoubts;
