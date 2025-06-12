import React from 'react';

const Sidebar = ({ darkMode, sessions }) => {
  return (
    <div
      className={`w-64 p-4 rounded-xl shadow-md h-fit ${
        darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
      }`}
    >
      <h2 className="text-xl font-semibold mb-4">Course Outline</h2>
      <ul className="space-y-4">
        {(sessions || []).map((session) => (
          <li key={session.id}>
            <div className="font-bold text-blue-600">{session.name}</div>

            <ul className="ml-4 mt-1 space-y-1">
              <li className="font-medium">
                Topic: {session.topicName || `Topic for ${session.name}`}
              </li>
              <ul className="ml-4 text-sm space-y-1">
                <li className="cursor-pointer hover:underline">📘 Ebook</li>
                <li className="cursor-pointer hover:underline">🎥 Video</li>
                <li className="cursor-pointer hover:underline">🧠 Quiz</li>
              </ul>
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
