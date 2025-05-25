import React, { createContext, useState } from 'react';

// 1. Create the context
export const DoubtsContext = createContext();

// 2. Create the provider component
export const DoubtsProvider = ({ children }) => {
  // State to hold all doubts from the student
  const [doubts, setDoubts] = useState([]);

  // State to hold notifications when teacher replies
  const [notifications, setNotifications] = useState([]);

  // Add a new doubt from student
  const addDoubt = (question) => {
    const newDoubt = {
      id: Date.now(),   // Unique id
      question,
      conversations: [],  // Messages between student and teacher
    };
    setDoubts(prev => [newDoubt, ...prev]);
  };

  // Teacher replies to a doubt
  // Adds reply to conversations and creates a notification
  const addReply = (doubtId, replyMessage) => {
    setDoubts(prevDoubts =>
      prevDoubts.map(doubt => {
        if (doubt.id === doubtId) {
          const updatedConversations = [
            ...doubt.conversations,
            { from: 'teacher', message: replyMessage, time: new Date().toISOString() }
          ];
          return { ...doubt, conversations: updatedConversations };
        }
        return doubt;
      })
    );

    // Add a new notification for student
    setNotifications(prevNotifications => [
      {
        id: Date.now(),
        message: `Teacher replied to your doubt: "${replyMessage}"`,
        read: false,
        doubtId,
        time: new Date().toISOString(),
      },
      ...prevNotifications
    ]);
  };

  // Mark notification as read
  const markNotificationRead = (id) => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  return (
    <DoubtsContext.Provider value={{
      doubts,
      addDoubt,
      addReply,
      notifications,
      markNotificationRead,
    }}>
      {children}
    </DoubtsContext.Provider>
  );
};
