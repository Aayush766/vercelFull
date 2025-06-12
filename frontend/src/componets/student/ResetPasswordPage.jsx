import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { PulseLoader } from 'react-spinners';
import apiClient from '../../axiosConfig'; // Adjust path if necessary

const ResetPasswordPage = () => {
  const { token } = useParams(); // Get the token from the URL
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, watch } = useForm();

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [isError, setIsError] = useState(false);

  const newPassword = watch('newPassword');

  const onSubmit = async (data) => {
    setIsLoading(true);
    setMessage(null);
    setIsError(false);

    if (data.newPassword !== data.confirmPassword) {
      setMessage('Passwords do not match.');
      setIsError(true);
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiClient.put(`/auth/reset-password/${token}`, {
        newPassword: data.newPassword,
      });
      setMessage(response.data.msg || 'Your password has been reset successfully!');
      setIsError(false);
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      console.error('Password reset error:', error.response ? error.response.data : error.message);
      setMessage(error.response?.data?.msg || 'Failed to reset password. Please try again or request a new link.');
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-white dark:from-gray-800 via-gray-900 dark:to-black p-4">
      <motion.div
        className="max-w-md w-full bg-white/80 dark:bg-gray-800/90 rounded-xl shadow-xl border border-blue-200 dark:border-gray-700 backdrop-blur-md p-6"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-2xl font-semibold text-center text-blue-600 dark:text-yellow-300 mb-6">Reset Your Password</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="newPassword" className="block text-gray-700 dark:text-gray-300 mb-2 text-md font-medium">New Password</label>
            <input
              type="password"
              id="newPassword"
              {...register("newPassword", {
                required: "New password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters long"
                }
              })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
            {errors.newPassword && <p className="text-red-500 text-sm mt-1">{errors.newPassword.message}</p>}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-gray-700 dark:text-gray-300 mb-2 text-md font-medium">Confirm New Password</label>
            <input
              type="password"
              id="confirmPassword"
              {...register("confirmPassword", {
                required: "Confirm password is required",
                validate: value => value === newPassword || "Passwords do not match"
              })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
            {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition duration-300"
            disabled={isLoading}
          >
            {isLoading ? <PulseLoader size={8} color="#fff" /> : 'Reset Password'}
          </button>

          {message && (
            <div className={`mt-4 text-center font-medium ${isError ? 'text-red-500' : 'text-green-600 dark:text-green-400'}`}>
              {message}
            </div>
          )}
        </form>
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;