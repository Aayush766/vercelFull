// src/sections/TrainerLoginForm.jsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PulseLoader } from 'react-spinners';
import logo from '../../assets/Logo.png';
import apiClient from '../../axiosConfig'; // Import your configured Axios instance

const TrainerLoginForm = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [loginError, setLoginError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        setTimeout(() => setLoading(false), 1500);

        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setDarkMode(prefersDark);
        document.documentElement.classList.toggle('dark', prefersDark);
    }, []);

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        setLoginError('');

        try {
            // --- CHANGE THIS LINE ---
            // It should target the /auth/trainer/login endpoint
            const response = await apiClient.post('/auth/trainer/login', {
                email: data.email,
                password: data.password
            });
            // --- END CHANGE ---

            // The backend should respond with success and set HTTP-only cookies.
            // If your backend still returns a user object in the response body, you can use it.
            // Otherwise, you might need to make a /users/me call after successful login to get user data.
            const { user } = response.data; // Assuming your backend still sends user data in response body

            // Optional: If you rely on the frontend for immediate role-based redirection,
            // ensure the backend sends the role in the response body.
            // If the backend doesn't send user data, you'd navigate and fetch it on dashboard/profile.
            if (user && user.role === 'trainer') {
                // If you store user data (other than token) in localStorage, do it here.
                // For instance, if `user` object contains non-sensitive profile info.
                localStorage.setItem('user', JSON.stringify(user));
                navigate('/trainer/dashboard');
            } else {
                // This 'else' block for role mismatch should ideally not be hit if the backend loginTrainer works correctly,
                // as the backend itself would return 403. But it's a good fallback.
                setLoginError('Access denied: Invalid role or credentials.');
                // You might want to also clear cookies if the backend sets them for wrong roles.
                // This would require a logout endpoint call or specific backend handling.
            }

        } catch (err) {
            console.error('Login failed:', err);
            // The error message from the backend should be helpful (e.g., "Invalid credentials" or "Access denied")
            setLoginError(err.response?.data?.msg || 'Login failed. Please check your credentials.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
                <PulseLoader color="#4B89FF" size={12} />
            </div>
        );
    }

    return (
        <div className={`min-h-screen flex items-center justify-center transition-all duration-500 ${darkMode ? 'bg-gradient-to-br from-gray-800 via-gray-900 to-black' : 'bg-gradient-to-br from-blue-100 to-white'} p-4`}>
            <motion.div
                className="max-w-md w-full"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
            >
                <div className="mb-8 text-center">
                    <div className="flex items-center justify-center mb-4">
                        <img src={logo} alt="GeniusKidz Logo" className="w-14 h-14 rounded-full shadow-lg" />
                    </div>
                    <h1 className="text-3xl font-bold text-geniuskidz-primary dark:text-yellow-400 mb-2">
                        GeniusKidz
                    </h1>
                    <p className="text-muted-foreground dark:text-gray-300">
                        Empower Trainers. Inspire Students.
                    </p>
                </div>

                <div className="w-full rounded-xl shadow-xl border border-blue-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/90 backdrop-blur-md p-6">
                    <h2 className="text-2xl font-semibold text-center text-blue-600 dark:text-yellow-300 mb-6">Trainer Login</h2>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-gray-700 dark:text-gray-300 mb-2 text-md font-medium">Email</label>
                            <input
                                type="email"
                                id="email"
                                {...register("email", {
                                    required: "Email is required",
                                    pattern: {
                                        value: /^[^@]+@[^@]+\.[^@]+$/i,
                                        message: "Invalid email format"
                                    }
                                })}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            />
                            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-gray-700 dark:text-gray-300 mb-2 text-md font-medium">Password</label>
                            <input
                                type="password"
                                id="password"
                                {...register("password", { required: "Password is required" })}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            />
                            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition duration-300"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Logging In...' : 'Login'}
                        </button>

                        {loginError && (
                            <div className="mt-4 text-center text-red-500 font-medium">
                                {loginError}
                            </div>
                        )}

                        <div className="text-center mt-4">
                            <a href="#" className="text-sm text-blue-600 hover:text-blue-800 dark:text-yellow-400">Forgot Password?</a>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default TrainerLoginForm;