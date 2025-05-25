// src/pages/Login.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // **Crucial: Add { withCredentials: true } to send and receive cookies**
            const res = await axios.post('http://localhost:5004/api/auth/admin/login', {
                email,
                password,
            }, { withCredentials: true });

            const { user } = res.data; // Backend no longer sends 'token' in response body for cookie-based auth

            if (user && user.role === 'admin') {
                // No need to set token in localStorage, it's handled by cookies
                localStorage.setItem('user', JSON.stringify(user)); // Still store user info for client-side use
                navigate('/dashboard');
            } else {
                setError('Access Denied: You are not authorized as an Admin. Please ensure you are logging into the correct portal or contact support.');
                localStorage.removeItem('user'); // Clear user info if role is incorrect
            }
        } catch (err) {
            console.error('Login error:', err.response ? err.response.data : err.message);
            const errorMessage = err.response?.data?.msg || 'Login failed. Please check your email and password.';
            setError(errorMessage);
            localStorage.removeItem('user'); // Clear user info on any login failure
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <form className="bg-white p-6 rounded shadow-md w-80" onSubmit={handleLogin}>
                <h2 className="text-2xl font-bold mb-4 text-center">Admin Login</h2>
                {error && <p className="text-red-500 text-sm mb-3 text-center">{error}</p>}
                <input
                    type="email"
                    placeholder="Email"
                    className="block w-full p-2 mb-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    className="block w-full p-2 mb-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button
                    type="submit"
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded transition-colors duration-300"
                    disabled={loading}
                >
                    {loading ? 'Logging In...' : 'Login'}
                </button>
            </form>
        </div>
    );
}

export default Login;