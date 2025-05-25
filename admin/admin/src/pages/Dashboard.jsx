// src/pages/Dashboard.jsx
import React, { useState } from 'react';
import apiClient from '../axiosConfig'; // Use apiClient for logout
import UploadContent from '../sections/UploadContent';
import CreateUser from '../sections/CreateUser';
import AllContent from '../sections/AllContent';

function Dashboard() {
    const [view, setView] = useState('upload'); // Default view

    // Function to handle logout
    const handleLogout = async () => {
        try {
            await apiClient.post('/auth/logout'); // Use apiClient, withCredentials already configured
            // No need to remove from localStorage as tokens are in cookies
            localStorage.removeItem('user'); // Clear client-side user info
            window.location.href = '/admin-login'; // Redirect to admin login page
        } catch (error) {
            console.error('Logout failed:', error);
            // Even if logout fails on server, clear client-side state and redirect
            localStorage.removeItem('user'); // Clear client-side user info
            window.location.href = '/admin-login';
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <button
                    onClick={handleLogout} // Use the new handleLogout function
                    className="bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors duration-300"
                >
                    Logout
                </button>
            </div>
            <div className="flex gap-4 mb-4">
                <button
                    onClick={() => setView('upload')}
                    className={`px-4 py-2 rounded transition-colors duration-300 ${view === 'upload' ? 'bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
                >
                    Upload Content
                </button>
                <button
                    onClick={() => setView('user')}
                    className={`px-4 py-2 rounded transition-colors duration-300 ${view === 'user' ? 'bg-green-700 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`}
                >
                    Create User
                </button>
                <button
                    onClick={() => setView('viewContent')}
                    className={`px-4 py-2 rounded transition-colors duration-300 ${view === 'viewContent' ? 'bg-purple-700 text-white' : 'bg-purple-500 hover:bg-purple-600 text-white'}`}
                >
                    View All Content
                </button>
            </div>
            {view === 'upload' && <UploadContent />}
            {view === 'user' && <CreateUser />}
            {view === 'viewContent' && <AllContent />}
        </div>
    );
}

export default Dashboard;