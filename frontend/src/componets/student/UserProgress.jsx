import React from 'react';
import BadgeSection from './BadgeSection';

function UserProgress() {
  const userProgress = 17; // dynamically update this from backend

  return (
    <div className="UserProgress">
      <BadgeSection userProgress={userProgress} darkMode={false} />
    </div>
  );
}

export default UserProgress;
