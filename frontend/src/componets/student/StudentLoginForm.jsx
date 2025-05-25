import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PulseLoader } from 'react-spinners';
import logo from '../../assets/Logo.png';
import apiClient from '../../axiosConfig'; // <-- Import apiClient here!

const StudentLoginForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [loginError, setLoginError] = useState(null); // State to display login errors
  const [isLoggingIn, setIsLoggingIn] = useState(false); // State for pending login
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1500);
  }, []);

  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(prefersDark);
    document.documentElement.classList.toggle('dark', prefersDark);
  }, []);

  const onSubmit = async (data) => { // Make this function async
    setLoginError(null); // Clear previous errors
    setIsLoggingIn(true); // Indicate that login is in progress

    try {
      // Use apiClient to send login request to your backend
      const response = await apiClient.post('/auth/login', {
        email: data.email,
        password: data.password,
        role: 'student', // Ensure you send the role to the backend
      });

      // If login is successful, the backend sets HTTP-only cookies.
      // You might get user data back in the response body (e.g., response.data.user).
      // Store non-sensitive user data in localStorage if needed for display.
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      // Navigate to dashboard only after successful backend authentication
      navigate('/dashboard');

    } catch (error) {
      // Handle login errors from the backend
      console.error('Login error:', error.response ? error.response.data : error.message);
      setLoginError(error.response?.data?.msg || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoggingIn(false); // End login process
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
            Spark Learning. Ignite Growth.
          </p>
        </div>

        <div className="w-full rounded-xl shadow-xl border border-blue-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/90 backdrop-blur-md p-6">
          <h2 className="text-2xl font-semibold text-center text-blue-600 dark:text-yellow-300 mb-6">Student Login</h2>
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
              disabled={isLoggingIn} // Disable button while logging in
            >
              {isLoggingIn ? <PulseLoader size={8} color="#fff" /> : 'Login'}
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

export default StudentLoginForm;