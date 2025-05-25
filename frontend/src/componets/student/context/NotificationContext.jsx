// src/context/NotificationContext.js
import React, { createContext, useState, useContext } from 'react';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    const addNotification = (message, question = '', timeAsked = new Date().toLocaleString()) => { // Changed toLocaleString for full date/time
        const newNotification = {
            id: Date.now(),
            message,
            read: false,
            question,
            timeAsked,
        };
        setNotifications((prevNotifications) => [newNotification, ...prevNotifications]);
    };

    const markAsRead = (id) => {
        setNotifications((prevNotifications) =>
            prevNotifications.map((notification) =>
                notification.id === id ? { ...notification, read: true } : notification
            )
        );
    };

    // New function to clear all notifications
    const clearAllNotifications = () => {
        setNotifications([]);
    };

    const contextValue = {
        notifications,
        addNotification,
        markAsRead,
        clearAllNotifications, // Add the new function to context value
    };

    return (
        <NotificationContext.Provider value={contextValue}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    return useContext(NotificationContext);
};