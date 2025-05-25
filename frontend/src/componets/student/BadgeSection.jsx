import React from 'react';
import { motion } from 'framer-motion';
import { FaBook, FaBullseye, FaBrain, FaRocket, FaFire, FaCrown, FaLock } from 'react-icons/fa';

const badgesData = [
  {
    title: "Session Starter",
    description: "Complete your first quiz",
    icon: <FaBook />,
    unlockedAt: 1,
  },
  {
    title: "8x Achiever",
    description: "Complete first 8 session quizzes",
    icon: <FaBullseye />,
    unlockedAt: 8,
  },
  {
    title: "Quarter Champ",
    description: "Complete a quarterly quiz",
    icon: <FaBrain />,
    unlockedAt: 9,
  },
  {
    title: "Midway Master",
    description: "Complete 17 sessions and half-yearly quiz",
    icon: <FaRocket />,
    unlockedAt: 17,
  },
  {
    title: "Full Course Finisher",
    description: "Complete all 34 session quizzes",
    icon: <FaFire />,
    unlockedAt: 34,
  },
  {
    title: "Quiz King/Queen",
    description: "Score 90%+ in all milestone quizzes",
    icon: <FaCrown />,
    unlockedAt: 100, // Custom rule
  },
];

const BadgeCard = ({ badge, unlocked, index, darkMode }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: index * 0.3, duration: 0.5 }}
    className={`rounded-2xl p-5 w-56 flex flex-col items-center justify-center shadow-lg transition-all duration-300
      ${unlocked
        ? darkMode
          ? 'bg-green-800 text-green-300 border border-green-700 hover:scale-105'
          : 'bg-green-100 text-green-800 border border-green-300 hover:scale-105'
        : darkMode
          ? 'bg-gray-800 text-gray-500 border border-gray-700'
          : 'bg-gray-100 text-gray-400 border border-gray-300 hover:scale-105'}`}
  >
    <div className="text-4xl mb-3">
      {unlocked ? badge.icon : <FaLock />}
    </div>
    <h3 className="font-semibold text-center text-lg">{badge.title}</h3>
    <p className="text-sm text-center">{badge.description}</p>
  </motion.div>
);

const BadgeSection = ({ userProgress, darkMode }) => {
  const getVisibleBadges = () => {
    const visible = [];
    for (let i = 0; i < badgesData.length; i++) {
      if (userProgress >= badgesData[i].unlockedAt) {
        visible.push(badgesData[i]);
      } else {
        if (visible.length === 0 || userProgress >= badgesData[i - 1]?.unlockedAt) {
          visible.push(badgesData[i]);
        }
        break;
      }
    }
    return visible;
  };

  const visibleBadges = getVisibleBadges();

  return (
    <motion.div
      className={`p-6 rounded-3xl shadow-xl mx-4 my-6 md:mx-10 md:my-10 transition-all duration-500
        ${darkMode
        ? 'bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 text-white border border-gray-700'
        : 'bg-gradient-to-br from-blue-50 via-white to-blue-100 text-gray-800 border border-gray-200'}`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-extrabold text-center md:text-left">🏅 Badge Achievements</h2>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${darkMode ? 'bg-gray-700 text-white' : 'bg-blue-200 text-blue-800'}`}>
          Progress: {userProgress}/34
        </span>
      </div>

      {/* Badge Layout */}
      <div className="flex flex-col items-center gap-6">
        {/* First Row: 3 cards */}
        <div className="flex flex-wrap justify-center gap-6">
          {visibleBadges.slice(0, 3).map((badge, index) => (
            <BadgeCard
              key={index}
              badge={badge}
              unlocked={userProgress >= badge.unlockedAt}
              index={index}
              darkMode={darkMode}
            />
          ))}
        </div>

        {/* Second Row: 2 cards centered */}
        <div className="flex flex-wrap justify-center gap-6">
          {visibleBadges.slice(3, 5).map((badge, index) => (
            <BadgeCard
              key={index + 3}
              badge={badge}
              unlocked={userProgress >= badge.unlockedAt}
              index={index + 3}
              darkMode={darkMode}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// Test Component
const UserProgress = () => {
  const userProgress = 17; // Change this value for testing

  return (
    <div className="UserProgress">
      <BadgeSection userProgress={userProgress} darkMode={true} />
    </div>
  );
};

export default UserProgress;
