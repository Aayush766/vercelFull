import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PulseLoader } from 'react-spinners';
import logo from '../../assets/Logo.png'; // Make sure the path is correct

const TrainerLoginForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1500);
  }, []);

  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(prefersDark);
    document.documentElement.classList.toggle('dark', prefersDark);
  }, []);

  const onSubmit = (data) => {
    console.log(data);
    setIsLoggedIn(true);
    setTimeout(() => {
      navigate('/trainer/dashboard'); // Redirect to trainer dashboard
    }, 1000);
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

            <div>
              <label htmlFor="trainerId" className="block text-gray-700 dark:text-gray-300 mb-2 text-md font-medium">Trainer ID</label>
              <input
                type="text"
                id="trainerId"
                {...register("trainerId", { required: "Trainer ID is required" })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              {errors.trainerId && <p className="text-red-500 text-sm mt-1">{errors.trainerId.message}</p>}
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition duration-300"
            >
              Login
            </button>

            <div className="text-center mt-4">
              <a href="#" className="text-sm text-blue-600 hover:text-blue-800 dark:text-yellow-400">Forgot Password?</a>
            </div>

            {isLoggedIn && (
              <div className="mt-4 text-center text-green-500 font-medium">
                Successfully logged in! Redirecting...
              </div>
            )}
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default TrainerLoginForm;
