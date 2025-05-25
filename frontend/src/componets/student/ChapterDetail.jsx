import React from 'react';
import { useParams } from 'react-router-dom';

const ChapterDetail = ({ darkMode }) => {
  const { id } = useParams();

  const resources = [
    { title: 'Ebook', emoji: '📘' },
    { title: 'Notes', emoji: '📝' },
    { title: 'Activities', emoji: '🎯' },
    { title: 'Ask a Doubt', emoji: '❓' }
  ];

  return (
    <div className={`min-h-screen p-6 ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
      <h1 className="text-2xl font-bold mb-6">Chapter {id} Resources</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {resources.map((res, i) => (
          <div
            key={i}
            className={`p-6 rounded shadow-md text-center ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}
          >
            <div className="text-4xl mb-2">{res.emoji}</div>
            <h2 className="text-lg font-semibold">{res.title}</h2>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChapterDetail;
