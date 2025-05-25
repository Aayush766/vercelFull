import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const DoubtAns = () => {
  const [question, setQuestion] = useState('What is the derivative of x^2?');
  const [timeAsked, setTimeAsked] = useState('2025-05-10');
  const [teacherReply, setTeacherReply] = useState('The derivative of x^2 is 2x.');
  const [isRead, setIsRead] = useState(false);

  const handleMarkAsRead = () => {
    setIsRead(true);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Student Support</h2>
      
      <div className="bg-white p-4 rounded-lg shadow-lg mb-6">
        <h3 className="font-semibold">Your Question</h3>
        <p>{question}</p>
        <small className="text-gray-500">{`Asked on: ${timeAsked}`}</small>
        <div className="mt-4">
          <button 
            onClick={handleMarkAsRead}
            className={`py-2 px-4 rounded-md ${isRead ? 'bg-green-500' : 'bg-blue-500'} text-white`}
          >
            {isRead ? 'Marked as Read' : 'Mark as Read'}
          </button>
        </div>
      </div>

      {isRead && (
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <h3 className="font-semibold">Teacher's Reply</h3>
          <p>{teacherReply}</p>
        </div>
      )}
    </div>
  );
};

export default DoubtAns;
