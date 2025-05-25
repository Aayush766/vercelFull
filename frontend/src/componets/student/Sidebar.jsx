import React from 'react';
import { FaFileAlt, FaPlayCircle, FaQuestionCircle } from 'react-icons/fa'; // Import icons

const Sidebar = ({ darkMode, sessions, onSelectSession, onSelectContent, getContentForSession }) => {
  return (
    <div
      className={`w-64 p-4 rounded-xl shadow-md h-fit ${
        darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
      }`}
    >
      <h2 className="text-xl font-semibold mb-4 border-b pb-2">Course Outline</h2>
      <ul className="space-y-4">
        {(sessions || []).map((session) => {
          const sessionEbooks = getContentForSession(session.id, 'ebook');
          const sessionVideos = getContentForSession(session.id, 'video');
          const sessionQuizzes = getContentForSession(session.id, 'quiz');

          return (
            <li key={session.id} className="mb-3">
              <button
                onClick={() => onSelectSession(session.id)}
                className="font-bold text-blue-600 hover:underline text-left w-full text-lg mb-1"
              >
                {'Session ' + session.sessionNumber }
              </button>

              <ul className="ml-4 mt-1 space-y-1 text-sm">
                {/* Ebooks */}
                <li className="flex items-center space-x-2">
                  <FaFileAlt size={16} className="text-violet-500" />
                  <span className="font-semibold">Ebooks:</span>
                </li>
                {sessionEbooks.length > 0 ? (
                  <ul className="ml-6 space-y-1">
                    {sessionEbooks.map(ebook => (
                      <li key={ebook._id}>
                        <button
                          onClick={() => onSelectContent(session.id, 'ebook', ebook._id)}
                          className="hover:underline text-left w-full text-blue-500 dark:text-blue-300"
                        >
                          {ebook.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <li className="ml-6 italic text-gray-500 dark:text-gray-400">No ebooks</li>
                )}

                {/* Videos */}
                <li className="flex items-center space-x-2 mt-2">
                  <FaPlayCircle size={16} className="text-indigo-500" />
                  <span className="font-semibold">Videos:</span>
                </li>
                {sessionVideos.length > 0 ? (
                  <ul className="ml-6 space-y-1">
                    {sessionVideos.map(video => (
                      // Note: Assuming video.videoList structure, map through inner items
                      video.videoList && video.videoList.length > 0 ? (
                        video.videoList.map(item => (
                          <li key={item.id}>
                            <button
                              onClick={() => onSelectContent(session.id, 'video', item.id)}
                              className="hover:underline text-left w-full text-blue-500 dark:text-blue-300"
                            >
                              {item.title || `Video ${item.id}`}
                            </button>
                          </li>
                        ))
                      ) : (
                        <li key={video._id} className="italic text-gray-500 dark:text-gray-400">No specific videos</li>
                      )
                    ))}
                  </ul>
                ) : (
                  <li className="ml-6 italic text-gray-500 dark:text-gray-400">No videos</li>
                )}

                {/* Quizzes */}
                <li className="flex items-center space-x-2 mt-2">
                  <FaQuestionCircle size={16} className="text-green-500" />
                  <span className="font-semibold">Quizzes:</span>
                </li>
                {sessionQuizzes.length > 0 ? (
                  <ul className="ml-6 space-y-1">
                    {sessionQuizzes.map(quiz => (
                      <li key={quiz._id}>
                        <button
                          onClick={() => onSelectContent(session.id, 'quiz', quiz._id)}
                          className="hover:underline text-left w-full text-blue-500 dark:text-blue-300"
                        >
                          {quiz.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <li className="ml-6 italic text-gray-500 dark:text-gray-400">No quizzes</li>
                )}
              </ul>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Sidebar;