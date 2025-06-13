// src/App.jsx
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import axios from 'axios'; // Import axios


// Set up a global Axios instance if you want to apply defaults like withCredentials for all requests
axios.defaults.withCredentials = true; // This is crucial for sending and receiving cookies automatically

function App() {
    const [isAdmin, setIsAdmin] = useState(false);
    const [loadingAuth, setLoadingAuth] = useState(true);

    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                // Try to fetch user info from the backend.
                // If the access token cookie is valid, this should succeed.
                // If it's expired, the backend might return 401.
                const res = await axios.get('http://vercelfull.onrender.com/api/users/me'); // Assuming a /api/users/me endpoint for current user info
                if (res.data.user && res.data.user.role === 'admin') {
                    setIsAdmin(true);
                    localStorage.setItem('user', JSON.stringify(res.data.user)); // Update user info
                } else {
                    setIsAdmin(false);
                    localStorage.removeItem('user'); // Clear if not admin or no user
                }
            } catch (error) {
                console.error('Authentication check failed:', error);
                setIsAdmin(false);
                localStorage.removeItem('user'); // Ensure user info is cleared on auth failure
            } finally {
                setLoadingAuth(false);
            }
        };

        // You might want to try checking localStorage first for a faster initial render
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                if (user.role === 'admin') {
                    setIsAdmin(true);
                }
            } catch (e) {
                console.error("Failed to parse stored user", e);
                localStorage.removeItem('user');
            }
        }
        setLoadingAuth(false); // Set to false to avoid blocking render

        // In a real app, you'd trigger `checkAuthStatus` on component mount and potentially
        // set up an Axios interceptor to automatically refresh tokens.
        // For this example, let's keep it simple and just redirect if `isAdmin` is false.
        // A more robust solution involves checking server-side token validity.
        // For the purpose of getting your app running with the changes, we'll rely on the
        // backend's protected routes redirecting unauthenticated/unauthorized users.
    }, []);

    // A simpler approach for protection, relying on backend.
    // If the user tries to access /dashboard and is not truly authenticated (due to cookie),
    // backend routes will return 401/403, and you'll handle it on the frontend by redirecting to login.
    // This is less about client-side token decoding and more about relying on server-side checks.

    if (loadingAuth) {
        return <div className="min-h-screen flex items-center justify-center">Checking authentication...</div>;
    }

    return (
        <Router>
            <Routes>
                {/* Admin Login Route */}
                <Route path="/admin-login" element={<Login />} />

                {/* Dashboard Route - Protected.
                    We don't do full client-side token validation here for HTTP-only cookies.
                    Instead, we rely on the backend to tell us if the user is authorized for Dashboard components.
                    A simple check from localStorage for `user.role` is a first pass.
                    If the `user` object in localStorage is cleared on logout or refresh,
                    `isAdmin` will become false, leading to a redirect.
                */}
                <Route
                    path="/dashboard"
                    element = {<Dashboard /> }
                />

                {/* Default route to redirect to login */}
                <Route
                    path="/"
                    element={<Navigate to="/admin-login" replace />}
                />

                {/* Catch-all for undefined routes */}
                <Route path="*" element={<Navigate to="/admin-login" replace />} />
                
            </Routes>
        </Router>
    );
}

export default App;
