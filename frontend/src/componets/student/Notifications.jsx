// src/components/Notifications.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import { useNotifications } from './context/NotificationContext'; // Make sure the path is correct
import { Bell, MailOpen, Mail, XCircle, Trash2, ArrowLeft } from 'lucide-react'; // Import ArrowLeft icon

const Notifications = () => {
    const { notifications, markAsRead, clearAllNotifications } = useNotifications();
    const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'
    const navigate = useNavigate(); // Initialize useNavigate hook

    // Filter notifications based on the selected filter
    const filteredNotifications = notifications.filter(notification => {
        if (filter === 'unread') {
            return !notification.read;
        }
        if (filter === 'read') {
            return notification.read;
        }
        return true; // 'all'
    });

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-xl min-h-[400px]">
            <div className="flex justify-between items-center mb-6 border-b pb-4 border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4"> {/* Group back button and title */}
                    <button
                        onClick={() => navigate(-1)} // Navigates back one step in history
                        className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        title="Go Back"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Bell className="w-8 h-8 text-blue-600" />
                        Notifications
                        {unreadCount > 0 && (
                            <span className="ml-2 bg-red-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full animate-pulse">
                                {unreadCount} New
                            </span>
                        )}
                    </h2>
                </div>
                <div className="flex items-center gap-2">
                    {notifications.length > 0 && (
                        <button
                            onClick={clearAllNotifications}
                            className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors tooltip"
                            data-tooltip="Clear All"
                            title="Clear All Notifications" // For accessibility
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    )}
                    <button
                        onClick={() => alert('Settings Coming Soon!')}
                        className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors tooltip"
                        data-tooltip="Settings"
                        title="Notification Settings" // For accessibility
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-settings"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.78 1.22a2 2 0 0 0 .73 2.73l.09.09a2 2 0 0 1 0 2.83l-.08.08a2 2 0 0 0-.73 2.73l.78 1.21a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.78-1.22a2 2 0 0 0-.73-2.73l-.09-.09a2 2 0 0 1 0-2.83l.08-.08a2 2 0 0 0 .73-2.73l-.78-1.21a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
                    </button>
                </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex justify-center mb-6 gap-3">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-5 py-2 rounded-full font-medium transition-all duration-300 ${
                        filter === 'all' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                    }`}
                >
                    All
                </button>
                <button
                    onClick={() => setFilter('unread')}
                    className={`px-5 py-2 rounded-full font-medium transition-all duration-300 ${
                        filter === 'unread' ? 'bg-red-500 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                    }`}
                >
                    Unread ({unreadCount})
                </button>
                <button
                    onClick={() => setFilter('read')}
                    className={`px-5 py-2 rounded-full font-medium transition-all duration-300 ${
                        filter === 'read' ? 'bg-green-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                    }`}
                >
                    Read
                </button>
            </div>

            {/* Notifications List */}
            {filteredNotifications.length === 0 ? (
                <div className="text-center py-10">
                    <Bell className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-xl text-gray-600 dark:text-gray-400 font-semibold">
                        {filter === 'unread' ? 'No unread notifications!' :
                         filter === 'read' ? 'No read notifications yet.' :
                         'You are all caught up! No notifications.'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                        Doubt replies and updates will appear here.
                    </p>
                </div>
            ) : (
                <ul className="space-y-4">
                    {filteredNotifications.map((notification) => (
                        <li
                            key={notification.id}
                            className={`p-5 rounded-xl shadow-md cursor-pointer transform hover:scale-[1.01] transition-all duration-300 ${
                                notification.read
                                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                    : 'bg-blue-50 dark:bg-blue-950 text-blue-900 dark:text-blue-100 ring-2 ring-blue-300 dark:ring-blue-700'
                            }`}
                            onClick={() => markAsRead(notification.id)}
                        >
                            <div className="flex items-start gap-3">
                                {notification.read ? (
                                    <MailOpen className="w-6 h-6 text-gray-500 dark:text-gray-400 mt-1 flex-shrink-0" />
                                ) : (
                                    <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0 animate-bounce-once" />
                                )}
                                <div className="flex-grow">
                                    <p className="font-semibold text-lg leading-snug">
                                        {notification.message}
                                    </p>
                                    {notification.question && (
                                        <p className="text-sm italic mt-1 text-gray-600 dark:text-gray-400">
                                            "Question: {notification.question}"
                                        </p>
                                    )}
                                    <small className="text-xs text-gray-500 dark:text-gray-400 mt-2 block">
                                        Received: {notification.timeAsked}
                                    </small>
                                </div>
                                {!notification.read && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation(); // Prevent marking as read when clicking the X
                                            markAsRead(notification.id);
                                        }}
                                        className="p-1 rounded-full text-gray-400 hover:text-green-600 transition-colors"
                                        title="Mark as Read"
                                    >
                                        <XCircle className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Notifications;